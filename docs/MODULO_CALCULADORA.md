# 🧮 Módulo de Calculadoras - Documentación Técnica

## Visión General

El módulo de calculadoras proporciona herramientas especializadas para cálculos de mecanizado industrial, específicamente para procesos de fresado y barrenado.

### Características
- ✅ Calculadora de Fresado (velocidad de corte, RPM, avance)
- ✅ Calculadora de Barrenado (perforación)
- ✅ Múltiples operaciones (cilindrado, refrentado, ranurado, etc.)
- ✅ Base de datos de materiales
- ✅ Configuraciones guardadas con Redux
- ✅ Historial de cálculos
- ✅ Validación de inputs
- ✅ Resultados en tiempo real

---

## Arquitectura

```
┌────────────────────────────────────┐
│       Redux Store (Persist)        │
│  - configurations                  │
│  - history                         │
│  - selectedMaterial                │
└────────────────────────────────────┘
              ↕
┌────────────────────────────────────┐
│      Calculator Components          │
│  - FresadoScreen                   │
│  - BarrenadoScreen                 │
│  - SettingsScreen                  │
└────────────────────────────────────┘
              ↕
┌────────────────────────────────────┐
│      Calculation Engine            │
│  - Formula implementations         │
│  - Material constants              │
│  - Unit conversions                │
└────────────────────────────────────┘
```

---

## Calculadora de Fresado

### Fórmulas Implementadas

#### 1. Velocidad de Corte (Vc)
```typescript
// Vc = (π × D × RPM) / 1000
const calcularVelocidadCorte = (diametro: number, rpm: number): number => {
  return (Math.PI * diametro * rpm) / 1000;
};
```

#### 2. Revoluciones Por Minuto (RPM)
```typescript
// RPM = (Vc × 1000) / (π × D)
const calcularRPM = (velocidadCorte: number, diametro: number): number => {
  return (velocidadCorte * 1000) / (Math.PI * diametro);
};
```

#### 3. Avance (F)
```typescript
// F = fz × z × RPM
const calcularAvance = (
  avancePorDiente: number,
  numDientes: number,
  rpm: number
): number => {
  return avancePorDiente * numDientes * rpm;
};
```

#### 4. Potencia de Corte
```typescript
// Pc = Vc × F × ap × Kc / 60000
const calcularPotencia = (
  velocidadCorte: number,
  avance: number,
  profundidad: number,
  constanteMaterial: number
): number => {
  return (velocidadCorte * avance * profundidad * constanteMaterial) / 60000;
};
```

---

## Materiales Soportados

### Base de Datos de Materiales

```typescript
// constants/calculator.ts
export const MATERIALES = {
  acero_dulce: {
    nombre: 'Acero Dulce (< 50 HB)',
    velocidadCorte: { min: 100, max: 200, recomendada: 150 },
    avancePorDiente: { min: 0.1, max: 0.3, recomendado: 0.2 },
    constanteKc: 1800,
  },
  acero_medio: {
    nombre: 'Acero Medio (50-70 HB)',
    velocidadCorte: { min: 80, max: 150, recomendada: 120 },
    avancePorDiente: { min: 0.08, max: 0.25, recomendado: 0.15 },
    constanteKc: 2200,
  },
  acero_duro: {
    nombre: 'Acero Duro (> 70 HB)',
    velocidadCorte: { min: 60, max: 120, recomendada: 90 },
    avancePorDiente: { min: 0.05, max: 0.2, recomendado: 0.1 },
    constanteKc: 2800,
  },
  aluminio: {
    nombre: 'Aluminio',
    velocidadCorte: { min: 200, max: 600, recomendada: 400 },
    avancePorDiente: { min: 0.15, max: 0.4, recomendado: 0.25 },
    constanteKc: 600,
  },
  bronce: {
    nombre: 'Bronce',
    velocidadCorte: { min: 80, max: 200, recomendada: 150 },
    avancePorDiente: { min: 0.1, max: 0.3, recomendado: 0.2 },
    constanteKc: 1200,
  },
  plastico: {
    nombre: 'Plástico',
    velocidadCorte: { min: 100, max: 300, recomendada: 200 },
    avancePorDiente: { min: 0.1, max: 0.3, recomendado: 0.2 },
    constanteKc: 400,
  },
};
```

---

## Operaciones de Fresado

```typescript
export const OPERACIONES_FRESADO = {
  cilindrado: {
    nombre: 'Cilindrado',
    descripcion: 'Mecanizado de superficies cilíndricas externas',
    factorPotencia: 1.0,
  },
  refrentado: {
    nombre: 'Refrentado',
    descripcion: 'Mecanizado de caras planas',
    factorPotencia: 1.2,
  },
  ranurado: {
    nombre: 'Ranurado',
    descripcion: 'Corte de ranuras y canales',
    factorPotencia: 1.5,
  },
  planeado: {
    nombre: 'Planeado',
    descripcion: 'Superficie plana con fresa de planear',
    factorPotencia: 1.1,
  },
  contorneado: {
    nombre: 'Contorneado',
    descripcion: 'Perfiles y contornos complejos',
    factorPotencia: 1.3,
  },
};
```

---

## Pantallas

### 1. FresadoScreen

**Ubicación**: `app/calculator/FresadoScreen.tsx`

```tsx
export default function FresadoScreen() {
  const dispatch = useDispatch();
  const { selectedMaterial, lastCalculation } = useSelector(
    (state: RootState) => state.calculator
  );

  // Estado local
  const [diametro, setDiametro] = useState('');
  const [numDientes, setNumDientes] = useState('');
  const [profundidad, setProfundidad] = useState('');
  const [operacion, setOperacion] = useState('cilindrado');

  // Cálculos
  const [resultados, setResultados] = useState({
    rpm: 0,
    velocidadCorte: 0,
    avance: 0,
    potencia: 0,
  });

  const calcular = () => {
    const material = MATERIALES[selectedMaterial];

    const rpm = calcularRPM(material.velocidadCorte.recomendada, parseFloat(diametro));
    const vc = calcularVelocidadCorte(parseFloat(diametro), rpm);
    const avance = calcularAvance(
      material.avancePorDiente.recomendado,
      parseInt(numDientes),
      rpm
    );
    const potencia = calcularPotencia(
      vc,
      avance,
      parseFloat(profundidad),
      material.constanteKc
    );

    setResultados({ rpm, velocidadCorte: vc, avance, potencia });

    // Guardar en historial
    dispatch(addCalculation({
      tipo: 'fresado',
      operacion,
      material: selectedMaterial,
      inputs: { diametro, numDientes, profundidad },
      resultados,
      timestamp: Date.now(),
    }));
  };

  return (
    <ScrollView>
      <Text style={styles.title}>Calculadora de Fresado</Text>

      {/* Selector de Material */}
      <Picker
        selectedValue={selectedMaterial}
        onValueChange={(value) => dispatch(setSelectedMaterial(value))}
      >
        {Object.entries(MATERIALES).map(([key, mat]) => (
          <Picker.Item key={key} label={mat.nombre} value={key} />
        ))}
      </Picker>

      {/* Selector de Operación */}
      <Picker
        selectedValue={operacion}
        onValueChange={setOperacion}
      >
        {Object.entries(OPERACIONES_FRESADO).map(([key, op]) => (
          <Picker.Item key={key} label={op.nombre} value={key} />
        ))}
      </Picker>

      {/* Inputs */}
      <TextInput
        placeholder="Diámetro de la fresa (mm)"
        value={diametro}
        onChangeText={setDiametro}
        keyboardType="numeric"
      />

      <TextInput
        placeholder="Número de dientes"
        value={numDientes}
        onChangeText={setNumDientes}
        keyboardType="numeric"
      />

      <TextInput
        placeholder="Profundidad de corte (mm)"
        value={profundidad}
        onChangeText={setProfundidad}
        keyboardType="numeric"
      />

      {/* Botón Calcular */}
      <Button title="Calcular" onPress={calcular} />

      {/* Resultados */}
      {resultados.rpm > 0 && (
        <View style={styles.resultados}>
          <Text style={styles.resultado}>
            RPM: {resultados.rpm.toFixed(0)} rev/min
          </Text>
          <Text style={styles.resultado}>
            Velocidad de Corte: {resultados.velocidadCorte.toFixed(2)} m/min
          </Text>
          <Text style={styles.resultado}>
            Avance: {resultados.avance.toFixed(2)} mm/min
          </Text>
          <Text style={styles.resultado}>
            Potencia: {resultados.potencia.toFixed(2)} kW
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
```

---

### 2. BarrenadoScreen

**Ubicación**: `app/calculator/BarrenadoScreen.tsx`

```tsx
export default function BarrenadoScreen() {
  const [diametro, setDiametro] = useState('');
  const [profundidad, setProfundidad] = useState('');
  const [material, setMaterial] = useState('acero_medio');

  const [resultados, setResultados] = useState({
    rpm: 0,
    velocidadCorte: 0,
    avance: 0,
    tiempoCorte: 0,
  });

  const calcular = () => {
    const mat = MATERIALES[material];

    // Fórmulas de barrenado
    const vc = mat.velocidadCorte.recomendada;
    const rpm = (vc * 1000) / (Math.PI * parseFloat(diametro));
    const avance = 0.2 * rpm; // Avance simplificado
    const tiempo = parseFloat(profundidad) / avance;

    setResultados({ rpm, velocidadCorte: vc, avance, tiempoCorte: tiempo });
  };

  return (
    <ScrollView>
      <Text style={styles.title}>Calculadora de Barrenado</Text>

      {/* Similar estructura a FresadoScreen */}
      {/* ... */}
    </ScrollView>
  );
}
```

---

## Redux Store

### Calculator Slice

```typescript
// store/calculatorSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CalculatorState {
  selectedMaterial: string;
  configurations: any[];
  history: Calculation[];
}

interface Calculation {
  id: string;
  tipo: 'fresado' | 'barrenado';
  operacion: string;
  material: string;
  inputs: any;
  resultados: any;
  timestamp: number;
}

const initialState: CalculatorState = {
  selectedMaterial: 'acero_medio',
  configurations: [],
  history: [],
};

const calculatorSlice = createSlice({
  name: 'calculator',
  initialState,
  reducers: {
    setSelectedMaterial: (state, action: PayloadAction<string>) => {
      state.selectedMaterial = action.payload;
    },

    addCalculation: (state, action: PayloadAction<Calculation>) => {
      state.history.unshift({
        ...action.payload,
        id: `calc-${Date.now()}`,
      });

      // Limitar historial a 50 cálculos
      if (state.history.length > 50) {
        state.history = state.history.slice(0, 50);
      }
    },

    saveConfiguration: (state, action: PayloadAction<any>) => {
      state.configurations.push(action.payload);
    },

    deleteConfiguration: (state, action: PayloadAction<string>) => {
      state.configurations = state.configurations.filter(
        c => c.id !== action.payload
      );
    },

    clearHistory: (state) => {
      state.history = [];
    },
  },
});

export const {
  setSelectedMaterial,
  addCalculation,
  saveConfiguration,
  deleteConfiguration,
  clearHistory,
} = calculatorSlice.actions;

export default calculatorSlice.reducer;
```

---

## Uso del Módulo

### Ejemplo: Calcular parámetros de fresado

```tsx
import { useDispatch, useSelector } from 'react-redux';
import { addCalculation } from '@/store/calculatorSlice';
import { MATERIALES } from '@/constants/calculator';

function MiComponente() {
  const dispatch = useDispatch();
  const material = useSelector(state => state.calculator.selectedMaterial);

  const calcularFresado = (diametro: number, numDientes: number) => {
    const mat = MATERIALES[material];

    // Cálculos
    const rpm = (mat.velocidadCorte.recomendada * 1000) / (Math.PI * diametro);
    const avance = mat.avancePorDiente.recomendado * numDientes * rpm;

    // Guardar en historial
    dispatch(addCalculation({
      tipo: 'fresado',
      operacion: 'cilindrado',
      material,
      inputs: { diametro, numDientes },
      resultados: { rpm, avance },
      timestamp: Date.now(),
    }));

    return { rpm, avance };
  };

  return (
    <Button onPress={() => calcularFresado(10, 4)} title="Calcular" />
  );
}
```

---

## Validaciones

```typescript
const validateInputs = (inputs: CalculatorInputs): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Diámetro
  if (!inputs.diametro || inputs.diametro <= 0) {
    errors.push({ field: 'diametro', message: 'Diámetro debe ser mayor a 0' });
  }

  if (inputs.diametro > 500) {
    errors.push({ field: 'diametro', message: 'Diámetro muy grande (máx 500mm)' });
  }

  // Número de dientes
  if (!inputs.numDientes || inputs.numDientes < 1) {
    errors.push({ field: 'numDientes', message: 'Mínimo 1 diente' });
  }

  if (inputs.numDientes > 20) {
    errors.push({ field: 'numDientes', message: 'Máximo 20 dientes' });
  }

  // Profundidad
  if (!inputs.profundidad || inputs.profundidad <= 0) {
    errors.push({ field: 'profundidad', message: 'Profundidad debe ser mayor a 0' });
  }

  return errors;
};
```

---

## Conversión de Unidades

```typescript
export const convertUnits = {
  // mm/min a m/min
  mmToM: (value: number) => value / 1000,

  // m/min a mm/min
  mToMm: (value: number) => value * 1000,

  // RPM a rad/s
  rpmToRadS: (rpm: number) => (rpm * 2 * Math.PI) / 60,

  // HP a kW
  hpToKw: (hp: number) => hp * 0.746,

  // kW a HP
  kwToHp: (kw: number) => kw / 0.746,
};
```

---

## Mejores Prácticas

1. **Validar inputs antes de calcular**
2. **Usar valores recomendados como default**
3. **Mostrar rangos de valores válidos**
4. **Guardar configuraciones frecuentes**
5. **Permitir exportar/compartir resultados**
6. **Mostrar warnings para valores extremos**

---

**Última Actualización**: 30 de Septiembre, 2025