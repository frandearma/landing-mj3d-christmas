'use client';

import { useEffect, useRef } from 'react';
import * as T from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment';
import { introV, markTreeReady, prefersReduced, weather } from '@/lib/scene';

const hasGL = () => {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl') || c.getContext('experimental-webgl')); } catch { return false; }
};

/* Árbol de fondo: arranca en la punta y baja girando con el scroll; una capa oscura lo atenúa a medida que bajás */
export default function TreeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dimRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dim = dimRef.current!;
    const onScroll = () => { const k = Math.min(1, scrollY / (innerHeight * .7)); dim.style.setProperty('--dim', (.08 + k * .7).toFixed(3)); };
    addEventListener('scroll', onScroll, { passive: true }); onScroll();

    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const slow = !!conn && (conn.saveData || /2g/.test(conn.effectiveType || ''));
    if (!hasGL() || slow) { markTreeReady(); return () => removeEventListener('scroll', onScroll); }

    const reduce = prefersReduced();
    const canvas = canvasRef.current!, mobile = innerWidth < 760, H = 15;
    const rOuter = (y: number) => 4.7 * Math.max(0, 1 - y / (H - .3)) + .25;
    const r = new T.WebGLRenderer({ canvas, antialias: !mobile }); r.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.25 : 1.5));
    r.toneMapping = T.ACESFilmicToneMapping; r.setClearColor(0x01141b);
    const scene = new T.Scene(); scene.fog = new T.Fog(0x01141b, 20, 60);
    const cam = new T.PerspectiveCamera(mobile ? 50 : 36, 1, .1, 140);
    scene.add(new T.HemisphereLight(0xcfe6f2, 0x061a14, .5));
    const moon = new T.DirectionalLight(0xdbeeff, .8); moon.position.set(-8, 18, 10); scene.add(moon);
    const warm = new T.PointLight(0xffa860, 1.4, 14, 1.6); scene.add(warm);
    const pmrem = new T.PMREMGenerator(r);
    const env = pmrem.fromScene(new RoomEnvironment(), .04).texture;
    const pivot = new T.Group(); scene.add(pivot);
    const bulbs: T.MeshStandardMaterial[] = [];

    // halo de la estrella
    const hc = document.createElement('canvas'); hc.width = hc.height = 128;
    const hx = hc.getContext('2d')!, hg = hx.createRadialGradient(64, 64, 0, 64, 64, 64);
    hg.addColorStop(0, 'rgba(255,220,150,.9)'); hg.addColorStop(.25, 'rgba(255,190,110,.35)'); hg.addColorStop(1, 'rgba(255,190,110,0)'); hx.fillStyle = hg; hx.fillRect(0, 0, 128, 128);
    const halo = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(hc), transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: .85 }));
    halo.scale.setScalar(4.5); halo.visible = false; scene.add(halo);

    let alive = true;
    new GLTFLoader().load('/tree.json', g => {
      if (!alive) return;
      const o = g.scene, box = new T.Box3().setFromObject(o), k = (H - .2) / box.max.y; o.scale.setScalar(k);
      o.traverse(n => {
        const m = n as T.Mesh; if (!m.isMesh) return; m.frustumCulled = false;
        const old = m.material as T.MeshStandardMaterial;
        if (old.name === 'material_0') m.material = new T.MeshStandardMaterial({ map: old.map, emissive: 0x0b2a1c, roughness: .7, alphaTest: .5, side: T.DoubleSide });
        else if (old.name === 'branch') m.material = new T.MeshStandardMaterial({ color: 0x3a2618, roughness: .9 });
        else if (old.name === 'needlaes_eevee') { const b = new T.MeshStandardMaterial({ color: 0xffe2a8, emissive: 0xffb04a, emissiveIntensity: 2, roughness: .4 }); m.material = b; bulbs.push(b); }
        else m.material = new T.MeshStandardMaterial({ color: old.color, metalness: old.metalness, roughness: Math.max(.12, old.roughness), envMap: env, envMapIntensity: .9 });
        old.dispose();
      });
      pivot.add(o); halo.position.y = 2.955 * k; halo.visible = true; canvas.classList.add('on'); markTreeReady();
    }, undefined, e => { console.warn('árbol', e); markTreeReady(); });

    // nieve liviana
    const N = mobile ? 900 : 2000, sp = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) sp.set([(Math.random() - .5) * 40, Math.random() * 26, (Math.random() - .5) * 30], i * 3);
    const sg = new T.BufferGeometry(); sg.setAttribute('position', new T.BufferAttribute(sp, 3));
    scene.add(new T.Points(sg, new T.PointsMaterial({ color: 0xffffff, size: mobile ? .09 : .07, transparent: true, opacity: .75, depthWrite: false })));

    /* paradas de cámara por sección: cada una mira una zona distinta del árbol, desde otro lado */
    // y: altura de la cámara, d: distancia al eje, rot: giro del árbol, ox: corrimiento lateral (fracción de pantalla), ly: hacia dónde mira
    type Key = { y: number; d: number; rot: number; ox: number; ly: number };
    const KEYS: Key[] = [
      { y: H - .7, d: rOuter(H - .7) + 10, rot: 0, ox: .22, ly: -1.2 },   // inicio: la punta con la estrella
      { y: 10.6, d: rOuter(10.6) + 6, rot: 1.1, ox: 0, ly: -.6 },        // catálogo: ramas altas con adornos
      { y: 7.4, d: rOuter(7.4) + 4.4, rot: 2.5, ox: -.2, ly: -.3 },      // mitad: de cerca, entre bolas y guirnaldas
      { y: 4.6, d: rOuter(4.6) + 7.5, rot: 1.9, ox: .2, ly: -.5 },       // final del catálogo: vuelve un poco, más abierto
      { y: 2.1, d: rOuter(2.1) + 6.5, rot: 3.3, ox: -.18, ly: -1.1 },    // personalizados: al pie, con los regalos
      { y: 8.2, d: 31, rot: 4.2, ox: .2, ly: -1 },                       // cierre: el árbol completo
    ];
    const sel = ['#catalogo', '#grid@.45', '#grid@1', '#personalizados'];
    let A: number[] = [];
    // posición de scroll donde cae cada parada; se recalcula si cambia el alto de la página
    const anchors = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - innerHeight), out = [0];
      sel.forEach(q => {
        const [id, f] = q.split('@'), el = document.querySelector(id); if (!el) return;
        const b = el.getBoundingClientRect(), top = b.top + scrollY;
        const v = f ? top + b.height * +f - innerHeight * (f === '1' ? .9 : .5) : top - innerHeight * .35;
        out.push(Math.min(max - 1, Math.max(out[out.length - 1] + 1, v)));
      });
      out.push(Math.max(out[out.length - 1] + 1, max)); A = out;
    };
    const ro = new ResizeObserver(anchors); ro.observe(document.querySelector('main')!);
    const size = () => { r.setSize(innerWidth, innerHeight, false); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); anchors(); };
    size(); addEventListener('resize', size);

    const cur: Key = { ...KEYS[0] }, tgt: Key = { ...KEYS[0] }, ss = (u: number) => u * u * (3 - 2 * u);
    const fields = Object.keys(cur) as (keyof Key)[];
    let t = 0, on = true, raf = 0;
    const P = new T.Vector3(), L = new T.Vector3(), Pw = new T.Vector3(), Lw = new T.Vector3();
    const loop = () => {
      if (!on || !alive) return; raf = requestAnimationFrame(loop); t += reduce ? 0 : .016;
      let i = 0; while (i < A.length - 2 && scrollY > A[i + 1]) i++;
      const u = ss(Math.min(1, Math.max(0, (scrollY - A[i]) / (A[i + 1] - A[i])))), k0 = KEYS[i], k1 = KEYS[i + 1];
      for (const f of fields) tgt[f] = k0[f] + (k1[f] - k0[f]) * u;
      // la cámara persigue la parada con inercia: el movimiento queda suave aunque el scroll sea brusco
      const damp = reduce ? 1 : .035; for (const f of fields) cur[f] += (tgt[f] - cur[f]) * damp;
      const w = innerWidth, h = innerHeight, ox = mobile ? 0 : cur.ox;
      cam.setViewOffset(w, h, -w * ox, mobile ? h * .16 : 0, w, h); cam.updateProjectionMatrix();
      const y = cur.y, d = cur.d + (mobile ? 3 : 0), sway = Math.sin(t * .25) * .06;
      P.set(Math.sin(sway) * d, y + .6, Math.cos(sway) * d); L.set(0, y + cur.ly, 0);
      Pw.set(0, H * .46, mobile ? 44 : 34); Lw.set(0, H * .46, 0);
      const k = introV.k, e = k * k * (3 - 2 * k);
      cam.position.lerpVectors(P, Pw, e); cam.lookAt(L.lerp(Lw, e));
      pivot.rotation.y = cur.rot + e * .6;
      warm.position.set(3, y, d * .6);
      bulbs.forEach((m, j) => (m.emissiveIntensity = 1.6 + Math.sin(t * 2 + j) * .6));
      const sa = sg.attributes.position as T.BufferAttribute;
      // el clima decide cuántos copos se dibujan, qué tan rápido caen y cuánto los corre el viento
      sg.setDrawRange(0, Math.round(N * weather.amount));
      if (!reduce) {
        const fall = .02 * weather.speed, drift = .02 * weather.wind;
        for (let j = 0; j < N; j++) {
          let yy = sa.getY(j) - fall * (.7 + (j % 7) * .1), xx = sa.getX(j) + drift + Math.sin(t + j) * .004;
          if (yy < 0) yy = 26; if (xx > 20) xx = -20;
          sa.setXY(j, xx, yy);
        }
        sa.needsUpdate = true;
      }
      r.render(scene, cam);
    };
    const vis = () => { on = !document.hidden; if (on) { cancelAnimationFrame(raf); loop(); } };
    document.addEventListener('visibilitychange', vis);
    loop();

    return () => {
      alive = false; cancelAnimationFrame(raf); ro.disconnect();
      removeEventListener('scroll', onScroll); removeEventListener('resize', size); document.removeEventListener('visibilitychange', vis);
      pmrem.dispose(); r.dispose();
    };
  }, []);

  return (
    <>
      <canvas id="tree" ref={canvasRef} aria-hidden="true" />
      <div className="dim" ref={dimRef} aria-hidden="true" />
    </>
  );
}
