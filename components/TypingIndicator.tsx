import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface TypingIndicatorProps {
  userName: string;
  visible: boolean;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  userName,
  visible,
}) => {
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      const animateSequence = () => {
        const createDotAnimation = (
          animValue: Animated.Value,
          delay: number
        ) => {
          return Animated.sequence([
            Animated.delay(delay),
            Animated.timing(animValue, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(animValue, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]);
        };

        Animated.loop(
          Animated.parallel([
            createDotAnimation(dot1Anim, 0),
            createDotAnimation(dot2Anim, 200),
            createDotAnimation(dot3Anim, 400),
          ])
        ).start();
      };

      animateSequence();
    } else {
      dot1Anim.setValue(0);
      dot2Anim.setValue(0);
      dot3Anim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.bubble}>
        <View style={styles.dotsContainer}>
          <Animated.View
            style={[
              styles.dot,
              {
                opacity: dot1Anim,
                transform: [
                  {
                    scale: dot1Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.2],
                    }),
                  },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              {
                opacity: dot2Anim,
                transform: [
                  {
                    scale: dot2Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.2],
                    }),
                  },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              {
                opacity: dot3Anim,
                transform: [
                  {
                    scale: dot3Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.2],
                    }),
                  },
                ],
              },
            ]}
          />
        </View>
      </View>
      <Text style={styles.typingText}>{userName} está escribiendo...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
    marginLeft: 40,
  },
  bubble: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    padding: 12,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9ca3af',
  },
  typingText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    alignSelf: 'flex-end',
    marginBottom: 4,
  },
});
