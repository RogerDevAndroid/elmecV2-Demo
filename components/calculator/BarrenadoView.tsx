import React, { useRef } from 'react';
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronUp, ChevronDown } from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setField,
  setEditable,
  clearAll,
  updateTextoCa,
  CalculatorState,
} from '@/store/calculatorSlice';
import {
  calcVc,
  calcN,
  calcfz,
  calcfn1,
  calcfn2,
  calcvf,
  calcQBarrenado,
  calctcBarrenado,
  formatNumber,
  isValidNumber,
  getFieldByIndex,
  getMedidaConfig,
  getFieldLabels,
  safeParseFloat,
  getThemeColors,
} from '@/utils/calculatorUtils';

interface BarrenadoViewProps {
  theme?: 'light' | 'dark';
}

export const BarrenadoView: React.FC<BarrenadoViewProps> = ({
  theme = 'light',
}) => {
  const dispatch = useAppDispatch();
  const calculator = useAppSelector(state => state.calculator);
  const scrollViewRef = useRef<ScrollView>(null);

  const isDark = theme === 'dark';
  const { width, height } = Dimensions.get('window');
  const medidas = getMedidaConfig(calculator.medida);
  const fieldLabels = getFieldLabels();
  const colors = getThemeColors(isDark);

  /**
   * Maneja el clic en un campo de entrada para barrenado
   */
  const textClick = (fieldIndex: number) => {
    if (fieldIndex > 9) fieldIndex = 0; // Barrenado tiene menos campos

    dispatch(setEditable(fieldIndex));

    if (fieldIndex > 0) {
      const fieldName = getFieldByIndex(fieldIndex);
      const currentValue = calculator[
        fieldName as keyof CalculatorState
      ] as string;
      const numValue = safeParseFloat(currentValue);

      dispatch(updateTextoCa(numValue === 0 ? 'CA' : 'C'));
    }
  };

  /**
   * Maneja la entrada del teclado para barrenado
   */
  const editarCampo = (boton: string) => {
    const fieldName = getFieldByIndex(calculator.editable);
    if (!fieldName) return;

    let currentValue = calculator[fieldName as keyof CalculatorState] as string;

    switch (boton) {
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
      case '0':
        if (currentValue === '0' || !isValidNumber(currentValue)) {
          currentValue = '';
        }
        currentValue += boton;
        break;

      case '.':
        if (!currentValue.includes('.')) {
          if (currentValue === '' || currentValue === '0') {
            currentValue = '0.';
          } else {
            currentValue += '.';
          }
        }
        break;

      case 'C':
        const numValue = safeParseFloat(currentValue);
        if (numValue === 0) {
          dispatch(clearAll());
          dispatch(updateTextoCa('CA'));
          return;
        } else {
          currentValue = '0';
        }
        break;

      case 'S':
        const prevIndex = calculator.editable - 1;
        textClick(prevIndex < 1 ? 9 : prevIndex);
        return;

      case 'B':
        const nextIndex = calculator.editable + 1;
        textClick(nextIndex > 9 ? 1 : nextIndex);
        return;

      default:
        return;
    }

    dispatch(
      setField({
        field: fieldName as keyof CalculatorState,
        value: currentValue,
      })
    );
    performBarrenadoCalculations(calculator.editable, currentValue);

    const newNumValue = safeParseFloat(currentValue);
    dispatch(updateTextoCa(newNumValue === 0 ? 'CA' : 'C'));
  };

  /**
   * Realiza cálculos específicos para barrenado
   */
  const performBarrenadoCalculations = (editable: number, newValue: string) => {
    const numValue = safeParseFloat(newValue);
    if (!isValidNumber(newValue)) return;

    setTimeout(() => {
      const D = editable === 1 ? numValue : safeParseFloat(calculator.D);
      const Z = editable === 2 ? numValue : safeParseFloat(calculator.Z);
      const N = editable === 3 ? numValue : safeParseFloat(calculator.N);
      const Vc = editable === 4 ? numValue : safeParseFloat(calculator.Vc);
      const fz = editable === 5 ? numValue : safeParseFloat(calculator.fz);
      const fn = editable === 6 ? numValue : safeParseFloat(calculator.fn);
      const vf = editable === 7 ? numValue : safeParseFloat(calculator.vf);
      const pb = editable === 8 ? numValue : safeParseFloat(calculator.ap); // Profundidad de barrenado
      const nb = editable === 9 ? numValue : safeParseFloat(calculator.ae); // Número de barrenos

      switch (editable) {
        case 1: // Diámetro (D)
          if (N > 0) {
            const newVc = calcVc(D, N);
            dispatch(setField({ field: 'Vc', value: formatNumber(newVc, 0) }));
          }
          if (Vc > 0 && D > 0) {
            const newN = calcN(D, Vc);
            dispatch(setField({ field: 'N', value: formatNumber(newN, 0) }));
          }
          break;

        case 2: // Número de filos (Z)
          if (fn > 0 && Z > 0) {
            const newFz = calcfz(fn, Z);
            dispatch(setField({ field: 'fz', value: formatNumber(newFz, 3) }));
          }
          if (fz > 0) {
            const newFn = calcfn2(fz, Z);
            dispatch(setField({ field: 'fn', value: formatNumber(newFn, 3) }));
          }
          break;

        case 3: // Velocidad de giro (N)
          if (D > 0) {
            const newVc = calcVc(D, N);
            dispatch(setField({ field: 'Vc', value: formatNumber(newVc, 0) }));
          }
          if (fn > 0) {
            const newVf = calcvf(fn, N);
            dispatch(setField({ field: 'vf', value: formatNumber(newVf, 0) }));
          }
          break;

        case 4: // Velocidad de corte (Vc)
          if (D > 0) {
            const newN = calcN(D, Vc);
            dispatch(setField({ field: 'N', value: formatNumber(newN, 0) }));
          }
          break;

        case 5: // Avance por filo (fz)
          if (Z > 0) {
            const newFn = calcfn2(fz, Z);
            dispatch(setField({ field: 'fn', value: formatNumber(newFn, 3) }));
          }
          break;

        case 6: // Avance por revolución (fn)
          if (Z > 0) {
            const newFz = calcfz(fn, Z);
            dispatch(setField({ field: 'fz', value: formatNumber(newFz, 3) }));
          }
          if (N > 0) {
            const newVf = calcvf(fn, N);
            dispatch(setField({ field: 'vf', value: formatNumber(newVf, 0) }));
          }
          break;

        case 7: // Velocidad de avance (vf)
          if (N > 0) {
            const newFn = calcfn1(vf, N);
            dispatch(setField({ field: 'fn', value: formatNumber(newFn, 3) }));
          }
          break;

        case 8: // Profundidad de barrenado (pb)
        case 9: // Número de barrenos (nb)
          // Calcular tiempo de corte para barrenado
          if (pb > 0 && vf > 0 && nb > 0) {
            const newTc = calctcBarrenado(pb, vf, nb);
            dispatch(setField({ field: 'tc', value: formatNumber(newTc, 2) }));
          }

          // Calcular tasa de remoción para barrenado
          if (D > 0 && vf > 0) {
            const newQ = calcQBarrenado(D, vf);
            dispatch(setField({ field: 'Q', value: formatNumber(newQ, 2) }));
          }
          break;
      }

      // Siempre recalcular tc y Q para barrenado si es posible
      const currentPb =
        editable === 8 ? numValue : safeParseFloat(calculator.ap);
      const currentNb =
        editable === 9 ? numValue : safeParseFloat(calculator.ae);
      const currentVf =
        editable === 7 ? numValue : safeParseFloat(calculator.vf);
      const currentD = editable === 1 ? numValue : safeParseFloat(calculator.D);

      if (currentPb > 0 && currentVf > 0 && currentNb > 0) {
        const newTc = calctcBarrenado(currentPb, currentVf, currentNb);
        dispatch(setField({ field: 'tc', value: formatNumber(newTc, 2) }));
      }

      if (currentD > 0 && currentVf > 0) {
        const newQ = calcQBarrenado(currentD, currentVf);
        dispatch(setField({ field: 'Q', value: formatNumber(newQ, 2) }));
      }
    }, 0);
  };

  const renderInputField = (
    label: string,
    value: string,
    unit: string,
    fieldIndex: number,
    isEditable: boolean = true
  ) => {
    const isSelected = calculator.editable === fieldIndex;
    const isCalculated = !isEditable;

    return (
      <View key={fieldIndex} style={styles.viewRow}>
        <Text style={[styles.labelRow, { color: colors.text }]}>{label}</Text>
        <View
          style={[
            isCalculated
              ? styles.inputContainerCalculated
              : styles.inputContainerEditable,
            isSelected && styles.inputContainerSelected,
            {
              borderColor: isSelected
                ? colors.selectedBorder
                : isCalculated
                  ? colors.border
                  : colors.primary,
              backgroundColor: isSelected
                ? colors.selectedBackground
                : isCalculated
                  ? colors.surface
                  : colors.inputBackground,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.textInputStyle}
            onPress={() => isEditable && textClick(fieldIndex)}
            disabled={!isEditable}
          >
            <Text style={[styles.labelInputText, { color: colors.text }]}>
              {value}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.labelMedRow, { color: colors.textSecondary }]}>
          {unit}
        </Text>
      </View>
    );
  };

  const renderKeyboard = () => {
    if (calculator.editable === 0) return null;

    return (
      <View
        style={[
          styles.keyboardContainer,
          {
            // Cast para evitar errores de tipos en alturas porcentuales
            height: calculator.keyboardHeight as any,
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          },
        ]}
      >
        <View style={styles.numbersGrid}>
          {[
            ['1', '2', '3'],
            ['4', '5', '6'],
            ['7', '8', '9'],
            [calculator.textoCa, '0', '.'],
          ].map((row, rowIndex) => (
            <View key={rowIndex} style={styles.buttonRow}>
              {row.map((button, buttonIndex) => (
                <TouchableOpacity
                  key={buttonIndex}
                  style={styles.calcButton}
                  onPress={() => editarCampo(button)}
                >
                  <LinearGradient
                    colors={
                      button === calculator.textoCa
                        ? [colors.primary, colors.primary]
                        : [colors.background, colors.surface]
                    }
                    style={styles.buttonGradient}
                  >
                    <Text
                      style={[
                        styles.calcText,
                        {
                          color:
                            button === calculator.textoCa
                              ? '#ffffff'
                              : colors.text,
                        },
                      ]}
                    >
                      {button}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>

        <View style={styles.arrowButtons}>
          <TouchableOpacity
            style={styles.arrowButton}
            onPress={() => editarCampo('S')}
          >
            <LinearGradient
              colors={[colors.primary, colors.primary]}
              style={styles.buttonGradient}
            >
              <ChevronUp size={24} color="#ffffff" />
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.arrowButton}
            onPress={() => editarCampo('B')}
          >
            <LinearGradient
              colors={[colors.primary, colors.primary]}
              style={styles.buttonGradient}
            >
              <ChevronDown size={24} color="#ffffff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <ScrollView
        ref={scrollViewRef}
        style={[
          styles.scrollContainer,
          {
            height: calculator.scrollHeight as any,
            backgroundColor: colors.background,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={() => textClick(0)}>
          <LinearGradient
            colors={[colors.primary, colors.primary]}
            style={styles.logoContainer}
          >
            <Text style={styles.logoText}>
              ELMEC - Calculadora de Barrenado
            </Text>
          </LinearGradient>

          {/* Parámetros de entrada para barrenado */}
          <View style={styles.parametersSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Parámetros de Entrada
            </Text>
            {renderInputField(fieldLabels.D, calculator.D, medidas.mm, 1)}
            {renderInputField(fieldLabels.Z, calculator.Z, '', 2)}
            {renderInputField(fieldLabels.N, calculator.N, medidas.rpm, 3)}
            {renderInputField(fieldLabels.Vc, calculator.Vc, medidas.mmin, 4)}
            {renderInputField(fieldLabels.fz, calculator.fz, medidas.mmrev, 5)}
            {renderInputField(fieldLabels.fn, calculator.fn, medidas.mmrev, 6)}
            {renderInputField(fieldLabels.vf, calculator.vf, medidas.mmmin, 7)}
            {renderInputField(
              fieldLabels.pb,
              calculator.ap,
              medidas.mm,
              8
            )}{' '}
            {/* Usando ap para pb */}
            {renderInputField(fieldLabels.nb, calculator.ae, '', 9)}{' '}
            {/* Usando ae para nb */}
          </View>

          {/* Resultados calculados */}
          <View style={styles.resultsSection}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              Resultados Calculados
            </Text>
            {renderInputField(fieldLabels.tc, calculator.tc, 'min', 10, false)}
            {renderInputField(
              fieldLabels.Q,
              calculator.Q,
              medidas.cm3min,
              11,
              false
            )}
          </View>

          {/* Información específica de barrenado */}
          <View style={styles.infoSection}>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              🔩 Calculadora especializada para operaciones de barrenado
            </Text>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              📏 Pb = Profundidad de barrenado, Nb = Número de barrenos
            </Text>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              🔧 Sistema: {calculator.medida === 'mt' ? 'Métrico' : 'Imperial'}
            </Text>
          </View>
        </Pressable>
      </ScrollView>

      {renderKeyboard()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
    padding: 20,
    borderRadius: 12,
  },
  logoText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  parametersSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  resultsSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    borderTopWidth: 2,
    borderTopColor: '#e5e7eb',
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  viewRow: {
    marginHorizontal: 4,
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  labelRow: {
    flex: 3,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    textAlign: 'right',
    marginRight: 12,
  },
  inputContainerSelected: {
    borderWidth: 3,
  },
  inputContainerEditable: {
    margin: 5,
    flex: 3,
    borderWidth: 2,
    borderRadius: 12,
  },
  inputContainerCalculated: {
    margin: 5,
    flex: 3,
    borderWidth: 2,
    borderRadius: 12,
  },
  textInputStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  labelInputText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  labelMedRow: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textAlign: 'left',
    marginLeft: 8,
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  infoText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 18,
  },
  keyboardContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 8,
  },
  numbersGrid: {
    flex: 8,
    padding: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    flex: 1,
    gap: 8,
    marginBottom: 8,
  },
  calcButton: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
    minHeight: 48,
  },
  buttonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  calcText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  arrowButtons: {
    flex: 3,
    padding: 8,
    gap: 8,
  },
  arrowButton: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
});
