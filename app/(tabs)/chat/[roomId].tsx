import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Dimensions,
  Animated,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useChat, ChatMessage } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import {
  ArrowLeft,
  Send,
  Paperclip,
  Camera,
  Image as ImageIcon,
  Mic,
  MicOff,
  Smile,
  Reply,
  X,
  MoveVertical as MoreVertical,
  Copy,
  Trash2,
  CreditCard as Edit3,
  Download,
  Play,
  Pause,
  Volume2,
  MessageSquare,
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

// Comprehensive emoji data
const emojiCategories = {
  Frecuentes: [
    '😀',
    '😂',
    '🥰',
    '😍',
    '🤔',
    '👍',
    '👎',
    '❤️',
    '🔥',
    '💯',
    '✨',
    '🎉',
    '👏',
    '🙌',
    '💪',
    '🤝',
    '🙏',
    '💖',
    '😊',
    '😎',
  ],
  Personas: [
    '😀',
    '😃',
    '😄',
    '😁',
    '😆',
    '😅',
    '😂',
    '🤣',
    '😊',
    '😇',
    '🙂',
    '🙃',
    '😉',
    '😌',
    '😍',
    '🥰',
    '😘',
    '😗',
    '😙',
    '😚',
    '😋',
    '😛',
    '😝',
    '😜',
    '🤪',
    '🤨',
    '🧐',
    '🤓',
    '😎',
    '🤩',
  ],
  Naturaleza: [
    '🐶',
    '🐱',
    '🐭',
    '🐹',
    '🐰',
    '🦊',
    '🐻',
    '🐼',
    '🐨',
    '🐯',
    '🦁',
    '🐮',
    '🐷',
    '🐸',
    '🐵',
    '🌳',
    '🌲',
    '🌴',
    '🌿',
    '🍀',
    '🌺',
    '🌸',
    '🌼',
    '🌻',
    '🌹',
    '🌷',
    '🌱',
    '🌾',
    '🍄',
    '🌰',
  ],
  Comida: [
    '🍎',
    '🍊',
    '🍋',
    '🍌',
    '🍉',
    '🍇',
    '🍓',
    '🍈',
    '🍒',
    '🍑',
    '🥭',
    '🍍',
    '🥥',
    '🥝',
    '🍅',
    '🍆',
    '🥑',
    '🥦',
    '🥬',
    '🥒',
    '🌶️',
    '🌽',
    '🥕',
    '🧄',
    '🧅',
    '🥔',
    '🍠',
    '🥐',
    '🍞',
    '🥖',
  ],
  Actividades: [
    '⚽',
    '🏀',
    '🏈',
    '⚾',
    '🥎',
    '🎾',
    '🏐',
    '🏉',
    '🥏',
    '🎱',
    '🪀',
    '🏓',
    '🏸',
    '🏒',
    '🏑',
    '🥍',
    '🏏',
    '🪃',
    '🥅',
    '⛳',
    '🪁',
    '🏹',
    '🎣',
    '🤿',
    '🥊',
    '🥋',
    '🎽',
    '🛹',
    '🛷',
    '⛸️',
  ],
  Objetos: [
    '📱',
    '💻',
    '⌚',
    '📷',
    '📹',
    '🎵',
    '🎮',
    '🚗',
    '✈️',
    '🏠',
    '💡',
    '🔑',
    '💰',
    '💎',
    '🎁',
    '🎈',
    '🎊',
    '🎉',
    '🎂',
    '🍰',
    '🧸',
    '🎯',
    '🎲',
    '🃏',
    '🎴',
    '🎭',
    '🎨',
    '🖼️',
    '🎪',
    '🎢',
  ],
  Símbolos: [
    '❤️',
    '🧡',
    '💛',
    '💚',
    '💙',
    '💜',
    '🖤',
    '🤍',
    '🤎',
    '💔',
    '❣️',
    '💕',
    '💞',
    '💓',
    '💗',
    '💖',
    '💘',
    '💝',
    '💟',
    '☮️',
    '✝️',
    '☪️',
    '🕉️',
    '☸️',
    '✡️',
    '🔯',
    '🕎',
    '☯️',
    '☦️',
    '🛐',
  ],
};

export default function ChatRoom() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const {
    messages,
    sendMessage,
    getChatRoom,
    markMessagesAsRead,
    sendTypingIndicator,
    loadMoreMessages,
    deleteMessage,
    editMessage,
    typingUsers,
  } = useChat();
  const { user } = useAuth();
  const router = useRouter();
  const scrollViewRef = useRef<FlatList<ChatMessage>>(null);
  const textInputRef = useRef<TextInput>(null);

  const [messageText, setMessageText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedEmojiCategory, setSelectedEmojiCategory] =
    useState('Frecuentes');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [playingAudio, setPlayingAudio] = useState<{ [key: string]: Audio.Sound }>({});
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(
    null
  );
  const [showMessageActions, setShowMessageActions] = useState(false);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(
    null
  );
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [timer, setTimer] = useState<ReturnType<typeof setInterval> | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const chatRoom = getChatRoom(roomId!);
  const roomMessages = messages[roomId!] || [];
  const roomTypingUsers = typingUsers[roomId!] || [];

  useEffect(() => {
    if (roomId) {
      markMessagesAsRead(roomId);
    }
  }, [roomId, markMessagesAsRead]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [roomMessages]);

  useEffect(() => {
    // Recording timer
    if (isRecording) {
      const newTimer = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      setTimer(newTimer);
    } else {
        setRecordingDuration(0);
        if (timer) {
          clearInterval(timer);
          setTimer(null);
        }
      }

      return () => {
        if (timer) clearInterval(timer);
      };
    }, [isRecording, timer]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      // Stop and unload all playing audio
      Object.values(playingAudio).forEach(async (sound) => {
        try {
          await sound.stopAsync();
          await sound.unloadAsync();
        } catch (error) {
          console.error('Error cleaning up audio:', error);
        }
      });
      
      // Stop recording if active
      if (recording) {
        recording.stopAndUnloadAsync().catch(console.error);
      }
    };
  }, []);

  const handleTextChange = (text: string) => {
    setMessageText(text);

    // Send typing indicator
    if (!isTyping && text.length > 0) {
      setIsTyping(true);
      sendTypingIndicator(roomId!, true);
    }

    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set new timeout to stop typing indicator
    const timeout = setTimeout(() => {
      setIsTyping(false);
      sendTypingIndicator(roomId!, false);
    }, 2000);

    setTypingTimeout(timeout as any);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() && !replyingTo) return;

    const messageToSend = messageText.trim();
    setMessageText('');
    setReplyingTo(null);
    setShowEmojiPicker(false);

    // Stop typing indicator
    if (isTyping) {
      setIsTyping(false);
      sendTypingIndicator(roomId!, false);
    }

    await sendMessage(
      roomId!,
      messageToSend,
      'text',
      undefined,
      undefined,
      undefined,
      undefined,
      replyingTo?.id
    );
  };

  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permisos requeridos',
        'Necesitamos permisos para acceder a tus fotos'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await sendMessage(
        roomId!,
        'Imagen enviada',
        'image',
        result.assets[0].uri,
        result.assets[0].fileName || 'imagen.jpg',
        result.assets[0].fileSize
      );
    }
    setShowAttachmentMenu(false);
  };

  const handleCameraPicker = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permisos requeridos',
        'Necesitamos permisos para acceder a la cámara'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await sendMessage(
        roomId!,
        'Foto tomada',
        'image',
        result.assets[0].uri,
        result.assets[0].fileName || 'foto.jpg',
        result.assets[0].fileSize
      );
    }
    setShowAttachmentMenu(false);
  };

  const handleDocumentPicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        await sendMessage(
          roomId!,
          'Archivo enviado',
          'file',
          result.assets[0].uri,
          result.assets[0].name,
          result.assets[0].size
        );
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar el archivo');
    }
    setShowAttachmentMenu(false);
  };

  const handleVoiceRecording = async () => {
    if (Platform.OS === 'web') {
      Alert.alert(
        'No disponible',
        'La grabación de audio no está disponible en web'
      );
      return;
    }

    try {
      if (isRecording && recording) {
        // Stop recording
        setIsRecording(false);
        await recording.stopAndUnloadAsync();
        
        const uri = recording.getURI();
        if (uri) {
          // Upload audio file and send message
          const audioInfo = await FileSystem.getInfoAsync(uri);
          const audioBlob = await fetch(uri).then(r => r.blob());
          
          // Create a file name
          const fileName = `audio_${Date.now()}.m4a`;
          
          // Here you would upload to your storage service (Supabase, etc.)
          // For now, we'll send a placeholder
          sendMessage(
            roomId!,
            'Audio enviado',
            'audio',
            uri, // temporary - should be uploaded URL
            fileName,
            undefined, // fileSize
            recordingDuration // audioDuration
          );
        }
        
        setRecording(null);
      } else {
        // Request permissions
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permisos requeridos',
            'Se necesitan permisos de micrófono para grabar audio'
          );
          return;
        }

        // Configure audio mode
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        // Start recording
        const { recording: newRecording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        
        setRecording(newRecording);
        setIsRecording(true);
      }
    } catch (error) {
      console.error('Error with audio recording:', error);
      Alert.alert('Error', 'No se pudo grabar el audio');
      setIsRecording(false);
      setRecording(null);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayAudio = async (messageId: string, audioUrl: string) => {
    try {
      // Stop any currently playing audio
      const currentlyPlaying = Object.keys(playingAudio);
      for (const id of currentlyPlaying) {
        if (id !== messageId) {
          await playingAudio[id].stopAsync();
          await playingAudio[id].unloadAsync();
          setPlayingAudio(prev => {
            const newState = { ...prev };
            delete newState[id];
            return newState;
          });
        }
      }

      if (playingAudio[messageId]) {
        // Stop current audio
        await playingAudio[messageId].stopAsync();
        await playingAudio[messageId].unloadAsync();
        setPlayingAudio(prev => {
          const newState = { ...prev };
          delete newState[messageId];
          return newState;
        });
      } else {
        // Play new audio
        const { sound } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          { shouldPlay: true }
        );
        
        setPlayingAudio(prev => ({ ...prev, [messageId]: sound }));
        
        // Remove from playing state when finished
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setPlayingAudio(prev => {
              const newState = { ...prev };
              delete newState[messageId];
              return newState;
            });
          }
        });
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      Alert.alert('Error', 'No se pudo reproducir el audio');
    }
  };

  const getOtherParticipantName = () => {
    if (!chatRoom || !user) return 'Chat';

    const currentUserName = `${user.nombre} ${user.apellido_paterno}`;
    return (
      chatRoom.metadata?.participant_names?.find(
        (name: string) => name !== currentUserName
      ) || 'Chat'
    );
  };

  const getOtherParticipantInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const handleMessageLongPress = (message: ChatMessage) => {
    setSelectedMessage(message);
    setShowMessageActions(true);
  };

  const handleCopyMessage = () => {
    if (selectedMessage) {
      // In a real app, you would copy to clipboard
      Alert.alert('Copiado', 'Mensaje copiado al portapapeles');
    }
    setShowMessageActions(false);
    setSelectedMessage(null);
  };

  const handleDeleteMessage = async () => {
    if (selectedMessage) {
      Alert.alert(
        'Eliminar mensaje',
        '¿Estás seguro de que quieres eliminar este mensaje?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: async () => {
              await deleteMessage(selectedMessage.id);
              setShowMessageActions(false);
              setSelectedMessage(null);
            },
          },
        ]
      );
    }
  };

  const handleEditMessage = () => {
    if (selectedMessage) {
      setEditingMessage(selectedMessage);
      setMessageText(selectedMessage.message);
      textInputRef.current?.focus();
    }
    setShowMessageActions(false);
    setSelectedMessage(null);
  };

  const handleSaveEdit = async () => {
    if (editingMessage && messageText.trim()) {
      await editMessage(editingMessage.id, messageText.trim());
      setEditingMessage(null);
      setMessageText('');
    }
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setMessageText('');
  };

  const renderMessage = (message: ChatMessage, index: number) => {
    const isOwnMessage = message.sender_id === user?.id;
    const showAvatar =
      !isOwnMessage &&
      (index === 0 || roomMessages[index - 1]?.sender_id !== message.sender_id);
    const showTimestamp =
      index === roomMessages.length - 1 ||
      roomMessages[index + 1]?.sender_id !== message.sender_id ||
      new Date(roomMessages[index + 1]?.created_at).getTime() -
        new Date(message.created_at).getTime() >
        300000; // 5 minutes

    const replyMessage = message.reply_to
      ? roomMessages.find(m => m.id === message.reply_to)
      : null;

    return (
      <Pressable
        key={message.id}
        onLongPress={() => handleMessageLongPress(message)}
        style={[
          styles.messageContainer,
          isOwnMessage
            ? styles.ownMessageContainer
            : styles.otherMessageContainer,
        ]}
      >
        {showAvatar && !isOwnMessage && (
          <View style={styles.messageAvatar}>
            <Text style={styles.messageAvatarText}>
              {message.sender_name
                .split(' ')
                .map(n => n[0])
                .join('')
                .substring(0, 2)}
            </Text>
          </View>
        )}

        <View
          style={[
            styles.messageBubble,
            isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble,
            !showAvatar && !isOwnMessage && styles.messageWithoutAvatar,
            message.is_deleted && styles.deletedMessageBubble,
          ]}
        >
          {/* Reply preview */}
          {replyMessage && !message.is_deleted && (
            <View style={styles.replyContainer}>
              <View
                style={[
                  styles.replyBar,
                  {
                    backgroundColor: isOwnMessage
                      ? 'rgba(255,255,255,0.3)'
                      : '#1e40af',
                  },
                ]}
              />
              <View style={styles.replyContent}>
                <Text
                  style={[
                    styles.replyAuthor,
                    {
                      color: isOwnMessage ? 'rgba(255,255,255,0.8)' : '#1e40af',
                    },
                  ]}
                >
                  {replyMessage.sender_name}
                </Text>
                <Text
                  style={[
                    styles.replyText,
                    {
                      color: isOwnMessage ? 'rgba(255,255,255,0.7)' : '#6b7280',
                    },
                  ]}
                  numberOfLines={1}
                >
                  {replyMessage.type === 'text'
                    ? replyMessage.message
                    : `${replyMessage.type === 'image' ? '📷' : replyMessage.type === 'audio' ? '🎵' : '📎'} ${replyMessage.type}`}
                </Text>
              </View>
            </View>
          )}

          {/* Message content */}
          {!message.is_deleted && (
            <>
              {/* Image message */}
              {message.type === 'image' && message.file_url && (
                <TouchableOpacity
                  onPress={() =>
                    Alert.alert(
                      'Imagen',
                      'Funcionalidad de vista completa próximamente'
                    )
                  }
                >
                  <Image
                    source={{ uri: message.file_url }}
                    style={styles.messageImage}
                    defaultSource={require('@/assets/images/icon.png')}
                    onError={() => console.log('Error loading image:', message.file_url)}
                  />
                </TouchableOpacity>
              )}
              
              {/* Image message without URL - show placeholder */}
              {message.type === 'image' && !message.file_url && (
                <View style={styles.imagePlaceholder}>
                  <ImageIcon size={48} color="#9ca3af" />
                  <Text style={styles.imagePlaceholderText}>Imagen no disponible</Text>
                </View>
              )}

              {/* Audio message */}
              {message.type === 'audio' && (
                <View style={styles.audioMessage}>
                  <TouchableOpacity 
                    style={styles.playButton}
                    onPress={() => message.file_url && handlePlayAudio(message.id, message.file_url)}
                  >
                    {playingAudio[message.id] ? (
                      <Pause
                        size={16}
                        color={isOwnMessage ? '#ffffff' : '#1e40af'}
                      />
                    ) : (
                      <Play
                        size={16}
                        color={isOwnMessage ? '#ffffff' : '#1e40af'}
                      />
                    )}
                  </TouchableOpacity>
                  <View style={styles.audioWaveform}>
                    {[...Array(20)].map((_, i) => (
                      <View
                        key={`${message.id}-waveform-${i}`}
                        style={[
                          styles.waveformBar,
                          {
                            height: Math.random() * 20 + 5,
                            backgroundColor: isOwnMessage
                              ? 'rgba(255,255,255,0.7)'
                              : playingAudio[message.id]
                              ? '#10b981'
                              : '#3b82f6',
                          },
                        ]}
                      />
                    ))}
                  </View>
                  <Text
                    style={[
                      styles.audioDuration,
                      {
                        color: isOwnMessage
                          ? 'rgba(255,255,255,0.8)'
                          : '#6b7280',
                      },
                    ]}
                  >
                    {formatDuration(message.audio_duration || 0)}
                  </Text>
                </View>
              )}

              {/* File message */}
              {message.type === 'file' && (
                <TouchableOpacity
                  style={styles.fileMessage}
                  onPress={() =>
                    Alert.alert('Archivo', 'Descarga próximamente')
                  }
                >
                  <View style={styles.fileIcon}>
                    <Text style={styles.fileIconText}>📎</Text>
                  </View>
                  <View style={styles.fileInfo}>
                    <Text
                      style={[
                        styles.fileName,
                        { color: isOwnMessage ? '#ffffff' : '#111827' },
                      ]}
                      numberOfLines={1}
                    >
                      {message.file_name || 'Archivo'}
                    </Text>
                    <Text
                      style={[
                        styles.fileSize,
                        {
                          color: isOwnMessage
                            ? 'rgba(255,255,255,0.7)'
                            : '#6b7280',
                        },
                      ]}
                    >
                      {message.file_size
                        ? `${(message.file_size / 1024).toFixed(1)} KB`
                        : 'Tamaño desconocido'}
                    </Text>
                  </View>
                  <Download
                    size={16}
                    color={isOwnMessage ? 'rgba(255,255,255,0.7)' : '#6b7280'}
                  />
                </TouchableOpacity>
              )}

              {/* Text message */}
              {(message.type === 'text' || message.type === 'system') && (
                <Text
                  style={[
                    styles.messageText,
                    isOwnMessage
                      ? styles.ownMessageText
                      : styles.otherMessageText,
                    message.type === 'system' && styles.systemMessageText,
                  ]}
                >
                  {message.message}
                </Text>
              )}
            </>
          )}

          {/* Deleted message */}
          {message.is_deleted && (
            <Text style={[styles.messageText, styles.deletedMessageText]}>
              <Text style={styles.deletedIcon}>🗑️</Text> {message.message}
            </Text>
          )}

          {/* Message footer */}
          <View style={styles.messageFooter}>
            <Text
              style={[
                styles.messageTime,
                isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime,
              ]}
            >
              {formatTime(message.created_at)}
              {message.edited_at && ' (editado)'}
            </Text>
            {isOwnMessage && !message.is_deleted && (
              <View style={styles.messageStatus}>
                <Text style={styles.messageStatusText}>
                  {message.isRead ? '✓✓' : message.isDelivered ? '✓' : '⏱️'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Reply button */}
        {!message.is_deleted && (
          <TouchableOpacity
            style={styles.replyButton}
            onPress={() => setReplyingTo(message)}
          >
            <Reply size={16} color="#6b7280" />
          </TouchableOpacity>
        )}
      </Pressable>
    );
  };

  const renderTypingIndicator = () => {
    const otherUsersTyping = roomTypingUsers.filter(
      tu => tu.userId !== user?.id
    );

    if (otherUsersTyping.length === 0) return null;

    return (
      <View style={styles.typingContainer}>
        <View style={styles.typingBubble}>
          <View style={styles.typingDots}>
            <Animated.View style={[styles.typingDot, styles.typingDot1]} />
            <Animated.View style={[styles.typingDot, styles.typingDot2]} />
            <Animated.View style={[styles.typingDot, styles.typingDot3]} />
          </View>
        </View>
        <Text style={styles.typingText}>
          {otherUsersTyping[0].userName} está escribiendo...
        </Text>
      </View>
    );
  };

  if (!chatRoom) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MessageSquare size={64} color="#ef4444" />
          <Text style={styles.errorText}>Chat no encontrado</Text>
          <TouchableOpacity
            style={styles.backToChatsButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backToChatsButtonText}>Volver a Chats</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <LinearGradient colors={['#1e40af', '#3b82f6']} style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color="#ffffff" />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <View style={styles.headerAvatar}>
              <Text style={styles.headerAvatarText}>
                {getOtherParticipantInitials(getOtherParticipantName())}
              </Text>
            </View>
            <View style={styles.headerText}>
              <Text style={styles.headerName}>{getOtherParticipantName()}</Text>
              <Text style={styles.headerStatus}>
                {roomTypingUsers.some(tu => tu.userId !== user?.id)
                  ? 'escribiendo...'
                  : 'en línea'}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.headerMenuButton}>
            <MoreVertical size={24} color="#ffffff" />
          </TouchableOpacity>
        </LinearGradient>

        {/* Messages */}
        <FlatList
          ref={scrollViewRef}
          style={styles.messagesContainer}
          data={roomMessages}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => renderMessage(item, index)}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={15}
          getItemLayout={(data, index) => ({
            length: 80, // Altura estimada del mensaje
            offset: 80 * index,
            index,
          })}
          onScrollBeginDrag={() => {
            setShowEmojiPicker(false);
            setShowAttachmentMenu(false);
          }}
          ListHeaderComponent={
            <TouchableOpacity
              style={styles.loadMoreButton}
              onPress={() => loadMoreMessages(roomId!)}
            >
              <Text style={styles.loadMoreText}>Cargar mensajes anteriores</Text>
            </TouchableOpacity>
          }
          ListFooterComponent={renderTypingIndicator}
        />

        {/* Reply Preview */}
        {replyingTo && (
          <View style={styles.replyPreview}>
            <View style={styles.replyPreviewBar} />
            <View style={styles.replyPreviewContent}>
              <Text style={styles.replyPreviewAuthor}>
                Respondiendo a {replyingTo.sender_name}
              </Text>
              <Text style={styles.replyPreviewText} numberOfLines={1}>
                {replyingTo.type === 'text'
                  ? replyingTo.message
                  : `${replyingTo.type} mensaje`}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setReplyingTo(null)}>
              <X size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
        )}

        {/* Edit Preview */}
        {editingMessage && (
          <View style={styles.editPreview}>
            <Edit3 size={16} color="#3b82f6" />
            <Text style={styles.editPreviewText}>Editando mensaje</Text>
            <TouchableOpacity onPress={handleCancelEdit}>
              <X size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
        )}

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <View style={styles.emojiPicker}>
            <View style={styles.emojiCategories}>
              {Object.keys(emojiCategories).map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.emojiCategory,
                    selectedEmojiCategory === category &&
                      styles.emojiCategoryActive,
                  ]}
                  onPress={() => setSelectedEmojiCategory(category)}
                >
                  <Text
                    style={[
                      styles.emojiCategoryText,
                      selectedEmojiCategory === category &&
                        styles.emojiCategoryTextActive,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <ScrollView
              style={styles.emojiGrid}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.emojiRow}>
                {emojiCategories[
                  selectedEmojiCategory as keyof typeof emojiCategories
                ].map((emoji, index) => (
                  <TouchableOpacity
                    key={`${selectedEmojiCategory}-emoji-${index}`}
                    style={styles.emojiButton}
                    onPress={() => {
                      setMessageText(prev => prev + emoji);
                    }}
                  >
                    <Text style={styles.emoji}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Attachment Menu */}
        {showAttachmentMenu && (
          <View style={styles.attachmentMenu}>
            <TouchableOpacity
              style={styles.attachmentOption}
              onPress={handleCameraPicker}
            >
              <LinearGradient
                colors={['#ef4444', '#dc2626']}
                style={styles.attachmentOptionGradient}
              >
                <Camera size={24} color="#ffffff" />
              </LinearGradient>
              <Text style={styles.attachmentOptionText}>Cámara</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.attachmentOption}
              onPress={handleImagePicker}
            >
              <LinearGradient
                colors={['#8b5cf6', '#7c3aed']}
                style={styles.attachmentOptionGradient}
              >
                <ImageIcon size={24} color="#ffffff" />
              </LinearGradient>
              <Text style={styles.attachmentOptionText}>Galería</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.attachmentOption}
              onPress={handleDocumentPicker}
            >
              <LinearGradient
                colors={['#f59e0b', '#d97706']}
                style={styles.attachmentOptionGradient}
              >
                <Paperclip size={24} color="#ffffff" />
              </LinearGradient>
              <Text style={styles.attachmentOptionText}>Archivo</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Input */}
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.attachmentButton}
            onPress={() => setShowAttachmentMenu(!showAttachmentMenu)}
          >
            <Paperclip size={24} color="#6b7280" />
          </TouchableOpacity>

          <View style={styles.textInputContainer}>
            <TextInput
              ref={textInputRef}
              style={styles.textInput}
              placeholder={
                editingMessage ? 'Editar mensaje...' : 'Escribe un mensaje...'
              }
              placeholderTextColor="#9ca3af"
              value={messageText}
              onChangeText={handleTextChange}
              multiline
              maxLength={1000}
            />

            <TouchableOpacity
              style={styles.emojiButtonInInput}
              onPress={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {editingMessage ? (
            <View style={styles.editActions}>
              <TouchableOpacity
                style={styles.cancelEditButton}
                onPress={handleCancelEdit}
              >
                <X size={16} color="#ef4444" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveEditButton}
                onPress={handleSaveEdit}
              >
                <Text style={styles.saveEditText}>✓</Text>
              </TouchableOpacity>
            </View>
          ) : messageText.trim() ? (
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendMessage}
            >
              <Send size={20} color="#ffffff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.voiceButton,
                isRecording && styles.voiceButtonRecording,
              ]}
              onPress={handleVoiceRecording}
            >
              {isRecording ? (
                    <View style={styles.recordingIndicator}>
                      <View style={styles.recordingDot} />
                      <MicOff size={18} color="#ffffff" />
                      <Text style={styles.recordingTime}>
                        {formatDuration(recordingDuration)}
                      </Text>
                    </View>
                  ) : (
                    <Mic size={20} color="#ffffff" />
                  )}
            </TouchableOpacity>
          )}
        </View>

        {/* Message Actions Modal */}
        {showMessageActions && selectedMessage && (
          <View style={styles.messageActionsOverlay}>
            <TouchableOpacity
              style={styles.messageActionsBackdrop}
              onPress={() => setShowMessageActions(false)}
            />
            <View style={styles.messageActionsMenu}>
              <TouchableOpacity
                style={styles.messageAction}
                onPress={handleCopyMessage}
              >
                <Copy size={20} color="#374151" />
                <Text style={styles.messageActionText}>Copiar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.messageAction}
                onPress={() => setReplyingTo(selectedMessage)}
              >
                <Reply size={20} color="#374151" />
                <Text style={styles.messageActionText}>Responder</Text>
              </TouchableOpacity>

              {selectedMessage.sender_id === user?.id && (
                <>
                  <TouchableOpacity
                    style={styles.messageAction}
                    onPress={handleEditMessage}
                  >
                    <Edit3 size={20} color="#374151" />
                    <Text style={styles.messageActionText}>Editar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.messageAction, styles.messageActionDanger]}
                    onPress={handleDeleteMessage}
                  >
                    <Trash2 size={20} color="#ef4444" />
                    <Text
                      style={[
                        styles.messageActionText,
                        styles.messageActionTextDanger,
                      ]}
                    >
                      Eliminar
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 20,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerAvatarText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  headerText: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  headerStatus: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  headerMenuButton: {
    padding: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#ef4444',
    textAlign: 'center',
  },
  backToChatsButton: {
    backgroundColor: '#1e40af',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backToChatsButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  loadMoreButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 16,
  },
  loadMoreText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#3b82f6',
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-end',
  },
  ownMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6b7280',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 4,
  },
  messageAvatarText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  messageBubble: {
    maxWidth: width * 0.75,
    borderRadius: 18,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  ownMessageBubble: {
    backgroundColor: '#1e40af',
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
  },
  deletedMessageBubble: {
    backgroundColor: '#f3f4f6',
    opacity: 0.7,
  },
  messageWithoutAvatar: {
    marginLeft: 40,
  },
  replyContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 8,
  },
  replyBar: {
    width: 3,
    borderRadius: 2,
    marginRight: 8,
  },
  replyContent: {
    flex: 1,
  },
  replyAuthor: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  replyText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginBottom: 4,
    backgroundColor: '#f3f4f6',
  },
  imagePlaceholder: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginBottom: 4,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  imagePlaceholderText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9ca3af',
  },
  audioMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    minWidth: 200,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  audioWaveform: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    height: 20,
    gap: 1,
  },
  waveformBar: {
    width: 2,
    borderRadius: 1,
  },
  audioDuration: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginLeft: 12,
  },
  fileMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    minWidth: 200,
  },
  fileIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  fileIconText: {
    fontSize: 20,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  messageText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 22,
  },
  ownMessageText: {
    color: '#ffffff',
  },
  otherMessageText: {
    color: '#111827',
  },
  systemMessageText: {
    fontStyle: 'italic',
    color: '#6b7280',
  },
  deletedMessageText: {
    fontStyle: 'italic',
    color: '#9ca3af',
  },
  deletedIcon: {
    fontSize: 14,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
  },
  ownMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherMessageTime: {
    color: '#9ca3af',
  },
  messageStatus: {
    marginLeft: 4,
  },
  messageStatusText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  replyButton: {
    padding: 8,
    marginLeft: 8,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  typingBubble: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    padding: 12,
    marginLeft: 40,
    marginRight: 8,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9ca3af',
  },
  typingDot1: {},
  typingDot2: {},
  typingDot3: {},
  typingText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    alignSelf: 'flex-end',
    marginBottom: 4,
  },
  replyPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  replyPreviewBar: {
    width: 4,
    height: 40,
    backgroundColor: '#1e40af',
    borderRadius: 2,
    marginRight: 12,
  },
  replyPreviewContent: {
    flex: 1,
  },
  replyPreviewAuthor: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#1e40af',
    marginBottom: 2,
  },
  replyPreviewText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
  editPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 8,
  },
  editPreviewText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#3b82f6',
  },
  emojiPicker: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    height: 280,
  },
  emojiCategories: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingHorizontal: 8,
  },
  emojiCategory: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  emojiCategoryActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#1e40af',
  },
  emojiCategoryText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
  },
  emojiCategoryTextActive: {
    color: '#1e40af',
    fontFamily: 'Inter-SemiBold',
  },
  emojiGrid: {
    flex: 1,
    padding: 16,
  },
  emojiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emojiButton: {
    width: (width - 64) / 8,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2,
    borderRadius: 8,
  },
  emoji: {
    fontSize: 24,
  },
  attachmentMenu: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    justifyContent: 'space-around',
  },
  attachmentOption: {
    alignItems: 'center',
    gap: 8,
  },
  attachmentOptionGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachmentOptionText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#ffffff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 8,
  },
  attachmentButton: {
    padding: 8,
    alignSelf: 'flex-end',
    marginBottom: 4,
  },
  textInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
    paddingVertical: 8,
    paddingRight: 8,
  },
  emojiButtonInInput: {
    padding: 4,
    alignSelf: 'flex-end',
    marginBottom: 4,
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelEditButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveEditButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveEditText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#16a34a',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1e40af',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1e40af',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  voiceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  voiceButtonRecording: {
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
    transform: [{ scale: 1.1 }],
    elevation: 6,
    shadowOpacity: 0.4,
  },
  recordingIndicator: {
    alignItems: 'center',
    gap: 2,
    flexDirection: 'row',
  },
  recordingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ffffff',
    marginRight: 2,
  },
  recordingTime: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
  },
  messageActionsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  messageActionsBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  messageActionsMenu: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 8,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  messageAction: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  messageActionDanger: {
    backgroundColor: '#fef2f2',
  },
  messageActionText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  messageActionTextDanger: {
    color: '#ef4444',
  },
});
