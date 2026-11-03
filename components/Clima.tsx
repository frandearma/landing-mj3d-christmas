'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { STAGES, TEMP_DEFAULT, prefersReduced, stageAt, weather } from '@/lib/scene';
import { track } from '@/lib/track';

const deg = (t: number) => `${t < 0 ? '−' : ''}${Math.abs(t)}°`;

/* Clima: sobre el botón de WhatsApp se ve solo la temperatura elegida; al tocarla se abren las demás */
export default function Clima() {
  const [i, setI] = useState(() => stageAt(TEMP_DEFAULT));
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);

  // se cierra al tocar afuera o con Escape
  useEffect(() => {
    if (!open) return;
    const out = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); toggle.current?.focus(); } };
    document.addEventListener('pointerdown', out); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('pointerdown', out); document.removeEventListener('keydown', esc); };
  }, [open]);

  const set = (n: number) => {
    setI(n); setOpen(false); toggle.current?.focus(); const s = STAGES[n];
    gsap.to(weather, { amount: s.amount, speed: s.speed, wind: s.wind, duration: prefersReduced() ? 0 : 1.6, ease: 'sine.inOut', overwrite: true });
    track('select_weather', { weather: s.name, temp: String(s.temp) });
  };
  const rest = STAGES.map((s, n) => ({ s, n })).filter(o => o.n !== i);

  return (
    <div className={`clima${open ? ' open' : ''}`} ref={root}>
      <div className="opts" id="climaOpts" role="group" aria-label="Elegí la temperatura" inert={!open}>
        {rest.map(({ s, n }, k) => (
          <button key={s.name} style={{ '--i': rest.length - 1 - k } as React.CSSProperties} aria-label={`${deg(s.temp)}C, ${s.name}`} title={s.name} onClick={() => set(n)}>{deg(s.temp)}</button>
        ))}
      </div>
      <button ref={toggle} className="cur" aria-expanded={open} aria-controls="climaOpts" aria-label={`Temperatura: ${deg(STAGES[i].temp)}C, ${STAGES[i].name}. Cambiar`} title={STAGES[i].name}
        onClick={() => setOpen(o => !o)}>{deg(STAGES[i].temp)}</button>
    </div>
  );
}
