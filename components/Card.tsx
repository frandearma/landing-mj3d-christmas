'use client';

import { useEffect, useRef, useState } from 'react';
import { COLORS, photoOf, priceOf, type Product } from '@/lib/catalog';
import LQ from '@/lib/lq.json';
import { prefersReduced } from '@/lib/scene';

type Props = {
  p: Product; color: string; hidden: boolean; hit: boolean;
  onOpen: (id: string, from: HTMLElement) => void;
  onColor: (id: string, c: string) => void;
};

const coverOf = (p: Product, c: string) => { const f = photoOf(p, c); return `/img/${f ? f + '-c' : p.id + '-c'}.webp`; };

export default function Card({ p, color, hidden, hit, onOpen, onColor }: Props) {
  // src: foto visible; next: la del color nuevo, que entra encima con un fundido y recién ahí la reemplaza
  const [src, setSrc] = useState(() => coverOf(p, color));
  const [next, setNext] = useState<string | null>(null);
  const [nextOn, setNextOn] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // cambió el color: se prepara la foto nueva (con movimiento reducido, se cambia directo)
  const [shownColor, setShownColor] = useState(color);
  if (color !== shownColor) {
    setShownColor(color);
    const want = coverOf(p, color);
    if (prefersReduced()) { setSrc(want); setNext(null); } else if (want !== src || next) { setNextOn(false); setNext(want); }
  }

  // la foto aparece recién cuando terminó de cargar y decodificar: entra entera, de borrosa a nítida
  useEffect(() => { const im = imgRef.current; if (im?.complete && im.naturalWidth) im.decode().catch(() => {}).then(() => setLoaded(true)); }, []);

  return (
    <article className={`card${hit ? ' hit' : ''}`} data-id={p.id} data-cat={p.cat} hidden={hidden}>
      <button className="open-p" aria-label={`Ver ${p.name}`} onClick={e => onOpen(p.id, e.currentTarget)}>
        <div className="ph" style={{ '--lq': `url(${(LQ as Record<string, string>)[p.id]})` } as React.CSSProperties}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={imgRef} src={src} alt="" width={720} height={540} loading="lazy" decoding="async" className={loaded ? 'ld' : ''}
            onLoad={e => e.currentTarget.decode().catch(() => {}).then(() => { setLoaded(true); if (next && src === next) { setNext(null); setNextOn(false); } })} />
          {next && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={next} alt="" width={720} height={540} decoding="async" className={`xf${nextOn ? ' on' : ''}`}
              onLoad={e => e.currentTarget.decode().catch(() => {}).then(() => requestAnimationFrame(() => setNextOn(true)))}
              onTransitionEnd={e => { if (e.propertyName === 'opacity' && nextOn) setSrc(next); }} />
          )}
        </div>
        <div className="info"><h3>{p.name}</h3><span className={`price${p.price ? '' : ' ask'}`}>{priceOf(p)}</span></div>
      </button>
      <div className={`sw${p.colors.length > 3 ? ' many' : ''}`} role="group" aria-label={`Colores de ${p.name}`}>
        {p.colors.map(c => (
          <button key={c} className="dot" aria-pressed={c === color} aria-label={c} onClick={() => onColor(p.id, c)}>
            <i style={{ background: COLORS[c] }} />
          </button>
        ))}
        <span className="cn">{color}</span>
      </div>
    </article>
  );
}
