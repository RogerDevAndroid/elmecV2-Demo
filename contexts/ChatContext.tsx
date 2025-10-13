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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [realtimeChannels, setRealtimeChannels] = useState<{
    [roomId: string]: RealtimeChannel;
  }>({});

  const { user, session } = useAuth();
  const { sendDemoNotification } = useNotifications();

  useEffect(() => {
    if (session?.user) {
      loadChatRooms();
    }

    return () => {
      // Cleanup realtime subscriptions
      Object.values(realtimeChannels).forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [session]);

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
           // Only setup realtime if we have a valid session
           if (session?.access_token) {
             setupRealtimeSubscription(room.id);
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
    if (!user || !session) return;

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
          message,
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
        // Remove optimistic message on error
        setMessages(prev => ({
          ...prev,
          [roomId]: prev[roomId]?.filter(msg => msg.localId !== tempId) || [],
        }));
        return;
      }

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
      await supabaseClient
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
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove optimistic message on error
      setMessages(prev => ({
        ...prev,
        [roomId]: prev[roomId]?.filter(msg => msg.localId !== tempId) || [],
      }));
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
      // Check if chat room already exists between these participants
      const { data: existingRoom } = await (supabase as any)
        .from('chat_rooms')
        .select('*')
        .contains('participants', [user.id])
        .contains('participants', [participantId])
        .eq('is_active', true)
        .maybeSingle();

      if (existingRoom) {
        // Load messages for existing room if not already loaded
        if (!messages[existingRoom.id]) {
          await loadRoomMessages(existingRoom.id);
        }
        setupRealtimeSubscription(existingRoom.id);
        return existingRoom.id;
      }

      // Create new chat room
      const { data, error } = await supabaseClient
        .from('chat_rooms')
        .insert({
          tipo: requestId ? 'support' : 'general',
          participants: [user.id, participantId],
          request_id: requestId,
          is_active: true,
          metadata: {
            participant_names: [
              (`${user.nombre} ${user.apellido_paterno ?? ''} ${user.apellido_materno ?? ''}`.trim() || user.email),
              participantName,
            ],
          },
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating chat room:', error);
        throw error;
      }

      setChatRooms(prev => [data, ...prev]);
      setMessages(prev => ({ ...prev, [data.id]: [] }));
      setupRealtimeSubscription(data.id);

      // Send welcome message
      await sendMessage(
        data.id,
        `¡Hola ${participantName}! 👋 ¿En qué puedo ayudarte?`,
        'system'
      );

      return data.id;
    } catch (error) {
      console.error('Error creating chat room:', error);
      throw error;
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

  return (
    <ChatContext.Provider
      value={{
        chatRooms,
        messages,
        typingUsers,
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
        loading,
        error,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
