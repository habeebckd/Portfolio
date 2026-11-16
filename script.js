document.getElementById('y').textContent = new Date().getFullYear();

// Floating "agent" tags that drift around the page like live cursors.
const labels = [['API','#7fd1ff'],['SQL','#ffd25a'],['Docker','#8be28b'],['Azure','#8aa4ff'],['JWT','#ff8fb1'],['Dapper','#ffa95a'],
  ['Review','#ff8fb1'],['Deploy','#8be28b'],['Queue','#c59bff'],['LINQ','#7fd1ff'],['Tests','#ffd25a'],['Report','#ffa95a']];
const layer = document.getElementById('agents');
const countEl = document.getElementById('count');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
let timer, agents = [];
const cursor = '<svg viewBox="0 0 16 16"><path d="M1 1l5.5 14 2-5.5L14 7.5z"/></svg>';
function rnd(max){ return Math.random() * max; }
function place(el){ el.style.transform = `translate(${rnd(innerWidth - 110)}px, ${rnd(innerHeight - 60)}px)`; }
function build(){
  layer.innerHTML = ''; agents = [];
  const n = innerWidth < 700 ? 6 : labels.length;
  labels.slice(0, n).forEach(([t, c]) => {
    const el = document.createElement('div');
    el.className = 'ag'; el.style.color = c; el.style.opacity = '.9';
    el.innerHTML = cursor + `<span><b>${t}</b></span>`;
    place(el); layer.appendChild(el); agents.push(el);
  });
  countEl.textContent = agents.length;
}
function run(){ clearInterval(timer); if (!reduce) timer = setInterval(() => agents.forEach(place), 3400); }
build(); run();
const toggle = document.getElementById('toggle');
toggle.addEventListener('click', () => {
  const off = document.body.classList.toggle('off');
  toggle.textContent = off ? 'AGENTS OFF' : 'AGENTS ON';
  toggle.setAttribute('aria-pressed', String(!off));
  off ? clearInterval(timer) : run();
});
document.getElementById('stop').addEventListener('click', () => {
  clearInterval(timer); agents.forEach(a => a.style.transition = 'none');
  setTimeout(() => agents.forEach(a => a.style.transition = ''), 50);
});
addEventListener('resize', () => { build(); run(); });

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
