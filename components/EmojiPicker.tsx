import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

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

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  visible: boolean;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  onEmojiSelect,
  visible,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('Frecuentes');

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.categories}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {Object.keys(emojiCategories).map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.category,
                selectedCategory === category && styles.categoryActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.emojiGrid} showsVerticalScrollIndicator={false}>
        <View style={styles.emojiRow}>
          {emojiCategories[
            selectedCategory as keyof typeof emojiCategories
          ].map((emoji, index) => (
            <TouchableOpacity
              key={index}
              style={styles.emojiButton}
              onPress={() => onEmojiSelect(emoji)}
            >
              <Text style={styles.emoji}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    height: 280,
  },
  categories: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingHorizontal: 8,
  },
  category: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#1e40af',
  },
  categoryText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
  },
  categoryTextActive: {
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
});
