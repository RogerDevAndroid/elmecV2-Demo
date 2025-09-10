import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Traducciones en español
const resources = {
  es: {
    translation: {
      // Traducciones generales
      loading: 'Cargando...',
      settings: 'Configuración',
      back: 'Atrás',
    },
    home: {
      barrenado: 'Barrenado',
      fresado: 'Fresado',
    },
    settings: {
      ajustes: 'Ajustes',
      medida: 'Unidad de Medida',
      velocidad: 'Velocidad',
    },
    barrenado: {
      d: 'Diámetro (D)',
      z: 'Número de filos (Z)',
      n: 'Velocidad de giro (N)',
      vc: 'Velocidad de corte (Vc)',
      fz: 'Avance por filo (fz)',
      fn: 'Avance por revolución (fn)',
      vf: 'Velocidad de avance (Vf)',
      pb: 'Profundidad de barrenado (Pb)',
      nb: 'Número de barrenos (Nb)',
      tc: 'Tiempo de corte (Tc)',
      q: 'Tasa de remoción (Q)',
    },
    fresado: {
      d: 'Diámetro (D)',
      z: 'Número de filos (Z)',
      n: 'Velocidad de giro (N)',
      vc: 'Velocidad de corte (Vc)',
      fz: 'Avance por filo (fz)',
      fn: 'Avance por revolución (fn)',
      vf: 'Velocidad de avance (Vf)',
      ap: 'Profundidad axial (ap)',
      ae: 'Profundidad radial (ae)',
      np: 'Número de pasadas (Np)',
      lm: 'Longitud de maquinado (Lm)',
      tc: 'Tiempo de corte (Tc)',
      q: 'Tasa de remoción (Q)',
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'es',
  fallbackLng: 'es',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
