/* ═══════════════════════════════════════════════════════════════════
   NIGHT SCHOOL — chalk-dust planetarium over the day's AI news.
   Three.js starfield · procedural constellations · GSAP choreography.
   ═══════════════════════════════════════════════════════════════════ */
import * as THREE from 'three';

const { stories, glossary, generatedAt } = window.HOMEROOM;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

/* ── shared helpers ──────────────────────────────────────────── */
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hashStr = (s) => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 7);

function glossaryTermId(term) {
  return 'glossary-' + term.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

const escapeRegExp = (v) => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const escapeHtml = (v) => v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const glossaryByName = new Map();
for (const t of glossary) {
  glossaryByName.set(t.term.toLowerCase(), t);
  for (const a of t.aliases ?? []) glossaryByName.set(a.toLowerCase(), t);
}

/* Mark glossary terms inside a summary string → HTML with .term links */
function markTerms(text) {
  const candidates = [...glossaryByName.keys()].sort((a, b) => b.length - a.length);
  let pieces = [{ text, raw: true }];
  for (const match of candidates) {
    const term = glossaryByName.get(match);
    const regex = new RegExp(`(?<![A-Za-z0-9])(${escapeRegExp(match)})(?![A-Za-z0-9])`, 'gi');
    pieces = pieces.flatMap((p) => {
      if (!p.raw) return [p];
      return p.text.split(regex).map((part, i) =>
        i % 2 === 1
          ? { raw: false, html: `<a class="term" href="#${glossaryTermId(term.term)}" data-term="${escapeHtml(term.term)}" data-definition="${escapeHtml(term.definition)}">${escapeHtml(part)}</a>` }
          : { raw: true, text: part });
    });
  }
  return pieces.map((p) => (p.raw ? escapeHtml(p.text) : p.html)).join('');
}

/* ── edition date ────────────────────────────────────────────── */
const editionDate = new Intl.DateTimeFormat('en-US', {
  weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
}).format(new Date(generatedAt));
document.getElementById('edition-date').textContent = editionDate;
document.getElementById('story-count').textContent = stories.length;

/* ── constellation SVG per story ─────────────────────────────── */
const LATIN = ['Nova', 'Minor', 'Major', 'Borealis', 'Australis', 'Obscura', 'Vulgaris', 'Docta'];
function constellationSVG(story, index) {
  const rng = mulberry32(hashStr(story.headline));
  const W = 400, H = 300, PAD = 46;
  const terms = story.termNames.slice(0, 6);
  const extraCount = Math.max(0, 5 - terms.length) + 1;
  const pts = [];
  const total = terms.length + extraCount;

  // rejection-sample points to keep them spread out
  for (let i = 0; i < total; i++) {
    let x, y, tries = 0;
    do {
      x = PAD + rng() * (W - PAD * 2);
      y = PAD + rng() * (H - PAD * 2);
      tries++;
    } while (tries < 24 && pts.some((p) => (p.x - x) ** 2 + (p.y - y) ** 2 < 72 ** 2));
    pts.push({ x, y, term: terms[i] ?? null });
  }

  // connect with a greedy nearest-neighbour walk
  const order = [0];
  const left = new Set(pts.map((_, i) => i).slice(1));
  while (left.size) {
    const last = pts[order[order.length - 1]];
    let best = null, bd = Infinity;
    for (const i of left) {
      const d = (pts[i].x - last.x) ** 2 + (pts[i].y - last.y) ** 2;
      if (d < bd) { bd = d; best = i; }
    }
    order.push(best); left.delete(best);
  }
  const path = order.map((i, k) => `${k ? 'L' : 'M'} ${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)}`).join(' ');

  const src = story.sourceName.split(/[. ]/)[0];
  const name = `${src.charAt(0).toUpperCase()}${src.slice(1)} ${LATIN[index % LATIN.length]}`;
  const starEls = pts.map((p, i) => {
    const r = p.term ? 4 + rng() * 1.6 : 1.6 + rng() * 1.4;
    const brass = p.term && i === 0 ? ' brass' : '';
    const halo = p.term ? `<circle class="chart-star-halo" cx="${p.x}" cy="${p.y}" r="${r + 4.5}"/>` : '';
    // label placement: flip side if near right edge
    const anchor = p.x > W - 120 ? 'end' : 'start';
    const lx = anchor === 'end' ? p.x - 9 : p.x + 9;
    const label = p.term
      ? `<a href="#${glossaryTermId(p.term)}"><text class="chart-star-label" x="${lx}" y="${p.y - 8}" text-anchor="${anchor}">${escapeHtml(p.term.replace(' (AI)', ''))}</text></a>`
      : '';
    return `${halo}<circle class="chart-star${brass}" cx="${p.x}" cy="${p.y}" r="${r.toFixed(1)}"/>${label}`;
  }).join('');

  /* faint RA/Dec chart grid: two declination arcs + tick marks */
  const gy1 = 60 + (index % 3) * 30, gy2 = H - 50 - (index % 2) * 30;
  const grid = `
    <path class="chart-grid" d="M -10 ${gy1} Q ${W / 2} ${gy1 - 34}, ${W + 10} ${gy1}" />
    <path class="chart-grid" d="M -10 ${gy2} Q ${W / 2} ${gy2 + 34}, ${W + 10} ${gy2}" />
    ${[0.22, 0.5, 0.78].map((f) => `<line class="chart-grid" x1="${W * f}" y1="${H - 8}" x2="${W * f}" y2="${H - 2}" />`).join('')}`;

  return `
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Constellation of glossary terms for this story">
      ${grid}
      <path class="chart-line" d="${path}" />
      ${starEls}
      <text class="chart-name" x="${PAD}" y="${H - 14}">${escapeHtml(name)}</text>
    </svg>
    <p class="chart-caption">fig. ${index + 1} — tonight’s terms, charted</p>`;
}

/* ── render plates ───────────────────────────────────────────── */
const plateDate = (iso) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(iso));

const platesRoot = document.getElementById('plates');
platesRoot.innerHTML = stories.map((story, i) => {
  const featured = i === 0;
  const flip = !featured && i % 2 === 0;
  return `
  <article class="plate${featured ? ' featured' : ''}${flip ? ' flip' : ''}" aria-label="Story ${i + 1}">
    <span class="plate-no">Plate ${ROMAN[i]}</span>
    <div class="plate-text">
      <p class="plate-topline">
        <span class="badge ${story.badge}">${story.badge}</span>
        <span>${escapeHtml(story.sourceName)}</span>
      </p>
      <h3>${escapeHtml(story.headline)}</h3>
      <p class="summary">${markTerms(story.summary)}</p>
      <p class="why"><strong>Why it matters</strong><span class="why-star">✶</span>${escapeHtml(story.whyItMatters)}</p>
      <div class="plate-footer">
        <a class="article-link" href="${escapeHtml(story.sourceUrl)}" target="_blank" rel="noreferrer">Original source: ${escapeHtml(story.sourceName)} ↗</a>
        <span class="plate-date">${plateDate(story.publishedAt)}</span>
      </div>
    </div>
    <div class="plate-chart">${constellationSVG(story, i)}</div>
  </article>`;
}).join('');

/* ── render atlas ────────────────────────────────────────────── */
const allTerms = [...glossary].sort((a, b) => a.term.localeCompare(b.term));
document.getElementById('term-count').textContent = allTerms.length;

const groups = new Map();
for (const t of allTerms) {
  const letter = t.term[0].toUpperCase();
  if (!groups.has(letter)) groups.set(letter, []);
  groups.get(letter).push(t);
}

document.getElementById('atlas-body').innerHTML = [...groups.entries()].map(([letter, terms]) => `
  <section class="atlas-letter-group" aria-label="Terms starting with ${letter}">
    <h3 class="atlas-letter">${letter}</h3>
    <dl class="atlas-columns">
      ${terms.map((t) => `
        <div class="atlas-entry" id="${glossaryTermId(t.term)}">
          <dt>${escapeHtml(t.term)}</dt>
          <dd>${escapeHtml(t.definition)}</dd>
        </div>`).join('')}
    </dl>
  </section>`).join('');

/* light up an atlas entry when navigated to */
function litFromHash() {
  const hash = decodeURIComponent(window.location.hash.slice(1));
  if (!hash) return;
  const el = document.getElementById(hash);
  if (el?.classList.contains('atlas-entry')) {
    document.querySelectorAll('.atlas-entry.lit').forEach((e) => e.classList.remove('lit'));
    el.classList.add('lit');
  }
}
window.addEventListener('hashchange', litFromHash);
litFromHash();

/* ── term tooltips ───────────────────────────────────────────── */
const tooltip = document.getElementById('tooltip');
let tooltipFor = null;
function showTooltip(link) {
  tooltipFor = link;
  tooltip.innerHTML = `<span class="tt-term">${escapeHtml(link.dataset.term)}</span>${escapeHtml(link.dataset.definition)}`;
  tooltip.hidden = false;
  const r = link.getBoundingClientRect();
  const tw = tooltip.offsetWidth, th = tooltip.offsetHeight;
  let x = Math.min(Math.max(10, r.left + r.width / 2 - tw / 2), window.innerWidth - tw - 10);
  let y = r.top - th - 10;
  if (y < 64) y = r.bottom + 10;
  tooltip.style.transform = `translate(${x}px, ${y}px)`;
}
function hideTooltip() { tooltip.hidden = true; tooltipFor = null; }
document.addEventListener('pointerover', (e) => {
  const link = e.target.closest?.('.term');
  if (link) showTooltip(link);
});
document.addEventListener('pointerout', (e) => {
  const from = e.target.closest?.('.term');
  const to = e.relatedTarget?.closest?.('.term');
  if (from && from === tooltipFor && !to) hideTooltip();
});
document.addEventListener('focusin', (e) => {
  const link = e.target.closest?.('.term');
  if (link) showTooltip(link);
  else if (tooltipFor) hideTooltip();
});
window.addEventListener('scroll', () => {
  if (!tooltipFor) return;
  const r = tooltipFor.getBoundingClientRect();
  if (r.bottom < 0 || r.top > window.innerHeight) hideTooltip();
  else showTooltip(tooltipFor);
}, { passive: true });

/* ═══════════════════════════════════════════════════════════════
   THE SKY — chalk-dust starfield
   ═══════════════════════════════════════════════════════════════ */
const canvas = document.getElementById('sky');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'low-power' });
} catch { /* WebGL unavailable — the CSS night holds on its own */ }

if (renderer) {
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(DPR);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 400);
  camera.position.z = 60;

  /* chalk-dot sprite texture */
  function chalkTexture(size = 64) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.35, 'rgba(255,255,255,0.8)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    // chalk grain: punch tiny holes
    const img = ctx.getImageData(0, 0, size, size);
    const rng = mulberry32(99);
    for (let i = 3; i < img.data.length; i += 4) {
      if (rng() < 0.16) img.data[i] = Math.floor(img.data[i] * 0.45);
    }
    ctx.putImageData(img, 0, 0);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }
  const sprite = chalkTexture();

  const PALETTE = [
    new THREE.Color('#f2edda'), new THREE.Color('#f2edda'), new THREE.Color('#f2edda'),
    new THREE.Color('#b9c8ea'), new THREE.Color('#e0b45c'),
  ];

  function makeField({ count, spread, sizeMin, sizeMax, band = false }) {
    const rng = mulberry32(count * 7 + 13);
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const size = new Float32Array(count);
    const phase = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      let x = (rng() - 0.5) * spread * 2;
      let y = (rng() - 0.5) * spread * 2;
      let z = -rng() * 120;
      if (band) {
        // milky-way: squeeze toward a tilted plane
        const t = (rng() - 0.5) * spread * 2.4;
        const off = (rng() - 0.5) * spread * 0.28 * (0.4 + rng());
        x = t * 0.94 - off * 0.34;
        y = t * 0.34 + off * 0.94;
        z = -20 - rng() * 100;
      }
      pos.set([x, y, z], i * 3);
      const c = PALETTE[Math.floor(rng() * PALETTE.length)];
      col.set([c.r, c.g, c.b], i * 3);
      size[i] = sizeMin + rng() * (sizeMax - sizeMin);
      phase[i] = rng() * Math.PI * 2;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uSprite: { value: sprite }, uOpacity: { value: 1 } },
      vertexShader: `
        attribute float aSize; attribute float aPhase; attribute vec3 color;
        varying vec3 vColor; varying float vTwinkle;
        uniform float uTime;
        void main() {
          vColor = color;
          vTwinkle = 0.62 + 0.38 * sin(uTime * (0.4 + aPhase * 0.13) + aPhase * 7.0);
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * (180.0 / -mv.z) * (0.82 + 0.18 * vTwinkle);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        uniform sampler2D uSprite; uniform float uOpacity;
        varying vec3 vColor; varying float vTwinkle;
        void main() {
          vec4 s = texture2D(uSprite, gl_PointCoord);
          gl_FragColor = vec4(vColor, s.a * vTwinkle * uOpacity);
        }`,
    });
    return new THREE.Points(geo, mat);
  }

  const far = makeField({ count: 1500, spread: 95, sizeMin: 0.5, sizeMax: 1.3 });
  const mid = makeField({ count: 700, spread: 80, sizeMin: 1.0, sizeMax: 2.2 });
  const near = makeField({ count: 220, spread: 66, sizeMin: 1.8, sizeMax: 3.4 });
  const way = makeField({ count: 2100, spread: 60, sizeMin: 0.4, sizeMax: 1.0, band: true });
  way.material.uniforms.uOpacity.value = 0.5;
  scene.add(far, mid, near, way);

  /* soft nebulae */
  function nebulaTexture(hex) {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(128, 128, 10, 128, 128, 128);
    g.addColorStop(0, hex + '55'); g.addColorStop(0.5, hex + '22'); g.addColorStop(1, hex + '00');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256);
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }
  const nebColors = ['#3a3f77', '#54407c', '#2e4a6e', '#43406e'];
  const nebRng = mulberry32(5150);
  for (let i = 0; i < 7; i++) {
    const m = new THREE.SpriteMaterial({
      map: nebulaTexture(nebColors[i % nebColors.length]),
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.5,
    });
    const sp = new THREE.Sprite(m);
    const s = 55 + nebRng() * 70;
    sp.scale.set(s, s, 1);
    sp.position.set((nebRng() - 0.5) * 130, (nebRng() - 0.5) * 110, -80 - nebRng() * 40);
    scene.add(sp);
  }

  /* shooting star */
  const shoot = (() => {
    const geo = new THREE.BufferGeometry();
    const N = 26;
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
    const alphas = new Float32Array(N);
    for (let i = 0; i < N; i++) alphas[i] = 1 - i / N;
    geo.setAttribute('aA', new THREE.BufferAttribute(alphas, 1));
    const mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uLife: { value: 0 } },
      vertexShader: `attribute float aA; varying float vA; void main(){ vA=aA; vec4 mv=modelViewMatrix*vec4(position,1.0); gl_PointSize=max(1.0, 4.5*aA*(120.0/-mv.z)); gl_Position=projectionMatrix*mv; }`,
      fragmentShader: `uniform float uLife; varying float vA; void main(){ vec2 uv=gl_PointCoord-0.5; float d=1.0-smoothstep(0.0,0.5,length(uv)); gl_FragColor=vec4(0.95,0.93,0.85,d*vA*uLife); }`,
    });
    const pts = new THREE.Points(geo, mat);
    pts.visible = false;
    scene.add(pts);
    return { pts, geo, mat, t: -1, dir: new THREE.Vector3(), origin: new THREE.Vector3() };
  })();
  const shootRng = mulberry32(Math.floor(performance.now()) | 1);
  function launchShootingStar() {
    shoot.t = 0;
    shoot.origin.set((shootRng() - 0.5) * 100, 25 + shootRng() * 25, -50 - shootRng() * 30);
    shoot.dir.set(-(0.5 + shootRng() * 0.6), -(0.35 + shootRng() * 0.3), 0).normalize();
    shoot.pts.visible = true;
  }

  /* sizing */
  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  /* pointer parallax */
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener('pointermove', (e) => {
    pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
    pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  let scrollFactor = 0;
  window.addEventListener('scroll', () => {
    scrollFactor = window.scrollY;
  }, { passive: true });

  const clock = new THREE.Clock();
  let nextShot = 4 + shootRng() * 6;
  let running = true;

  function frame() {
    const t = clock.getElapsedTime();
    far.material.uniforms.uTime.value = t;
    mid.material.uniforms.uTime.value = t;
    near.material.uniforms.uTime.value = t;
    way.material.uniforms.uTime.value = t * 0.6;

    /* slow dome rotation + parallax */
    const sy = scrollFactor * 0.004;
    scene.rotation.z = t * 0.004;
    far.position.y = sy * 2.2;
    mid.position.y = sy * 4.2;
    near.position.y = sy * 7.5;
    way.position.y = sy * 3.0;

    pointer.x += (pointer.tx - pointer.x) * 0.03;
    pointer.y += (pointer.ty - pointer.y) * 0.03;
    camera.position.x = pointer.x * 1.6;
    camera.position.y = -pointer.y * 1.2;
    camera.lookAt(0, 0, -40);

    /* shooting star lifecycle */
    if (!reduceMotion) {
      if (shoot.t < 0 && t > nextShot) launchShootingStar();
      if (shoot.t >= 0) {
        shoot.t += clock.getDelta ? 0.016 : 0.016;
        const life = shoot.t / 1.4;
        if (life >= 1) { shoot.t = -1; shoot.pts.visible = false; nextShot = t + 7 + shootRng() * 9; }
        else {
          shoot.mat.uniforms.uLife.value = Math.sin(Math.min(life * Math.PI, Math.PI));
          const pos = shoot.geo.attributes.position;
          const head = shoot.origin.clone().addScaledVector(shoot.dir, life * 65);
          for (let i = 0; i < pos.count; i++) {
            const p = head.clone().addScaledVector(shoot.dir, -i * 0.9);
            pos.setXYZ(i, p.x, p.y, p.z);
          }
          pos.needsUpdate = true;
        }
      }
    }

    renderer.render(scene, camera);
    if (running && !reduceMotion) requestAnimationFrame(frame);
  }

  document.addEventListener('visibilitychange', () => {
    const wasRunning = running;
    running = !document.hidden;
    if (running && !wasRunning && !reduceMotion) requestAnimationFrame(frame);
  });

  if (reduceMotion) { frame(); /* single still render */ }
  else requestAnimationFrame(frame);
}

/* ═══════════════════════════════════════════════════════════════
   CHOREOGRAPHY — GSAP entrances & constellation drawing
   ═══════════════════════════════════════════════════════════════ */
if (!reduceMotion && window.gsap) {
  gsap.registerPlugin(ScrollTrigger);

  /* hero: constellation draws, then copy settles in */
  const lines = document.querySelectorAll('.hero-constellation .const-lines path');
  lines.forEach((p) => {
    const len = p.getTotalLength();
    gsap.set(p, { strokeDasharray: `${len}`, strokeDashoffset: len });
    gsap.to(p, { strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut', delay: 0.5 });
    gsap.set(p, { strokeDasharray: '4 7', delay: 3.2 });
  });
  gsap.fromTo('.hero-constellation .const-stars circle',
    { opacity: 0, scale: 0.2, transformOrigin: 'center', svgOrigin: undefined },
    { opacity: 1, scale: 1, duration: 0.9, stagger: 0.08, ease: 'power3.out', delay: 0.25 });
  gsap.fromTo('.const-label', { opacity: 0 }, { opacity: 1, duration: 1.2, delay: 2.4 });

  gsap.fromTo('.hero-script', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.15 });
  gsap.fromTo('.hero h1', { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 1.1, ease: 'power4.out', delay: 0.35 });
  gsap.fromTo('.hero .dek, .session-log, .hero-actions', { opacity: 0, y: 18 },
    { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out', delay: 0.7 });
  gsap.fromTo('.dome-cue', { opacity: 0 }, { opacity: 1, duration: 1.4, delay: 1.8 });

  /* plates: rise gently; constellations draw when seen */
  document.querySelectorAll('.plate').forEach((plate) => {
    gsap.fromTo(plate, { opacity: 0.001, y: 34 }, {
      opacity: 1, y: 0, duration: 1.0, ease: 'power3.out', immediateRender: false,
      scrollTrigger: { trigger: plate, start: 'top 86%', once: true },
    });
    const line = plate.querySelector('.chart-line');
    if (line) {
      const len = line.getTotalLength();
      gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(line, {
        strokeDashoffset: 0, duration: 2.0, ease: 'power2.inOut', immediateRender: false,
        scrollTrigger: { trigger: plate, start: 'top 70%', once: true },
      });
    }
    const stars = plate.querySelectorAll('.chart-star, .chart-star-halo');
    gsap.fromTo(stars, { opacity: 0 }, {
      opacity: 1, duration: 0.7, stagger: 0.1, ease: 'power2.out', immediateRender: false,
      scrollTrigger: { trigger: plate, start: 'top 74%', once: true },
    });
    const labels = plate.querySelectorAll('.chart-star-label, .chart-name');
    gsap.fromTo(labels, { opacity: 0 }, {
      opacity: 1, duration: 0.9, stagger: 0.12, delay: 0.8, ease: 'power2.out', immediateRender: false,
      scrollTrigger: { trigger: plate, start: 'top 74%', once: true },
    });
  });

  /* atlas letters shimmer in */
  document.querySelectorAll('.atlas-letter-group').forEach((grp) => {
    gsap.fromTo(grp, { opacity: 0.001, y: 22 }, {
      opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', immediateRender: false,
      scrollTrigger: { trigger: grp, start: 'top 90%', once: true },
    });
  });

  /* failsafe: anything still hidden after 4s becomes visible */
  setTimeout(() => {
    document.querySelectorAll('.plate, .atlas-letter-group').forEach((el) => {
      if (Number(getComputedStyle(el).opacity) < 0.05) gsap.set(el, { opacity: 1, y: 0 });
    });
  }, 4000);
}
