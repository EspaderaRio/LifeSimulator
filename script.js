// Player data
let player = {
  money: 10000,
  reputation: 0,
  stress: 0,
  happiness: 50,
  age: 18,
  ownedBusinesses: [],
  ownedLuxury: []
};

let businesses = [];
let luxuryItems = [
  { name: "Luxury House", cost: 50000, image: "house.svg", happinessImpact: 15 },
  { name: "Sports Car", cost: 30000, image: "car.svg", happinessImpact: 10 },
  { name: "Diamond Necklace", cost: 15000, image: "jewelry.svg", happinessImpact: 5 }
];

// Elements
const businessModal = document.getElementById("businessModal");
const luxuryModal = document.getElementById("luxuryModal");
const businessChoices = document.getElementById("business-choices");
const luxuryChoices = document.getElementById("luxury-choices");
const ownedBusinessGrid = document.getElementById("owned-businesses");
const ownedLuxuryGrid = document.getElementById("owned-luxury-grid");

// Event listeners
document.getElementById("open-business-tab").addEventListener("click", openBusinessTab);
document.getElementById("close-business").addEventListener("click", closeBusinessTab);
document.getElementById("open-luxury-tab").addEventListener("click", openLuxuryTab);
document.getElementById("close-luxury").addEventListener("click", closeLuxuryTab);

// Load businesses.json
async function loadBusinesses() {
  try {
    const res = await fetch("businesses.json");
    if (!res.ok) throw new Error("Failed to load businesses.json");
    businesses = await res.json();
  } catch (err) {
    console.error(err);
  }
}

// Stats & HUD
function updateStats() {
  document.getElementById("money").textContent = `$${player.money.toLocaleString()}`;
  document.getElementById("reputation-text").textContent = `⭐ ${player.reputation}`;
  document.getElementById("age").textContent = `Age: ${player.age}`;

  displayOwnedBusinesses();
  displayOwnedLuxury();

  // HUD bars
  document.getElementById("stress-fill").style.width = `${Math.min(player.stress, 100)}%`;
  document.getElementById("happiness-fill").style.width = `${Math.min(player.happiness, 100)}%`;
  document.getElementById("reputation-fill").style.width = `${Math.min(player.reputation * 5, 100)}%`;
}

// Owned Businesses
function displayOwnedBusinesses() {
  if (!ownedBusinessGrid) return;
  ownedBusinessGrid.innerHTML = "";
  player.ownedBusinesses.forEach(b => {
    const card = document.createElement("div");
    card.className = "business-card";
    card.innerHTML = `
      <img src="assets/svgs/${b.image}" alt="${b.name}">
      <p>${b.name}</p>
      <p>Stress: +${b.stressImpact}</p>
      <p>Reputation: +${b.reputationImpact}</p>
    `;
    ownedBusinessGrid.appendChild(card);
  });
}

// Owned Luxury Items
function displayOwnedLuxury() {
  if (!ownedLuxuryGrid) return;
  ownedLuxuryGrid.innerHTML = "";
  player.ownedLuxury.forEach(l => {
    const card = document.createElement("div");
    card.className = "luxury-card";
    card.innerHTML = `
      <img src="assets/svgs/${l.image}" alt="${l.name}">
      <p>${l.name}</p>
      ${l.happinessImpact ? `<p>Happiness: +${l.happinessImpact}</p>` : ""}
    `;
    ownedLuxuryGrid.appendChild(card);
  });
}

// Modals
function openBusinessTab() {
  businessChoices.innerHTML = "";
  businesses.forEach(b => {
    const btn = document.createElement("button");
    btn.textContent = `${b.name} — $${b.cost}`;
    btn.onclick = () => buyBusinessVisual(b);
    businessChoices.appendChild(btn);
  });
  businessModal.classList.remove("hidden");
}
function closeBusinessTab() { businessModal.classList.add("hidden"); }

function openLuxuryTab() {
  luxuryChoices.innerHTML = "";
  const grid = document.createElement("div");
  grid.className = "luxury-grid";
  luxuryChoices.appendChild(grid);

  luxuryItems.forEach(l => {
    const card = document.createElement("div");
    card.className = "luxury-card";
    card.innerHTML = `
      <img src="assets/svgs/${l.image}" alt="${l.name}">
      <p>${l.name}</p>
      <p>$${l.cost}</p>
      <button>Buy</button>
    `;
    card.querySelector("button").onclick = () => buyLuxuryVisual(l, card);
    grid.appendChild(card);
  });

  luxuryModal.classList.remove("hidden");
}
function closeLuxuryTab() { luxuryModal.classList.add("hidden"); }

// Purchase functions
function buyBusinessVisual(b) {
  if (player.money >= b.cost) {
    player.money -= b.cost;
    player.stress += b.stressImpact;
    player.reputation += b.reputationImpact;
    player.ownedBusinesses.push(b);
    updateStats();
    animateCardPurchase(b.image);
    alert(`Purchased ${b.name}!`);
  } else alert("Not enough money!");
}

function buyLuxuryVisual(item, card) {
  if (player.money >= item.cost) {
    player.money -= item.cost;
    player.ownedLuxury.push(item);
    player.happiness += item.happinessImpact || 0;
    updateStats();
    card.animate(
      [{ transform: "scale(0)" }, { transform: "scale(1)" }],
      { duration: 300, easing: "ease-out" }
    );
    alert(`Purchased ${item.name}!`);
  } else alert("Not enough money!");
}

// Purchase animation
function animateCardPurchase(image) {
  const sparkle = document.createElement("img");
  sparkle.src = `assets/svgs/${image}`;
  sparkle.style.position = "fixed";
  sparkle.style.width = "60px";
  sparkle.style.top = "50%";
  sparkle.style.left = "50%";
  sparkle.style.transform = "translate(-50%, -50%) scale(0)";
  sparkle.style.zIndex = "200";
  document.body.appendChild(sparkle);

  sparkle.animate(
    [
      { transform: "translate(-50%, -50%) scale(0)" },
      { transform: "translate(-50%, -50%) scale(1.5)" },
      { transform: "translate(-50%, -50%) scale(1)" }
    ],
    { duration: 500, easing: "ease-out" }
  );

  setTimeout(() => sparkle.remove(), 600);
}

// Initialize
loadBusinesses().then(updateStats);
