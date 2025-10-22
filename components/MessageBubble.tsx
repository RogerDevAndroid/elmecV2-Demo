import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Pressable,
} from 'react-native';
import { ChatMessage } from '@/contexts/ChatContext';
import { Play, Download, Volume2 } from 'lucide-react-native';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwnMessage: boolean;
  showAvatar: boolean;
  showTimestamp: boolean;
  onLongPress: () => void;
  onReply: () => void;
  replyMessage?: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
  showAvatar,
  showTimestamp,
  onLongPress,
  onReply,
  replyMessage,
}) => {
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

  const renderMessageContent = () => {
    if (message.is_deleted) {
      return (
        <Text style={[styles.messageText, styles.deletedMessageText]}>
          <Text style={styles.deletedIcon}>🗑️</Text> {message.message}
        </Text>
      );
    }

    switch (message.type) {
      case 'image':
        return message.file_url ? (
          <TouchableOpacity onPress={() => console.log('Open image viewer')}>
            <Image
              source={{ uri: message.file_url }}
              style={styles.messageImage}
              defaultSource={require('@/assets/images/icon.png')}
              onError={() => console.log('Error loading image:', message.file_url)}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>🖼️ Imagen no disponible</Text>
          </View>
        );

      case 'audio':
        return (
          <View style={styles.audioMessage}>
            <TouchableOpacity style={styles.playButton}>
              <Play size={16} color={isOwnMessage ? '#ffffff' : '#1e40af'} />
            </TouchableOpacity>
            <View style={styles.audioWaveform}>
              {[...Array(15)].map((_, i) => (
                <View
                  key={`${message.id}-bubble-waveform-${i}`}
                  style={[
                    styles.waveformBar,
                    {
                      height: Math.random() * 20 + 5,
                      backgroundColor: isOwnMessage
                        ? 'rgba(255,255,255,0.7)'
                        : '#3b82f6',
                    },
                  ]}
                />
              ))}
            </View>
            <Text
              style={[
                styles.audioDuration,
                { color: isOwnMessage ? 'rgba(255,255,255,0.8)' : '#6b7280' },
              ]}
            >
              {formatDuration(message.audio_duration || 0)}
            </Text>
          </View>
        );

      case 'file':
        return (
          <TouchableOpacity style={styles.fileMessage}>
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
                  { color: isOwnMessage ? 'rgba(255,255,255,0.7)' : '#6b7280' },
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
        );

      case 'system':
        return (
          <Text style={[styles.messageText, styles.systemMessageText]}>
            {message.message}
          </Text>
        );

      default:
        return (
          <Text
            style={[
              styles.messageText,
              isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
            ]}
          >
            {message.message}
          </Text>
        );
    }
  };

  return (
    <Pressable onLongPress={onLongPress} style={styles.container}>
      <View
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

          {renderMessageContent()}

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
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  messageContainer: {
    flexDirection: 'row',
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
    maxWidth: '75%',
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
    padding: 12,
  },
  imagePlaceholderText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9ca3af',
    textAlign: 'center',
  },
  audioMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    minWidth: 180,
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
    textAlign: 'center',
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
});
