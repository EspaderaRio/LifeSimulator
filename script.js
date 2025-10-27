// Player data
let player = {
  money: 10000,
  reputation: 0,
  stress: 0,
  age: 18,
  ownedBusinesses: [],
  ownedLuxury: []
};

let businesses = [];
let luxuryItems = [
  { name: "Luxury House", cost: 50000, image: "house.svg" },
  { name: "Sports Car", cost: 30000, image: "car.svg" },
  { name: "Diamond Necklace", cost: 15000, image: "jewelry.svg" }
];

// Elements
const businessModal = document.getElementById("businessModal");
const luxuryModal = document.getElementById("luxuryModal");
const businessChoices = document.getElementById("business-choices");
const luxuryChoices = document.getElementById("luxury-choices");
const ownedBusinessGrid = document.getElementById("owned-businesses");

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

// Stats
function updateStats() {
  document.getElementById("money").textContent = `$${player.money.toLocaleString()}`;
  document.getElementById("reputation").textContent = `⭐ ${player.reputation}`;
  document.getElementById("age").textContent = `Age: ${player.age}`;
  displayOwnedBusinesses();
  displayOwnedLuxury();
}

// Owned Businesses Dashboard
function displayOwnedBusinesses() {
  ownedBusinessGrid.innerHTML = "";
  player.ownedBusinesses.forEach(b => {
    const card = document.createElement("div");
    card.className = "business-card";
    card.innerHTML = `
      <img src="assets/svgs/${b.image}" alt="${b.name}">
      <p>${b.name}</p>
    `;
    ownedBusinessGrid.appendChild(card);
  });
}

// Owned Luxury Dashboard
function displayOwnedLuxury() {
  let luxuryGrid = document.getElementById("owned-luxury-grid");
  if (!luxuryGrid) {
    luxuryGrid = document.createElement("div");
    luxuryGrid.id = "owned-luxury-grid";
    luxuryGrid.className = "luxury-grid";
    document.querySelector(".game-container main").appendChild(luxuryGrid);
  }
  luxuryGrid.innerHTML = "";
  player.ownedLuxury.forEach(l => {
    const card = document.createElement("div");
    card.className = "luxury-card";
    card.innerHTML = `
      <img src="assets/svgs/${l.image}" alt="${l.name}">
      <p>${l.name}</p>
    `;
    luxuryGrid.appendChild(card);
  });
}

// Open/Close Functions
function openBusinessTab() {
  businessChoices.innerHTML = "";
  businesses.forEach(b => {
    const btn = document.createElement("button");
    btn.textContent = `${b.name} — $${b.cost}`;
    btn.onclick = () => buyBusiness(b);
    businessChoices.appendChild(btn);
  });
  businessModal.classList.remove("hidden");
}

function closeBusinessTab() {
  businessModal.classList.add("hidden");
}

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
    const btn = card.querySelector("button");
    btn.onclick = () => buyLuxuryVisual(l, card);
    grid.appendChild(card);
  });

  luxuryModal.classList.remove("hidden");
}

function closeLuxuryTab() {
  luxuryModal.classList.add("hidden");
}

// Purchase Functions
function buyBusiness(b) {
  if (player.money >= b.cost) {
    player.money -= b.cost;
    player.ownedBusinesses.push(b);
    alert(`Purchased ${b.name}!`);
    updateStats();
  } else {
    alert("Not enough money!");
  }
}

function buyLuxuryVisual(item, card) {
  if (player.money >= item.cost) {
    player.money -= item.cost;
    player.ownedLuxury.push(item);
    updateStats();
    // animate card
    card.animate(
      [{ transform: "scale(0)" }, { transform: "scale(1)" }],
      { duration: 300, easing: "ease-out" }
    );
    alert(`Purchased ${item.name}!`);
  } else {
    alert("Not enough money!");
  }
}

// Initialize
loadBusinesses().then(updateStats);
