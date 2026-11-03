// Número de WhatsApp en formato internacional sin "+" (ej. 5493472XXXXXX). Se configura en Vercel.
const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '';

export const msg = (name: string, color: string) =>
  `Hola! Estoy interesado en el producto ${name} de MJ 3D (${color}). ¿Me pueden brindar más información?`;
export const GENERIC = 'Hola! Quiero consultar por el catálogo navideño de MJ 3D.';
export const wa = (text: string) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
