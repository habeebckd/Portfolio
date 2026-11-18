const year = new Date().getFullYear();
document.getElementById('y').textContent = year;

const labels = [['API','#7fd1ff'],['SQL','#ffd25a'],['Docker','#8be28b'],['Azure','#8aa4ff'],['JWT','#ff8fb1'],['Dapper','#ffa95a'],
  ['Review','#ff8fb1'],['Deploy','#8be28b'],['Queue','#c59bff'],['LINQ','#7fd1ff'],['Tests','#ffd25a'],['Report','#ffa95a']];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile = () => innerWidth < 700;
const agentCount = () => mobile() ? 8 : labels.length;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const rnd = (a, b) => a + Math.random() * (b - a);
const EASE = 'cubic-bezier(.25,.8,.25,1)';

/* ---------- Opening: "booting agents" loader ---------- */
const boot = document.getElementById('boot');
const root = document.documentElement;
async function runBoot() {
  const n = agentCount();
  const dots = boot.querySelector('.dots');
  const bootN = document.getElementById('bootN');
  const pad = v => String(v).padStart(2, '0');
  boot.querySelector('.boot-l').textContent = `© ${year} HABEEB RAHMAN`;
  labels.slice(0, n).forEach(([, c], i) => {
    const d = document.createElement('i');
    d.style.cssText = `--a:${(360 / n) * i}deg;--c:${c}`;
    dots.appendChild(d);
  });
  bootN.textContent = `00/${pad(n)}`;
  // Wait for the page and its fonts so nothing jumps after the reveal.
  const loaded = document.readyState === 'complete' ? Promise.resolve() : new Promise(r => addEventListener('load', r, { once: true }));
  const ready = Promise.race([Promise.all([loaded, document.fonts ? document.fonts.ready : null]), sleep(3500)]);
  const step = reduce ? 0 : 85;
  for (let i = 0; i < n; i++) {
    await sleep(step);
    dots.children[i].classList.add('on');
    bootN.textContent = `${pad(i + 1)}/${pad(n)}`;
  }
  await ready;
  await sleep(reduce ? 0 : 200);
  boot.classList.add('leaving');
  await sleep(reduce ? 0 : 260);
  boot.classList.add('done');
  root.classList.remove('booting');
  root.classList.add('ready');
  setTimeout(() => boot.remove(), 800);
}

/* ---------- Agents: cursors that drag selection boxes around page elements ---------- */
const layer = document.getElementById('agents');
const countEl = document.getElementById('count');
const cursor = '<svg viewBox="0 0 16 16"><path d="M1 1l5.5 14 2-5.5L14 7.5z"/></svg>';
const bot = '<svg class="ic" viewBox="0 0 10 10"><rect x="1" y="2.5" width="8" height="6" rx="1.5"/><rect x="4.4" y=".4" width="1.2" height="2"/></svg>';
const targets = [
  ['.hero h1', 'Heading'], ['.intro h2', 'Subhead'], ['.blurb', 'Text'], ['.hero .btn', 'Button'], ['.meta', 'Caption'], ['.stats li', 'Stat'],
  ['.title', 'Heading'], ['.side', 'Text'], ['.card', 'Card'], ['.card h3', 'Title'], ['.chips', 'Flexbox'], ['.card .top', 'Row'],
  ['.num', 'Counter'], ['.rows li', 'Row'], ['.cols p', 'Text'], ['.stack', 'Grid'], ['.how li', 'Step'],
  ['.quote', 'Quote'], ['.contact form', 'Form'], ['.ship', 'Frame'], ['.ship h3', 'Heading'], ['.eyebrow', 'Label']
];
let agents = [], running = !reduce, gen = 0, sweepY = 0;
const taken = new Set();

function sizeLayer() {
  layer.style.height = '0px';
  layer.style.height = document.documentElement.scrollHeight + 'px';
}
function move(a, x, y, ms) {
  a.x = x; a.y = y;
  a.el.style.transition = `transform ${ms}ms ${EASE}, opacity .4s ease`;
  a.el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
}
// A wait that a scroll can cut short, so idle agents react right away.
function nap(a, ms) {
  return new Promise(r => { a.wake = r; setTimeout(r, ms); });
}
function wanderPoint() {
  const pad = mobile() ? 80 : 120;
  return [rnd(8, innerWidth - pad), scrollY + rnd(80, innerHeight - 100)];
}
function candidates() {
  const pool = [];
  for (const [sel, name] of targets) {
    for (const el of document.querySelectorAll(sel)) {
      if (taken.has(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 40 || r.height < 16) continue;
      if (r.top < 64 || r.bottom > innerHeight - 70 || r.left < 0 || r.right > innerWidth) continue;
      if (r.height > innerHeight * .7) continue;
      pool.push({ el, name, r });
    }
  }
  return pool;
}
const overlaps = (a, b, m = 2) => !(a.right + m < b.left || b.right + m < a.left || a.bottom + m + 8 < b.top || b.bottom + m + 8 < a.top);
// Several elements that don't overlap, so a sweep covers the screen cleanly.
function pickMany(limit) {
  const pool = candidates().sort((p, q) => p.r.width * p.r.height - q.r.width * q.r.height);
  const out = [];
  for (const c of pool) {
    if (out.length >= limit) break;
    if (!out.some(o => overlaps(o.r, c.r) || o.el.contains(c.el) || c.el.contains(o.el))) out.push(c);
  }
  return out.sort((p, q) => p.r.top - q.r.top || p.r.left - q.r.left);
}
function pickOne() {
  const busy = [...taken].map(el => el.getBoundingClientRect());
  const pool = candidates().filter(c => !busy.some(b => overlaps(b, c.r)));
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
}

// Agent flies to the element's corner, then drags a selection box across it.
async function frame(a, t, g, reach, hold) {
  const { el, name } = t;
  taken.add(el);
  a.busy = true;
  const r = el.getBoundingClientRect();
  const x = r.left + scrollX, y = r.top + scrollY, w = Math.round(r.width), h = Math.round(r.height);
  move(a, x - 3, y - 3, reach);
  await sleep(reach);
  if (g === gen) {
    // Measure again: the element may have shifted while the agent travelled (hero entrance, scroll).
    const r2 = el.getBoundingClientRect();
    const x = r2.left + scrollX, y = r2.top + scrollY, w = Math.round(r2.width), h = Math.round(r2.height);
    if (Math.abs(a.x - (x - 3)) > 2 || Math.abs(a.y - (y - 3)) > 2) move(a, x - 3, y - 3, 150);
    const box = document.createElement('div');
    box.className = 'sel';
    box.style.cssText = `left:${x}px;top:${y}px`;
    box.innerHTML = `<span class="tab">${name}<em>${w} × ${h}</em></span><i class="h tl"></i><i class="h tr"></i><i class="h bl"></i><i class="h br"></i>`;
    layer.appendChild(box);
    void box.offsetWidth; // commit the 0×0 start so the drag animates
    setTimeout(() => {
      box.style.width = w + 'px';
      box.style.height = h + 'px';
      move(a, x + w - 3, y + h - 3, 620);
    }, 16);
    await sleep(620 + hold);
    box.classList.add('out');
    setTimeout(() => box.remove(), 400);
  }
  taken.delete(el);
  a.busy = false;
}

// Sweep: idle agents fan out together and frame everything on screen at once.
async function sweep(limit, g) {
  sweepY = scrollY;
  const free = agents.filter(a => !a.busy);
  const picks = pickMany(Math.min(limit, free.length));
  // Send each element the nearest free agent.
  const jobs = picks.map((t, i) => {
    const cx = t.r.left + scrollX, cy = t.r.top + scrollY;
    let best = 0, bd = Infinity;
    free.forEach((a, k) => { const d = (a.x - cx) ** 2 + (a.y - cy) ** 2; if (d < bd) { bd = d; best = k; } });
    const a = free.splice(best, 1)[0];
    a.busy = true;
    return sleep(i * 70).then(() => frame(a, t, g, 700, 1500 + (picks.length - i) * 60));
  });
  await Promise.all(jobs);
}

async function loop(a, g) {
  await sleep(rnd(150, 900));
  while (running && g === gen) {
    if (a.busy) { await nap(a, 300); continue; }
    const busy = agents.filter(x => x.busy).length;
    const cap = mobile() ? 2 : 3;
    const t = busy < cap && (a.eager || Math.random() < .65) ? pickOne() : null;
    a.eager = false;
    if (t) { await frame(a, t, g, 850, rnd(1600, 2600)); continue; }
    const [x, y] = wanderPoint();
    move(a, x, y, 2400);
    await nap(a, rnd(1800, 2800));
  }
}
function clearBoxes() {
  layer.querySelectorAll('.sel').forEach(b => b.remove());
  taken.clear();
  agents.forEach(a => a.busy = false);
}
function start() {
  gen++;
  const g = gen;
  if (running) agents.forEach(a => loop(a, g));
}
function build(fromCenter) {
  gen++;
  layer.innerHTML = ''; agents = []; taken.clear();
  sizeLayer();
  const cx = innerWidth / 2 - 6, cy = scrollY + innerHeight / 2 - 30;
  labels.slice(0, agentCount()).forEach(([t, c], i, arr) => {
    const el = document.createElement('div');
    el.className = 'ag'; el.style.color = c;
    el.innerHTML = cursor + `<span>${bot}<b>${t}</b></span>`;
    layer.appendChild(el);
    const a = { el, busy: false, x: 0, y: 0 };
    if (fromCenter) {
      // Start on the loader's ring, so the dots become the agents.
      const ang = (Math.PI * 2 * i) / arr.length - Math.PI / 2;
      move(a, cx + Math.cos(ang) * 36, cy + Math.sin(ang) * 36, 0);
      el.style.opacity = '0';
    } else {
      const [x, y] = wanderPoint();
      move(a, x, y, 0);
    }
    agents.push(a);
  });
  countEl.textContent = agents.length;
  if (!running) return;
  const g = gen;
  void layer.offsetWidth;
  setTimeout(async () => {
    agents.forEach(a => a.el.style.opacity = '');
    // Agents not used by the sweep drift out to random spots.
    const sweeping = sweep(mobile() ? 5 : 9, g);
    agents.filter(a => !a.busy).forEach((a, i) => setTimeout(() => { if (!a.busy) { const [x, y] = wanderPoint(); move(a, x, y, 1100); } }, i * 50));
    await sleep(900);
    if (g === gen && running) agents.forEach(a => loop(a, g));
    await sweeping;
  }, 30);
}

// After scrolling to a new part of the page, agents sweep the new view together.
let scrollT;
addEventListener('scroll', () => {
  clearTimeout(scrollT);
  scrollT = setTimeout(() => {
    if (!running || !booted) return;
    if (Math.abs(scrollY - sweepY) > innerHeight * .6) {
      sweep(mobile() ? 4 : 6, gen);
    }
    agents.forEach(a => {
      if (a.busy) return;
      if (a.y < scrollY - 20 || a.y > scrollY + innerHeight) { const [x, y] = wanderPoint(); move(a, x, y, 900); }
      a.eager = true;
      a.wake && a.wake();
    });
  }, 140);
}, { passive: true });

let resizeT, lastW = innerWidth;
addEventListener('resize', () => {
  clearTimeout(resizeT);
  resizeT = setTimeout(() => {
    if (!booted) return;
    sizeLayer();
    if (innerWidth !== lastW) { lastW = innerWidth; build(false); }
  }, 200);
});

const toggle = document.getElementById('toggle');
const stopBtn = document.getElementById('stop');
toggle.addEventListener('click', () => {
  const off = document.body.classList.toggle('off');
  toggle.querySelector('span').textContent = off ? 'AGENTS OFF' : 'AGENTS ON';
  toggle.setAttribute('aria-pressed', String(!off));
  running = !off && !reduce && !stopBtn.classList.contains('paused');
  if (off) { gen++; clearBoxes(); } else start();
});
stopBtn.addEventListener('click', () => {
  const paused = stopBtn.classList.toggle('paused');
  stopBtn.textContent = paused ? '▶ RUN' : '■ STOP';
  running = !paused && !reduce && !document.body.classList.contains('off');
  if (paused) {
    gen++;
    agents.forEach(a => { const s = getComputedStyle(a.el).transform; a.el.style.transition = 'none'; if (s !== 'none') a.el.style.transform = s; });
  } else start();
});

let booted = false;
runBoot().then(() => { booted = true; build(true); });

// Highlight the nav link of the section in view.
const links = [...document.querySelectorAll('.nav nav a')];
const obs = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) links.forEach(l => l.classList.toggle('on', l.hash === '#' + e.target.id));
}), { rootMargin: '-45% 0px -50% 0px' });
['home','work','about','contact'].forEach(id => obs.observe(document.getElementById(id)));

// Contact form opens the visitor's email app with the message filled in.
document.getElementById('form').addEventListener('submit', e => {
  e.preventDefault();
  const f = new FormData(e.target);
  const body = `${f.get('msg')}\n\nFrom: ${f.get('name')} (${f.get('email')})`;
  location.href = `mailto:habee0483.4@gmail.com?subject=${encodeURIComponent('Portfolio message from ' + f.get('name'))}&body=${encodeURIComponent(body)}`;
});
