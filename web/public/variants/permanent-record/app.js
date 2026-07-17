/* ═══════════════════════════════════════════════════════════════════
   THE PERMANENT RECORD — the day's AI news, typed, stamped, filed.
   Dust motes in fluorescent violet · stamp choreography · card catalog.
   ═══════════════════════════════════════════════════════════════════ */
import * as THREE from 'three';

const { stories, glossary, generatedAt } = window.HOMEROOM;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── helpers ─────────────────────────────────────────────────── */
const hashStr = (s) => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 7);
const glossaryTermId = (term) => 'glossary-' + term.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const escapeRegExp = (v) => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const escapeHtml = (v) => v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const glossaryByName = new Map();
for (const t of glossary) {
  glossaryByName.set(t.term.toLowerCase(), t);
  for (const a of t.aliases ?? []) glossaryByName.set(a.toLowerCase(), t);
}

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

/* ── dates ───────────────────────────────────────────────────── */
const gen = new Date(generatedAt);
document.getElementById('edition-date').textContent = new Intl.DateTimeFormat('en-US', {
  weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
}).format(gen);
document.getElementById('story-count').textContent = stories.length;
document.getElementById('stamp-date').textContent = new Intl.DateTimeFormat('en-US', {
  month: 'short', day: '2-digit', year: 'numeric',
}).format(gen).replace(/,/g, '').toUpperCase();

/* ── ticker ──────────────────────────────────────────────────── */
const TICKER_TEXT = 'DO NOT REMOVE FROM OFFICE ✶ FORM 6-A · DAILY AI BULLETIN ✶ PROPERTY OF THE DISTRICT ✶ TYPED IN TRIPLICATE ✶ SPIRIT-DUPLICATED, DO NOT SNIFF ✶ ';
for (const id of ['ticker-track', 'ticker-track-2']) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = `<span>${TICKER_TEXT.repeat(3)}</span><span aria-hidden="true">${TICKER_TEXT.repeat(3)}</span>`;
}

/* ── incident reports ────────────────────────────────────────── */
const reportDate = (iso) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(iso));

document.getElementById('forms').innerHTML = stories.map((story, i) => {
  const tilt = (((hashStr(story.headline) % 100) / 100) * 1.2 - 0.6).toFixed(2);
  const featured = i === 0;
  return `
  <article class="report${featured ? ' featured' : ''}" style="--tilt:${tilt}deg" aria-label="Story ${i + 1}">
    ${featured ? '<div class="confidential" aria-hidden="true"><span>CONFIDENTIAL</span></div>' : ''}
    <div class="report-head">
      <div>
        <p class="report-form-no">FORM 6-A · INCIDENT REPORT Nº ${String(i + 1).padStart(3, '0')}</p>
        <p class="report-source">FILED BY: ${escapeHtml(story.sourceName)}</p>
      </div>
      <span class="badge-stamp ${story.badge}">${story.badge === 'new' ? 'NEW ARRIVAL' : 'REVISED COPY'}</span>
    </div>
    <h3>${escapeHtml(story.headline)}</h3>
    <p class="summary">${markTerms(story.summary)}</p>
    <p class="why"><strong>Counselor’s note — why it matters</strong>${escapeHtml(story.whyItMatters)}</p>
    <div class="report-footer">
      <a class="article-link" href="${escapeHtml(story.sourceUrl)}" target="_blank" rel="noreferrer">SEE ATTACHED: ${escapeHtml(story.sourceName)} ↗</a>
      <span class="report-date">time-stamped ${reportDate(story.publishedAt)}</span>
    </div>
  </article>`;
}).join('');

/* ── card catalog ────────────────────────────────────────────── */
const allTerms = [...glossary].sort((a, b) => a.term.localeCompare(b.term));
document.getElementById('term-count').textContent = allTerms.length;

const groups = new Map();
for (const t of allTerms) {
  const letter = t.term[0].toUpperCase();
  if (!groups.has(letter)) groups.set(letter, []);
  groups.get(letter).push(t);
}

document.getElementById('catalog-body').innerHTML = [...groups.entries()].map(([letter, terms]) => `
  <section class="drawer-group" aria-label="Terms starting with ${letter}">
    <h3 class="drawer">
      <span class="drawer-letter">${letter}</span>
      <span class="drawer-label">${letter}a — ${letter.toLowerCase()}z · ${terms.length} card${terms.length > 1 ? 's' : ''}</span>
      <span class="drawer-pull" aria-hidden="true"></span>
    </h3>
    <dl class="catalog-columns">
      ${terms.map((t) => `
        <div class="catalog-card" id="${glossaryTermId(t.term)}">
          <dt>${escapeHtml(t.term)}</dt>
          <dd>${escapeHtml(t.definition)}</dd>
        </div>`).join('')}
    </dl>
  </section>`).join('');

function litFromHash() {
  const hash = decodeURIComponent(window.location.hash.slice(1));
  if (!hash) return;
  const el = document.getElementById(hash);
  if (el?.classList.contains('catalog-card')) {
    document.querySelectorAll('.catalog-card.lit').forEach((e) => e.classList.remove('lit'));
    el.classList.add('lit');
  }
}
window.addEventListener('hashchange', litFromHash);
litFromHash();

/* ── catalog-card tooltip ────────────────────────────────────── */
const tooltip = document.getElementById('tooltip');
let tooltipFor = null;
function showTooltip(link) {
  tooltipFor = link;
  tooltip.innerHTML = `<span class="tt-term">${escapeHtml(link.dataset.term)}</span>${escapeHtml(link.dataset.definition)}`;
  tooltip.hidden = false;
  const r = link.getBoundingClientRect();
  const tw = tooltip.offsetWidth, th = tooltip.offsetHeight;
  let x = Math.min(Math.max(10, r.left + r.width / 2 - tw / 2), window.innerWidth - tw - 10);
  let y = r.top - th - 12;
  if (y < 70) y = r.bottom + 12;
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
   DUST MOTES — fluorescent air in the records office
   ═══════════════════════════════════════════════════════════════ */
const canvas = document.getElementById('motes');
let renderer = null;
if (!reduceMotion) {
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'low-power' });
  } catch { /* fine without */ }
}

if (renderer) {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.z = 20;

  function moteTexture() {
    const c = document.createElement('canvas'); c.width = c.height = 32;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, 'rgba(235,225,255,0.9)');
    g.addColorStop(1, 'rgba(235,225,255,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 32, 32);
    return new THREE.CanvasTexture(c);
  }

  const N = 260;
  const pos = new Float32Array(N * 3);
  const seed = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 44;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 26;
    pos[i * 3 + 2] = -Math.random() * 24;
    seed[i] = Math.random() * Math.PI * 2;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uTex: { value: moteTexture() } },
    vertexShader: `
      attribute float aSeed; uniform float uTime; varying float vA;
      void main() {
        vec3 p = position;
        p.x += sin(uTime * 0.12 + aSeed * 3.0) * 1.6;
        p.y += sin(uTime * 0.09 + aSeed * 5.0) * 1.2 - mod(uTime * 0.16 + aSeed, 26.0) + 13.0;
        vA = 0.16 + 0.2 * sin(uTime * 0.5 + aSeed * 7.0);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = (1.4 + fract(aSeed) * 2.4) * (60.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform sampler2D uTex; varying float vA;
      void main() { gl_FragColor = texture2D(uTex, gl_PointCoord) * vec4(1.0, 1.0, 1.0, vA); }`,
  });
  scene.add(new THREE.Points(geo, mat));

  function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  const clock = new THREE.Clock();
  let running = true;
  function frame() {
    mat.uniforms.uTime.value = clock.getElapsedTime();
    renderer.render(scene, camera);
    if (running) requestAnimationFrame(frame);
  }
  document.addEventListener('visibilitychange', () => {
    const was = running;
    running = !document.hidden;
    if (running && !was) requestAnimationFrame(frame);
  });
  requestAnimationFrame(frame);
}

/* ═══════════════════════════════════════════════════════════════
   CHOREOGRAPHY — stamps slam, forms feed in, tickers roll
   ═══════════════════════════════════════════════════════════════ */
if (!reduceMotion && window.gsap) {
  gsap.registerPlugin(ScrollTrigger);

  /* folder settles onto the desk */
  gsap.fromTo('.folder', { opacity: 0, y: 30, rotateX: 8 }, { opacity: 1, y: 0, rotateX: 0, duration: 0.9, ease: 'power4.out', delay: 0.15 });

  /* the RECEIVED stamp slams down after the folder lands */
  gsap.fromTo('.stamp.received',
    { opacity: 0, scale: 2.6, rotation: -14 },
    { opacity: 1, scale: 1, rotation: -7, duration: 0.38, ease: 'power4.in', delay: 0.95,
      onComplete() {
        /* ink ripple: quick shadow pulse on the folder */
        gsap.fromTo('.folder-body', { boxShadow: '0 1px 0 oklch(0.9 0.05 90) inset, 0 24px 60px -18px oklch(0.12 0.05 305 / 0.75), 0 0 0 0 oklch(0.54 0.19 27 / 0.4)' },
          { boxShadow: '0 1px 0 oklch(0.9 0.05 90) inset, 0 24px 60px -18px oklch(0.12 0.05 305 / 0.75), 0 0 0 26px oklch(0.54 0.19 27 / 0)', duration: 0.8, ease: 'power2.out', clearProps: 'boxShadow' });
      } });

  /* typewriter reveal for the form fields */
  document.querySelectorAll('.form-fields dd').forEach((dd, i) => {
    const full = dd.textContent;
    dd.textContent = '';
    const state = { n: 0 };
    gsap.to(state, {
      n: full.length, duration: Math.min(1.4, full.length * 0.03), ease: 'none', delay: 1.35 + i * 0.45,
      onUpdate() { dd.textContent = full.slice(0, Math.round(state.n)); },
    });
  });

  /* tickers roll forever */
  const roll = (sel, dir) => {
    const track = document.querySelector(sel);
    if (!track) return;
    const half = () => track.scrollWidth / 2;
    gsap.to(track, {
      x: dir * -half(), duration: 60, ease: 'none', repeat: -1,
      modifiers: { x: (x) => `${parseFloat(x) % half()}px` },
    });
  };
  roll('#ticker-track', 1);
  roll('#ticker-track-2', 1);

  /* reports feed in like paper from the platen */
  document.querySelectorAll('.report').forEach((rep) => {
    gsap.fromTo(rep, { opacity: 0.001, y: 54 }, {
      opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', immediateRender: false,
      scrollTrigger: { trigger: rep, start: 'top 87%', once: true },
    });
    const stampEl = rep.querySelector('.badge-stamp');
    if (stampEl) {
      gsap.fromTo(stampEl, { opacity: 0, scale: 2.1, rotation: 12 }, {
        opacity: 1, scale: 1, rotation: 4, duration: 0.3, ease: 'power4.in', delay: 0.5, immediateRender: false,
        scrollTrigger: { trigger: rep, start: 'top 80%', once: true },
      });
    }
  });

  /* drawers slide out slightly as they arrive */
  document.querySelectorAll('.drawer-group').forEach((grp) => {
    gsap.fromTo(grp, { opacity: 0.001, y: 26 }, {
      opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', immediateRender: false,
      scrollTrigger: { trigger: grp, start: 'top 92%', once: true },
    });
  });

  /* failsafe */
  setTimeout(() => {
    document.querySelectorAll('.report, .drawer-group, .badge-stamp').forEach((el) => {
      if (Number(getComputedStyle(el).opacity) < 0.05) gsap.set(el, { opacity: 1, y: 0, scale: 1 });
    });
  }, 4000);
} else {
  /* reduced motion: tickers stay still, everything visible */
}
