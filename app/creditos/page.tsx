import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Créditos | MJ 3D' };

export default function Creditos() {
  return (
    <main className="credits">
      <h1>Créditos</h1>
      <p>
        El árbol 3D del fondo está basado en{' '}
        <a href="https://sketchfab.com/3d-models/xmas-tree-97a40736d2e149e5b0af1e856abb00d3" rel="noopener">&quot;XMas Tree&quot;</a> de{' '}
        <a href="https://sketchfab.com/anybody" rel="noopener">anybody</a>, publicado bajo licencia{' '}
        <a href="https://creativecommons.org/licenses/by/4.0/" rel="noopener">CC BY 4.0</a>. Se cambiaron sus materiales y la iluminación.
      </p>
      {process.env.NEXT_PUBLIC_GA_ID && <p>Usamos Google Analytics para medir visitas de forma anónima.</p>}
      <p><Link href="/">Volver al catálogo</Link></p>
    </main>
  );
}
