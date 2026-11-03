'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { introV, prefersReduced, treeLoaded } from '@/lib/scene';

gsap.registerPlugin(SplitText);

const CHROME = ['.hdr', '.clima', '.fab'];

/* Intro: unas palabras de Navidad que se deshacen en nieve; después se abre la página */
export default function Intro() {
  const [done, setDone] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const txt = useRef<HTMLParagraphElement>(null);
  const skip = useRef<() => void>(() => {});

  useEffect(() => {
    const html = document.documentElement;
    if (prefersReduced()) { introV.k = 0; const r = requestAnimationFrame(() => setDone(true)); return () => cancelAnimationFrame(r); }
    history.scrollRestoration = 'manual'; scrollTo(0, 0);
    html.classList.add('lock');
    gsap.set(['.hero > *', ...CHROME], { autoAlpha: 0 });
    const chars = SplitText.create(txt.current!, { type: 'words,chars' }).chars as HTMLElement[];
    const finish = () => { html.classList.remove('lock'); setDone(true); };

    const it = gsap.timeline({ delay: .3 });
    it.from(chars, { opacity: 0, y: 12, filter: 'blur(10px)', duration: .9, ease: 'power2.out', stagger: .03 })
      .addPause('+=1.3', () => { Promise.race([treeLoaded, new Promise(r => setTimeout(r, 4000))]).then(() => it.resume()); })
      .add(() => dust(txt.current!, chars))
      .to(root.current, { backgroundColor: 'rgba(1,20,27,0)', duration: 1.2, ease: 'power1.inOut' }, '<.5')
      .to(introV, { k: 0, duration: 2.6, ease: 'power2.inOut' }, '<.4')
      .add(finish, '-=1')
      .fromTo('.hero > *', { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: .7, stagger: .08, ease: 'power3.out' }, '<')
      .fromTo(CHROME, { autoAlpha: 0, y: -10 }, { autoAlpha: 1, y: 0, duration: .6, stagger: .08, ease: 'power2.out' }, '<');

    // saltar: corta la intro y deja la página como queda al final
    skip.current = () => {
      it.kill(); document.querySelectorAll('.dust').forEach(n => n.remove()); finish();
      gsap.to(introV, { k: 0, duration: 1.4, ease: 'power2.inOut' });
      gsap.to(['.hero > *', ...CHROME], { autoAlpha: 1, y: 0, duration: .5, stagger: .05 });
    };
    return () => { it.kill(); html.classList.remove('lock'); };
  }, []);

  if (done) return null;
  return (
    <div className="intro" id="intro" ref={root}>
      <p ref={txt}>Que esta Navidad te encuentre cerca de los que <em>más querés</em></p>
      <button className="skip" onClick={() => skip.current()}>Saltar</button>
    </div>
  );
}

type Dot = { x: number; y: number; r: number; g: number; b: number; d: number; vx: number; vy: number; s: number; ph: number };

// dibuja cada letra en un canvas, la muestrea en partículas y las deja volar y caer como nieve
function dust(el: HTMLElement, chars: HTMLElement[]) {
  const dpr = Math.min(devicePixelRatio, 2), W0 = innerWidth, H0 = innerHeight;
  const cv = document.createElement('canvas'); cv.className = 'dust'; cv.width = W0 * dpr; cv.height = H0 * dpr; document.body.appendChild(cv);
  const x = cv.getContext('2d', { willReadFrequently: true })!; x.scale(dpr, dpr);
  const box = el.getBoundingClientRect(), list = chars.length ? chars : [el];
  list.forEach(ch => {
    const s = getComputedStyle(ch), r = ch.getBoundingClientRect();
    x.font = `${s.fontWeight} ${s.fontSize} ${s.fontFamily}`;
    if ('fontStretch' in x) (x as CanvasRenderingContext2D & { fontStretch: string }).fontStretch = 'condensed';
    x.fillStyle = s.color; x.textBaseline = 'middle'; x.fillText(ch.textContent || '', r.left, r.top + r.height / 2);
  });
  const sx = Math.floor(Math.max(0, box.left - 20) * dpr), sy = Math.floor(Math.max(0, box.top - 20) * dpr);
  const sw = Math.floor(Math.min(W0 * dpr - sx, (box.width + 40) * dpr)), sh = Math.floor(Math.min(H0 * dpr - sy, (box.height + 40) * dpr));
  const data = x.getImageData(sx, sy, sw, sh).data, step = Math.max(2, Math.round(2.5 * dpr));
  let ps: Dot[] = [];
  for (let py = 0; py < sh; py += step) for (let px = 0; px < sw; px += step) {
    const i = (py * sw + px) * 4;
    if (data[i + 3] > 120) ps.push({ x: (sx + px) / dpr, y: (sy + py) / dpr, r: data[i], g: data[i + 1], b: data[i + 2], d: 0, vx: 0, vy: 0, s: 0, ph: 0 });
  }
  if (ps.length > 5000) ps = ps.filter(() => Math.random() < 5000 / ps.length);
  const sweep = (q: number) => (q - box.left) / box.width * .9; // se deshace de izquierda a derecha
  ps.forEach(q => { q.d = sweep(q.x) + Math.random() * .3; q.vx = 30 + Math.random() * 80; q.vy = -(25 + Math.random() * 70); q.s = .9 + Math.random() * 1.6; q.ph = Math.random() * 6.28; });
  list.forEach(ch => { const r = ch.getBoundingClientRect(); gsap.to(ch, { opacity: 0, duration: .25, delay: sweep(r.left + r.width / 2) + .08 }); });
  let t = 0; const life = 2.4;
  const tick = (_time: number, dms: number) => {
    if (!cv.isConnected) return gsap.ticker.remove(tick);
    const dt = Math.min(.05, dms / 1000); t += dt; x.clearRect(0, 0, W0, H0); let alive = 0;
    for (const q of ps) {
      const u = t - q.d; if (u > life) continue; alive++; if (u < 0) continue;
      q.vy += 30 * dt; q.vx *= .985; // primero vuela, después cae
      q.x += (q.vx + Math.sin(u * 3 + q.ph) * 20) * dt; q.y += q.vy * dt;
      const w = Math.min(1, u / .6), a = Math.max(0, 1 - u / life), s = q.s * (1 + w * .7);
      x.fillStyle = `rgba(${q.r + (255 - q.r) * w | 0},${q.g + (255 - q.g) * w | 0},${q.b + (255 - q.b) * w | 0},${a})`; // del color de la letra al blanco de la nieve
      x.fillRect(q.x - s / 2, q.y - s / 2, s, s);
    }
    if (!alive) { gsap.ticker.remove(tick); cv.remove(); }
  };
  gsap.ticker.add(tick);
}
