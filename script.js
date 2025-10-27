// Core game state
const state = {
  year: 1,
  money: 1000,
  reputation: 50,
  stress: 10,
  avatarSeed: Math.floor(Math.random()*1000),
};

// Utility helpers
const $ = (id) => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function formatMoney(n){
  const sign = n<0 ? '-' : '';
  return sign + '$' + Math.abs(n).toLocaleString();
}

// avatars: simple SVG generator that uses a seed
function avatarSVG(seed){
  // deterministic-ish random
  function rnd(min, max){ seed = (seed * 9301 + 49297) % 233280; const r = seed / 233280; return Math.floor(min + r*(max-min)); }
  const skin = ['#ffd7be','#ffddb3','#f1c27d','#e0ac69','#c68642'][rnd(0,5)];
  const hair = ['#1f2937','#6b4226','#2c7a7b','#b91c1c','#f59e0b'][rnd(0,5)];
  const shirt = ['#60a5fa','#6ee7b7','#f472b6','#fde68a','#a78bfa'][rnd(0,5)];

  return `
  <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Avatar">
    <rect width="120" height="120" rx="12" fill="none"/>
    <circle cx="60" cy="46" r="20" fill="${skin}"/>
    <ellipse cx="60" cy="74" rx="28" ry="18" fill="${shirt}"/>
    <path d="M42 36c6-10 30-12 36 2c0 0-2 8-18 10c-14-2-20-8-18-12z" fill="${hair}"/>
    <circle cx="52" cy="44" r="2.2" fill="#111"/>
    <circle cx="68" cy="44" r="2.2" fill="#111"/>
    <path d="M54 54 q6 6 12 0" stroke="#6b4b3b" stroke-width="1.6" fill="none" stroke-linecap="round"/>
  </svg>`;
}

// DOM refs
const yearEl = $('year'), moneyEl = $('money'), repEl = $('reputation'), stressEl = $('stress'),
      eventText = $('event-text'), choicesEl = $('choices'), avatarEl = $('avatar'),
      downloadBtn = $('download-state'), randomAvatarBtn = $('randomize-avatar'),
      illustration = $('event-illustration');

// Example event templates (flexible, will be combined into randomized choices)
const templates = [
  { title: "Competitor launches similar product", tags: ["market","competitor"] },
  { title: "Investor interested in your idea", tags: ["investment","opportunity"] },
  { title: "Key employee resigns", tags: ["hr","risk"] },
  { title: "Viral social media moment!", tags: ["marketing","opportunity"] },
  { title: "Unexpected tax audit", tags: ["legal","risk"] },
  { title: "Tech breakthrough reduces costs", tags: ["tech","opportunity"] },
];

// Action building blocks
const actions = [
  { id:'invest_marketing', label:'Invest $300 in marketing', effect:(s)=>({money:-300, reputation: +8, stress:+2})},
  { id:'ignore', label:'Ignore the issue', effect:(s)=>({reputation:-6, stress:-1})},
  { id:'accept_offer', label:'Accept investor offer (+$2000, -10% equity)', effect:(s)=>({money:+2000, reputation:+10})},
  { id:'decline_offer', label:'Politely decline', effect:(s)=>({reputation:+2, stress:-2})},
  { id:'hire_temp', label:'Hire temporary staff ($500)', effect:(s)=>({money:-500, stress:+3})},
  { id:'cover_taxes', label:'Cooperate in audit', effect:(s)=>({reputation:+10, stress:+5})},
  { id:'hide_taxes', label:'Take the risky reduction', effect:(s)=>({money:+1000, reputation:-15, stress:+10})},
  { id:'scale_up', label:'Scale up production ($800)', effect:(s)=>({money:-800, reputation:+15, stress:+6})},
  { id:'ride_trend', label:'Ride the trend (spend $200)', effect:(s)=>({money:-200, reputation:+20})},
];

// Random event generator creates a descriptive event and two choices based on tags
function makeEvent(){
  const tpl = templates[Math.floor(Math.random()*templates.length)];
  // create two choices heuristically
  let optA, optB;
  if (tpl.tags.includes('opportunity')){
    optA = actions.find(a=>a.id==='ride_trend' || a.id==='scale_up' || a.id==='accept_offer') || actions[0];
    optB = actions.find(a=>a.id==='decline_offer' || a.id==='ignore') || actions[1];
  } else if (tpl.tags.includes('market')){
    optA = actions.find(a=>a.id==='invest_marketing') || actions[0];
    optB = actions.find(a=>a.id==='ignore');
  } else if (tpl.tags.includes('legal')){
    optA = actions.find(a=>a.id==='cover_taxes');
    optB = actions.find(a=>a.id==='hide_taxes');
  } else if (tpl.tags.includes('hr')){
    optA = actions.find(a=>a.id==='hire_temp');
    optB = actions.find(a=>a.id==='ignore');
  } else if (tpl.tags.includes('tech')){
    optA = actions.find(a=>a.id==='scale_up');
    optB = actions.find(a=>a.id==='ignore');
  } else {
    optA = actions[Math.floor(Math.random()*actions.length)];
    optB = actions[Math.floor(Math.random()*actions.length)];
  }

  // if same, pick different
  if (optA.id === optB.id){
    optB = actions[Math.floor(Math.random()*actions.length)];
  }

  const description = tpl.title + ' — what will you do?';
  return {
    description,
    options: [optA, optB]
  };
}
// Business management system
let ownedBusinesses = [];

function openBusinessMenu() {
  const menu = document.getElementById('business-menu');
  menu.classList.toggle('hidden');
  renderBusinesses();
}

function renderBusinesses() {
  const list = document.getElementById('business-list');
  list.innerHTML = '';
  businesses.forEach(biz => {
    const owned = ownedBusinesses.includes(biz.name);
    list.innerHTML += `
      <div class="business-card">
        <img src="assets/${biz.image}" alt="${biz.name}">
        <h3>${biz.name}</h3>
        <p>Cost: $${biz.cost}</p>
        <p>Profit/year: $${biz.profitPerYear}</p>
        <button ${owned ? 'disabled' : ''} onclick="buyBusiness('${biz.name}')">
          ${owned ? 'Owned' : 'Buy'}
        </button>
      </div>`;
  });
}

function buyBusiness(name) {
  const biz = businesses.find(b => b.name === name);
  if (money >= biz.cost) {
    money -= biz.cost;
    ownedBusinesses.push(name);
    reputation += biz.reputationImpact;
    stress += biz.stressImpact;
    updateStats();
    renderBusinesses();
    alert(`You bought ${name}!`);
  } else {
    alert(`Not enough money to buy ${name}.`);
  }
}

// renderers
function renderState(){
  yearEl.textContent = state.year;
  moneyEl.textContent = formatMoney(state.money);
  repEl.textContent = state.reputation;
  stressEl.textContent = state.stress;
  avatarEl.innerHTML = avatarSVG(state.avatarSeed);
}

function renderEvent(ev){
  eventText.textContent = ev.description;
  illustration.innerHTML = ''; // simple placeholder, could be SVG per event
  // fill choices
  choicesEl.innerHTML = '';
  ev.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.innerHTML = `<strong>${idx+1}.</strong> ${opt.label}`;
    btn.onclick = () => {
      // apply effect
      const delta = opt.effect(state);
      state.money = Math.round((state.money + (delta.money||0))*100)/100;
      state.reputation = clamp(state.reputation + (delta.reputation||0), 0, 100);
      state.stress = clamp(state.stress + (delta.stress||0), 0, 100);
      // next year
      state.year += 1;
      // small random outcome bonus
      if (Math.random() < 0.12 && (delta.reputation||0) >= 5) { state.money +=  Math.round( (Math.random()*500 + 200) ); }
      // show small animated effect
      pulseCard(delta);
      // render new event in 700ms to allow animation
      setTimeout(()=>renderState() || renderEvent(makeEvent()), 700);
    };
    choicesEl.appendChild(btn);
  });
}

// Visual pulse to reflect outcome
function pulseCard(delta){
  const card = document.querySelector('.card');
  card.animate([
    { boxShadow: '0 12px 30px rgba(2,6,23,0.5)'},
    { boxShadow: '0 24px 60px rgba(96,165,250,0.18)', transform: 'scale(1.01)'},
    { boxShadow: '0 12px 30px rgba(2,6,23,0.5)', transform: 'scale(1)'}
  ], { duration: 600, easing: 'ease-out'});

  // show small + or - floating label
  const f = document.createElement('div');
  f.className = 'floaty';
  f.textContent = `${delta.money? (delta.money>0? '+':'')+formatMoney(delta.money) : ''} ${delta.reputation? (delta.reputation>0? '+':'')+delta.reputation+' rep' : ''}`;
  document.body.appendChild(f);
  f.animate([{opacity:1, transform:'translateY(0) scale(1)'}, {opacity:0, transform:'translateY(-40px) scale(0.85)'}], { duration:900, easing:'ease-out' });
  setTimeout(()=>f.remove(), 950);
}

// download state as json
downloadBtn.onclick = () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'businesslife-save.json';
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
};

// randomize avatar
randomAvatarBtn.onclick = ()=> {
  state.avatarSeed = Math.floor(Math.random()*9999);
  renderState();
};

// initial boot
renderState();
renderEvent(makeEvent());
