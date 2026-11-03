'use client';

import { useState } from 'react';
import { gsap } from 'gsap';
import { STAGES, TEMP_DEFAULT, prefersReduced, stageAt, weather } from '@/lib/scene';
import { track } from '@/lib/track';

const deg = (t: number) => `${t < 0 ? '−' : ''}${Math.abs(t)}°`;

/* Clima: selectores de temperatura sobre el botón de WhatsApp. Cada uno cambia cuánto nieva sobre el árbol */
export default function Clima() {
  const [i, setI] = useState(() => stageAt(TEMP_DEFAULT));
  const set = (n: number) => {
    setI(n); const s = STAGES[n];
    gsap.to(weather, { amount: s.amount, speed: s.speed, wind: s.wind, duration: prefersReduced() ? 0 : 1.6, ease: 'sine.inOut', overwrite: true });
    track('select_weather', { weather: s.name, temp: String(s.temp) });
  };
  return (
    <div className="clima" role="group" aria-label="Temperatura de la nieve">
      {STAGES.map((s, n) => (
        <button key={s.name} aria-pressed={n === i} aria-label={`${deg(s.temp)}C, ${s.name}`} title={s.name} onClick={() => set(n)}>{deg(s.temp)}</button>
      ))}
    </div>
  );
}
