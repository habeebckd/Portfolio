const year = new Date().getFullYear();
document.getElementById('y').textContent = year;

const labels = [['API','#7fd1ff'],['SQL','#ffd25a'],['Docker','#8be28b'],['Azure','#8aa4ff'],['JWT','#ff8fb1'],['Dapper','#ffa95a'],
  ['Review','#ff8fb1'],['Deploy','#8be28b'],['Queue','#c59bff'],['LINQ','#7fd1ff'],['Tests','#ffd25a'],['Report','#ffa95a']];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const agentCount = () => innerWidth < 700 ? 8 : labels.length;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const rnd = (a, b) => a + Math.random() * (b - a);

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
  const loaded = document.readyState === 'complete' ? Promise.resolve() : new Promise(r => addEventListener('load', r, { once: true }));
  const step = reduce ? 0 : 150;
  for (let i = 0; i < n; i++) {
    await sleep(step);
    dots.children[i].classList.add('on');
    bootN.textContent = `${pad(i + 1)}/${pad(n)}`;
  }
  await Promise.race([loaded, sleep(4000)]);
  await sleep(reduce ? 0 : 380);
  boot.classList.add('done');
  root.classList.remove('booting');
  root.classList.add('ready');
  setTimeout(() => boot.remove(), 900);
}

/* ---------- Agents: cursors that drag selection boxes around page elements ---------- */
const layer = document.getElementById('agents');
const countEl = document.getElementById('count');
const cursor = '<svg viewBox="0 0 16 16"><path d="M1 1l5.5 14 2-5.5L14 7.5z"/></svg>';
const bot = '<svg class="ic" viewBox="0 0 10 10"><rect x="1" y="2.5" width="8" height="6" rx="1.5"/><rect x="4.4" y=".4" width="1.2" height="2"/></svg>';
const targets = [
  ['.hero h1', 'Heading'], ['.intro h2', 'Subhead'], ['.blurb', 'Text'], ['.hero .btn', 'Button'], ['.stats li', 'Stat'],
  ['.title', 'Heading'], ['.side', 'Text'], ['.card', 'Card'], ['.card h3', 'Title'], ['.chips', 'Flexbox'],
  ['.num', 'Counter'], ['.rows li', 'Row'], ['.cols p', 'Text'], ['.stack', 'Grid'], ['.how li', 'Step'],
  ['.quote', 'Quote'], ['.contact form', 'Form'], ['.ship', 'Frame'], ['.eyebrow', 'Label']
];
let agents = [], running = !reduce, gen = 0;
const taken = new Set();

function sizeLayer() {
  layer.style.height = '0px';
  layer.style.height = document.documentElement.scrollHeight + 'px';
}
function move(a, x, y, ms) {
  a.el.style.transitionDuration = ms + 'ms';
  a.el.style.transform = `translate(${x}px, ${y}px)`;
}
function wanderPoint() {
  const pad = innerWidth < 700 ? 70 : 110;
  return [rnd(8, innerWidth - pad), scrollY + rnd(70, innerHeight - 90)];
}
function pickTarget() {
  const pool = [];
  for (const [sel, name] of targets) {
    for (const el of document.querySelectorAll(sel)) {
      if (taken.has(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 40 || r.height < 18) continue;
      if (r.top < 70 || r.bottom > innerHeight - 70 || r.left < 0 || r.right > innerWidth) continue;
      if (r.height > innerHeight * .7) continue;
      pool.push([el, name, r]);
    }
  }
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
}
async function select(a, g) {
  const t = pickTarget();
  if (!t) return false;
  const [el, name, r] = t;
  taken.add(el);
  const x = r.left + scrollX, y = r.top + scrollY, w = Math.round(r.width), h = Math.round(r.height);
  move(a, x - 3, y - 3, 1100);
  await sleep(1150);
  if (g !== gen) { taken.delete(el); return true; }
  const box = document.createElement('div');
  box.className = 'sel';
  box.style.cssText = `left:${x}px;top:${y}px`;
  box.innerHTML = `<span class="tab">${name}<em>${w} × ${h}</em></span><i class="h tl"></i><i class="h tr"></i><i class="h bl"></i><i class="h br"></i>`;
  layer.appendChild(box);
  a.box = box;
  box.getBoundingClientRect();
  box.style.width = w + 'px';
  box.style.height = h + 'px';
  move(a, x + w - 3, y + h - 3, 750);
  await sleep(rnd(2400, 3600));
  box.classList.add('out');
  setTimeout(() => box.remove(), 450);
  taken.delete(el);
  a.box = null;
  return true;
}
async function loop(a, g) {
  await sleep(rnd(0, 1600));
  while (running && g === gen) {
    const busy = agents.filter(x => x.box).length;
    const maxBoxes = innerWidth < 700 ? 2 : 3;
    if (busy >= maxBoxes || Math.random() < .4 || !(await select(a, g))) {
      const [x, y] = wanderPoint();
      move(a, x, y, 3000);
      await sleep(rnd(2600, 3800));
    }
  }
}
function clearBoxes() {
  layer.querySelectorAll('.sel').forEach(b => b.remove());
  taken.clear();
  agents.forEach(a => a.box = null);
}
function start() {
  gen++;
  if (running) agents.forEach(a => loop(a, gen));
}
function build() {
  gen++;
  layer.innerHTML = ''; agents = []; taken.clear();
  sizeLayer();
  labels.slice(0, agentCount()).forEach(([t, c]) => {
    const el = document.createElement('div');
    el.className = 'ag'; el.style.color = c;
    el.innerHTML = cursor + `<span>${bot}<b>${t}</b></span>`;
    layer.appendChild(el);
    const a = { el, box: null };
    const [x, y] = wanderPoint();
    move(a, x, y, 0);
    agents.push(a);
  });
  countEl.textContent = agents.length;
  start();
}

// Agents follow the visitor: after scrolling stops, the ones far off-screen glide back into view.
let scrollT;
addEventListener('scroll', () => {
  clearTimeout(scrollT);
  scrollT = setTimeout(() => {
    if (!running) return;
    agents.forEach(a => {
      if (a.box) return;
      const m = /translate\(([-\d.]+)px, ([-\d.]+)px\)/.exec(a.el.style.transform);
      const y = m ? +m[2] : 0;
      if (y < scrollY - 20 || y > scrollY + innerHeight) { const [nx, ny] = wanderPoint(); move(a, nx, ny, 1200); }
    });
  }, 160);
}, { passive: true });

let resizeT, lastW = innerWidth;
addEventListener('resize', () => {
  clearTimeout(resizeT);
  resizeT = setTimeout(() => {
    if (!booted) return;
    sizeLayer();
    if (innerWidth !== lastW) { lastW = innerWidth; build(); }
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
    agents.forEach(a => { const s = getComputedStyle(a.el).transform; a.el.style.transitionDuration = '0ms'; a.el.style.transform = s === 'none' ? a.el.style.transform : s; });
  } else start();
});

let booted = false;
runBoot().then(() => { booted = true; build(); });

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
