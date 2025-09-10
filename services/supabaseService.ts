import { supabase } from '@/lib/supabase';
import {
  User,
  Request,
  ChatRoom,
  Message,
  Notification,
} from '@/types/supabase';

export class SupabaseService {
  // Authentication Services
  static async registerUser(
    userData: Omit<User, 'id' | 'created_at' | 'updated_at'> & {
      password: string;
    }
  ): Promise<User> {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.correo_electronico,
        password: userData.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create user profile
        const { password, ...userProfile } = userData;
        const { data, error } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: authData.user.email!,
            ...userProfile,
            activo: true,
            is_online: false,
            last_seen: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }

      throw new Error('User creation failed');
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }

  static async loginUser(email: string, password: string): Promise<User> {
    try {
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError) throw authError;

      if (authData.user) {
        // Get user profile
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (error) throw error;

        // Update last login and online status
        await supabase
          .from('users')
          .update({
            last_login: new Date().toISOString(),
            is_online: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', authData.user.id);

        return data;
      }

      throw new Error('Login failed');
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }

  static async logoutUser(): Promise<void> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase
          .from('users')
          .update({
            is_online: false,
            last_seen: new Date().toISOString(),
          })
          .eq('id', user.id);
      }

      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  }

  // User Services
  static async getUserInfo(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error getting user info:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting user info:', error);
      return null;
    }
  }

  static async updateUser(
    userId: string,
    updates: Partial<User>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  static async getDirectoryUsers(
    role?: string,
    excludeUserId?: string
  ): Promise<User[]> {
    try {
      let query = supabase
        .from('users')
        .select('*')
        .eq('activo', true)
        .order('nombre', { ascending: true });

      if (role) {
        query = query.eq('rol', role);
      }

      if (excludeUserId) {
        query = query.neq('id', excludeUserId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error getting directory users:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting directory users:', error);
      return [];
    }
  }

  static async searchUsers(
    searchQuery: string,
    filters?: {
      categoria?: string;
      zona?: string;
      rol?: string;
      excludeUserId?: string;
    }
  ): Promise<User[]> {
    try {
      let query = supabase.from('users').select('*').eq('activo', true);

      // Apply text search
      if (searchQuery.trim()) {
        query = query.or(
          `nombre.ilike.%${searchQuery}%,apellido_paterno.ilike.%${searchQuery}%,apellido_materno.ilike.%${searchQuery}%,correo_electronico.ilike.%${searchQuery}%,empresa.ilike.%${searchQuery}%`
        );
      }

      // Apply filters
      if (filters?.categoria) {
        query = query.eq('categoria', filters.categoria);
      }

      if (filters?.zona) {
        query = query.eq('zona', filters.zona);
      }

      if (filters?.rol) {
        query = query.eq('rol', filters.rol);
      }

      if (filters?.excludeUserId) {
        query = query.neq('id', filters.excludeUserId);
      }

      query = query.order('nombre', { ascending: true });

      const { data, error } = await query;

      if (error) {
        console.error('Error searching users:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }

  static async updateUserOnlineStatus(
    userId: string,
    isOnline: boolean
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          is_online: isOnline,
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating user online status:', error);
    }
  }

  // Request Services
  static async createRequest(
    requestData: Omit<Request, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Request> {
    try {
      const { data, error } = await supabase
        .from('requests')
        .insert(requestData)
        .select()
        .single();

      if (error) throw error;

      // Create notification for agent if assigned
      if (requestData.agente_id) {
        await this.createNotification({
          user_id: requestData.agente_id,
          title: 'Nueva solicitud asignada',
          body: `Se te ha asignado la solicitud: ${requestData.titulo}`,
          type: 'assignment',
          priority: 'medium',
          data: { requestId: data.id },
          read: false,
        });
      }

      return data;
    } catch (error) {
      console.error('Error creating request:', error);
      throw error;
    }
  }

  static async getUserRequests(
    userId: string,
    role: string
  ): Promise<Request[]> {
    try {
      const field = role === 'customer' ? 'usuario_id' : 'agente_id';
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq(field, userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting user requests:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting user requests:', error);
      return [];
    }
  }

  static async getAllRequests(): Promise<Request[]> {
    try {
      const { data, error } = await supabase
        .from('requests')
        .select(
          `
          *,
          usuario:users!requests_usuario_id_fkey(nombre, apellido_paterno, apellido_materno, empresa),
          agente:users!requests_agente_id_fkey(nombre, apellido_paterno, apellido_materno, categoria)
        `
        )
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting all requests:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting all requests:', error);
      return [];
    }
  }

  static async getRequestsForUser(
    userId: string,
    role: string
  ): Promise<Request[]> {
    try {
      let query = supabase
        .from('requests')
        .select(
          `
          *,
          usuario:users!requests_usuario_id_fkey(nombre, apellido_paterno, apellido_materno, empresa),
          agente:users!requests_agente_id_fkey(nombre, apellido_paterno, apellido_materno, categoria)
        `
        )
        .order('created_at', { ascending: false });

      // Filtrar según el rol del usuario
      if (role === 'customer') {
        query = query.eq('usuario_id', userId);
      } else if (role === 'agent') {
        query = query.eq('agente_id', userId);
      }
      // Los admins pueden ver todas las solicitudes

      const { data, error } = await query;

      if (error) {
        console.error('Error getting requests for user:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting requests for user:', error);
      return [];
    }
  }

  static async updateRequestStatus(
    requestId: string,
    status: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('requests')
        .update({
          estatus: status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating request status:', error);
      throw error;
    }
  }

  static async getAgents(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(
          'id, nombre, apellido_paterno, apellido_materno, categoria, zona'
        )
        .eq('rol', 'agent')
        .eq('activo', true)
        .order('nombre', { ascending: true });

      if (error) {
        console.error('Error getting agents:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting agents:', error);
      return [];
    }
  }

  // Chat Services
  static async getChatRoomsForUser(userId: string): Promise<ChatRoom[]> {
    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select(
          `
          *,
          request:requests(titulo, estatus),
          participants_info:users!inner(id, nombre, apellido_paterno, apellido_materno, foto, is_online)
        `
        )
        .contains('participants', [userId])
        .eq('is_active', true)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error getting chat rooms:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting chat rooms:', error);
      return [];
    }
  }

  static async getChatRoomMessages(
    roomId: string,
    limit: number = 50,
    before?: string
  ): Promise<Message[]> {
    try {
      let query = supabase
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

      if (before) {
        query = query.lt('created_at', before);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error getting chat room messages:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting chat room messages:', error);
      return [];
    }
  }

  static async createChatRoom(
    participants: string[],
    tipo: ChatRoom['tipo'],
    requestId?: string
  ): Promise<ChatRoom> {
    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .insert({
          tipo,
          participants,
          request_id: requestId,
          is_active: true,
          metadata: {},
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating chat room:', error);
      throw error;
    }
  }

  static async sendMessage(
    chatRoomId: string,
    senderId: string,
    senderName: string,
    message: string,
    type: Message['type'] = 'text'
  ): Promise<Message> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          chat_room_id: chatRoomId,
          sender_id: senderId,
          sender_name: senderName,
          message,
          type,
          is_deleted: false,
        })
        .select()
        .single();

      if (error) throw error;

      // Update chat room with last message
      await supabase
        .from('chat_rooms')
        .update({
          last_message: {
            id: data.id,
            message: data.message,
            sender_id: data.sender_id,
            created_at: data.created_at,
            type: data.type,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', chatRoomId);

      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  static async sendChatMessage(
    chatRoomId: string,
    senderId: string,
    senderName: string,
    message: string,
    type: Message['type'] = 'text',
    fileUrl?: string,
    fileName?: string,
    fileSize?: number,
    audioDuration?: number,
    replyTo?: string
  ): Promise<Message> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          chat_room_id: chatRoomId,
          sender_id: senderId,
          sender_name: senderName,
          message,
          type,
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

      if (error) throw error;

      // Update chat room with last message
      await supabase
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
        .eq('id', chatRoomId);

      return data;
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
    }
  }

  static async markMessagesAsRead(
    roomId: string,
    userId: string
  ): Promise<void> {
    try {
      // In a real implementation, you would update the read_by JSONB field
      // For now, we'll just log the action
      console.log(
        `Marking messages as read for room ${roomId} by user ${userId}`
      );

      // You could implement this by updating the read_by field:
      // UPDATE messages SET read_by = jsonb_set(read_by, '{userId}', 'true')
      // WHERE chat_room_id = roomId AND sender_id != userId
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }

  static async deleteMessage(messageId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('messages')
        .update({
          is_deleted: true,
          message: 'Este mensaje fue eliminado',
          edited_at: new Date().toISOString(),
        })
        .eq('id', messageId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }

  static async editMessage(
    messageId: string,
    newMessage: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('messages')
        .update({
          message: newMessage,
          edited_at: new Date().toISOString(),
        })
        .eq('id', messageId);

      if (error) throw error;
    } catch (error) {
      console.error('Error editing message:', error);
      throw error;
    }
  }

  // Notification Services
  static async createNotification(
    notificationData: Omit<Notification, 'id' | 'created_at'>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert(notificationData);

      if (error) throw error;
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }

  static async getNotifications(userId: string): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting notifications:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }

  static async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          read: true,
          read_at: new Date().toISOString(),
        })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }
}

export default SupabaseService;
