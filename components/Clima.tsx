'use client';

import { useState } from 'react';
import { gsap } from 'gsap';
import { DEFAULT_STAGE, STAGES, prefersReduced, weather } from '@/lib/scene';
import { track } from '@/lib/track';

/* Clima: un detalle del inicio. Cada etapa cambia la nieve que cae sobre el árbol */
export default function Clima() {
  const [i, setI] = useState(DEFAULT_STAGE);
  const set = (n: number) => {
    setI(n); const s = STAGES[n];
    gsap.to(weather, { amount: s.amount, speed: s.speed, wind: s.wind, duration: prefersReduced() ? 0 : 2.4, ease: 'sine.inOut', overwrite: true });
    track('select_weather', { weather: s.name });
  };
  return (
    <div className="clima" role="group" aria-label="Clima">
      <span className="now" aria-live="polite"><b>{STAGES[i].temp}</b>{STAGES[i].name}</span>
      <span className="seg">
        {STAGES.map((s, n) => (
          <button key={s.name} aria-pressed={n === i} aria-label={`${s.name}, ${s.temp}`} title={s.name} onClick={() => set(n)}><i /></button>
        ))}
      </span>
    </div>
  );
}
