'use client';

import { useEffect, useRef, useState } from 'react';
import { COLORS, photoOf, priceOf, type Product } from '@/lib/catalog';
import { msg, wa } from '@/lib/contact';
import { track } from '@/lib/track';
import { Next, Prev, WaIcon, XIcon } from './Icons';

type Props = {
  p: Product | null; open: boolean; color: string;
  onColor: (c: string) => void; onClose: () => void;
};

/* Ficha del producto: galería de fotos, color y consulta. En celular sube desde abajo; en compu, dos columnas */
export default function Sheet({ p, open, color, onColor, onClose }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const gal = useRef<HTMLDivElement>(null);
  const [at, setAt] = useState(0);
  const reduce = useRef(false);

  useEffect(() => { reduce.current = matchMedia('(prefers-reduced-motion: reduce)').matches; }, []);

  // abrir: bloquea el scroll de la página y lleva el foco a la ficha; cerrar: lo devuelve a donde estaba
  useEffect(() => {
    if (!open) return;
    const back = document.activeElement as HTMLElement | null, html = document.documentElement;
    html.classList.add('lock');
    const t = setTimeout(() => root.current?.querySelector<HTMLElement>('[data-close]')?.focus(), 30);
    return () => { clearTimeout(t); html.classList.remove('lock'); back?.focus(); };
  }, [open]);

  // al elegir un color, la galería se desliza a la foto de ese color (al abrir, sin animación)
  const first = useRef(true);
  useEffect(() => { first.current = true; }, [p?.id, open]);
  useEffect(() => {
    if (!p || !open || !gal.current) return;
    const f = photoOf(p, color), i = f ? p.photos.indexOf(f) : -1, g = gal.current;
    const instant = first.current; first.current = false;
    requestAnimationFrame(() => g.scrollTo({ left: Math.max(0, i) * g.clientWidth, behavior: instant || reduce.current ? 'auto' : 'smooth' }));
  }, [p, open, color]);

  const go = (d: number) => { const g = gal.current!; g.scrollTo({ left: (Math.round(g.scrollLeft / g.clientWidth) + d) * g.clientWidth, behavior: reduce.current ? 'auto' : 'smooth' }); };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key !== 'Tab') return;
    const f = [...root.current!.querySelectorAll<HTMLElement>('button,a[href],[tabindex="0"]')].filter(n => n.offsetParent);
    if (!f.length) return; const a = f[0], z = f[f.length - 1];
    if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
  };

  // deslizar la manija hacia abajo cierra la hoja
  const y0 = useRef<number | null>(null);
  const grip = {
    onPointerDown: (e: React.PointerEvent) => { y0.current = e.clientY; e.currentTarget.setPointerCapture(e.pointerId); panel.current!.style.transition = 'none'; },
    onPointerMove: (e: React.PointerEvent) => { if (y0.current !== null) panel.current!.style.transform = `translateY(${Math.max(0, e.clientY - y0.current)}px)`; },
    onPointerUp: (e: React.PointerEvent) => end(e), onPointerCancel: (e: React.PointerEvent) => end(e),
  };
  const end = (e: React.PointerEvent) => { if (y0.current === null) return; const d = e.clientY - y0.current; y0.current = null; panel.current!.style.transition = ''; panel.current!.style.transform = ''; if (d > 90) onClose(); };

  return (
    <div className={`sheet${open ? ' open' : ''}`} ref={root} role="dialog" aria-modal="true" aria-labelledby="sName" aria-hidden={!open}
      onClick={e => e.target === root.current && onClose()} onKeyDown={onKey}>
      <div className="panel" ref={panel}>
        <div className="grip" aria-hidden="true" {...grip} />
        <button className="x" data-close aria-label="Cerrar" onClick={onClose}><XIcon /></button>
        {p && (
          <>
            <div className="gal-w">
              <div className="gal" ref={gal} tabIndex={0} role="group" aria-label="Fotos del producto"
                onScroll={e => setAt(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
                onKeyDown={e => { const d = ({ ArrowRight: 1, ArrowLeft: -1 } as Record<string, number>)[e.key]; if (d) { e.preventDefault(); go(d); } }}>
                {p.photos.map((f, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={f} src={`/img/${f}.webp`} alt={`${p.name}, foto ${i + 1} de ${p.photos.length}`} loading={i ? 'lazy' : 'eager'} decoding="async"
                    onLoad={e => { const im = e.currentTarget; im.decode().catch(() => {}).then(() => im.classList.add('ld')); }} />
                ))}
              </div>
              {p.photos.length > 1 && (
                <>
                  <div className="pips" aria-hidden="true">{p.photos.map((f, i) => <i key={f} className={i === at ? 'on' : ''} />)}</div>
                  <button className="gnav prev" aria-label="Foto anterior" onClick={() => go(-1)}><Prev /></button>
                  <button className="gnav next" aria-label="Foto siguiente" onClick={() => go(1)}><Next /></button>
                </>
              )}
            </div>
            <div className="sh">
              <h2 id="sName">{p.name}</h2>
              <div className="meta"><span className={`price${p.price ? '' : ' ask'}`}>{priceOf(p)}</span></div>
              <p>{p.desc}</p>
              <fieldset className="pick">
                <legend>{p.colors.length > 1 ? 'Elegí el color' : 'Color'}</legend>
                <div className="opts">
                  {p.colors.map(c => (
                    <button key={c} className="opt" aria-pressed={c === color} onClick={() => onColor(c)}><i style={{ background: COLORS[c] }} />{c}</button>
                  ))}
                </div>
              </fieldset>
              <a className="btn" href={wa(msg(p.name, color))} target="_blank" rel="noopener"
                onClick={() => track('contact_whatsapp', { place: 'ficha', item_id: p.id, item_name: p.name, color })}>
                <WaIcon />Consultar por WhatsApp
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
