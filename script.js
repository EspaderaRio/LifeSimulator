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

// ===================== FAMILY DATA ===================== //
let family = {
  surname: "",
  father: {},
  mother: {},
  siblings: []
};

function setGameBackground(imageName) {
  const bgDiv = document.getElementById("player-character-bg");
  if (bgDiv) {
    bgDiv.style.backgroundImage = `url('assets/svgs/${imageName}')`;
    bgDiv.style.backgroundSize = "cover";
    bgDiv.style.backgroundPosition = "center";
    bgDiv.style.backgroundRepeat = "no-repeat";
    bgDiv.style.transition = "background-image 0.8s ease-in-out";
  }
}


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

// === CHARACTER CUSTOMIZATION ===
const characterModal = document.getElementById("characterModal");
const openCharacterTab = document.getElementById("open-character-tab");
const closeCharacter = document.getElementById("close-character");
const outfitSelection = document.getElementById("outfit-selection");
const outfitOptions = document.getElementById("outfit-options");
const characterPreview = document.getElementById("character-preview-img");

let playerGender = localStorage.getItem("playerGender") || null;
let playerOutfit = localStorage.getItem("playerOutfit") || null;

// Outfit data
const characterOutfits = {
  female: [
    { id: "polo", src: "assets/female/polo.png" },
    { id: "dress", src: "assets/female/dress.png" },
    { id: "suit", src: "assets/female/suit.png" },
    { id: "suit", src: "assets/female/princess.png" },
    { id: "suit1", src: "assets/female1/suit.svg" }, 
    { id: "athletic", src: "assets/female1/athletic.svg" },
    { id: "cocktail", src: "assets/female1/cocktail.svg" },
    { id: "casual", src: "assets/female1/casual.svg" },
    { id: "polo1", src: "assets/female1/polo.svg" }
  ],
  male: [
    { id: "polo", src: "assets/male/polo.png" },
    { id: "tshirt", src: "assets/male/tshirt.png" },
    { id: "suit", src: "assets/male/suit.png" },
    { id: "prince", src: "assets/male/prince.png" },
    { id: "suit1", src: "assets/male1/suit.svg" }, 
    { id: "athletic", src: "assets/male1/athletic.svg" },
    { id: "cocktail", src: "assets/male1/cocktail.svg" },
    { id: "casual", src: "assets/male1/casual.svg" },
    { id: "polo1", src: "assets/male1/polo.svg" }
  ]
};

// Open and close modal
openCharacterTab.onclick = () => {
  characterModal.classList.remove("hidden");
};

closeCharacter.onclick = () => {
  characterModal.classList.add("hidden");
};

// Gender selection
document.querySelectorAll(".gender-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const gender = btn.dataset.gender;
    playerGender = gender;
    localStorage.setItem("playerGender", gender);
    showOutfits(gender);
  });
});

// Display outfits for selected gender
function showOutfits(gender) {
  outfitSelection.classList.remove("hidden");
  outfitOptions.innerHTML = "";

  characterOutfits[gender].forEach(outfit => {
    const img = document.createElement("img");
    img.src = outfit.src;
    img.alt = outfit.id;
    img.onclick = () => selectOutfit(outfit.id, outfit.src);
    outfitOptions.appendChild(img);
  });
}

// Select outfit
function selectOutfit(id, src) {
  playerOutfit = id;
  localStorage.setItem("playerOutfit", id);
  localStorage.setItem("playerOutfitSrc", src);

  // Update character preview in customization tab
  characterPreview.src = src;

  // Instantly change the actual in-game character image
  const playerCharacter = document.getElementById("playerCharacter");
  if (playerCharacter) {
    playerCharacter.src = src;
  }

  // Optional: subtle animation for feedback
  playerCharacter?.animate(
    [
      { transform: "scale(0.9)", opacity: 0.8 },
      { transform: "scale(1.05)", opacity: 1 },
      { transform: "scale(1)", opacity: 1 }
    ],
    { duration: 400, easing: "ease-in-out" }
  );

  showToast(`Outfit changed to ${id}!`);
}


const playerCharacter = document.getElementById("playerCharacter");
const savedOutfitSrc = localStorage.getItem("playerOutfitSrc");

if (savedOutfitSrc) {
  playerCharacter.src = savedOutfitSrc;
}

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


const icon = document.createElement("img");
icon.src = 'assets/svgs/${catData.icon || "default.svg"}';
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
    card.innerHTML = `
      <img src="assets/svgs/${item.image || "default.svg"}" alt="${item.name}">
      <p>${item.name}</p>
      <p>Cost: $${item.cost.toLocaleString()}</p>
      ${item.happinessImpact ? `<p>Happiness: +${item.happinessImpact}</p>` : ""}
    `;

    const owned = player.ownedLuxury.some(l => l.name === item.name);

    // If owned, show "Set as Home" for Houses, otherwise "Owned"
    const button = document.createElement("button");

    if (owned && category === "Houses") {
      button.textContent = "Set as Home";
      button.onclick = () => {
        player.selectedHouse = item;
        localStorage.setItem("selectedHouse", JSON.stringify(item)); // save permanently
        setGameBackground(item.image);
        showToast(`${item.name} is now your home!`);
      };
    } 
    else if (!owned) {
      button.textContent = "Buy";
      button.onclick = () => buyLuxury(item, card);
    } 
    else {
      button.textContent = "Owned";
      button.disabled = true;
      button.style.opacity = "0.6";
    }

    card.appendChild(button);
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

  // If bought item is a House, set as background
if (item.category === "Houses") {
  player.selectedHouse = item;
  setGameBackground(item.image);
}

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


function openHouseSelection() {
  const houses = player.ownedLuxury.filter(l => l.category === "Houses");

  if (houses.length === 0) {
    return showToast("You don’t own any houses yet!");
  }

  // Create modal container dynamically
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <h2>Select Your Home</h2>
      <div class="house-grid"></div>
    </div>
  `;

  document.body.appendChild(modal);

  const grid = modal.querySelector(".house-grid");
  houses.forEach(house => {
    const card = document.createElement("div");
    card.className = "house-card";
    card.innerHTML = `
      <img src="assets/svgs/${house.image}" alt="${house.name}">
      <p>${house.name}</p>
      <button>Select</button>
    `;
    card.querySelector("button").onclick = () => {
      player.selectedHouse = house;
      setGameBackground(house.image);
      showToast(`${house.name} is now your home!`);
      modal.remove();
    };
    grid.appendChild(card);
  });

  modal.querySelector(".close").onclick = () => modal.remove();
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
    handleLifeProgression();
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

// ===================== LIFE STAGES ===================== //
function handleLifeProgression() {
  if (player.age === 0) {
    showToast("You were born into the " + family.surname + " family!");
  } else if (player.age === 3) {
    showToast("You learned to talk and play with " + (family.siblings[0]?.name || "your toys") + ".");
  } else if (player.age === 6) {
    showToast("You started school!");
  } else if (player.age === 12) {
    showToast("You discovered a hobby — maybe sports or studying!");
  } else if (player.age === 18) {
    showToast("You’re now an adult! Time to build your future!");
  }
}


// ===================== EVENT LISTENERS ===================== //
document.getElementById("open-family-tab").addEventListener("click", () => {
  alert(`Father: ${family.father.name}\nMother: ${family.mother.name}\nSiblings: ${family.siblings.map(s => s.name).join(", ") || "None"}`);
});

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


// ===================== FAMILY GENERATION ===================== //
function generateFamily() {
  const surnames = ["Santos", "Reyes", "Garcia", "Cruz", "Dela Cruz", "Mendoza", "Lopez"];
  const maleNames = ["Carlos", "Juan", "Miguel", "Jose", "Antonio", "Rafael"];
  const femaleNames = ["Maria", "Ana", "Carmen", "Sofia", "Isabella", "Luz"];
  
  family.surname = surnames[Math.floor(Math.random() * surnames.length)];

  family.father = {
    name: maleNames[Math.floor(Math.random() * maleNames.length)] + " " + family.surname,
    relationship: 80
  };
  family.mother = {
    name: femaleNames[Math.floor(Math.random() * femaleNames.length)] + " " + family.surname,
    relationship: 90
  };

  // Random 0–2 siblings
  const siblingCount = Math.floor(Math.random() * 3);
  for (let i = 0; i < siblingCount; i++) {
    const gender = Math.random() < 0.5 ? "male" : "female";
    const name = (gender === "male"
      ? maleNames[Math.floor(Math.random() * maleNames.length)]
      : femaleNames[Math.floor(Math.random() * femaleNames.length)]) + " " + family.surname;
    family.siblings.push({ name, gender, relationship: 70 });
  }

  console.log("Generated family:", family);
}

// ===================== LIFE RESET & SURRENDER ===================== //
document.getElementById("surrender-life").addEventListener("click", () => {
  if (confirm("Are you sure you want to surrender your life? This cannot be undone.")) {
    handleGameOver();
  }
});

document.getElementById("restart-life").addEventListener("click", () => {
  if (confirm("Restart a new life from birth? All progress will be lost.")) {
    restartLife();
  }
});

function handleGameOver() {
  showToast("💀 You have surrendered your life...");
  player.happiness = 0;
  player.stress = 100;
  player.reputation = 0;
  player.money = 0;
  setGameBackground("heaven.svg"); // optional: add a symbolic image
  localStorage.removeItem("selectedHouse");
  setTimeout(() => {
    alert("Your life has ended. You can start a new one anytime.");
  }, 1000);
}

function restartLife() {
  // Reset player data
  player = {
    money: 10000,
    reputation: 0,
    stress: 0,
    happiness: 50,
    age: 0,
    month: 1,
    ownedBusinesses: [],
    ownedLuxury: []
  };

  // Reset family, outfit, and house
  family = { surname: "", father: {}, mother: {}, siblings: [] };
  generateFamily();
  localStorage.removeItem("playerOutfitSrc");
  localStorage.removeItem("playerOutfit");
  localStorage.removeItem("playerGender");
  localStorage.removeItem("selectedHouse");

  setGameBackground("birth.svg"); // optional newborn background
  updateStats();
  showToast("A new life begins!");
}


// ===================== INITIALIZE GAME ===================== //
(async function init() {
  await loadBusinesses();
  await loadLuxuryItems();
  generateFamily();
  clampStats();
  updateStats();
const savedHouse = localStorage.getItem("selectedHouse");
if (savedHouse) {
  player.selectedHouse = JSON.parse(savedHouse);
  setGameBackground(player.selectedHouse.image);
}
})();

