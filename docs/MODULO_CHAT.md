# 💬 Módulo de Chat en Tiempo Real - Documentación Técnica

## Índice
1. [Visión General](#visión-general)
2. [Arquitectura](#arquitectura)
3. [Funcionalidades](#funcionalidades)
4. [API y Métodos](#api-y-métodos)
5. [Componentes](#componentes)
6. [Tiempo Real](#tiempo-real)
7. [Casos de Uso](#casos-de-uso)

---

## Visión General

### Descripción
El módulo de chat proporciona comunicación en tiempo real entre usuarios, agentes y administradores. Utiliza **Supabase Realtime** para sincronización instantánea de mensajes.

### Características Principales
- ✅ Mensajería en tiempo real con WebSockets
- ✅ Múltiples tipos de mensaje: texto, imagen, archivo, audio
- ✅ Indicadores de "escribiendo..."
- ✅ Estados de mensaje: enviado, entregado, leído
- ✅ Respuestas a mensajes (reply)
- ✅ Edición y eliminación de mensajes
- ✅ Emojis y reacciones
- ✅ Adjuntar archivos e imágenes
- ✅ Grabación de audio
- ✅ Historial completo de conversaciones
- ✅ Notificaciones de nuevos mensajes
- ✅ Optimistic updates

### Tecnologías
- **Supabase Realtime**: WebSockets para tiempo real
- **React Context API**: Gestión de estado del chat
- **Expo AV**: Grabación de audio
- **Expo Image Picker**: Selección de imágenes
- **Expo Document Picker**: Selección de archivos

---

## Arquitectura

### Diagrama del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    ChatContext Provider                      │
│                                                               │
│  Estado:                                                      │
│  - chatRooms: ChatRoom[]                                     │
│  - messages: { [roomId]: ChatMessage[] }                    │
│  - typingUsers: { [roomId]: TypingUser[] }                  │
│                                                               │
│  Métodos:                                                     │
│  - sendMessage()                                             │
│  - createChatRoom()                                          │
│  - markMessagesAsRead()                                      │
│  - sendTypingIndicator()                                     │
└─────────────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────────────┐
│                  Supabase Realtime                           │
│                                                               │
│  Canales:                                                     │
│  - chat_room_{roomId}                                        │
│                                                               │
│  Eventos:                                                     │
│  - postgres_changes (INSERT message)                         │
│  - postgres_changes (UPDATE message)                         │
│  - presence (typing indicators)                              │
└─────────────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────────────┐
│                    Database Tables                           │
│                                                               │
│  - chat_rooms                                                │
│  - messages                                                  │
│  - users (para info de remitente)                           │
└─────────────────────────────────────────────────────────────┘
```

### Flujo de Mensaje

```
Usuario escribe mensaje
       ↓
sendMessage() (Optimistic Update)
       ↓
Mensaje agregado localmente con localId
       ↓
INSERT en tabla messages (Supabase)
       ↓
Realtime Event fired (postgres_changes)
       ↓
Todos los clientes reciben el mensaje
       ↓
Mensaje local reemplazado por mensaje real
       ↓
Notificación enviada a otros usuarios
```

---

## Funcionalidades

### 1. Tipos de Mensajes

#### Mensaje de Texto
```typescript
{
  type: 'text',
  message: 'Hola, ¿cómo estás?',
}
```

#### Mensaje con Imagen
```typescript
{
  type: 'image',
  message: 'Mira esta imagen',
  file_url: 'https://...',
  file_name: 'imagen.jpg',
  file_size: 123456,
}
```

#### Mensaje con Archivo
```typescript
{
  type: 'file',
  message: 'Documento adjunto',
  file_url: 'https://...',
  file_name: 'documento.pdf',
  file_size: 789012,
}
```

#### Mensaje de Audio
```typescript
{
  type: 'audio',
  message: 'Mensaje de voz',
  file_url: 'https://...',
  audio_duration: 45, // segundos
}
```

#### Mensaje del Sistema
```typescript
{
  type: 'system',
  message: 'Usuario se unió a la conversación',
}
```

---

### 2. Salas de Chat

#### Tipos de Salas

**Soporte (1-a-1)**:
```typescript
{
  tipo: 'support',
  participants: [userId, agentId],
  request_id: 'solicitud-123',
}
```

**General (1-a-1)**:
```typescript
{
  tipo: 'general',
  participants: [user1Id, user2Id],
}
```

**Grupal**:
```typescript
{
  tipo: 'group',
  participants: [user1Id, user2Id, user3Id],
  metadata: {
    group_name: 'Equipo de Desarrollo',
  }
}
```

---

### 3. Estados de Mensaje

```typescript
interface MessageStates {
  isDelivered: boolean;  // Mensaje llegó al servidor
  isRead: boolean;       // Mensaje fue leído por destinatario
  edited_at?: string;    // Mensaje fue editado
  is_deleted: boolean;   // Mensaje fue eliminado
}
```

---

## API y Métodos

### ChatContext API

#### `sendMessage()`

Envía un mensaje a una sala de chat.

```typescript
sendMessage(
  roomId: string,
  message: string,
  messageType?: 'text' | 'image' | 'file' | 'audio' | 'system',
  fileUrl?: string,
  fileName?: string,
  fileSize?: number,
  audioDuration?: number,
  replyTo?: string
): Promise<void>
```

**Ejemplo**:
```typescript
// Mensaje de texto
await sendMessage('room-123', 'Hola!', 'text');

// Mensaje con imagen
await sendMessage(
  'room-123',
  'Mira esta imagen',
  'image',
  'https://storage.../imagen.jpg',
  'imagen.jpg',
  123456
);

// Responder a un mensaje
await sendMessage(
  'room-123',
  'Respuesta',
  'text',
  undefined,
  undefined,
  undefined,
  undefined,
  'message-id-to-reply'
);
```

---

#### `createChatRoom()`

Crea una nueva sala de chat.

```typescript
createChatRoom(
  participantId: string,
  participantName: string,
  requestId?: string
): Promise<string>
```

**Ejemplo**:
```typescript
// Chat de soporte vinculado a solicitud
const roomId = await createChatRoom(
  'agent-id',
  'Juan Agente',
  'request-123'
);

// Chat general
const roomId = await createChatRoom(
  'user-id',
  'María Usuario'
);
```

---

#### `sendTypingIndicator()`

Indica que el usuario está escribiendo.

```typescript
sendTypingIndicator(
  roomId: string,
  isTyping: boolean
): void
```

**Ejemplo**:
```typescript
// Usuario empieza a escribir
sendTypingIndicator('room-123', true);

// Usuario deja de escribir
setTimeout(() => {
  sendTypingIndicator('room-123', false);
}, 3000);
```

---

#### `markMessagesAsRead()`

Marca mensajes como leídos.

```typescript
markMessagesAsRead(roomId: string): Promise<void>
```

**Ejemplo**:
```typescript
// Cuando usuario abre la sala
useEffect(() => {
  if (roomId) {
    markMessagesAsRead(roomId);
  }
}, [roomId]);
```

---

#### `editMessage()`

Edita un mensaje existente.

```typescript
editMessage(
  messageId: string,
  newMessage: string
): Promise<void>
```

**Ejemplo**:
```typescript
await editMessage('msg-123', 'Mensaje editado');
```

---

#### `deleteMessage()`

Elimina (soft delete) un mensaje.

```typescript
deleteMessage(messageId: string): Promise<void>
```

**Ejemplo**:
```typescript
await deleteMessage('msg-123');
// El mensaje se marca como eliminado, no se borra físicamente
```

---

#### `loadMoreMessages()`

Carga mensajes antiguos (paginación).

```typescript
loadMoreMessages(roomId: string): Promise<void>
```

**Ejemplo**:
```typescript
// En un ScrollView cuando llega al top
const handleScroll = (event) => {
  if (event.contentOffset.y <= 0) {
    loadMoreMessages(roomId);
  }
};
```

---

## Componentes

### 1. Lista de Conversaciones

**Ubicación**: `app/(tabs)/chat/index.tsx`

**Funcionalidades**:
- Lista todas las salas de chat del usuario
- Muestra último mensaje y timestamp
- Contador de mensajes no leídos
- Orden por último mensaje
- Estado online de participantes

```tsx
export default function ChatListScreen() {
  const { chatRooms, getRoomUnreadCount } = useChat();

  return (
    <FlatList
      data={chatRooms}
      renderItem={({ item }) => (
        <ChatRoomItem
          room={item}
          unreadCount={getRoomUnreadCount(item.id)}
          onPress={() => router.push(`/chat/${item.id}`)}
        />
      )}
    />
  );
}
```

---

### 2. Sala de Chat

**Ubicación**: `app/(tabs)/chat/[roomId].tsx`

**Funcionalidades**:
- Vista de mensajes en tiempo real
- Input de mensaje con opciones
- Adjuntar archivos/imágenes
- Grabar audio
- Emojis
- Responder a mensajes
- Indicadores de escritura

```tsx
export default function ChatRoomScreen() {
  const { roomId } = useLocalSearchParams();
  const {
    messages,
    sendMessage,
    typingUsers,
    sendTypingIndicator,
  } = useChat();

  const roomMessages = messages[roomId as string] || [];

  return (
    <View style={{ flex: 1 }}>
      {/* Lista de mensajes */}
      <FlatList
        data={roomMessages}
        renderItem={({ item }) => (
          <MessageBubble message={item} />
        )}
        inverted
      />

      {/* Indicador de escritura */}
      {typingUsers[roomId]?.length > 0 && (
        <TypingIndicator users={typingUsers[roomId]} />
      )}

      {/* Input de mensaje */}
      <MessageInput
        onSend={(text) => sendMessage(roomId, text)}
        onTyping={(isTyping) => sendTypingIndicator(roomId, isTyping)}
      />
    </View>
  );
}
```

---

### 3. MessageBubble

**Ubicación**: `components/MessageBubble.tsx`

**Funcionalidades**:
- Renderiza diferentes tipos de mensaje
- Muestra estados (enviado, leído)
- Estilos para mensaje propio vs otros
- Opciones (editar, eliminar, responder)

```tsx
interface MessageBubbleProps {
  message: ChatMessage;
  onReply?: (messageId: string) => void;
  onEdit?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
}

export function MessageBubble({ message, onReply, onEdit, onDelete }: MessageBubbleProps) {
  const { user } = useAuth();
  const isOwnMessage = message.sender_id === user?.id;

  return (
    <View style={[styles.bubble, isOwnMessage && styles.ownBubble]}>
      {/* Responder a mensaje anterior */}
      {message.reply_to && (
        <ReplyPreview replyToId={message.reply_to} />
      )}

      {/* Contenido según tipo */}
      {renderMessageContent(message)}

      {/* Footer con timestamp y estados */}
      <View style={styles.footer}>
        <Text style={styles.timestamp}>
          {formatTime(message.created_at)}
        </Text>

        {isOwnMessage && (
          <MessageStatus
            isDelivered={message.isDelivered}
            isRead={message.isRead}
          />
        )}
      </View>

      {/* Opciones (long press) */}
      <MessageOptions
        message={message}
        onReply={onReply}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </View>
  );
}

function renderMessageContent(message: ChatMessage) {
  switch (message.type) {
    case 'text':
      return <Text>{message.message}</Text>;

    case 'image':
      return <Image source={{ uri: message.file_url }} />;

    case 'audio':
      return <AudioPlayer uri={message.file_url} duration={message.audio_duration} />;

    case 'file':
      return <FileAttachment file={message} />;

    case 'system':
      return <SystemMessage text={message.message} />;
  }
}
```

---

### 4. TypingIndicator

**Ubicación**: `components/TypingIndicator.tsx`

**Funcionalidades**:
- Muestra quién está escribiendo
- Animación de "..."
- Muestra nombre de usuario

```tsx
interface TypingIndicatorProps {
  users: TypingUser[];
}

export function TypingIndicator({ users }: TypingIndicatorProps) {
  if (users.length === 0) return null;

  const names = users.map(u => u.userName).join(', ');

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {names} {users.length > 1 ? 'están' : 'está'} escribiendo
      </Text>
      <AnimatedDots />
    </View>
  );
}
```

---

### 5. EmojiPicker

**Ubicación**: `components/EmojiPicker.tsx`

**Funcionalidades**:
- Selector de emojis
- Categorías
- Búsqueda
- Emojis recientes

```tsx
interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  visible: boolean;
  onClose: () => void;
}

export function EmojiPicker({ onSelect, visible, onClose }: EmojiPickerProps) {
  const categories = ['😀', '🐶', '🍕', '⚽', '🚗', '💡'];

  return (
    <Modal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        {/* Categorías */}
        <ScrollView horizontal>
          {categories.map(cat => (
            <CategoryButton key={cat} category={cat} />
          ))}
        </ScrollView>

        {/* Emojis */}
        <FlatList
          data={emojis}
          numColumns={8}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => onSelect(item)}>
              <Text style={styles.emoji}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </Modal>
  );
}
```

---

### 6. FileUploadComponent

**Ubicación**: `components/FileUploadComponent.tsx`

**Funcionalidades**:
- Subir imágenes (cámara o galería)
- Subir archivos
- Grabar audio
- Preview antes de enviar

```tsx
interface FileUploadComponentProps {
  onUploadComplete: (fileUrl: string, fileName: string, fileSize: number) => void;
}

export function FileUploadComponent({ onUploadComplete }: FileUploadComponentProps) {
  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      const file = result.assets[0];
      const fileUrl = await uploadToSupabase(file.uri);
      onUploadComplete(fileUrl, file.fileName, file.fileSize);
    }
  };

  const handleDocumentPick = async () => {
    const result = await DocumentPicker.getDocumentAsync();

    if (result.type === 'success') {
      const fileUrl = await uploadToSupabase(result.uri);
      onUploadComplete(fileUrl, result.name, result.size);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="📷 Imagen" onPress={handleImagePick} />
      <Button title="📎 Archivo" onPress={handleDocumentPick} />
      <Button title="🎤 Audio" onPress={handleAudioRecord} />
    </View>
  );
}
```

---

## Tiempo Real

### Configuración de Suscripción

```typescript
const setupRealtimeSubscription = (roomId: string) => {
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
      async (payload) => {
        const newMessage = payload.new as Message;

        // Obtener info del usuario
        const { data: userData } = await supabase
          .from('users')
          .select('nombre, apellido_paterno, foto')
          .eq('id', newMessage.sender_id)
          .single();

        // Agregar mensaje al estado
        setMessages(prev => ({
          ...prev,
          [roomId]: [...(prev[roomId] || []), {
            ...newMessage,
            user: userData,
            isDelivered: true,
            isRead: false,
          }],
        }));

        // Enviar notificación si no es mensaje propio
        if (newMessage.sender_id !== user?.id) {
          sendNotification(`💬 ${newMessage.sender_name}`, newMessage.message);
        }
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
      (payload) => {
        const updatedMessage = payload.new as Message;

        // Actualizar mensaje en estado
        setMessages(prev => ({
          ...prev,
          [roomId]: prev[roomId]?.map(msg =>
            msg.id === updatedMessage.id
              ? { ...msg, ...updatedMessage }
              : msg
          ) || [],
        }));
      }
    )
    .subscribe();

  return channel;
};
```

---

### Presencia para Typing Indicators

```typescript
// Enviar presencia
const sendTypingIndicator = (roomId: string, isTyping: boolean) => {
  const channel = realtimeChannels[roomId];

  if (!channel) return;

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
};

// Escuchar presencia
channel
  .on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState();
    const typingUsers = Object.values(state)
      .flat()
      .filter(presence => presence.typing && presence.user_id !== user?.id)
      .map(presence => ({
        userId: presence.user_id,
        userName: presence.user_name,
        timestamp: presence.timestamp,
      }));

    setTypingUsers(prev => ({ ...prev, [roomId]: typingUsers }));
  });
```

---

## Casos de Uso

### Caso 1: Iniciar Chat desde Solicitud

```tsx
function RequestDetailScreen({ requestId }: { requestId: string }) {
  const { createChatRoom } = useChat();
  const router = useRouter();

  const handleStartChat = async () => {
    // Obtener info del agente asignado
    const { data: request } = await supabase
      .from('requests')
      .select('agente_asignado_id, agente_nombre')
      .eq('id', requestId)
      .single();

    if (request) {
      // Crear sala de chat vinculada a solicitud
      const roomId = await createChatRoom(
        request.agente_asignado_id,
        request.agente_nombre,
        requestId
      );

      // Navegar a sala
      router.push(`/chat/${roomId}`);
    }
  };

  return (
    <Button title="💬 Iniciar Chat" onPress={handleStartChat} />
  );
}
```

---

### Caso 2: Enviar Imagen con Mensaje

```tsx
async function sendImageMessage(roomId: string, imageUri: string, caption: string) {
  // 1. Subir imagen a Supabase Storage
  const fileName = `${Date.now()}.jpg`;
  const { data, error } = await supabase.storage
    .from('chat-files')
    .upload(fileName, {
      uri: imageUri,
      type: 'image/jpeg',
      name: fileName,
    });

  if (error) throw error;

  // 2. Obtener URL pública
  const { data: { publicUrl } } = supabase.storage
    .from('chat-files')
    .getPublicUrl(fileName);

  // 3. Enviar mensaje con imagen
  await sendMessage(
    roomId,
    caption,
    'image',
    publicUrl,
    fileName,
    imageSize
  );
}
```

---

### Caso 3: Responder a un Mensaje

```tsx
function MessageBubble({ message }: { message: ChatMessage }) {
  const [showOptions, setShowOptions] = useState(false);
  const { sendMessage } = useChat();

  const handleReply = () => {
    // Abrir input con referencia al mensaje
    setReplyToMessage(message);
  };

  return (
    <Pressable onLongPress={() => setShowOptions(true)}>
      <View>
        {/* Contenido del mensaje */}
        <Text>{message.message}</Text>

        {/* Opciones */}
        {showOptions && (
          <View>
            <Button title="Responder" onPress={handleReply} />
            <Button title="Editar" onPress={handleEdit} />
            <Button title="Eliminar" onPress={handleDelete} />
          </View>
        )}
      </View>
    </Pressable>
  );
}

function MessageInput({ roomId }: { roomId: string }) {
  const [text, setText] = useState('');
  const [replyToMessage, setReplyToMessage] = useState<ChatMessage | null>(null);
  const { sendMessage } = useChat();

  const handleSend = async () => {
    await sendMessage(
      roomId,
      text,
      'text',
      undefined,
      undefined,
      undefined,
      undefined,
      replyToMessage?.id // Referencia al mensaje a responder
    );

    setText('');
    setReplyToMessage(null);
  };

  return (
    <View>
      {/* Preview del mensaje al que se responde */}
      {replyToMessage && (
        <View style={styles.replyPreview}>
          <Text>Respondiendo a: {replyToMessage.message}</Text>
          <Button title="X" onPress={() => setReplyToMessage(null)} />
        </View>
      )}

      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Escribe un mensaje..."
      />

      <Button title="Enviar" onPress={handleSend} />
    </View>
  );
}
```

---

## Optimizaciones

### 1. Optimistic Updates

```typescript
const sendMessage = async (roomId: string, message: string) => {
  // 1. Crear mensaje temporal
  const tempId = `temp_${Date.now()}`;
  const optimisticMessage = {
    id: tempId,
    chat_room_id: roomId,
    sender_id: user.id,
    message,
    created_at: new Date().toISOString(),
    localId: tempId,
    isDelivered: false,
  };

  // 2. Agregar inmediatamente a UI
  setMessages(prev => ({
    ...prev,
    [roomId]: [...(prev[roomId] || []), optimisticMessage],
  }));

  // 3. Enviar al servidor
  try {
    const { data } = await supabase
      .from('messages')
      .insert({ chat_room_id: roomId, message })
      .select()
      .single();

    // 4. Reemplazar mensaje temporal con real
    setMessages(prev => ({
      ...prev,
      [roomId]: prev[roomId]?.map(msg =>
        msg.localId === tempId
          ? { ...data, isDelivered: true }
          : msg
      ) || [],
    }));
  } catch (error) {
    // 5. Remover mensaje temporal en caso de error
    setMessages(prev => ({
      ...prev,
      [roomId]: prev[roomId]?.filter(msg => msg.localId !== tempId) || [],
    }));
  }
};
```

---

### 2. Paginación de Mensajes

```typescript
const loadMoreMessages = async (roomId: string) => {
  const currentMessages = messages[roomId] || [];
  const oldestMessage = currentMessages[0];

  if (!oldestMessage) return;

  const { data } = await supabase
    .from('messages')
    .select('*, user:users(nombre, apellido_paterno, foto)')
    .eq('chat_room_id', roomId)
    .lt('created_at', oldestMessage.created_at)
    .order('created_at', { ascending: true })
    .limit(20);

  if (data && data.length > 0) {
    setMessages(prev => ({
      ...prev,
      [roomId]: [...data, ...currentMessages],
    }));
  }
};
```

---

## Troubleshooting

### Problema: Mensajes duplicados

**Causa**: Suscripción se activa múltiples veces

**Solución**:
```typescript
useEffect(() => {
  if (realtimeChannels[roomId]) return; // Ya existe

  const channel = setupRealtimeSubscription(roomId);
  setRealtimeChannels(prev => ({ ...prev, [roomId]: channel }));

  return () => {
    supabase.removeChannel(channel);
  };
}, [roomId]);
```

---

### Problema: Indicador de escritura no desaparece

**Causa**: Usuario no envió untrack al dejar de escribir

**Solución**:
```typescript
const handleTextChange = (text: string) => {
  setText(text);

  if (text.length > 0) {
    sendTypingIndicator(roomId, true);

    // Timeout para limpiar indicador
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      sendTypingIndicator(roomId, false);
    }, 3000);
  } else {
    sendTypingIndicator(roomId, false);
  }
};
```

---

## Mejores Prácticas

1. **Siempre usar Optimistic Updates** para mejor UX
2. **Limpiar suscripciones** al desmontar componentes
3. **Paginar mensajes** para evitar cargar todo el historial
4. **Validar permisos** antes de enviar mensajes
5. **Comprimir imágenes** antes de subir
6. **Limitar tamaño de archivos** (ej: 10MB máximo)
7. **Usar debounce** en typing indicators

---

**Última Actualización**: 30 de Septiembre, 2025
**Versión**: 2.0.0