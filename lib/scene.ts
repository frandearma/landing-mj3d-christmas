// Estado compartido entre la intro y el árbol de fondo.
// k: 1 = plano abierto del árbol completo, 0 = cámara que sigue el scroll.
export const introV = { k: 1 };

let ready: () => void = () => {};
export const treeLoaded = new Promise<void>(r => (ready = r));
export const markTreeReady = () => ready();

// clima: cuánta nieve cae (fracción de copos visibles), a qué velocidad y con cuánto viento
export const STAGES = [
  { name: 'Noche clara', temp: '2 °C', amount: .08, speed: .5, wind: .03 },
  { name: 'Nevisca', temp: '−1 °C', amount: .35, speed: .75, wind: .12 },
  { name: 'Nevada', temp: '−4 °C', amount: .65, speed: 1, wind: .3 },
  { name: 'Ventisca', temp: '−7 °C', amount: 1, speed: 1.7, wind: 1.3 },
];
export const DEFAULT_STAGE = 2;
export const weather = { amount: STAGES[DEFAULT_STAGE].amount, speed: STAGES[DEFAULT_STAGE].speed, wind: STAGES[DEFAULT_STAGE].wind };

export const prefersReduced = () => typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
