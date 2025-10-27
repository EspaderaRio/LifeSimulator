let player = {
  money: 1000,
  reputation: 0,
  stress: 0,
  age: 18,
  ownedBusinesses: []
};

let businesses = [];

const eventTitle = document.getElementById("event-title");
const eventDesc = document.getElementById("event-description");
const choices = document.getElementById("choices");

document.getElementById("next-event").addEventListener("click", nextTurn);
document.getElementById("buy-business").addEventListener("click", openBusinessMenu);

async function loadBusinesses() {
  try {
    const res = await fetch("businesses.json");
    if (!res.ok) throw new Error("Could not load businesses.json");
    businesses = await res.json();
  } catch (err) {
    console.error(err);
  }
}

function updateStats() {
  document.getElementById("money").textContent = `$${player.money.toLocaleString()}`;
  document.getElementById("reputation").textContent = `⭐ ${player.reputation}`;
  document.getElementById("age").textContent = `Age: ${player.age}`;
}

function nextTurn() {
  // Age progresses
  player.age += 1;

  // Calculate total yearly profit
  let totalProfit = 0;
  player.ownedBusinesses.forEach(b => {
    totalProfit += b.profitPerYear;
  });
  player.money += totalProfit;

  // Trigger a random life or business event
  randomEvent();

  // Stress recovery logic
  if (player.stress > 0) player.stress -= 1;

  updateStats();
}

function randomEvent() {
  const events = [
    { title: "Market Boom", desc: "The economy surges! You gain extra profit.", effect: () => player.money += 500 },
    { title: "Competition Rises", desc: "A rival business affects your sales slightly.", effect: () => player.money -= 300 },
    { title: "Networking Success", desc: "You meet influential people — reputation up!", effect: () => player.reputation += 2 },
    { title: "Burnout", desc: "Stress builds up from managing too much.", effect: () => player.stress += 3 },
  ];

  const e = events[Math.floor(Math.random() * events.length)];
  e.effect();
  eventTitle.textContent = e.title;
  eventDesc.textContent = e.desc;
}

function openBusinessMenu() {
  choices.innerHTML = "";
  eventTitle.textContent = "Buy a Business";
  eventDesc.textContent = "Each business affects money, stress, and reputation.";

  businesses.forEach(b => {
    const alreadyOwned = player.ownedBusinesses.find(x => x.name === b.name);
    if (!alreadyOwned) {
      const btn = document.createElement("button");
      btn.textContent = `${b.name} — $${b.cost}`;
      btn.onclick = () => buyBusiness(b);
      choices.appendChild(btn);
    }
  });
}

function buyBusiness(b) {
  if (player.money >= b.cost) {
    player.money -= b.cost;
    player.reputation += b.reputationImpact;
    player.stress += b.stressImpact;
    player.ownedBusinesses.push(b);
    addBusinessCard(b);

    eventTitle.textContent = `Purchased ${b.name}!`;
    eventDesc.textContent = `You gain $${b.profitPerYear}/year. Stress +${b.stressImpact}, Reputation +${b.reputationImpact}.`;
  } else {
    eventTitle.textContent = "Not Enough Funds!";
    eventDesc.textContent = "You need more money to buy this business.";
  }
  updateStats();
}

function addBusinessCard(b) {
  const grid = document.getElementById("owned-businesses");
  const card = document.createElement("div");
  card.className = "business-card";
  card.innerHTML = `
    <img src="assets/svgs/${b.image}" alt="${b.name}">
    <p>${b.name}</p>
  `;
  grid.appendChild(card);
  card.animate([{ transform: "scale(0)" }, { transform: "scale(1)" }], { duration: 300, easing: "ease-out" });
}

// Initialize
loadBusinesses().then(updateStats);
