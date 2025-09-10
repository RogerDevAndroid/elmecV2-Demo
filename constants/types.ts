// Legacy types for backward compatibility with existing API service
export interface AgentList {
  id: number;
  first_name: string;
  last_name: string;
  materno: string;
  email: string;
  telefono: string;
  rol: number;
  zona: string;
  categoria: string;
  activo: boolean;
  foto?: string;
}

export interface dataChats {
  id: number;
  usuario: number;
  mensaje: string;
  archivo?: string;
  fecha_envio: string;
  solicitud_chat: number;
}

// New Firebase-compatible types
export interface RequestFormData {
  titulo: string;
  mensaje: string;
  tipo: number;
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  agenteId?: string;
  archivos?: string[];
  tags?: string[];
}

export interface ChatMessageData {
  message: string;
  type: 'text' | 'image' | 'file' | 'audio';
  fileUrl?: string;
  fileName?: string;
  audioDuration?: number;
  replyTo?: string;
}

export interface NotificationData {
  title: string;
  body: string;
  type: 'request_update' | 'new_message' | 'assignment' | 'reminder' | 'system';
  priority: 'low' | 'medium' | 'high';
  data?: any;
}

export interface AnalyticsEvent {
  event: string;
  properties?: {
    [key: string]: any;
  };
}

export interface UserPresenceStatus {
  isOnline: boolean;
  lastSeen: string;
  status: 'available' | 'busy' | 'away' | 'offline';
  currentPage?: string;
}

export interface FileUploadResult {
  id: string;
  url: string;
  fileName: string;
  size: number;
  mimeType: string;
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  errors: ValidationError[];
  isValid: boolean;
  isSubmitting: boolean;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationError[];
}

export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
}
