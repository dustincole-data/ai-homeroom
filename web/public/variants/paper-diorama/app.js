/* ═══════════════════════════════════════════════════════════════════
   THE DIORAMA — construction-paper world for the day's AI news.
   CSS-3D paper scene · three.js paper airplane · GSAP choreography.
   ═══════════════════════════════════════════════════════════════════ */
import * as THREE from 'three';

const { stories, glossary, generatedAt } = window.HOMEROOM;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── helpers ─────────────────────────────────────────────────── */
const hashStr = (s) => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 7);
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
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

/* ── edition date ────────────────────────────────────────────── */
document.getElementById('edition-date').textContent = new Intl.DateTimeFormat('en-US', {
  weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
}).format(new Date(generatedAt));
document.getElementById('story-count').textContent = stories.length;

/* ── sun rays + bunting flags (procedural SVG bits) ──────────── */
const raysGroup = document.getElementById('rays');
if (raysGroup) {
  const RAYS = 12;
  raysGroup.innerHTML = Array.from({ length: RAYS }, (_, i) => {
    const a = (i / RAYS) * Math.PI * 2;
    const inner = 72, outer = 104, half = 0.11;
    const p1 = [Math.cos(a - half) * inner, Math.sin(a - half) * inner];
    const p2 = [Math.cos(a + half) * inner, Math.sin(a + half) * inner];
    const p3 = [Math.cos(a) * outer, Math.sin(a) * outer];
    return `<polygon points="${p1} ${p2} ${p3}" />`;
  }).join('');
}

const flagsGroup = document.getElementById('flags');
if (flagsGroup) {
  const COLORS = ['#e2543a', '#f5b73a', '#3f9e5c', '#e88bab', '#a7c7e7'];
  const N = 9;
  flagsGroup.innerHTML = Array.from({ length: N }, (_, i) => {
    const t = (i + 0.5) / N;
    // quadratic bezier M2,6 Q260,30 518,6
    const x = (1 - t) ** 2 * 2 + 2 * (1 - t) * t * 260 + t ** 2 * 518;
    const y = (1 - t) ** 2 * 6 + 2 * (1 - t) * t * 30 + t ** 2 * 6;
    const c = COLORS[i % COLORS.length];
    return `<polygon points="${x - 9},${y} ${x + 9},${y} ${x},${y + 22}" fill="${c}" />`;
  }).join('');
}

/* ── craft cards ─────────────────────────────────────────────── */
const PATCHES = ['#e2543a', '#f5b73a', '#3f9e5c', '#e88bab', '#5a7fd6', '#c8a06a'];
const cardDate = (iso) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(iso));

document.getElementById('cards').innerHTML = stories.map((story, i) => {
  const rng = mulberry32(hashStr(story.headline));
  const tilt = (rng() * 2.4 - 1.2).toFixed(2);
  const featured = i === 0;
  const patch = PATCHES[i % PATCHES.length];
  return `
  <article class="craft-card${featured ? ' featured' : ''}" id="story-${i}" style="--tilt:${tilt}deg" aria-label="Story ${i + 1}">
    <span class="card-patch" style="background:${patch}" aria-hidden="true"></span>
    <span class="sticker ${story.badge}" aria-label="${story.badge} story">${story.badge === 'new' ? '★ new' : '↻ upd'}</span>
    <p class="card-topline"><span class="source-chip">${escapeHtml(story.sourceName)}</span></p>
    <h3>${escapeHtml(story.headline)}</h3>
    <p class="summary">${markTerms(story.summary)}</p>
    <p class="why"><strong>Why it matters</strong><br/>${escapeHtml(story.whyItMatters)}</p>
    <div class="card-footer">
      <a class="article-link" href="${escapeHtml(story.sourceUrl)}" target="_blank" rel="noreferrer">Original source: ${escapeHtml(story.sourceName)} ↗</a>
      <span class="card-date">${cardDate(story.publishedAt)}</span>
      <button type="button" class="card-listen" data-story="${i}" hidden>▶ Listen</button>
    </div>
  </article>`;
}).join('');

/* ── word wall ───────────────────────────────────────────────── */
const allTerms = [...glossary].sort((a, b) => a.term.localeCompare(b.term));
document.getElementById('term-count').textContent = allTerms.length;

const groups = new Map();
for (const t of allTerms) {
  const letter = t.term[0].toUpperCase();
  if (!groups.has(letter)) groups.set(letter, []);
  groups.get(letter).push(t);
}

document.getElementById('wall-body').innerHTML = [...groups.entries()].map(([letter, terms]) => `
  <section class="wall-letter-group" aria-label="Terms starting with ${letter}">
    <h3 class="wall-letter">${letter}</h3>
    <dl class="wall-columns">
      ${terms.map((t) => {
        const tilt = ((hashStr(t.term) % 100) / 100 * 1.6 - 0.8).toFixed(2);
        return `
        <div class="wall-card" id="${glossaryTermId(t.term)}" style="--tilt:${tilt}deg">
          <dt>${escapeHtml(t.term)}</dt>
          <dd>${escapeHtml(t.definition)}</dd>
        </div>`;
      }).join('')}
    </dl>
  </section>`).join('');

function litFromHash() {
  const hash = decodeURIComponent(window.location.hash.slice(1));
  if (!hash) return;
  const el = document.getElementById(hash);
  if (el?.classList.contains('wall-card')) {
    document.querySelectorAll('.wall-card.lit').forEach((e) => e.classList.remove('lit'));
    el.classList.add('lit');
  }
}
window.addEventListener('hashchange', litFromHash);
litFromHash();

/* ── flashcard tooltip ───────────────────────────────────────── */
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
  tooltip.style.transform = `translate(${x}px, ${y}px) rotate(-0.5deg)`;
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
   THE INTERCOM — the lesson, read aloud.
   Browser-native speech synthesis: no key, no network, no cost.
   ═══════════════════════════════════════════════════════════════ */
const synth = window.speechSynthesis;

/* Say it the way a teacher would: initialisms get spelled, domains get
   "dot", money gets said in full. TTS engines mangle all three. */
const SAY = [
  [/\bAI\b/g, 'A.I.'],
  [/\bLLMs\b/g, 'L.L.M.s'], [/\bLLM\b/g, 'L.L.M.'],
  [/\bAPIs\b/g, 'A.P.I.s'], [/\bAPI\b/g, 'A.P.I.'],
  [/\bCLI\b/g, 'C.L.I.'], [/\bMCP\b/g, 'M.C.P.'], [/\bRAG\b/g, 'rag'],
  [/\bGPUs\b/g, 'G.P.U.s'], [/\bGPU\b/g, 'G.P.U.'],
  [/\bRSS\b/g, 'R.S.S.'], [/\bCEO\b/g, 'C.E.O.'],
  [/\$(\d+(?:\.\d+)?)\s?M\b/g, '$1 million dollars'],
  [/\$(\d+(?:\.\d+)?)\s?B\b/g, '$1 billion dollars'],
  [/\$(\d+(?:\.\d+)?)\s?K\b/g, '$1 thousand dollars'],
  [/\b([a-z0-9-]+)\.(com|ai|org|net|io|dev|computer|technology|co)\b/gi, '$1 dot $2'],
  [/[—–]/g, ', '],
  [/["“”]/g, ''],
  [/\s+/g, ' '],
];
const speakable = (text) => SAY.reduce((s, [re, to]) => s.replace(re, to), text).trim();

const ORDINAL = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'];

/* Build the lesson script: an ordered list of {storyIndex, text} segments. */
function buildScript() {
  const spokenDate = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date(generatedAt));
  const segments = [{
    storyIndex: null,
    text: `Good morning, and welcome to A.I. Homeroom for ${spokenDate}. We have ${stories.length} ${stories.length === 1 ? 'story' : 'stories'} on the board today. Here is what actually happened, and why it matters.`,
  }];

  stories.forEach((story, i) => {
    const nth = ORDINAL[i] ?? `number ${i + 1}`;
    segments.push({
      storyIndex: i,
      text: speakable(
        `Story the ${nth}, from ${story.sourceName}. ${story.headline}. ` +
        `${story.summary} ` +
        `Why it matters. ${story.whyItMatters}`,
      ),
    });
  });

  segments.push({
    storyIndex: null,
    text: 'And that is today’s lesson. Every story links to its original source on the page, so you can read the whole thing when you are back at a screen. Class dismissed.',
  });
  return segments;
}

/* Chrome truncates long utterances; feed it a sentence at a time. */
function chunk(text, max = 180) {
  const out = [];
  for (const sentence of text.match(/[^.!?]+[.!?]*\s*/g) ?? [text]) {
    if (sentence.length <= max) { out.push(sentence.trim()); continue; }
    let line = '';
    for (const word of sentence.split(/\s+/)) {
      if ((line + ' ' + word).trim().length > max) { out.push(line.trim()); line = word; }
      else line = (line + ' ' + word).trim();
    }
    if (line) out.push(line.trim());
  }
  return out.filter(Boolean);
}

if (synth && stories.length) {
  const segments = buildScript();
  /* flatten to chunks, remembering which story each belongs to */
  const queue = segments.flatMap((seg) => chunk(seg.text).map((text) => ({ text, storyIndex: seg.storyIndex })));
  const totalWords = queue.reduce((n, q) => n + q.text.split(/\s+/).length, 0);

  const el = {
    intercom: document.getElementById('intercom'),
    cta: document.getElementById('listen-cta'),
    runtime: document.getElementById('cta-runtime'),
    now: document.getElementById('intercom-now'),
    bar: document.getElementById('intercom-bar'),
    play: document.getElementById('btn-play'),
    prev: document.getElementById('btn-prev'),
    next: document.getElementById('btn-next'),
    stop: document.getElementById('btn-stop'),
    voice: document.getElementById('voice-select'),
    rate: document.getElementById('rate-select'),
    onAir: document.getElementById('on-air'),
  };

  /* runtime estimate at ~155 wpm */
  const minutes = Math.max(1, Math.round(totalWords / 155));
  el.runtime.textContent = `${minutes} min`;
  el.cta.hidden = false;
  document.querySelectorAll('.card-listen').forEach((b) => { b.hidden = false; });

  let cursor = 0;
  let playing = false;
  let voices = [];
  let keepAlive = null;

  /* Voices arrive asynchronously in Chrome. */
  function loadVoices() {
    voices = synth.getVoices().filter((v) => v.lang?.toLowerCase().startsWith('en'));
    if (!voices.length) return;
    const preferred = [/natural/i, /google us english/i, /aria/i, /jenny/i, /samantha/i, /zira/i];
    const ranked = [...voices].sort((a, b) => {
      const score = (v) => preferred.findIndex((re) => re.test(v.name));
      const sa = score(a), sb = score(b);
      return (sa < 0 ? 99 : sa) - (sb < 0 ? 99 : sb);
    });
    el.voice.innerHTML = ranked
      .map((v, i) => `<option value="${escapeHtml(v.name)}"${i === 0 ? ' selected' : ''}>${escapeHtml(v.name.replace(/^Microsoft /, '').replace(/ - English.*$/, ''))}</option>`)
      .join('');
  }
  loadVoices();
  synth.addEventListener?.('voiceschanged', loadVoices);

  const currentVoice = () => voices.find((v) => v.name === el.voice.value) ?? null;

  function highlight(storyIndex) {
    document.querySelectorAll('.craft-card.now-reading').forEach((c) => c.classList.remove('now-reading'));
    if (storyIndex === null || storyIndex === undefined) {
      el.now.textContent = 'Homeroom announcements';
      return;
    }
    const card = document.getElementById(`story-${storyIndex}`);
    if (!card) return;
    card.classList.add('now-reading');
    el.now.textContent = `Story ${storyIndex + 1} of ${stories.length} — ${stories[storyIndex].sourceName}`;
    card.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  function progress() {
    el.bar.style.width = `${(cursor / queue.length) * 100}%`;
  }

  function speakAt(i) {
    if (i >= queue.length) { stop(); return; }
    cursor = i;
    progress();
    const item = queue[i];
    if (i === 0 || item.storyIndex !== queue[i - 1]?.storyIndex) highlight(item.storyIndex);

    const u = new SpeechSynthesisUtterance(item.text);
    const v = currentVoice();
    if (v) { u.voice = v; u.lang = v.lang; }
    u.rate = Number(el.rate.value);
    u.pitch = 1;
    u.onend = () => { if (playing) speakAt(i + 1); };
    u.onerror = (e) => { if (e.error !== 'interrupted' && e.error !== 'canceled' && playing) speakAt(i + 1); };
    synth.speak(u);
  }

  /* Chrome silently stops speaking after ~15s unless nudged. */
  function startKeepAlive() {
    clearInterval(keepAlive);
    keepAlive = setInterval(() => {
      if (!playing) return;
      if (synth.speaking && !synth.paused) { synth.pause(); synth.resume(); }
    }, 9000);
  }

  function play(from = cursor) {
    synth.cancel();
    playing = true;
    el.intercom.hidden = false;
    el.play.textContent = '⏸';
    el.play.setAttribute('aria-label', 'Pause');
    el.onAir.classList.add('live');
    startKeepAlive();
    speakAt(from);
  }

  function pause() {
    playing = false;
    synth.cancel();
    el.play.textContent = '▶';
    el.play.setAttribute('aria-label', 'Play');
    el.onAir.classList.remove('live');
    clearInterval(keepAlive);
  }

  function stop() {
    pause();
    cursor = 0;
    progress();
    el.intercom.hidden = true;
    document.querySelectorAll('.craft-card.now-reading').forEach((c) => c.classList.remove('now-reading'));
  }

  /* jump to the first chunk of a story (or the intro) */
  const firstChunkOf = (storyIndex) => queue.findIndex((q) => q.storyIndex === storyIndex);
  function jumpStory(delta) {
    const here = queue[cursor]?.storyIndex;
    const base = here === null || here === undefined ? (delta > 0 ? -1 : 0) : here;
    const target = Math.min(stories.length - 1, Math.max(0, base + delta));
    const at = firstChunkOf(target);
    if (at >= 0) play(at);
  }

  el.cta.addEventListener('click', () => play(0));
  el.play.addEventListener('click', () => (playing ? pause() : play(cursor)));
  el.prev.addEventListener('click', () => jumpStory(-1));
  el.next.addEventListener('click', () => jumpStory(1));
  el.stop.addEventListener('click', stop);
  el.rate.addEventListener('change', () => { if (playing) play(cursor); });
  el.voice.addEventListener('change', () => { if (playing) play(cursor); });
  document.addEventListener('click', (e) => {
    const btn = e.target.closest?.('.card-listen');
    if (!btn) return;
    const at = firstChunkOf(Number(btn.dataset.story));
    if (at >= 0) play(at);
  });
  window.addEventListener('pagehide', () => synth.cancel());
  window.addEventListener('beforeunload', () => synth.cancel());
}

/* ═══════════════════════════════════════════════════════════════
   PAPER AIRPLANE — three.js, folded from eight triangles,
   flying a scroll-driven route through the diorama.
   ═══════════════════════════════════════════════════════════════ */
const canvas = document.getElementById('plane-canvas');
let renderer = null;
if (!reduceMotion) {
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  } catch { /* no WebGL: the paper world stands on its own */ }
}

if (renderer) {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50);
  camera.position.set(0, 0, 9);

  scene.add(new THREE.AmbientLight(0xffffff, 1.5));
  const sunLight = new THREE.DirectionalLight(0xfff2d8, 1.3);
  sunLight.position.set(4, 6, 6);
  scene.add(sunLight);

  /* fold the plane: nose +z */
  function paperPlane() {
    const nose = [0, 0, 1.5];
    const tailT = [0, 0.12, -1.15];
    const tailB = [0, -0.42, -1.0];
    const tipL = [-1.25, 0.22, -1.25];
    const tipR = [1.25, 0.22, -1.25];
    const innerL = [-0.09, -0.02, -1.2];
    const innerR = [0.09, -0.02, -1.2];
    const tris = [
      [nose, tipL, innerL],   // left wing
      [nose, innerR, tipR],   // right wing
      [nose, innerL, tailT],  // left inner fold
      [nose, tailT, innerR],  // right inner fold
      [nose, tailB, tailT],   // keel fin
    ];
    const pos = new Float32Array(tris.flat(2));
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.computeVertexNormals();
    const mat = new THREE.MeshStandardMaterial({
      color: 0xfaf7ef, roughness: 0.9, metalness: 0,
      side: THREE.DoubleSide, flatShading: true,
    });
    return new THREE.Mesh(geo, mat);
  }
  const plane = paperPlane();
  const rig = new THREE.Group();
  rig.add(plane);
  scene.add(rig);

  /* route in viewport-fraction coordinates (x: 0 left → 1 right, y: 0 top → 1 bottom) */
  const ROUTE = [
    [1.18, 0.16], [0.86, 0.09], [0.30, 0.13], [-0.06, 0.34],
    [0.10, 0.78], [0.62, 0.90], [1.08, 0.66], [0.90, 0.12],
    [0.42, 0.06], [0.06, 0.52], [0.55, 0.93], [-0.22, 0.62],
  ];

  let vw = 1, vh = 1, worldW = 1, worldH = 1;
  function resize() {
    vw = window.innerWidth; vh = window.innerHeight;
    renderer.setSize(vw, vh, false);
    camera.aspect = vw / vh;
    camera.updateProjectionMatrix();
    worldH = 2 * camera.position.z * Math.tan((camera.fov * Math.PI) / 360);
    worldW = worldH * camera.aspect;
  }
  resize();
  window.addEventListener('resize', resize);

  const toWorld = ([fx, fy]) => new THREE.Vector3((fx - 0.5) * worldW, (0.5 - fy) * worldH, 0);

  const curve = new THREE.CatmullRomCurve3(ROUTE.map(toWorld));
  window.addEventListener('resize', () => { curve.points = ROUTE.map(toWorld); });

  let progress = 0, target = 0;
  function scrollProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    return max > 0 ? window.scrollY / max : 0;
  }
  window.addEventListener('scroll', () => { target = scrollProgress(); }, { passive: true });
  target = scrollProgress();
  progress = target;

  const clock = new THREE.Clock();
  let running = true;

  function frame() {
    const t = clock.getElapsedTime();
    progress += (target - progress) * 0.045;

    const p = curve.getPointAt(THREE.MathUtils.clamp(progress, 0, 1));
    const ahead = curve.getPointAt(THREE.MathUtils.clamp(progress + 0.012, 0, 1));

    /* gentle idle bob layered on the route */
    const bob = Math.sin(t * 1.7) * 0.06;
    rig.position.set(p.x, p.y + bob, 0);
    rig.lookAt(ahead.x, ahead.y + bob, 0.6);

    /* bank into turns */
    const dx = ahead.x - p.x;
    const roll = THREE.MathUtils.clamp(-dx * 2.2, -0.9, 0.9);
    plane.rotation.z = plane.rotation.z * 0.92 + roll * 0.08;

    const s = Math.min(0.72, 0.44 + worldW * 0.016);
    rig.scale.setScalar(s);

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
   CHOREOGRAPHY — GSAP
   ═══════════════════════════════════════════════════════════════ */
if (!reduceMotion && window.gsap) {
  gsap.registerPlugin(ScrollTrigger);

  /* hero: paper settles onto the board */
  gsap.fromTo('.hero-kicker', { opacity: 0, y: -14 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.15 });
  gsap.fromTo('.hero .diecut', { opacity: 0, scale: 0.94, y: 18 }, { opacity: 1, scale: 1, y: 0, duration: 0.9, ease: 'power4.out', delay: 0.3 });
  gsap.fromTo('.hero .dek, .session-tape, .hero-actions', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: 'power3.out', delay: 0.55 });
  gsap.fromTo('.cloud', { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 1.2, stagger: 0.2, ease: 'power2.out', delay: 0.2 });
  gsap.fromTo('.sun', { opacity: 0, scale: 0.7, transformOrigin: 'center' }, { opacity: 1, scale: 1, duration: 1.1, ease: 'power3.out', delay: 0.45 });

  /* environment: perpetual gentle motion */
  gsap.to('.sun-rays', { rotation: 360, duration: 140, ease: 'none', repeat: -1, transformOrigin: 'center' });
  document.querySelectorAll('.cloud').forEach((c, i) => {
    gsap.to(c, { y: '+=9', rotation: i % 2 ? 1.2 : -1.4, duration: 3.4 + i * 0.7, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: i * 0.5 });
  });

  /* hills parallax while the hero scrolls away */
  gsap.to('.hill-back', { yPercent: 34, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hill-mid', { yPercent: 18, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* cards: settle in with a paper drop */
  document.querySelectorAll('.craft-card').forEach((card) => {
    gsap.fromTo(card, { opacity: 0.001, y: 44 }, {
      opacity: 1, y: 0, duration: 0.85, ease: 'power3.out', immediateRender: false,
      scrollTrigger: { trigger: card, start: 'top 88%', once: true },
    });
  });

  /* word wall letters pop */
  document.querySelectorAll('.wall-letter-group').forEach((grp) => {
    gsap.fromTo(grp, { opacity: 0.001, y: 26 }, {
      opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', immediateRender: false,
      scrollTrigger: { trigger: grp, start: 'top 92%', once: true },
    });
  });

  /* failsafe */
  setTimeout(() => {
    document.querySelectorAll('.craft-card, .wall-letter-group').forEach((el) => {
      if (Number(getComputedStyle(el).opacity) < 0.05) gsap.set(el, { opacity: 1, y: 0 });
    });
  }, 4000);
}
