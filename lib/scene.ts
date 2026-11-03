// Estado compartido entre la intro y el árbol de fondo.
// k: 1 = plano abierto del árbol completo, 0 = cámara que sigue el scroll.
export const introV = { k: 1 };

let ready: () => void = () => {};
export const treeLoaded = new Promise<void>(r => (ready = r));
export const markTreeReady = () => ready();

export const prefersReduced = () => typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
