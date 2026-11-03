/* MJ 3D catálogo: datos, renders de producto, visor 3D, WhatsApp y diálogos. Compartido por los tres bocetos. */
(() => {
const T = window.THREE;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fmt = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

/* ===== Datos (de ejemplo: los reemplaza la lista real del cliente) ===== */
const WA_NUMBER = ''; // NEXT_PUBLIC_WHATSAPP_NUMBER
const COLORS = { Rojo: 0xb83b32, Verde: 0x2e7a5c, Dorado: 0xd6b875, Blanco: 0xf4f0e8, Crema: 0xe6dccb };
const CATS = [
  { id: 'colgar', name: 'Para colgar' },
  { id: 'mesa', name: 'Para la mesa' },
  { id: 'regalar', name: 'Para regalar' },
  { id: 'personalizados', name: 'Personalizados' },
];
const PRODUCTS = [
  { id: 'estrella', cat: 'colgar', name: 'Adorno Estrella', price: 2500, stock: true, colors: ['Rojo', 'Dorado', 'Blanco'], desc: 'Facetada y liviana, con lazo para colgar.', size: '8 cm' },
  { id: 'copo', cat: 'colgar', name: 'Copo de Nieve', price: 2200, stock: true, colors: ['Blanco', 'Dorado', 'Rojo'], desc: 'Seis brazos finos impresos en una sola pieza.', size: '9 cm' },
  { id: 'campana', cat: 'colgar', name: 'Campana', price: 2800, stock: true, colors: ['Dorado', 'Rojo', 'Verde'], desc: 'Con badajo dorado y lazo para colgar.', size: '7 cm' },
  { id: 'esfera', cat: 'colgar', name: 'Esfera Facetada', price: 3000, stock: true, colors: ['Rojo', 'Verde', 'Dorado'], desc: 'Caras planas que juegan con las luces del árbol.', size: '8 cm' },
  { id: 'twist', cat: 'mesa', name: 'Árbol Twist', price: 7200, stock: true, colors: ['Verde', 'Blanco', 'Dorado'], desc: 'Por capas y con giro. Para la mesa o la biblioteca.', size: '15 cm' },
  { id: 'portavela', cat: 'mesa', name: 'Portavela Anillo', price: 6500, stock: true, colors: ['Crema', 'Verde', 'Rojo'], desc: 'Para velas de té, con bayas doradas. La vela no está incluida.', size: '12 cm de diámetro' },
  { id: 'pesebre', cat: 'mesa', name: 'Pesebre Minimal', price: 18900, stock: false, colors: ['Blanco', 'Crema', 'Dorado'], desc: 'Portal y figuras en piezas simples, para el pie del árbol.', size: '18 cm' },
  { id: 'llavero', cat: 'regalar', name: 'Llavero Navideño', price: 1500, stock: true, colors: ['Rojo', 'Verde', 'Dorado'], desc: 'Chiquito y resistente. Ideal para el amigo invisible.', size: '5 cm' },
  { id: 'cortantes', cat: 'regalar', name: 'Cortantes de Galletitas', price: 4800, stock: true, colors: ['Rojo', 'Verde', 'Blanco'], desc: 'Set de estrella y arbolito para cocinar en familia.', size: '7 cm cada uno' },
  { id: 'caja', cat: 'personalizados', name: 'Caja Regalo Inicial', price: 5400, stock: false, colors: ['Rojo', 'Dorado', 'Verde'], desc: 'Con la inicial que elijas en la tapa.', size: '10 cm' },
  { id: 'cartel', cat: 'personalizados', name: 'Cartel de Puerta', price: 9800, stock: false, colors: ['Verde', 'Rojo', 'Blanco'], desc: 'Con el apellido de la familia, para colgar en la puerta.', size: '30 cm' },
];
const hex = n => '#' + n.toString(16).padStart(6, '0');
const msg = (name, color) => `Hola! Estoy interesado en el producto ${name} de MJ 3D (${color}). ¿Me pueden brindar más información?`;
const wa = text => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
const GENERIC = 'Hola! Quiero consultar por el catálogo navideño de MJ 3D.';

/* ===== Geometría de cada producto ===== */
const gl = !!(T && (() => { try { const c = document.createElement('canvas'); return c.getContext('webgl') || c.getContext('experimental-webgl'); } catch (e) { return false; } })());
// líneas de capa por altura, como sale de la impresora
const printed = m => (m.onBeforeCompile = sh => {
  sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying float vWY;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvWY = (modelMatrix * vec4(transformed, 1.)).y;');
  sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vWY;').replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.rgb *= .84 + .16 * smoothstep(0., .45, abs(fract(vWY * 34.) - .5) * 2.);');
}, m);
const M = (color, o) => printed(new T.MeshStandardMaterial(Object.assign({ color, roughness: .5, envMapIntensity: .55 }, o)));
const goldM = () => M(0xd6b875, { metalness: .85, roughness: .25 });
const sShape = (R1, r1) => { const s = new T.Shape(); for (let i = 0; i <= 10; i++) { const a = Math.PI * i / 5 + Math.PI / 2, d = i % 2 ? r1 : R1; i ? s.lineTo(Math.cos(a) * d, Math.sin(a) * d) : s.moveTo(Math.cos(a) * d, Math.sin(a) * d); } return s; };
const loop = (y, g) => { const t = new T.Mesh(new T.TorusGeometry(.09, .025, 8, 24), g); t.position.y = y; return t; };
const lathe = (pts, seg = 48) => new T.LatheGeometry(pts.map(([x, y]) => new T.Vector2(x, y)), seg);

const BUILD = {
  estrella() { const m = M(0, { roughness: .35 }), g = new T.Group(), gd = goldM(); const geo = new T.ExtrudeGeometry(sShape(.7, .29), { depth: .18, bevelEnabled: true, bevelSize: .06, bevelThickness: .07, bevelSegments: 1 }); geo.center(); g.add(new T.Mesh(geo, m), loop(.82, gd)); return { g, main: [m] }; },
  copo() {
    const m = M(0, { roughness: .4 }), g = new T.Group(), box = (w, h, x, y, r) => { const b = new T.Mesh(new T.BoxGeometry(w, h, .1), m); b.position.set(x, y, 0); b.rotation.z = r || 0; return b; };
    for (let k = 0; k < 6; k++) { const arm = new T.Group(); arm.add(box(.09, .72, 0, .38)); [[.42, .2], [.6, .13]].forEach(([y, l]) => { arm.add(box(.06, l * 1.3, -l * .45, y + l * .45, Math.PI / 4)); arm.add(box(.06, l * 1.3, l * .45, y + l * .45, -Math.PI / 4)); }); arm.rotation.z = k * Math.PI / 3; g.add(arm); }
    const c = new T.Mesh(new T.CylinderGeometry(.17, .17, .12, 6), m); c.rotation.x = Math.PI / 2; g.add(c); g.add(loop(.86, goldM()));
    return { g, main: [m] };
  },
  campana() { const m = M(0, { roughness: .35, metalness: .2 }), gd = goldM(), g = new T.Group(); g.add(new T.Mesh(lathe([[.001, .58], [.13, .58], [.19, .48], [.25, .2], [.32, -.08], [.46, -.34], [.6, -.46], [.6, -.52], [.52, -.5], [.001, -.4]]), m)); const cl = new T.Mesh(new T.SphereGeometry(.12, 20, 14), gd); cl.position.y = -.52; g.add(cl, loop(.68, gd)); return { g, main: [m] }; },
  esfera() { const m = M(0, { roughness: .3, metalness: .15, flatShading: true }), gd = goldM(), g = new T.Group(); g.add(new T.Mesh(new T.IcosahedronGeometry(.68, 1), m)); const cap = new T.Mesh(new T.CylinderGeometry(.11, .13, .14, 16), gd); cap.position.y = .7; g.add(cap, loop(.83, gd)); return { g, main: [m] }; },
  twist() {
    const m = M(0, { flatShading: true }), g = new T.Group();
    const geo = lathe([[.001, -.75], [.66, -.75], [.26, -.28], [.54, -.28], [.2, .14], [.42, .14], [.13, .5], [.27, .5], [.001, .8]], 9), p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { const y = p.getY(i), a = y * 1.4, x = p.getX(i), z = p.getZ(i); p.setXYZ(i, x * Math.cos(a) - z * Math.sin(a), y, x * Math.sin(a) + z * Math.cos(a)); }
    geo.computeVertexNormals(); g.add(new T.Mesh(geo, m));
    const s = new T.Mesh(new T.ExtrudeGeometry(sShape(.16, .07), { depth: .05, bevelEnabled: false }), goldM()); s.position.set(0, .9, -.025); g.add(s);
    return { g, main: [m] };
  },
  portavela() {
    const m = M(0), g = new T.Group(), gd = goldM();
    g.add(new T.Mesh(lathe([[.36, 0], [.78, 0], [.84, .06], [.82, .2], [.68, .28], [.5, .24], [.4, .16], [.36, .1]], 64), m));
    const cand = new T.Mesh(new T.CylinderGeometry(.3, .3, .26, 32), new T.MeshStandardMaterial({ color: 0xfaf6ee, roughness: .7 })); cand.position.y = .15; g.add(cand);
    const fl = new T.Mesh(new T.ConeGeometry(.05, .16, 12), new T.MeshBasicMaterial({ color: 0xffc875 })); fl.position.y = .4; g.add(fl);
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, b = new T.Mesh(new T.IcosahedronGeometry(.07, 1), gd); b.position.set(Math.cos(a) * .62, .27 + (i % 2) * .03, Math.sin(a) * .62); g.add(b); }
    g.rotation.x = .5; return { g, main: [m] };
  },
  pesebre() {
    const m = M(0, { roughness: .5 }), g = new T.Group();
    const base = new T.Mesh(new T.CylinderGeometry(1.45, 1.5, .14, 40), m); base.position.y = .07; g.add(base);
    [-1.05, 1.05].forEach(x => { const c = new T.Mesh(new T.CylinderGeometry(.1, .12, 1.05, 14), m); c.position.set(x, .66, -.35); g.add(c); });
    const arch = new T.Mesh(new T.TorusGeometry(1.05, .1, 10, 32, Math.PI), m); arch.position.set(0, 1.18, -.35); g.add(arch);
    [[-.5, .6], [.5, .6], [0, .32]].forEach(([x, h], i) => { const z = i === 2 ? .25 : 0, b = new T.Mesh(new T.CylinderGeometry(.16, .22, h * 1.6, 16), m); b.position.set(x, h * .8 + .14, z); g.add(b); const hd = new T.Mesh(new T.SphereGeometry(.16, 20, 16), m); hd.position.set(x, h * 1.6 + .28, z); g.add(hd); });
    const st = new T.Mesh(new T.OctahedronGeometry(.18), goldM()); st.position.set(0, 2.55, -.35); g.add(st);
    return { g, main: [m] };
  },
  llavero() {
    const m = M(0, { roughness: .45 }), g = new T.Group(), s = new T.Shape(), w = .5, h = .62, r = .14;
    s.moveTo(-w + r, -h); s.lineTo(w - r, -h); s.quadraticCurveTo(w, -h, w, -h + r); s.lineTo(w, h - r); s.quadraticCurveTo(w, h, w - r, h); s.lineTo(-w + r, h); s.quadraticCurveTo(-w, h, -w, h - r); s.lineTo(-w, -h + r); s.quadraticCurveTo(-w, -h, -w + r, -h);
    const hole = new T.Path(); hole.absarc(0, h - .18, .08, 0, Math.PI * 2, true); s.holes.push(hole);
    const geo = new T.ExtrudeGeometry(s, { depth: .12, bevelEnabled: true, bevelSize: .03, bevelThickness: .03, bevelSegments: 2 }); geo.center(); g.add(new T.Mesh(geo, m));
    const tr = new T.Mesh(new T.ExtrudeGeometry(sShape(.22, .09), { depth: .04, bevelEnabled: false }), goldM()); tr.position.set(0, -.1, .08); g.add(tr);
    const ring = new T.Mesh(new T.TorusGeometry(.2, .03, 10, 32), goldM()); ring.position.y = .62; ring.rotation.y = Math.PI / 2; g.add(ring);
    return { g, main: [m] };
  },
  cortantes() {
    const m = M(0, { roughness: .4 }), g = new T.Group(), opt = { depth: .32, bevelEnabled: false, curveSegments: 1 };
    const star = sShape(.62, .27); star.holes.push(new T.Path(sShape(.53, .21).getPoints().reverse()));
    const a = new T.Mesh(new T.ExtrudeGeometry(star, opt), m); a.rotation.x = -Math.PI / 2; a.position.set(-.55, 0, 0); a.rotation.z = .3;
    const tp = [[0, .7], [.32, .3], [.18, .3], [.45, -.12], [.28, -.12], [.55, -.55], [.1, -.55], [.1, -.75], [-.1, -.75], [-.1, -.55], [-.55, -.55], [-.28, -.12], [-.45, -.12], [-.18, .3], [-.32, .3]];
    const outer = new T.Shape(tp.map(([x, y]) => new T.Vector2(x, y))), sc = .84;
    outer.holes.push(new T.Path(tp.map(([x, y]) => new T.Vector2(x * sc, y * sc + .02)).reverse()));
    const b = new T.Mesh(new T.ExtrudeGeometry(outer, opt), m); b.rotation.x = -Math.PI / 2; b.position.set(.6, 0, .1); b.rotation.z = -.2;
    g.add(a, b); g.rotation.x = .95; return { g, main: [m] };
  },
  caja() {
    const m = M(0, { roughness: .45 }), gd = goldM(), g = new T.Group();
    g.add(new T.Mesh(new T.BoxGeometry(.9, .8, .9), m)); const l = new T.Mesh(new T.BoxGeometry(.98, .16, .98), m); l.position.y = .46; g.add(l);
    [[.16, .98, .94], [.94, .98, .16]].forEach(([x, y, z]) => g.add(new T.Mesh(new T.BoxGeometry(x, y, z), gd)));
    const bow = new T.Mesh(new T.TorusKnotGeometry(.13, .04, 64, 8, 2, 3), gd); bow.position.y = .66; g.add(bow);
    return { g, main: [m] };
  },
  cartel() {
    const m = M(0, { roughness: .45 }), g = new T.Group(), s = new T.Shape(), w = .95, h = .42, r = .16;
    s.moveTo(-w + r, -h); s.lineTo(w - r, -h); s.quadraticCurveTo(w, -h, w, -h + r); s.lineTo(w, h - r); s.quadraticCurveTo(w, h, w - r, h); s.lineTo(-w + r, h); s.quadraticCurveTo(-w, h, -w, h - r); s.lineTo(-w, -h + r); s.quadraticCurveTo(-w, -h, -w + r, -h);
    const geo = new T.ExtrudeGeometry(s, { depth: .1, bevelEnabled: true, bevelSize: .025, bevelThickness: .025, bevelSegments: 2 }); geo.center(); g.add(new T.Mesh(geo, m));
    const c = document.createElement('canvas'); c.width = 1024; c.height = 448; const x = c.getContext('2d'), tex = new T.CanvasTexture(c); tex.anisotropy = 4;
    const face = new T.Mesh(new T.PlaneGeometry(1.9, .84), new T.MeshStandardMaterial({ map: tex, transparent: true, roughness: .5 })); face.position.z = .08; g.add(face);
    const st = new T.Mesh(new T.ExtrudeGeometry(sShape(.12, .05), { depth: .04, bevelEnabled: false }), goldM()); st.position.set(0, .26, .07); g.add(st);
    const cord = new T.Mesh(new T.TorusGeometry(.62, .015, 6, 40, Math.PI), goldM()); cord.position.y = .38; g.add(cord);
    const draw = name => { x.clearRect(0, 0, 1024, 448); x.fillStyle = name === 'Blanco' ? '#174B38' : '#F7F3EB'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = '800 176px "Bricolage Grotesque", "Arial Narrow", sans-serif'; x.fillText('Los García', 512, 250); tex.needsUpdate = true; };
    return { g, main: [m], onColor: draw };
  },
};

function make(id, color) {
  const o = BUILD[id](), box = new T.Box3().setFromObject(o.g), sph = box.getBoundingSphere(new T.Sphere());
  const wrap = new T.Group(), k = 1 / sph.radius; o.g.position.sub(sph.center); wrap.add(o.g); wrap.scale.setScalar(k);
  o.wrap = wrap; o.set = c => { o.main.forEach(m => m.color.setHex(COLORS[c])); o.onColor && o.onColor(c); };
  o.set(color); return o;
}

/* ===== Escenario de estudio para renders y visor ===== */
function stage(renderer) {
  renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = .82;
  const scene = new T.Scene();
  if (T.RoomEnvironment) scene.environment = new T.PMREMGenerator(renderer).fromScene(new T.RoomEnvironment(), .04).texture;
  scene.add(new T.HemisphereLight(0xfff4e6, 0x1a2a24, .3));
  const key = new T.DirectionalLight(0xfff1dc, 1.1); key.position.set(3, 5, 4); scene.add(key);
  const rim = new T.DirectionalLight(0xffc89a, .6); rim.position.set(-4, 2, -3); scene.add(rim);
  const cam = new T.PerspectiveCamera(28, 1, .1, 50); cam.position.set(0, .55, 4.4); cam.lookAt(0, 0, 0);
  return { scene, cam };
}

/* renders estáticos con fondo transparente, cacheados por producto, color y ángulo */
let TR = null; const cache = new Map();
function thumb(id, color, angle = 0, size = 480) {
  if (!gl) return '';
  const key = `${id}|${color}|${angle}|${size}`; if (cache.has(key)) return cache.get(key);
  if (!TR) { const r = new T.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); r.setPixelRatio(1); r.setClearColor(0, 0); TR = Object.assign({ r, objs: {} }, stage(r)); }
  TR.r.setSize(size, size, false);
  const o = TR.objs[id] || (TR.objs[id] = make(id, color)); o.set(color);
  TR.scene.add(o.wrap); o.wrap.rotation.set(0, -.45 + angle, 0); TR.r.render(TR.scene, TR.cam); TR.scene.remove(o.wrap);
  const url = TR.r.domElement.toDataURL('image/png'); cache.set(key, url); return url;
}

/* visor 3D interactivo: arrastrar para girar */
function viewer(canvas) {
  if (!gl) return null;
  const r = new T.WebGLRenderer({ canvas, antialias: true, alpha: true }); r.setPixelRatio(Math.min(devicePixelRatio, 2)); r.setClearColor(0, 0);
  const { scene, cam } = stage(r), objs = {};
  let cur = null, rot = -.45, vel = reduce ? 0 : .004, drag = false, lx = 0, raf = 0, on = false;
  const size = () => { const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return; r.setSize(w, h, false); cam.aspect = w / h; cam.fov = w < h ? 34 : 28; cam.updateProjectionMatrix(); };
  canvas.addEventListener('pointerdown', e => { drag = true; lx = e.clientX; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', e => { if (!drag) return; const d = (e.clientX - lx) * .01; lx = e.clientX; rot += d; vel = reduce ? 0 : d * .25; });
  const up = () => { drag = false; }; canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
  const tick = () => { raf = on ? requestAnimationFrame(tick) : 0; if (!drag) { rot += vel; if (!reduce) vel += (.004 - vel) * .02; } if (cur) cur.wrap.rotation.y = rot; r.render(scene, cam); };
  return {
    set(id, color) { if (cur) scene.remove(cur.wrap); cur = objs[id] || (objs[id] = make(id, color)); cur.set(color); scene.add(cur.wrap); size(); if (!on) r.render(scene, cam); },
    color(c) { cur && cur.set(c); if (!on) r.render(scene, cam); },
    start() { size(); if (!on) { on = true; tick(); } },
    stop() { on = false; cancelAnimationFrame(raf); },
    resize: size,
  };
}

/* ===== Diálogo accesible (hoja o pantalla) ===== */
function dialog(el, { onClose } = {}) {
  let back = null;
  const close = () => { if (!el.classList.contains('open')) return; el.classList.remove('open'); el.setAttribute('aria-hidden', 'true'); document.documentElement.classList.remove('lock'); onClose && onClose(); back && back.focus(); };
  const open = from => { back = from || document.activeElement; el.classList.add('open'); el.removeAttribute('aria-hidden'); document.documentElement.classList.add('lock'); setTimeout(() => (el.querySelector('[data-close]') || el).focus(), 30); };
  el.addEventListener('click', e => { if (e.target.closest('[data-close]') || e.target === el) close(); });
  el.addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
    if (e.key !== 'Tab') return;
    const f = [...el.querySelectorAll('button,a[href],input,[tabindex="0"]')].filter(n => n.offsetParent);
    if (!f.length) return; const a = f[0], z = f[f.length - 1];
    if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
  });
  // deslizar hacia abajo para cerrar la hoja
  const grip = el.querySelector('[data-grip]');
  if (grip) { let y0 = null; const panel = grip.closest('[data-panel]');
    grip.addEventListener('pointerdown', e => { y0 = e.clientY; grip.setPointerCapture(e.pointerId); panel.style.transition = 'none'; });
    grip.addEventListener('pointermove', e => { if (y0 === null) return; panel.style.transform = `translateY(${Math.max(0, e.clientY - y0)}px)`; });
    const end = e => { if (y0 === null) return; const d = e.clientY - y0; y0 = null; panel.style.transition = ''; panel.style.transform = ''; if (d > 90) close(); };
    grip.addEventListener('pointerup', end); grip.addEventListener('pointercancel', end);
  }
  return { open, close };
}

window.MJ = { reduce, fmt, COLORS, CATS, PRODUCTS, hex, msg, wa, GENERIC, thumb, viewer, dialog, gl, year: new Date().getFullYear(),
  icon: { wa: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>',
    x: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    search: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    arrow: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    back: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>' },
};
})();
