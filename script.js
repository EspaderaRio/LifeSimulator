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
let luxuryItems = {}; // loaded from luxury.json

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
// Load luxury.json
async function loadLuxuryItems() {
  try {
    const res = await fetch("luxury.json");
    if (!res.ok) throw new Error("Failed to load luxury.json");
    luxuryItems = await res.json();
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
    // Create card
    const card = document.createElement("div");
    card.className = "business-card";

    card.innerHTML = `
      <img src="assets/svgs/${b.image}" alt="${b.name}">
      <p>${b.name}</p>
      <p>Cost: $${b.cost}</p>
      <p>Stress: +${b.stressImpact}</p>
      <p>Reputation: +${b.reputationImpact}</p>
      <button>Buy</button>
    `;

    // Buy button
    const btn = card.querySelector("button");
    btn.onclick = () => buyBusinessVisual(b);

    businessChoices.appendChild(card);
  });

  businessModal.classList.remove("hidden");
}

function closeBusinessTab() { businessModal.classList.add("hidden"); }

function openLuxuryTab() {
  luxuryChoices.innerHTML = "";
  const categoriesDiv = document.getElementById("luxury-categories");
  categoriesDiv.innerHTML = "";

  Object.keys(luxuryItems).forEach((category, index) => {
    const btn = document.createElement("button");

    // Icon from JSON
    const icon = document.createElement("img");
    icon.src = `assets/svgs/${luxuryItems[category].icon}`;
    icon.alt = category;
    icon.style.width = "20px";
    icon.style.height = "20px";
    icon.style.marginRight = "5px";
    btn.appendChild(icon);

    btn.appendChild(document.createTextNode(category));

    if (index === 0) btn.classList.add("active");
    btn.onclick = () => {
      setActiveCategory(btn);
      displayLuxuryCategory(category);
    };

    categoriesDiv.appendChild(btn);
  });

  // Show first category by default
  const firstCategory = Object.keys(luxuryItems)[0];
  if (firstCategory) displayLuxuryCategory(firstCategory);

  luxuryModal.classList.remove("hidden");
}

function closeLuxuryTab() { luxuryModal.classList.add("hidden"); }

function setActiveCategory(activeBtn) {
  const buttons = document.querySelectorAll(".luxury-categories button");
  buttons.forEach(btn => btn.classList.remove("active"));
  activeBtn.classList.add("active");
}

// Display items for selected category
// Update displayLuxuryCategory to pull items from JSON
function displayLuxuryCategory(category) {
  const grid = document.createElement("div");
  grid.className = "luxury-grid";

  luxuryItems[category].items.forEach(item => {
    const card = document.createElement("div");
    card.className = "luxury-card";
    card.innerHTML = `
      <img src="assets/svgs/${item.image}" alt="${item.name}">
      <p>${item.name}</p>
      <p>$${item.cost}</p>
      ${item.happinessImpact ? `<p>Happiness: +${item.happinessImpact}</p>` : ""}
      <button>Buy</button>
    `;
    card.querySelector("button").onclick = () => buyLuxuryVisual(item, card);
    grid.appendChild(card);
  });

  const oldGrid = document.querySelector("#luxury-choices .luxury-grid");
  if (oldGrid) oldGrid.remove();
  luxuryChoices.appendChild(grid);
}

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

document.getElementById("advance-month").addEventListener("click", () => advanceTime("month"));
document.getElementById("advance-year").addEventListener("click", () => advanceTime("year"));

function advanceTime(type) {
  let monthsPassed = 1;
  if (!player.month) player.month = 1;

  if (type === "month") {
    player.month++;
    if (player.month > 12) {
      player.month = 1;
      player.age++;
    }
  } else if (type === "year") {
    player.age++;
    monthsPassed = 12;
  }

  // Add income & stress/reputation effects
  let totalIncome = 0;
  player.ownedBusinesses.forEach(b => {
    totalIncome += (b.profitPerYear / 12) * monthsPassed;
    player.stress += (b.stressImpact / 12) * monthsPassed;
    player.reputation += (b.reputationImpact / 12) * monthsPassed;
  });

  player.money += Math.round(totalIncome);

  // Happiness decrease if stress high
  if (player.stress > 70) player.happiness -= monthsPassed * 2;

  // Clamp values
  player.stress = Math.min(Math.max(player.stress, 0), 100);
  player.happiness = Math.min(Math.max(player.happiness, 0), 100);

  updateStats();
  alert(`Time advanced! Age: ${player.age}, Money: $${player.money}`);
}

// Initialize
loadBusinesses().then(updateStats);
