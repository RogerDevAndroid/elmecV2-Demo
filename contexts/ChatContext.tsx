import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { supabase, supabaseClient } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import { ChatRoom, Message, User } from '@/types/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface ChatMessage extends Message {
  user?: User;
  isDelivered?: boolean;
  isRead?: boolean;
  localId?: string; // Para optimistic updates
}

interface TypingUser {
  userId: string;
  userName: string;
  timestamp: number;
}

interface ChatContextType {
  chatRooms: ChatRoom[];
  messages: { [roomId: string]: ChatMessage[] };
  typingUsers: { [roomId: string]: TypingUser[] };
  onlineUsers: string[];
  sendMessage: (
    roomId: string,
    message: string,
    messageType?: Message['type'],
    fileUrl?: string,
    fileName?: string,
    fileSize?: number,
    audioDuration?: number,
    replyTo?: string
  ) => Promise<void>;
  sendTypingIndicator: (roomId: string, isTyping: boolean) => void;
  createChatRoom: (
    participantId: string,
    participantName: string,
    requestId?: string
  ) => Promise<string>;
  markMessagesAsRead: (roomId: string) => Promise<void>;
  getChatRoom: (roomId: string) => ChatRoom | undefined;
  getUnreadCount: () => number;
  getRoomUnreadCount: (roomId: string) => number;
  loadMoreMessages: (roomId: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  editMessage: (messageId: string, newMessage: string) => Promise<void>;
  isUserOnline: (userId: string) => boolean;
  loading: boolean;
  error: string | null;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<{ [roomId: string]: ChatMessage[] }>(
    {}
  );
  const [typingUsers, setTypingUsers] = useState<{
    [roomId: string]: TypingUser[];
  }>({});
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [realtimeChannels, setRealtimeChannels] = useState<{
    [roomId: string]: RealtimeChannel;
  }>({});
  const [presenceChannel, setPresenceChannel] = useState<RealtimeChannel | null>(null);

  const { user, session } = useAuth();
  const { sendDemoNotification } = useNotifications();

  useEffect(() => {
    if (session?.user) {
      loadChatRooms();
      setupChatRoomsSubscription();
      setupPresence();
      updateLastSeen(); // Initial update
    }

    return () => {
      // Cleanup realtime subscriptions
      Object.values(realtimeChannels).forEach(channel => {
        supabase.removeChannel(channel);
      });

      // Cleanup presence
      if (presenceChannel) {
        presenceChannel.untrack();
        supabase.removeChannel(presenceChannel);
      }

      // Update last_seen when unmounting
      if (user) {
        updateLastSeen();
      }
    };
  }, [session]);

  // Update last_seen periodically while app is active
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      updateLastSeen();
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [user]);

  const loadChatRooms = async () => {
    if (!session?.user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('chat_rooms')
        .select(
          `
          *,
          requests!chat_rooms_request_id_fkey(titulo, estatus)
        `
        )
        .contains('participants', [session.user.id])
        .eq('is_active', true)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error loading chat rooms:', error);
        setError(`Error al cargar los chats: ${error.message}`);
        setLoading(false);
        return;
      }

      setChatRooms(data || []);

      // Load messages for each room (limit to prevent infinite loading)
       const roomPromises = (data || []).slice(0, 10).map(async (room: any) => {
         try {
           await loadRoomMessages(room.id);
           // Only setup realtime if we have a valid, non-expired session
           if (session?.access_token && session?.expires_at) {
             const expiresAt = new Date(session.expires_at * 1000);
             const now = new Date();
             if (expiresAt > now) {
               setupRealtimeSubscription(room.id);
             } else {
               console.warn('Session expired, skipping realtime setup for room:', room.id);
             }
           }
         } catch (roomError) {
           console.error(`Error loading room ${room.id}:`, roomError);
         }
       });

      await Promise.allSettled(roomPromises);
    } catch (error) {
      console.error('Error loading chat rooms:', error);
      setError(
        `Error al cargar los chats: ${error instanceof Error ? error.message : 'Error desconocido'}`
      );
    } finally {
      setLoading(false);
    }
  };

  const loadRoomMessages = async (roomId: string, limit: number = 50) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(
          `
          *,
          user:users(nombre, apellido_paterno, apellido_materno, foto)
        `
        )
        .eq('chat_room_id', roomId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('Error loading messages:', error);
        return;
      }

      setMessages(prev => ({
        ...prev,
        [roomId]: data || [],
      }));
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const setupRealtimeSubscription = (roomId: string) => {
    if (realtimeChannels[roomId]) return; // Already subscribed

    const channel = supabase
      .channel(`chat_room_${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_room_id=eq.${roomId}`,
        },
        async payload => {
          const newMessage = payload.new as Message;

          // Get user info for the message
          const { data: userData } = await supabase
            .from('users')
            .select('nombre, apellido_paterno, apellido_materno, foto')
            .eq('id', newMessage.sender_id)
            .single();

          const messageWithUser: ChatMessage = {
            ...newMessage,
            user: userData || undefined,
            isDelivered: true,
            isRead: false,
          };

          setMessages(prev => ({
            ...prev,
            [roomId]: [...(prev[roomId] || []), messageWithUser],
          }));

          // Send notification if message is from another user
          if (newMessage.sender_id !== user?.id) {
            await sendDemoNotification(
              `💬 ${newMessage.sender_name}`,
              getMessagePreview(newMessage),
              'info',
              { roomId, messageId: newMessage.id }
            );
          }

          // Update chat room's updated_at
          setChatRooms(prev =>
            prev.map(room =>
              room.id === roomId
                ? {
                    ...room,
                    updated_at: newMessage.created_at,
                    last_message: newMessage,
                  }
                : room
            )
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `chat_room_id=eq.${roomId}`,
        },
        payload => {
          const updatedMessage = payload.new as Message;

          setMessages(prev => ({
            ...prev,
            [roomId]:
              prev[roomId]?.map(msg =>
                msg.id === updatedMessage.id
                  ? { ...msg, ...updatedMessage }
                  : msg
              ) || [],
          }));
        }
      )
      .on('presence', { event: 'sync' }, () => {
        // Handle presence updates for typing indicators
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        // Handle user joining
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        // Handle user leaving
      })
      .subscribe();

    setRealtimeChannels(prev => ({ ...prev, [roomId]: channel }));
  };

  const setupChatRoomsSubscription = () => {
    if (!session?.user) return;

    // Subscribe to chat_rooms table for new rooms
    const chatRoomsChannel = supabase
      .channel('chat_rooms_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_rooms',
        },
        async (payload) => {
          const newRoom = payload.new as ChatRoom;

          // Only add if current user is a participant
          if (newRoom.participants?.includes(session.user.id)) {
            // Load room details with relations
            const { data: roomData } = await supabase
              .from('chat_rooms')
              .select(`
                *,
                requests!chat_rooms_request_id_fkey(titulo, estatus)
              `)
              .eq('id', newRoom.id)
              .single();

            if (roomData) {
              setChatRooms(prev => [roomData, ...prev]);
              await loadRoomMessages(newRoom.id);
              setupRealtimeSubscription(newRoom.id);

              // Notify user about new chat
              await sendDemoNotification(
                'Nuevo chat',
                'Se ha creado una nueva conversación',
                'info',
                { roomId: newRoom.id }
              );
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_rooms',
        },
        (payload) => {
          const updatedRoom = payload.new as ChatRoom;

          // Update room in state
          setChatRooms(prev =>
            prev.map(room =>
              room.id === updatedRoom.id
                ? { ...room, ...updatedRoom }
                : room
            )
          );
        }
      )
      .subscribe();

    setRealtimeChannels(prev => ({ ...prev, chat_rooms_global: chatRoomsChannel }));
  };

  const getMessagePreview = (message: Message): string => {
    switch (message.type) {
      case 'image':
        return '📷 Imagen';
      case 'audio':
        return '🎵 Audio';
      case 'file':
        return `📎 ${message.file_name || 'Archivo'}`;
      case 'system':
        return '🔔 Mensaje del sistema';
      default:
        return message.message.length > 50
          ? message.message.substring(0, 50) + '...'
          : message.message;
    }
  };

  const sendMessage = async (
    roomId: string,
    message: string,
    messageType: Message['type'] = 'text',
    fileUrl?: string,
    fileName?: string,
    fileSize?: number,
    audioDuration?: number,
    replyTo?: string
  ) => {
    if (!user || !session) {
      console.error('Cannot send message: user not authenticated');
      throw new Error('Usuario no autenticado');
    }

    // Validate message
    if (!message || message.trim().length === 0) {
      console.error('Cannot send empty message');
      throw new Error('El mensaje no puede estar vacío');
    }

    // Validate room exists
    const room = chatRooms.find(r => r.id === roomId);
    if (!room) {
      console.error('Chat room not found:', roomId);
      throw new Error('Sala de chat no encontrada');
    }

    console.log('Sending message:', {
      roomId,
      messageType,
      length: message.length,
      hasFile: !!fileUrl,
    });

    // Optimistic update - add message immediately to UI
    const tempId = `temp_${Date.now()}`;
    const optimisticMessage: ChatMessage = {
      id: tempId,
      chat_room_id: roomId,
      sender_id: user.id,
      sender_name: `${user.nombre} ${user.apellido_paterno}`,
      message,
      type: messageType,
      file_url: fileUrl,
      file_name: fileName,
      file_size: fileSize,
      audio_duration: audioDuration,
      reply_to: replyTo,
      is_deleted: false,
      created_at: new Date().toISOString(),
      localId: tempId,
      isDelivered: false,
      isRead: false,
      user: user,
    };

    setMessages(prev => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []), optimisticMessage],
    }));

    try {
      const { data, error } = await supabaseClient
        .from('messages')
        .insert({
          chat_room_id: roomId,
          sender_id: user.id,
          sender_name: `${user.nombre} ${user.apellido_paterno}`,
          message: message.trim(),
          type: messageType,
          file_url: fileUrl,
          file_name: fileName,
          file_size: fileSize,
          audio_duration: audioDuration,
          reply_to: replyTo,
          is_deleted: false,
        })
        .select(
          `
          *,
          user:users(nombre, apellido_paterno, apellido_materno, foto)
        `
        )
        .single();

      if (error) {
        console.error('Error sending message:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        // Remove optimistic message on error
        setMessages(prev => ({
          ...prev,
          [roomId]: prev[roomId]?.filter(msg => msg.localId !== tempId) || [],
        }));
        throw new Error(`No se pudo enviar el mensaje: ${error.message}`);
      }

      if (!data) {
        console.error('No data returned from message insert');
        setMessages(prev => ({
          ...prev,
          [roomId]: prev[roomId]?.filter(msg => msg.localId !== tempId) || [],
        }));
        throw new Error('No se recibió confirmación del mensaje enviado');
      }

      console.log('Message sent successfully:', data.id);

      // Replace optimistic message with real message
      if (data) {
        setMessages(prev => ({
          ...prev,
          [roomId]:
            prev[roomId]?.map(msg =>
              msg.localId === tempId
                ? { ...(data as any), user: (data as any).user, isDelivered: true, isRead: false }
                : msg
            ) || [],
        }));
      }

      // Update chat room's last message and timestamp
      try {
        const { error: updateError } = await supabaseClient
          .from('chat_rooms')
          .update({
            last_message: {
              id: data.id,
              message: data.message,
              sender_id: data.sender_id,
              sender_name: data.sender_name,
              created_at: data.created_at,
              type: data.type,
            },
            updated_at: new Date().toISOString(),
          })
          .eq('id', roomId);

        if (updateError) {
          console.error('Error updating chat room:', updateError);
          // Don't fail if room update fails
        }
      } catch (updateError) {
        console.error('Error updating chat room:', updateError);
        // Don't fail if room update fails
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove optimistic message on error
      setMessages(prev => ({
        ...prev,
        [roomId]: prev[roomId]?.filter(msg => msg.localId !== tempId) || [],
      }));
      throw error;
    }
  };

  const sendTypingIndicator = useCallback(
    (roomId: string, isTyping: boolean) => {
      if (!user || !realtimeChannels[roomId]) return;

      const channel = realtimeChannels[roomId];

      if (isTyping) {
        channel.track({
          user_id: user.id,
          user_name: `${user.nombre} ${user.apellido_paterno}`,
          typing: true,
          timestamp: Date.now(),
        });
      } else {
        channel.untrack();
      }
    },
    [user, realtimeChannels]
  );

  const createChatRoom = async (
    participantId: string,
    participantName: string,
    requestId?: string
  ): Promise<string> => {
    if (!user || !session) throw new Error('User not authenticated');

    try {
      console.log('Creating/finding chat room:', {
        currentUserId: user.id,
        participantId,
        requestId,
      });

      // Validate participant exists
      const { data: participantData, error: participantError } = await supabase
        .from('users')
        .select('id, nombre, apellido_paterno, apellido_materno, activo')
        .eq('id', participantId)
        .single();

      if (participantError || !participantData) {
        console.error('Participant not found:', participantError);
        throw new Error('El usuario destinatario no existe o no está disponible');
      }

      if (!participantData.activo) {
        throw new Error('El usuario destinatario no está activo');
      }

      // Check if chat room already exists between these participants
      // Use proper array comparison for PostgreSQL
      const { data: existingRooms, error: searchError } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('is_active', true);

      if (searchError) {
        console.error('Error searching for existing rooms:', searchError);
      }

      // Filter rooms that contain both participants
      const existingRoom = existingRooms?.find(room => {
        const participants = room.participants || [];
        return (
          participants.includes(user.id) &&
          participants.includes(participantId) &&
          participants.length === 2
        );
      });

      if (existingRoom) {
        console.log('Found existing chat room:', existingRoom.id);
        // Load messages for existing room if not already loaded
        if (!messages[existingRoom.id]) {
          await loadRoomMessages(existingRoom.id);
        }
        setupRealtimeSubscription(existingRoom.id);
        return existingRoom.id;
      }

      console.log('No existing room found, creating new one');

      // Validate request exists if provided
      if (requestId) {
        const { data: requestData, error: requestError } = await supabase
          .from('requests')
          .select('id, titulo, estatus')
          .eq('id', requestId)
          .single();

        if (requestError || !requestData) {
          console.error('Request not found:', requestError);
          throw new Error('La solicitud asociada no existe');
        }
      }

      // Build participant names properly
      const currentUserName = `${user.nombre || ''} ${user.apellido_paterno || ''} ${user.apellido_materno || ''}`.trim() || user.email || 'Usuario';
      const otherUserName = participantName || `${participantData.nombre || ''} ${participantData.apellido_paterno || ''} ${participantData.apellido_materno || ''}`.trim() || 'Usuario';

      // Create new chat room
      const { data, error } = await supabaseClient
        .from('chat_rooms')
        .insert({
          tipo: requestId ? 'support' : 'general',
          participants: [user.id, participantId],
          request_id: requestId || null,
          is_active: true,
          metadata: {
            participant_names: [currentUserName, otherUserName],
            participant_ids: [user.id, participantId],
            created_by: user.id,
            created_at: new Date().toISOString(),
          },
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating chat room:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        throw new Error(`No se pudo crear el chat: ${error.message}`);
      }

      if (!data) {
        console.error('No data returned from chat room creation');
        throw new Error('No se recibió confirmación de la creación del chat');
      }

      console.log('Chat room created successfully:', data.id);

      setChatRooms(prev => [data, ...prev]);
      setMessages(prev => ({ ...prev, [data.id]: [] }));
      setupRealtimeSubscription(data.id);

      // Send welcome message
      try {
        await sendMessage(
          data.id,
          `¡Hola ${otherUserName}! 👋 ¿En qué puedo ayudarte?`,
          'system'
        );
      } catch (msgError) {
        console.error('Error sending welcome message:', msgError);
        // Don't fail if welcome message fails
      }

      return data.id;
    } catch (error) {
      console.error('Error creating chat room:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new Error(errorMessage);
    }
  };

  const markMessagesAsRead = async (roomId: string) => {
    if (!session?.user) return;

    try {
      // Update read_by field for unread messages
      const unreadMessages =
        messages[roomId]?.filter(
          msg => msg.sender_id !== user?.id && !msg.isRead
        ) || [];

      if (unreadMessages.length === 0) return;

      const messageIds = unreadMessages.map(msg => msg.id);

      // In a real implementation, you would update the read_by JSONB field
      // For now, we'll update local state
      setMessages(prev => ({
        ...prev,
        [roomId]:
          prev[roomId]?.map(msg =>
            messageIds.includes(msg.id) ? { ...msg, isRead: true } : msg
          ) || [],
      }));
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const loadMoreMessages = async (roomId: string) => {
    try {
      const currentMessages = messages[roomId] || [];
      const oldestMessage = currentMessages[0];

      if (!oldestMessage) return;

      const { data, error } = await supabase
        .from('messages')
        .select(
          `
          *,
          user:users(nombre, apellido_paterno, apellido_materno, foto)
        `
        )
        .eq('chat_room_id', roomId)
        .eq('is_deleted', false)
        .lt('created_at', oldestMessage.created_at)
        .order('created_at', { ascending: true })
        .limit(20);

      if (error) {
        console.error('Error loading more messages:', error);
        return;
      }

      if (data && data.length > 0) {
        setMessages(prev => ({
          ...prev,
          [roomId]: [...data, ...currentMessages],
        }));
      }
    } catch (error) {
      console.error('Error loading more messages:', error);
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabaseClient
        .from('messages')
        .update({
          is_deleted: true,
          message: 'Este mensaje fue eliminado',
          edited_at: new Date().toISOString(),
        })
        .eq('id', messageId);

      if (error) {
        console.error('Error deleting message:', error);
        return;
      }

      // Update local state
      Object.keys(messages).forEach(roomId => {
        setMessages(prev => ({
          ...prev,
          [roomId]:
            prev[roomId]?.map(msg =>
              msg.id === messageId
                ? {
                    ...msg,
                    is_deleted: true,
                    message: 'Este mensaje fue eliminado',
                  }
                : msg
            ) || [],
        }));
      });
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const editMessage = async (messageId: string, newMessage: string) => {
    try {
      const { error } = await supabaseClient
        .from('messages')
        .update({
          message: newMessage,
          edited_at: new Date().toISOString(),
        })
        .eq('id', messageId);

      if (error) {
        console.error('Error editing message:', error);
        return;
      }

      // Update local state
      Object.keys(messages).forEach(roomId => {
        setMessages(prev => ({
          ...prev,
          [roomId]:
            prev[roomId]?.map(msg =>
              msg.id === messageId
                ? {
                    ...msg,
                    message: newMessage,
                    edited_at: new Date().toISOString(),
                  }
                : msg
            ) || [],
        }));
      });
    } catch (error) {
      console.error('Error editing message:', error);
    }
  };

  const getChatRoom = (roomId: string): ChatRoom | undefined => {
    return chatRooms.find(room => room.id === roomId);
  };

  const getUnreadCount = (): number => {
    return Object.values(messages).reduce((total, roomMessages) => {
      return (
        total +
        roomMessages.filter(msg => msg.sender_id !== user?.id && !msg.isRead)
          .length
      );
    }, 0);
  };

  const getRoomUnreadCount = (roomId: string): number => {
    const roomMessages = messages[roomId] || [];
    return roomMessages.filter(msg => msg.sender_id !== user?.id && !msg.isRead)
      .length;
  };

  const updateLastSeen = useCallback(async () => {
    if (!user) return;

    try {
      await supabaseClient
        .from('users')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', user.id);
    } catch (error) {
      console.error('Error updating last_seen:', error);
    }
  }, [user]);

  const setupPresence = useCallback(() => {
    if (!user) return;

    console.log('Setting up presence tracking for user:', user.id);

    const channel = supabase
      .channel('online_users')
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const userIds = Object.keys(state)
          .flatMap(key => state[key])
          .map((presence: any) => presence.user_id)
          .filter(Boolean);

        console.log('Online users updated:', userIds);
        setOnlineUsers(userIds);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track current user as online
          await channel.track({
            user_id: user.id,
            user_name: `${user.nombre} ${user.apellido_paterno}`,
            online_at: new Date().toISOString()
          });
          console.log('User tracked as online');
        }
      });

    setPresenceChannel(channel);
  }, [user]);

  const isUserOnline = useCallback((userId: string): boolean => {
    return onlineUsers.includes(userId);
  }, [onlineUsers]);

  return (
    <ChatContext.Provider
      value={{
        chatRooms,
        messages,
        typingUsers,
        onlineUsers,
        sendMessage,
        sendTypingIndicator,
        createChatRoom,
        markMessagesAsRead,
        getChatRoom,
        getUnreadCount,
        getRoomUnreadCount,
        loadMoreMessages,
        deleteMessage,
        editMessage,
        isUserOnline,
        loading,
        error,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
