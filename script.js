/* ============================================================
BUSINESSLIFE SIMULATOR (Optimized v2)
============================================================ */

// ===================== PLAYER DATA ===================== //
let player = {
money: 10000,
reputation: 0,
stress: 0,
happiness: 50,
age: 18,
month: 1,
ownedBusinesses: [],
ownedLuxury: []
};

// ===================== GLOBAL VARIABLES ===================== //
let businesses = [];
let luxuryItems = {};

const businessModal = document.getElementById("businessModal");
const luxuryModal = document.getElementById("luxuryModal");
const lifeModal = document.getElementById("lifeModal");

const businessChoices = document.getElementById("business-choices");
const luxuryChoices = document.getElementById("luxury-choices");
const lifeChoices = document.getElementById("life-choices");

const ownedBusinessGrid = document.getElementById("owned-businesses");
const ownedLuxuryGrid = document.getElementById("owned-luxury-grid");

// ===================== UTILITY FUNCTIONS ===================== //
function clampStats() {
player.stress = Math.min(Math.max(player.stress, 0), 100);
player.happiness = Math.min(Math.max(player.happiness, 0), 100);
player.reputation = Math.min(Math.max(player.reputation, 0), 100);
}

function showToast(msg) {
const existing = document.querySelector(".toast");
if (existing) existing.remove();

const toast = document.createElement("div");
toast.className = "toast";
toast.textContent = msg;
document.body.appendChild(toast);

setTimeout(() => toast.remove(), 2000);
}

function animateCardPurchase(image) {
const sparkle = document.createElement("img");
sparkle.src = `assets/svgs/${image || "default.svg"}`;
sparkle.className = "purchase-animation";
document.body.appendChild(sparkle);

sparkle.animate(
[
{ transform: "translate(-50%, -50%) scale(0)", opacity: 0 },
{ transform: "translate(-50%, -50%) scale(1.5)", opacity: 1 },
{ transform: "translate(-50%, -50%) scale(1)", opacity: 0 }
],
{ duration: 600, easing: "ease-out" }
);

setTimeout(() => sparkle.remove(), 600);
}

// ===================== HUD UPDATE ===================== //
function updateStats() {
clampStats();

document.getElementById("money").textContent = `$${player.money.toLocaleString()}`;
document.getElementById("reputation-text").textContent = `⭐ ${player.reputation}`;
document.getElementById("age").textContent = `Age: ${player.age}`;
document.getElementById("month").textContent = `Month: ${player.month}`;

const happinessFill = document.getElementById("happiness-fill");
const stressFill = document.getElementById("stress-fill");
const repFill = document.getElementById("reputation-fill");

happinessFill.style.width = `${player.happiness}%`;
stressFill.style.width = `${player.stress}%`;
repFill.style.width = `${player.reputation}%`;

happinessFill.style.backgroundColor =
player.happiness > 70 ? "#4CAF50" :
player.happiness > 40 ? "#FFC107" : "#E53935";

stressFill.style.backgroundColor =
player.stress > 70 ? "#E53935" :
player.stress > 40 ? "#FFC107" : "#4CAF50";

displayOwnedBusinesses();
displayOwnedLuxury();
}

// ===================== BUSINESS HANDLERS ===================== //
async function loadBusinesses() {
try {
const res = await fetch("businesses.json");
if (!res.ok) throw new Error("Failed to load businesses.json");
businesses = await res.json();
} catch (err) {
console.error(err);
}
}

function openBusinessTab() {
businessChoices.innerHTML = "";

businesses.forEach(b => {
const card = document.createElement("div");
card.className = "business-card";
card.innerHTML = `       <img src="assets/svgs/${b.image || "default.svg"}" alt="${b.name}">       <p>${b.name}</p>       <p>Cost: $${b.cost}</p>       <p>Stress: +${b.stressImpact}</p>       <p>Reputation: +${b.reputationImpact}</p>       <button>Buy</button>
    `;
card.querySelector("button").onclick = () => buyBusiness(b);
businessChoices.appendChild(card);
});

businessModal.classList.remove("hidden");
}

function closeBusinessTab() {
businessModal.classList.add("hidden");
}

function buyBusiness(b) {
const owned = player.ownedBusinesses.some(x => x.name === b.name);
if (owned) return showToast(`You already own ${b.name}!`);

if (player.money < b.cost) return showToast("Not enough money!");

player.money -= b.cost;
player.stress += b.stressImpact;
player.reputation += b.reputationImpact;
player.ownedBusinesses.push(b);

animateCardPurchase(b.image);
updateStats();
showToast(`Purchased ${b.name}!`);
}

function displayOwnedBusinesses() {
ownedBusinessGrid.innerHTML = "";
player.ownedBusinesses.forEach(b => {
const card = document.createElement("div");
card.className = "business-card";
card.innerHTML = `       <img src="assets/svgs/${b.image || "default.svg"}" alt="${b.name}">       <p>${b.name}</p>       <p>Stress: +${b.stressImpact}</p>       <p>Reputation: +${b.reputationImpact}</p>
    `;
ownedBusinessGrid.appendChild(card);
});
}

// ===================== LUXURY HANDLERS ===================== //
async function loadLuxuryItems() {
try {
const res = await fetch("luxury.json");
if (!res.ok) throw new Error("Failed to load luxury.json");
luxuryItems = await res.json();
} catch (err) {
console.error(err);
}
}

function openLuxuryTab() {
luxuryChoices.innerHTML = "";
const categoriesDiv = document.getElementById("luxury-categories");
categoriesDiv.innerHTML = "";

Object.keys(luxuryItems).forEach((category, index) => {
const catData = luxuryItems[category];
const btn = document.createElement("button");
btn.className = "luxury-category-btn";

```
const icon = document.createElement("img");
icon.src = `assets/svgs/${catData.icon || "default.svg"}`;
icon.alt = category;
icon.style.width = "24px";
icon.style.height = "24px";
icon.style.marginRight = "6px";

btn.appendChild(icon);
btn.appendChild(document.createTextNode(category));
if (index === 0) btn.classList.add("active");

btn.onclick = () => {
  setActiveCategory(btn);
  displayLuxuryCategory(category);
};
categoriesDiv.appendChild(btn);
```

});

const firstCategory = Object.keys(luxuryItems)[0];
if (firstCategory) displayLuxuryCategory(firstCategory);

luxuryModal.classList.remove("hidden");
}

function closeLuxuryTab() {
luxuryModal.classList.add("hidden");
}

function setActiveCategory(activeBtn) {
document.querySelectorAll("#luxury-categories button").forEach(btn =>
btn.classList.remove("active")
);
activeBtn.classList.add("active");
}

function displayLuxuryCategory(category) {
luxuryChoices.innerHTML = "";
const grid = document.createElement("div");
grid.className = "luxury-grid";

const items = luxuryItems[category]?.items || [];
items.forEach(item => {
const card = document.createElement("div");
card.className = "luxury-card";
card.innerHTML = `      <img src="assets/svgs/${item.image || "default.svg"}" alt="${item.name}">       <p>${item.name}</p>       <p>Cost: $${item.cost.toLocaleString()}</p>
      ${item.happinessImpact ?`<p>Happiness: +${item.happinessImpact}</p>`: ""}       <button>Buy</button>
   `;
card.querySelector("button").onclick = () => buyLuxury(item, card);
grid.appendChild(card);
});

luxuryChoices.appendChild(grid);
grid.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300 });
}

function buyLuxury(item, card) {
if (player.ownedLuxury.some(l => l.name === item.name))
return showToast(`You already own ${item.name}!`);
if (player.money < item.cost)
return showToast("Not enough money!");

player.money -= item.cost;
player.ownedLuxury.push(item);

const gain = item.happinessImpact || 0;
player.happiness = Math.min(100, player.happiness + gain);
player.reputation += Math.floor(gain / 5);

animateCardPurchase(item.image);
updateStats();
showToast(`Purchased ${item.name}! Happiness +${gain}`);
}

function displayOwnedLuxury() {
ownedLuxuryGrid.innerHTML = "";
player.ownedLuxury.forEach(l => {
const card = document.createElement("div");
card.className = "luxury-card";
card.innerHTML = `       <img src="assets/svgs/${l.image || "default.svg"}" alt="${l.name}">       <p>${l.name}</p>       <p>Happiness: +${l.happinessImpact || 0}</p>
    `;
ownedLuxuryGrid.appendChild(card);
});
}

// ===================== PERSONAL LIFE ===================== //
function openLifeTab() {
lifeChoices.innerHTML = "";
const actions = [
{ name: "Vacation Trip", cost: 2000, stressChange: -20, happinessChange: +25, reputationChange: +3, image: "vacation.svg" },
{ name: "Family Time", cost: 500, stressChange: -15, happinessChange: +20, reputationChange: 0, image: "family.svg" },
{ name: "Charity Donation", cost: 1500, stressChange: -5, happinessChange: +10, reputationChange: +10, image: "charity.svg" },
{ name: "Spa Day", cost: 800, stressChange: -25, happinessChange: +15, reputationChange: 0, image: "spa.svg" }
];

actions.forEach(a => {
const card = document.createElement("div");
card.className = "life-card";
card.innerHTML = `       <img src="assets/svgs/${a.image || "default.svg"}" alt="${a.name}">       <p>${a.name}</p>       <p>Cost: $${a.cost}</p>       <p>Stress: ${a.stressChange}</p>       <p>Happiness: +${a.happinessChange}</p>       <p>Reputation: +${a.reputationChange}</p>       <button>Do Activity</button>
    `;
card.querySelector("button").onclick = () => doLifeAction(a, card);
lifeChoices.appendChild(card);
});

lifeModal.classList.remove("hidden");
}

function closeLifeTab() {
lifeModal.classList.add("hidden");
}

function doLifeAction(a, card) {
if (player.money < a.cost) return showToast("Not enough money!");

player.money -= a.cost;
player.stress = Math.max(0, player.stress + a.stressChange);
player.happiness = Math.min(100, player.happiness + a.happinessChange);
player.reputation += a.reputationChange;

card.animate([{ transform: "scale(0.9)" }, { transform: "scale(1)" }], { duration: 300 });
updateStats();
showToast(`You enjoyed ${a.name}!`);
}

// ===================== TIME PROGRESSION ===================== //
function advanceTime(type) {
let monthsPassed = type === "year" ? 12 : 1;
player.month += monthsPassed;

if (player.month > 12) {
player.month = 1;
player.age++;
}

let totalIncome = 0;
player.ownedBusinesses.forEach(b => {
totalIncome += (b.profitPerYear / 12) * monthsPassed;
player.stress += (b.stressImpact / 12) * monthsPassed;
player.reputation += (b.reputationImpact / 12) * monthsPassed;
});

player.money += Math.round(totalIncome);
if (player.stress > 70) player.happiness -= monthsPassed * 2;

clampStats();
updateStats();
showToast(`Time advanced! Age: ${player.age}, Money: $${player.money.toLocaleString()}`);
}

// ===================== EVENT LISTENERS ===================== //
document.getElementById("open-business-tab").addEventListener("click", async () => {
if (!businesses.length) await loadBusinesses();
openBusinessTab();
});

document.getElementById("open-luxury-tab").addEventListener("click", async () => {
if (Object.keys(luxuryItems).length === 0) await loadLuxuryItems();
openLuxuryTab();
});

document.getElementById("open-life-tab").addEventListener("click", openLifeTab);
document.getElementById("close-life").addEventListener("click", closeLifeTab);
document.getElementById("close-business").addEventListener("click", closeBusinessTab);
document.getElementById("close-luxury").addEventListener("click", closeLuxuryTab);
document.getElementById("advance-month").addEventListener("click", () => advanceTime("month"));
document.getElementById("advance-year").addEventListener("click", () => advanceTime("year"));

// ===================== INITIALIZE GAME ===================== //
(async function init() {
await loadBusinesses();
await loadLuxuryItems();
clampStats();
updateStats();
})();
