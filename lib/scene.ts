// Estado compartido entre la intro y el árbol de fondo.
// k: 1 = plano abierto del árbol completo, 0 = cámara que sigue el scroll.
export const introV = { k: 1 };

let ready: () => void = () => {};
export const treeLoaded = new Promise<void>(r => (ready = r));
export const markTreeReady = () => ready();

// clima: cuánta nieve cae (fracción de copos visibles), a qué velocidad y con cuánto viento, según la temperatura
export const STAGES = [
  { name: 'Noche clara', temp: 2, amount: .08, speed: .5, wind: .03 },
  { name: 'Nevisca', temp: -1, amount: .35, speed: .75, wind: .12 },
  { name: 'Nevada', temp: -4, amount: .65, speed: 1, wind: .3 },
  { name: 'Ventisca', temp: -7, amount: 1, speed: 1.7, wind: 1.3 },
];
export const TEMP_DEFAULT = -4;
// nombre del clima: el de la etapa más cercana a esa temperatura
export const stageAt = (t: number) => STAGES.reduce((b, s, i) => (Math.abs(s.temp - t) < Math.abs(STAGES[b].temp - t) ? i : b), 0);
// entre etapas, la nieve se interpola: cada grado cambia un poco
export const weatherAt = (t: number) => {
  let i = 0; while (i < STAGES.length - 2 && t < STAGES[i + 1].temp) i++;
  const a = STAGES[i], b = STAGES[i + 1], u = Math.min(1, Math.max(0, (a.temp - t) / (a.temp - b.temp)));
  return { amount: a.amount + (b.amount - a.amount) * u, speed: a.speed + (b.speed - a.speed) * u, wind: a.wind + (b.wind - a.wind) * u };
};
export const weather = weatherAt(TEMP_DEFAULT);

export const prefersReduced = () => typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
