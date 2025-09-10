import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Delete } from 'lucide-react-native';

export default function Calculator() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);

  const inputNumber = (num: string) => {
    if (waitingForNewValue) {
      setDisplay(num);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputDecimal = () => {
    if (waitingForNewValue) {
      setDisplay('0.');
      setWaitingForNewValue(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForNewValue(true);
    setOperation(nextOperation);
  };

  const calculate = (
    firstValue: number,
    secondValue: number,
    operation: string
  ): number => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return firstValue / secondValue;
      case '=':
        return secondValue;
      default:
        return secondValue;
    }
  };

  const handleEquals = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForNewValue(true);
    }
  };

  const buttons = [
    ['C', '±', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '='],
  ];

  const getButtonStyle = (button: string) => {
    if (button === 'C' || button === '±' || button === '%') {
      return [styles.button, styles.functionButton];
    }
    if (['+', '-', '×', '÷', '='].includes(button)) {
      return [styles.button, styles.operatorButton];
    }
    if (button === '0') {
      return [styles.button, styles.zeroButton];
    }
    return styles.button;
  };

  const getButtonTextStyle = (button: string) => {
    if (button === 'C' || button === '±' || button === '%') {
      return [styles.buttonText, styles.functionButtonText];
    }
    if (['+', '-', '×', '÷', '='].includes(button)) {
      return [styles.buttonText, styles.operatorButtonText];
    }
    return styles.buttonText;
  };

  const handleButtonPress = (button: string) => {
    switch (button) {
      case 'C':
        clear();
        break;
      case '±':
        setDisplay(String(parseFloat(display) * -1));
        break;
      case '%':
        setDisplay(String(parseFloat(display) / 100));
        break;
      case '=':
        handleEquals();
        break;
      case '+':
      case '-':
      case '×':
      case '÷':
        performOperation(button);
        break;
      case '.':
        inputDecimal();
        break;
      default:
        inputNumber(button);
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Calculadora</Text>
        <Text style={styles.subtitle}>Herramienta de cálculo</Text>
      </View>

      <View style={styles.calculator}>
        <View style={styles.displayContainer}>
          <Text style={styles.display}>{display}</Text>
        </View>

        <View style={styles.buttonsContainer}>
          {buttons.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.buttonRow}>
              {row.map(button => (
                <TouchableOpacity
                  key={button}
                  style={getButtonStyle(button)}
                  onPress={() => handleButtonPress(button)}
                  activeOpacity={0.7}
                >
                  <Text style={getButtonTextStyle(button)}>{button}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 24,
    paddingTop: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
  calculator: {
    flex: 1,
    margin: 24,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  displayContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingVertical: 32,
    paddingHorizontal: 16,
    backgroundColor: '#1f2937',
    borderRadius: 16,
    marginBottom: 24,
  },
  display: {
    fontSize: 48,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    textAlign: 'right',
  },
  buttonsContainer: {
    gap: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
  },
  button: {
    flex: 1,
    height: 72,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  zeroButton: {
    flex: 2,
    marginRight: 16,
  },
  functionButton: {
    backgroundColor: '#d1d5db',
  },
  operatorButton: {
    backgroundColor: '#1e40af',
  },
  buttonText: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  functionButtonText: {
    color: '#374151',
  },
  operatorButtonText: {
    color: '#ffffff',
  },
});
