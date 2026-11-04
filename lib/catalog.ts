// Datos del catálogo: se editan en data/catalog.json. precio null = "Consultar precio".
import data from '@/data/catalog.json';

export type CatId = 'colgar' | 'mesa' | 'deco';
export type Product = { id: string; cat: CatId; name: string; desc: string; colors: string[]; price: number | null; photos: string[] };

type Item = (typeof data.productos)[number] & { precio: number | null; fotoPorColor: Record<string, number> };

export const CATS = data.categorias.map(c => ({ id: c.id as CatId, name: c.nombre }));
export const COLORS: Record<string, string> = data.colores;

// fotos: qué fotos del producto se usan (001-1.webp, 001-2.webp, ...)
export const PRODUCTS: Product[] = (data.productos as Item[]).map(p => ({
  id: p.id, cat: p.categoria as CatId, name: p.nombre, desc: p.descripcion, colors: p.colores,
  price: typeof p.precio === 'number' && p.precio > 0 ? p.precio : null, photos: p.fotos.map(i => `${p.id}-${i}`),
}));

// fotoPorColor: qué foto muestra mejor cada color
const CPH = Object.fromEntries((data.productos as Item[]).map(p => [p.id, p.fotoPorColor]));

export const photoOf = (p: Product, c: string) => (CPH[p.id]?.[c] ? `${p.id}-${CPH[p.id][c]}` : null);
export const catName = (id: string) => CATS.find(c => c.id === id)?.name ?? 'Todo';
const fmt = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
export const priceOf = (p: Product) => (p.price ? fmt.format(p.price) : 'Consultar precio');
