// --- Funciones de Cálculo de Mecanizado CNC ---

/**
 * Calcula la velocidad de corte (Vc) basada en diámetro y RPM
 * Fórmula: Vc = (π × D × N) / 1000
 * @param D Diámetro de la herramienta en mm
 * @param N Velocidad de rotación en RPM
 * @returns Velocidad de corte en m/min
 */
export const calcVc = (D: number, N: number): number => {
  if (D === 0 || N === 0) return 0;
  return (Math.PI * D * N) / 1000;
};

/**
 * Calcula las RPM basadas en diámetro y velocidad de corte
 * Fórmula: N = (Vc × 1000) / (π × D)
 * @param D Diámetro de la herramienta en mm
 * @param Vc Velocidad de corte en m/min
 * @returns Velocidad de rotación en RPM
 */
export const calcN = (D: number, Vc: number): number => {
  if (D === 0 || Vc === 0) return 0;
  return (Vc * 1000) / (Math.PI * D);
};

/**
 * Calcula el avance por diente basado en avance por revolución y número de dientes
 * Fórmula: fz = fn / Z
 * @param fn Avance por revolución en mm/rev
 * @param Z Número de dientes/filos
 * @returns Avance por diente en mm/diente
 */
export const calcfz = (fn: number, Z: number): number => {
  if (Z === 0) return 0;
  return fn / Z;
};

/**
 * Calcula el avance por revolución basado en avance por diente y número de dientes
 * Fórmula: fn = fz × Z
 * @param fz Avance por diente en mm/diente
 * @param Z Número de dientes/filos
 * @returns Avance por revolución en mm/rev
 */
export const calcfn2 = (fz: number, Z: number): number => {
  return fz * Z;
};

/**
 * Calcula el avance por revolución basado en velocidad de avance y RPM
 * Fórmula: fn = vf / N
 * @param vf Velocidad de avance en mm/min
 * @param N Velocidad de rotación en RPM
 * @returns Avance por revolución en mm/rev
 */
export const calcfn1 = (vf: number, N: number): number => {
  if (N === 0) return 0;
  return vf / N;
};

/**
 * Calcula la velocidad de avance basada en avance por revolución y RPM
 * Fórmula: vf = fn × N
 * @param fn Avance por revolución en mm/rev
 * @param N Velocidad de rotación en RPM
 * @returns Velocidad de avance en mm/min
 */
export const calcvf = (fn: number, N: number): number => {
  return fn * N;
};

/**
 * Calcula el tiempo de corte para fresado
 * Fórmula: tc = (lm × np) / vf
 * @param lm Longitud a mecanizar en mm
 * @param vf Velocidad de avance en mm/min
 * @param np Número de pasadas
 * @returns Tiempo de corte en minutos
 */
export const calctc = (lm: number, vf: number, np: number): number => {
  if (vf === 0) return 0;
  return (lm * np) / vf;
};

/**
 * Calcula la tasa de remoción de material para fresado
 * Fórmula: Q = ap × ae × vf
 * @param ap Profundidad axial en mm
 * @param ae Profundidad radial en mm
 * @param vf Velocidad de avance en mm/min
 * @returns Tasa de remoción en cm³/min
 */
export const calcQ = (ap: number, ae: number, vf: number): number => {
  return (ap * ae * vf) / 1000; // Convertir a cm³/min
};

/**
 * Calcula la tasa de remoción para barrenado
 * Fórmula: Q = (π × D² / 4) × vf / 1000
 * @param D Diámetro del barreno en mm
 * @param vf Velocidad de avance en mm/min
 * @returns Tasa de remoción en cm³/min
 */
export const calcQBarrenado = (D: number, vf: number): number => {
  if (D === 0 || vf === 0) return 0;
  return (((Math.PI * D * D) / 4) * vf) / 1000;
};

/**
 * Calcula el tiempo de corte para barrenado
 * Fórmula: tc = (pb × nb) / vf
 * @param pb Profundidad de barrenado en mm
 * @param vf Velocidad de avance en mm/min
 * @param nb Número de barrenos
 * @returns Tiempo de corte en minutos
 */
export const calctcBarrenado = (pb: number, vf: number, nb: number): number => {
  if (vf === 0) return 0;
  return (pb * nb) / vf;
};

// --- Funciones de Utilidad ---

/**
 * Formatea un número a una cantidad específica de decimales
 * Maneja casos de NaN e infinito
 */
export const formatNumber = (value: number, decimals: number): string => {
  if (isNaN(value) || !isFinite(value)) {
    return '0';
  }
  return value.toFixed(decimals);
};

/**
 * Verifica si una cadena representa un número válido
 */
export const isValidNumber = (value: string): boolean => {
  const num = parseFloat(value);
  return !isNaN(num) && isFinite(num);
};

/**
 * Convierte un valor string a número de forma segura
 */
export const safeParseFloat = (value: string): number => {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
};

/**
 * Obtiene el nombre del campo basado en su índice
 */
export const getFieldByIndex = (index: number): string => {
  const fieldMap: { [key: number]: string } = {
    1: 'D',
    2: 'Z',
    3: 'N',
    4: 'Vc',
    5: 'fz',
    6: 'fn',
    7: 'vf',
    8: 'ap',
    9: 'ae',
    10: 'np',
    11: 'lm',
  };

  return fieldMap[index] || '';
};

/**
 * Obtiene la configuración de unidades según el sistema de medida
 */
export const getMedidaConfig = (medida: string) => {
  if (medida === 'mt') {
    return {
      mm: 'mm',
      mmin: 'm/min',
      mmrev: 'mm/rev',
      mmmin: 'mm/min',
      rpm: 'rpm',
      cm3min: 'cm³/min',
    };
  } else {
    return {
      mm: 'in',
      mmin: 'ft/min',
      mmrev: 'in/rev',
      mmmin: 'in/min',
      rpm: 'rpm',
      cm3min: 'in³/min',
    };
  }
};

/**
 * Obtiene las etiquetas de los campos en español
 */
export const getFieldLabels = () => ({
  D: 'Diámetro (D)',
  Z: 'Número de filos (Z)',
  N: 'Velocidad de giro (N)',
  Vc: 'Velocidad de corte (Vc)',
  fz: 'Avance por filo (fz)',
  fn: 'Avance por revolución (fn)',
  vf: 'Velocidad de avance (Vf)',
  ap: 'Profundidad axial (ap)',
  ae: 'Profundidad radial (ae)',
  np: 'Número de pasadas (Np)',
  lm: 'Longitud de maquinado (Lm)',
  tc: 'Tiempo de corte (Tc)',
  Q: 'Tasa de remoción (Q)',
  pb: 'Profundidad de barrenado (Pb)',
  nb: 'Número de barrenos (Nb)',
});

/**
 * Valida que un valor esté dentro de un rango específico
 */
export const validateRange = (
  value: number,
  min: number,
  max: number
): boolean => {
  return value >= min && value <= max;
};

/**
 * Obtiene los colores del tema según el modo claro/oscuro
 */
export const getThemeColors = (isDark: boolean) => ({
  background: isDark ? '#1f2937' : '#ffffff',
  surface: isDark ? '#374151' : '#f9fafb',
  primary: isDark ? '#60a5fa' : '#1e40af',
  text: isDark ? '#f9fafb' : '#111827',
  textSecondary: isDark ? '#d1d5db' : '#6b7280',
  border: isDark ? '#4b5563' : '#e5e7eb',
  inputBackground: isDark ? '#4b5563' : '#eff6ff',
  selectedBackground: isDark ? '#065f46' : '#ecfdf5',
  selectedBorder: isDark ? '#10b981' : '#10b981',
});

/**
 * Valida parámetros de mecanizado según rangos típicos
 */
export const validateMachiningParameters = (params: {
  D?: number;
  N?: number;
  Vc?: number;
  fz?: number;
  vf?: number;
}) => {
  const errors: string[] = [];

  if (params.D && !validateRange(params.D, 0.1, 500)) {
    errors.push('Diámetro debe estar entre 0.1 y 500 mm');
  }

  if (params.N && !validateRange(params.N, 1, 50000)) {
    errors.push('RPM debe estar entre 1 y 50,000');
  }

  if (params.Vc && !validateRange(params.Vc, 1, 2000)) {
    errors.push('Velocidad de corte debe estar entre 1 y 2,000 m/min');
  }

  if (params.fz && !validateRange(params.fz, 0.001, 10)) {
    errors.push('Avance por filo debe estar entre 0.001 y 10 mm/diente');
  }

  if (params.vf && !validateRange(params.vf, 1, 20000)) {
    errors.push('Velocidad de avance debe estar entre 1 y 20,000 mm/min');
  }

  return errors;
};

/**
 * Convierte unidades métricas a imperiales
 */
export const convertToImperial = (value: number, unit: string): number => {
  switch (unit) {
    case 'mm':
      return value / 25.4; // mm to inches
    case 'm/min':
      return value * 3.28084; // m/min to ft/min
    case 'mm/min':
      return value / 25.4; // mm/min to in/min
    case 'mm/rev':
      return value / 25.4; // mm/rev to in/rev
    case 'cm³/min':
      return value / 16.387; // cm³/min to in³/min
    default:
      return value;
  }
};

/**
 * Convierte unidades imperiales a métricas
 */
export const convertToMetric = (value: number, unit: string): number => {
  switch (unit) {
    case 'in':
      return value * 25.4; // inches to mm
    case 'ft/min':
      return value / 3.28084; // ft/min to m/min
    case 'in/min':
      return value * 25.4; // in/min to mm/min
    case 'in/rev':
      return value * 25.4; // in/rev to mm/rev
    case 'in³/min':
      return value * 16.387; // in³/min to cm³/min
    default:
      return value;
  }
};
