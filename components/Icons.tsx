type P = { size?: number };
const base = (size: number) => ({ width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true });

export const WaIcon = ({ size = 18 }: P) => <svg {...base(size)}><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>;
export const XIcon = ({ size = 20 }: P) => <svg {...base(size)}><path d="M18 6 6 18M6 6l12 12" /></svg>;
export const Chevron = ({ size = 14 }: P) => <svg {...base(size)}><path d="m6 9 6 6 6-6" /></svg>;
export const Arrow = ({ size = 18 }: P) => <svg {...base(size)}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
export const FilterIcon = ({ size = 16 }: P) => <svg {...base(size)}><path d="M4 6h16M7 12h10M10 18h4" /></svg>;
export const Prev = ({ size = 20 }: P) => <svg {...base(size)}><path d="m15 18-6-6 6-6" /></svg>;
export const Next = ({ size = 20 }: P) => <svg {...base(size)}><path d="m9 18 6-6-6-6" /></svg>;
