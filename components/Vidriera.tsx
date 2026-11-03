'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { CATS, PRODUCTS, catName, type Product } from '@/lib/catalog';
import { GENERIC, wa } from '@/lib/contact';
import { track } from '@/lib/track';
import { prefersReduced } from '@/lib/scene';
import Card from './Card';
import Clima from './Clima';
import Sheet from './Sheet';
import { Arrow, Chevron, FilterIcon, WaIcon } from './Icons';

const ALL = [{ id: 'all', name: 'Todo' }, ...CATS];
const nOf = (id: string) => (id === 'all' ? PRODUCTS.length : PRODUCTS.filter(p => p.cat === id).length);
const byId = (id: string) => PRODUCTS.find(p => p.id === id) as Product;
const hdrH = () => document.querySelector<HTMLElement>('.hdr')?.offsetHeight ?? 61;

// desplazamiento suave con window.scrollTo; si no llegó (pestaña en segundo plano, otro gesto), salta directo
function toY(el: Element, block: 'start' | 'center' = 'start') {
  const r = el.getBoundingClientRect();
  const top = Math.round(scrollY + (block === 'center' ? r.top - (innerHeight - r.height) / 2 : r.top - hdrH() - 14));
  scrollTo({ top, behavior: prefersReduced() ? 'auto' : 'smooth' });
  setTimeout(() => Math.abs(scrollY - top) > 40 && scrollTo({ top, behavior: 'instant' }), 1200);
  return top;
}

const waClick = (place: string) => () => track('contact_whatsapp', { place });

export default function Vidriera() {
  const [cat, setCatState] = useState('all');
  const [picks, setPicks] = useState<Record<string, string>>(() => Object.fromEntries(PRODUCTS.map(p => [p.id, p.colors[0]])));
  const [sheet, setSheet] = useState<{ id: string | null; open: boolean }>({ id: null, open: false });
  const [hit, setHit] = useState<string | null>(null);
  const [inCat, setInCat] = useState(false);
  const [ddOpen, setDdOpen] = useState(false);
  const [mega, setMega] = useState(false);
  const [megaCat, setMegaCat] = useState('all');
  const megaT = useRef<ReturnType<typeof setTimeout>>(undefined);
  const mBtn = useRef<HTMLButtonElement>(null);
  const ddBtn = useRef<HTMLButtonElement>(null);
  const ddMenu = useRef<HTMLDivElement>(null);
  const shown = PRODUCTS.filter(p => cat === 'all' || p.cat === cat);

  /* ===== Filtro en el encabezado: aparece apenas éste llega al título del catálogo y se va cuando ya no quedan productos ===== */
  useEffect(() => {
    const check = () => {
      const h = hdrH(), a = document.getElementById('catalogo')!.getBoundingClientRect(), b = document.querySelector('.catalog')!.getBoundingClientRect();
      const on = a.top <= h + 100 && b.bottom > h + 120;
      setInCat(on); if (!on) setDdOpen(false);
    };
    // en captura: también se entera si el que scrollea es otro contenedor; y un chequeo liviano por si se pierde algún evento
    document.addEventListener('scroll', check, { passive: true, capture: true }); addEventListener('resize', check);
    const iv = setInterval(check, 250); check();
    return () => { document.removeEventListener('scroll', check, { capture: true }); removeEventListener('resize', check); clearInterval(iv); };
  }, []);

  /* ===== Entradas: tarjetas y textos suben al entrar en pantalla, igual en celular y en compu ===== */
  // IntersectionObserver en vez de posiciones precalculadas: si la página cambia de alto (filtros, fotos) no se desfasa
  useEffect(() => {
    if (prefersReduced()) return;
    gsap.ticker.lagSmoothing(0); // en equipos lentos las entradas terminan a tiempo en vez de ir en cámara lenta
    const groups: [string, gsap.TweenVars][] = [
      ['.card', { y: 40, duration: .7, stagger: .07 }],
      ['.cat-head > *, .sec-head > *, .custom-box > *, .steps li', { y: 26, duration: .8, stagger: .09 }],
    ];
    const ios = groups.map(([q, v]) => {
      const els = gsap.utils.toArray<HTMLElement>(q); gsap.set(els, { autoAlpha: 0 });
      let queue: HTMLElement[] = [], raf = 0;
      const io = new IntersectionObserver(es => {
        es.forEach(e => { if (e.isIntersecting) { io.unobserve(e.target); (e.target as HTMLElement).dataset.in = '1'; queue.push(e.target as HTMLElement); } });
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => { gsap.fromTo(queue, { autoAlpha: 0, y: v.y }, { autoAlpha: 1, y: 0, duration: v.duration, stagger: v.stagger, ease: 'power3.out', overwrite: true }); queue = []; });
      }, { rootMargin: '0px 0px -6% 0px' });
      els.forEach(el => io.observe(el));
      return io;
    });
    return () => ios.forEach(io => io.disconnect());
  }, []);

  // al cambiar de categoría, las tarjetas que quedan a la vista se reparten de nuevo
  const firstCat = useRef(true);
  useEffect(() => {
    if (firstCat.current) { firstCat.current = false; return; }
    if (prefersReduced()) return;
    const list = gsap.utils.toArray<HTMLElement>('.card:not([hidden])').filter(k => k.dataset.in);
    gsap.fromTo(list, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: .6, ease: 'power3.out', stagger: .05, delay: .2, overwrite: true });
  }, [cat]);

  const setCat = useCallback((id: string, go = true) => {
    track('filter_category', { category: catName(id) });
    setCatState(id); setDdOpen(false); setMega(false);
    if (go) toY(document.getElementById('catalogo')!);
  }, []);

  const openSheet = useCallback((id: string) => {
    setSheet({ id, open: true });
    const p = byId(id);
    track('view_item', { item_id: p.id, item_name: p.name, item_category: catName(p.cat) });
  }, []);

  // producto elegido en el menú: va al catálogo filtrado por su categoría, lo marca y abre su ficha
  const goTo = (id: string) => {
    setCat(byId(id).cat, false);
    setTimeout(() => {
      const card = document.querySelector(`.card[data-id="${id}"]`)!;
      const top = toY(card, 'center');
      let done = false;
      const go = () => {
        if (done) return; done = true;
        if (Math.abs(scrollY - top) > 40) scrollTo({ top, behavior: 'instant' });
        setHit(null); requestAnimationFrame(() => setHit(id));
        setTimeout(() => openSheet(id), prefersReduced() ? 0 : 450);
      };
      if (prefersReduced()) go(); else { addEventListener('scrollend', go, { once: true }); setTimeout(go, 1100); }
    }, 60);
  };

  const pickColor = (id: string, c: string, place: string) => {
    const p = byId(id);
    track('select_color', { item_id: p.id, item_name: p.name, color: c, place });
    setPicks(s => ({ ...s, [id]: c }));
  };

  /* ===== Menús: panel del catálogo (compu) y desplegable del filtro ===== */
  const megaLater = () => { clearTimeout(megaT.current); megaT.current = setTimeout(() => setMega(false), 220); };
  useEffect(() => {
    const out = (e: MouseEvent) => {
      const t = e.target as Element;
      if (!t.closest('#mega,#mBtn')) setMega(false);
      if (!t.closest('#dd')) setDdOpen(false);
    };
    const esc = (e: KeyboardEvent) => { if (e.key !== 'Escape') return; setMega(m => { if (m) mBtn.current?.focus(); return false; }); };
    document.addEventListener('click', out); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('click', out); document.removeEventListener('keydown', esc); };
  }, []);
  useEffect(() => { if (ddOpen) (ddMenu.current?.querySelector<HTMLElement>('[aria-pressed="true"]') ?? ddMenu.current?.querySelector('button'))?.focus(); }, [ddOpen]);

  const megaPs = PRODUCTS.filter(p => megaCat === 'all' || p.cat === megaCat), megaN = megaCat === 'all' ? 4 : 3;
  const cur = sheet.id ? byId(sheet.id) : null;

  return (
    <>
      <header className={`hdr${inCat ? ' in-cat' : ''}`}>
        <a className="logo" href="#inicio">MJ 3D</a>
        <nav className="mnav" aria-label="Principal">
          <button className="mlink" id="mBtn" ref={mBtn} aria-expanded={mega} aria-controls="mega"
            onMouseEnter={() => { clearTimeout(megaT.current); setMega(true); }} onMouseLeave={megaLater}
            onClick={() => setMega(m => !m)}>
            Catálogo<Chevron />
          </button>
          <a className="mlink" href="#personalizados">Personalizados</a>
          <a className="mlink" href="#como">Cómo pedir</a>
        </nav>
        <div className={`mega${mega ? ' open' : ''}`} id="mega" onMouseEnter={() => clearTimeout(megaT.current)} onMouseLeave={megaLater}>
          <div className="mcats">
            {ALL.map(c => (
              <button key={c.id} className={`mcat${megaCat === c.id ? ' on' : ''}`}
                onMouseOver={() => setMegaCat(c.id)} onFocus={() => setMegaCat(c.id)} onClick={() => setCat(c.id)}>
                {c.id === 'all' ? 'Todo el catálogo' : c.name}<span>{String(nOf(c.id)).padStart(2, '0')}</span><Arrow />
              </button>
            ))}
          </div>
          <div className="mpics" key={megaCat}>
            {megaPs.slice(0, megaN).map((p, i) => (
              <button key={p.id} className="mpic" style={{ '--i': i } as React.CSSProperties} onClick={() => { setMega(false); goTo(p.id); }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <span className="im"><img src={`/img/${p.id}-c.webp`} alt="" /></span>{p.name}
              </button>
            ))}
            {megaCat !== 'all' && (
              <button className="mpic all" style={{ '--i': megaN } as React.CSSProperties} onClick={() => setCat(megaCat)}>
                <small>{megaPs.length} productos</small>Ver todos<Arrow />
              </button>
            )}
          </div>
        </div>
        <div className="dd" id="dd" inert={!inCat}>
          <button className="dd-btn" ref={ddBtn} aria-expanded={ddOpen} aria-controls="ddMenu" aria-label={`Filtrar por categoría, ahora: ${catName(cat)}`}
            onClick={() => setDdOpen(o => !o)} onKeyDown={e => { if (e.key === 'Escape') setDdOpen(false); }}>
            <FilterIcon /><span>{catName(cat)}</span><Chevron size={16} />
          </button>
          <div className={`dd-menu${ddOpen ? ' open' : ''}`} id="ddMenu" ref={ddMenu}
            onKeyDown={e => { if (e.key === 'Escape') { setDdOpen(false); ddBtn.current?.focus(); } }}>
            {ALL.map(c => (
              <button key={c.id} className="dd-it" aria-pressed={cat === c.id} onClick={() => setCat(c.id)}>{c.name}<span>{nOf(c.id)}</span></button>
            ))}
          </div>
        </div>
        <a className="btn btn-ghost btn-sm" href={wa(GENERIC)} target="_blank" rel="noopener" aria-label="Consultar por WhatsApp" onClick={waClick('encabezado')}>
          <WaIcon /><span className="t">Consultar</span>
        </a>
      </header>

      <main id="inicio">
        <section className="hero" aria-labelledby="t">
          <span className="eyebrow">Catálogo Navidad 2026</span>
          <h1 id="t">Navidad, capa por capa</h1>
          <p>Adornos y regalos impresos en 3D en Marcos Juárez. Tocá un producto, elegí el color y consultanos por WhatsApp.</p>
          <div className="row"><a className="btn" href="#catalogo" onClick={e => { e.preventDefault(); toY(document.getElementById('catalogo')!); }}>Ver catálogo</a></div>
          <Clima />
        </section>

        <section className="catalog" aria-labelledby="catTitle">
          <div className="cat-head" id="catalogo">
            <h2 id="catTitle">{cat === 'all' ? 'Todo el catálogo' : catName(cat)}</h2>
            <div className="r">
              {cat !== 'all' && <button className="reset" onClick={() => setCat('all')}>Ver todo</button>}
              <p className="count" role="status">{shown.length} {shown.length === 1 ? 'producto' : 'productos'}</p>
            </div>
          </div>
          <div className="grid" id="grid">
            {PRODUCTS.map(p => (
              <Card key={p.id} p={p} color={picks[p.id]} hidden={!(cat === 'all' || p.cat === cat)} hit={hit === p.id}
                onOpen={openSheet} onColor={(id, c) => pickColor(id, c, 'tarjeta')} />
            ))}
          </div>
        </section>

        <section className="sec" id="personalizados" aria-labelledby="hc">
          <div className="custom-box">
            <div>
              <h2 id="hc">¿Tenés una idea?</h2>
              <p>Hacemos piezas a pedido: con nombre, en el color que quieras o en cantidad para regalar. Contanos qué imaginás y te pasamos precio y tiempo.</p>
              <a className="btn" href={wa(GENERIC)} target="_blank" rel="noopener" onClick={waClick('personalizados')}><WaIcon />Pedir un personalizado</a>
            </div>
            <ul className="ideas">
              <li><b>Nombres e iniciales</b><span>En adornos, servilleteros y más.</span></li>
              <li><b>Tu color</b><span>Cualquier pieza en los colores que elijas.</span></li>
              <li><b>Regalos empresariales</b><span>Con logo y en cantidad.</span></li>
              <li><b>Souvenirs</b><span>Para fiestas y encuentros de fin de año.</span></li>
            </ul>
          </div>
        </section>

        <section className="sec" id="como" aria-labelledby="hp">
          <div className="sec-head"><h2 id="hp">Cómo pedir</h2></div>
          <ol className="steps">
            <li><b>Elegí el producto</b><span>Tocalo en el catálogo y elegí el color.</span></li>
            <li><b>Consultanos</b><span>Se abre WhatsApp con el mensaje listo.</span></li>
            <li><b>Retirá o recibí</b><span>Retiro en Marcos Juárez y envíos a coordinar.</span></li>
          </ol>
        </section>
      </main>

      <footer>
        <span>© 2026 MJ 3D, Marcos Juárez</span>
        <Link href="/creditos">Créditos</Link>
      </footer>
      <a className="fab" href={wa(GENERIC)} target="_blank" rel="noopener" aria-label="Consultar por WhatsApp" onClick={waClick('boton flotante')}><WaIcon /></a>

      <Sheet p={cur} open={sheet.open} color={cur ? picks[cur.id] : ''}
        onColor={c => cur && pickColor(cur.id, c, 'ficha')} onClose={() => setSheet(s => ({ ...s, open: false }))} />
    </>
  );
}
