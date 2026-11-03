// Datos del catálogo. Nombres provisorios hasta tener la lista del cliente; price null = "Consultar precio".

export type CatId = 'colgar' | 'mesa' | 'deco';
export type Product = { id: string; cat: CatId; name: string; desc: string; colors: string[]; price: number | null; photos: string[] };

export const CATS: { id: CatId; name: string }[] = [
  { id: 'colgar', name: 'Para colgar' },
  { id: 'mesa', name: 'Para la mesa' },
  { id: 'deco', name: 'Figuras y deco' },
];

export const COLORS: Record<string, string> = { Blanco: '#f4f0e8', Crema: '#e9dfcc', Beige: '#cdb79a', Verde: '#2e7a5c', 'Verde salvia': '#8a9e8c', 'Verde agua': '#5fb8a8', 'Verde oliva': '#4f5236', Rojo: '#b83b32', 'Bordó': '#7d2a2a', Gris: '#9a9a96', Negro: '#262626', 'Marrón': '#6b4a33', Rosa: '#d9a5a0', Dorado: '#d6b875' };

// n: qué fotos del producto se usan (001-1.webp, 001-2.webp, ...)
const P = (id: string, cat: CatId, name: string, desc: string, colors: string[], n: number[]): Product =>
  ({ id, cat, name, desc, colors, price: null, photos: n.map(i => `${id}-${i}`) });

export const PRODUCTS: Product[] = [
  P('007', 'colgar', 'Esferas acanaladas', 'Esferas con líneas verticales y argolla para colgar.', ['Bordó', 'Beige', 'Verde salvia'], [1, 2, 3, 4]),
  P('008', 'colgar', 'Gotas acanaladas', 'Adorno alargado tipo gota, liviano y con argolla.', ['Bordó', 'Blanco', 'Gris', 'Verde salvia'], [1, 2, 3, 4]),
  P('016', 'colgar', 'Campanas acanaladas', 'Campana con badajo, para el árbol o la puerta.', ['Verde salvia', 'Beige', 'Bordó'], [1, 2, 3, 4]),
  P('017', 'colgar', 'Esfera espiral calada', 'Esfera calada en espiral que deja pasar la luz.', ['Rojo', 'Blanco'], [1, 2, 3, 4]),
  P('019', 'colgar', 'Estrellas tejidas', 'Estrella con textura de tejido trenzado.', ['Verde', 'Beige', 'Blanco'], [1, 2, 3, 4]),
  P('020', 'colgar', 'Ángel con corazón', 'Angelito blanco con corazón rojo.', ['Blanco'], [1, 2]),
  P('021', 'colgar', 'Arbolito colgante', 'Arbolito acanalado de tres pisos, con argolla.', ['Verde salvia', 'Beige', 'Bordó'], [1, 2, 3, 4]),
  P('022', 'colgar', 'Adornos texturados', 'Set de adornos con relieve: esferas, gotas y piñas.', ['Blanco', 'Rosa', 'Gris', 'Dorado'], [1]),
  P('023', 'colgar', 'Campanas caladas', 'Campana calada, linda con una luz adentro.', ['Rojo', 'Negro', 'Crema', 'Verde agua'], [1, 2, 3, 4]),
  P('001', 'mesa', 'Servilletero árbol', 'Servilletero con forma de árbol y estrella calada.', ['Crema', 'Verde', 'Blanco'], [1, 2, 3, 4]),
  P('002', 'mesa', 'Árbol portavela', 'Silueta de árbol con lugar para una vela de té.', ['Beige', 'Crema'], [1, 2, 3]),
  P('003', 'mesa', 'Posavasos copo de nieve', 'Set de posavasos con copo en relieve y soporte.', ['Rojo', 'Verde agua'], [1, 2, 3, 4]),
  P('009', 'mesa', 'Portavelas acanalados', 'Portavelas bajos para velas de té.', ['Verde salvia', 'Crema', 'Gris', 'Negro'], [1, 2, 3]),
  P('013', 'mesa', 'Portavela reno', 'Reno con hueco para una vela de té.', ['Blanco', 'Beige', 'Marrón'], [1, 2, 3, 4]),
  P('018', 'mesa', 'Servilleteros navideños', 'Aros para servilleta: reno, regalo, estrella y más.', ['Rojo', 'Verde agua', 'Beige'], [1, 2, 3, 4]),
  P('004', 'deco', 'Renos rayados', 'Renos de cuerpo acanalado para la mesa o un estante.', ['Verde salvia', 'Beige', 'Bordó', 'Blanco'], [1, 2, 3]),
  P('005', 'deco', 'Gnomos nórdicos', 'Gnomos de nariz redonda y gorro largo.', ['Beige', 'Verde oliva'], [1, 2, 4]),
  P('006', 'deco', 'Árboles acanalados', 'Árboles de pisos con líneas verticales.', ['Crema', 'Gris', 'Verde', 'Marrón', 'Negro'], [1, 2, 3, 4]),
  P('010', 'deco', 'Árbol farol calado', 'Árbol con calados para poner una vela adentro.', ['Blanco'], [1, 2, 3, 4]),
  P('011', 'deco', 'Muñeco de nieve', 'Muñeco con galera y bufanda.', ['Blanco'], [1, 2, 3, 4]),
  P('012', 'deco', 'Papá Noel nórdico', 'Papá Noel alto, de barba larga y gorro.', ['Verde salvia', 'Marrón'], [1, 2, 3, 4]),
  P('014', 'deco', 'Árbol de ondas', 'Árbol de formas redondeadas apiladas.', ['Crema', 'Verde salvia'], [1, 2]),
  P('015', 'deco', 'Árbol de capas', 'Cono de capas finas, se nota cada capa impresa.', ['Verde oliva', 'Rojo'], [1, 2, 3]),
];

// qué foto muestra mejor cada color (número de foto del producto)
const CPH: Record<string, Record<string, number>> = { '001': { Crema: 1, Blanco: 3, Verde: 4 }, '002': { Beige: 2, Crema: 3 }, '003': { Rojo: 3, 'Verde agua': 4 }, '004': { 'Verde salvia': 2, Beige: 1, 'Bordó': 2, Blanco: 3 }, '005': { Beige: 1, 'Verde oliva': 2 },
  '006': { Crema: 2, Gris: 1, Verde: 3, 'Marrón': 4, Negro: 4 }, '007': { 'Bordó': 3, Beige: 2, 'Verde salvia': 1 }, '008': { 'Bordó': 1, Blanco: 2, Gris: 1, 'Verde salvia': 3 }, '009': { 'Verde salvia': 2, Crema: 1, Gris: 2, Negro: 3 },
  '012': { 'Verde salvia': 1, 'Marrón': 2 }, '013': { Blanco: 4, Beige: 3, 'Marrón': 1 }, '014': { Crema: 1, 'Verde salvia': 2 }, '015': { 'Verde oliva': 2, Rojo: 3 }, '016': { 'Verde salvia': 1, Beige: 3, 'Bordó': 4 },
  '017': { Rojo: 4, Blanco: 3 }, '018': { Rojo: 1, 'Verde agua': 3, Beige: 2 }, '019': { Verde: 2, Beige: 3, Blanco: 4 }, '021': { 'Verde salvia': 4, Beige: 2, 'Bordó': 3 }, '023': { Rojo: 3, Negro: 3, Crema: 2, 'Verde agua': 4 } };

export const photoOf = (p: Product, c: string) => (CPH[p.id]?.[c] ? `${p.id}-${CPH[p.id][c]}` : null);
export const catName = (id: string) => CATS.find(c => c.id === id)?.name ?? 'Todo';
const fmt = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
export const priceOf = (p: Product) => (p.price ? fmt.format(p.price) : 'Consultar precio');
