/* ============================================================
BUSINESSLIFE SIMULATOR (Optimized v3 - Debugged + Refined)
============================================================ */
// ===================== IMPORT FUNCTIONS ===================== //
import { displayManagedBusinesses } from './businessManagement.js';
// ===================== PLAYER DATA ===================== //
export let player = {
  money: 10000,
  reputation: 0,
  health: 100,
  happiness: 50,
  age: 18,
  month: 1,
  ownedBusinesses: [],
  ownedLuxury: [],
  profession: null
};




// ===================== FAMILY DATA ===================== //
let family = {
  surname: "",
  father: {},
  mother: {},
  siblings: []
};

// ===================== HELPERS ===================== //
function safeGet(id) {
  return document.getElementById(id);
}
function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}
function clampStats() {
  player.health = Math.min(Math.max(player.health, 0), 100);
  player.happiness = Math.min(Math.max(player.happiness, 0), 100);
  player.reputation = Math.min(Math.max(player.reputation, 0), 100);
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 100);
  setTimeout(() => {
    toast.classList.remove("show");
    toast.remove();
  }, 3000);
}

// ===================== BACKGROUND CONTROL ===================== //
function setGameBackground(imageName) {
  const bgDiv = safeGet("player-character-bg");
  if (!bgDiv) return;
  bgDiv.style.background = `url('assets/svgs/${imageName}') center/cover no-repeat`;
  bgDiv.style.transition = "background-image 0.8s ease-in-out";
}

// ===================== MODAL HANDLING ===================== //

function openModal(modalElement) {
  document.querySelectorAll(".modal").forEach(m => {
    if (m !== modalElement) m.classList.add("hidden");
  });
  modalElement.classList.remove("hidden");
}
function closeModal(modalElement) {
  modalElement.classList.add("hidden");
}



// ===================== PROFESSION SELECTION ===================== //
function openProfessionSelection() {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <h2>Choose Your Profession</h2>
      <div class="profession-grid">
        <button id="open-business-tab"><img src="assets/buttons/business.svg" alt="Business"></button>
        <button id="choose-athlete"><img src="assets/buttons/athlete.svg" alt="Athlete"></button>
        <button id="choose-licensed"><img src="assets/buttons/Licensed.svg" alt="Licensed"></button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  modal.querySelector(".close").onclick = () => modal.remove();

  modal.querySelector("#open-business-tab").onclick = () => {
    player.profession = "entrepreneur";
    showToast("You chose Entrepreneur!");
    modal.remove();
  };
  modal.querySelector("#choose-athlete").onclick = () => {
    player.profession = "athlete";
    openSportsTab();
    modal.remove();
  };
  modal.querySelector("#choose-licensed").onclick = () => {
    player.profession = "licensed";
    openLicensedTab();
    modal.remove();
  };
}

// ===================== SPORTS TAB ===================== //
function openSportsTab() {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <h2>Sports Career</h2>
      <div class="sports-grid">
        <div class="sport-card" data-sport="basketball">
          <img src="assets/svgs/basketball.svg" alt="Basketball">
          <h3>Basketball</h3>
          <p>Train Cost: $500</p>
          <p>Health -5 | Happiness +5</p>
          <button>Train</button>
        </div>
        <div class="sport-card" data-sport="boxing">
          <img src="assets/svgs/boxing.svg" alt="Boxing">
          <h3>Boxing</h3>
          <p>Train Cost: $800</p>
          <p>Health -8 | Happiness +7</p>
          <button>Train</button>
        </div>
        <div class="sport-card" data-sport="swimming">
          <img src="assets/svgs/swim.svg" alt="Swimming">
          <h3>Swimming</h3>
          <p>Train Cost: $600</p>
          <p>Health -6 | Happiness +6</p>
          <button>Train</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  modal.querySelector(".close").onclick = () => modal.remove();
  modal.querySelectorAll(".sport-card button").forEach(btn => {
    btn.onclick = () => {
      const cost = parseInt(btn.parentElement.querySelector("p").textContent.match(/\d+/)[0]);
      if (player.money < cost) return showToast("Not enough money to train!");

      player.money -= cost;
      player.health -= 5;
      player.happiness += 5;
      player.reputation += 2;

      updateStats();
      showToast(`You trained in ${btn.parentElement.dataset.sport}!`);
    };
  });
}
// ===================== LICENSED CAREER TAB ===================== //
function openLicensedTab() {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <h2>Licensed Professions</h2>
      <div class="career-grid">
        <div class="career-card" data-career="doctor">
          <img src="assets/svgs/doctor.svg" alt="Doctor">
          <h3>Doctor</h3>
          <p>Workload: Health -10 | Reputation +5 | Money +5000</p>
          <button>Work</button>
        </div>
        <div class="career-card" data-career="engineer">
          <img src="assets/svgs/engineer.svg" alt="Engineer">
          <h3>Engineer</h3>
          <p>Workload: Health -5 | Reputation +3 | Money +4000</p>
          <button>Work</button>
        </div>
        <div class="career-card" data-career="lawyer">
          <img src="assets/svgs/lawyer.svg" alt="Lawyer">
          <h3>Lawyer</h3>
          <p>Workload: Health -7 | Reputation +4 | Money +4500</p>
          <button>Work</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  modal.querySelector(".close").onclick = () => modal.remove();
  modal.querySelectorAll(".career-card button").forEach(btn => {
    btn.onclick = () => {
      const job = btn.parentElement.dataset.career;
      player.health -= 7;
      player.reputation += 4;
      player.money += 4000;
      player.happiness -= 2;
      updateStats();
      showToast(`You worked as a ${job}!`);
    };
  });
}
// ===================== CONTROL MODAL ===================== //
const openMenuTab = document.getElementById("menu-toggle");
const closeMenuTab = document.getElementById("close-modal");

openMenuTab.onclick = () => openModal(document.getElementById("MenuTab"));
closeMenuTab.onclick = () => closeModal(document.getElementById("MenuTab"));

// ===================== SELECT CHARACTER ===================== //
const openCharacterTab = document.getElementById("open-character-tab");
const closeCharacterTab = document.getElementById("close-character");
// Open and close modal
openCharacterTab.onclick = () => {
  openModal(characterModal);
};

closeCharacter.onclick = () => {
  closeModal(characterModal);
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

// ===================== LIFE EVENTS ===================== //
function handleLifeProgression() {
  if (player.age === 0) {
    showToast(`You were born into the ${family.surname} family!`);
  } else if (player.age === 3) {
    showToast(`You learned to talk and play with ${family.siblings[0]?.name || "your toys"}.`);
  } else if (player.age === 6) {
    showToast("You started school!");
  } else if (player.age === 12) {
    showToast("You discovered a hobby — maybe sports or studying!");
  } if (player.age === 18 && !player.profession) {
  showToast("You’re now an adult! Choose your profession!");
  openProfessionSelection();
}
}

// ===================== LIFE ACTIONS ===================== //
function openLifeTab() {
  const actions = [
    { name: "Vacation Trip", cost: 2000, healthChange: +10, happinessChange: +25, reputationChange: +3, image: "vacation.svg" },
    { name: "Family Time", cost: 500, healthChange: +5, happinessChange: +20, reputationChange: 0, image: "family.svg" },
    { name: "Charity Donation", cost: 1500, healthChange: 0, happinessChange: +10, reputationChange: +10, image: "charity.svg" },
    { name: "Spa Day", cost: 800, healthChange: +15, happinessChange: +15, reputationChange: 0, image: "spa.svg" }
  ];

  const container = safeGet("life-choices");
  container.innerHTML = "";

  actions.forEach(a => {
    const card = document.createElement("div");
    card.className = "life-card";
    card.innerHTML = `
      <img src="assets/svgs/${a.image}" alt="${a.name}">
      <p>${a.name}</p>
      <p>Cost: $${a.cost}</p>
      <p>Happiness: +${a.happinessChange}</p>
      <p>Health: +${a.healthChange}</p>
      <p>Reputation: +${a.reputationChange}</p>
      <button>Do Activity</button>
    `;
    card.querySelector("button").onclick = () => doLifeAction(a, card);
    container.appendChild(card);
  });

  openModal(safeGet("lifeModal"));
}

function doLifeAction(a, card) {
  if (player.money < a.cost) return showToast("Not enough money!");

  player.money -= a.cost;
  player.health = clamp(player.health + a.healthChange);
  player.happiness = clamp(player.happiness + a.happinessChange);
  player.reputation = clamp(player.reputation + a.reputationChange);

  card.animate([{ transform: "scale(0.9)" }, { transform: "scale(1)" }], { duration: 300 });
  updateStats();
  showToast(`You enjoyed ${a.name}!`);
}

// ===================== TIME PROGRESSION ===================== //
function advanceTime(type) {
  const monthsPassed = type === "year" ? 12 : 1;
  player.month += monthsPassed;

  if (player.month > 12) {
    player.month = 1;
    player.age++;
    handleLifeProgression();
  }

  let totalIncome = 0;
  player.ownedBusinesses.forEach(b => {
    totalIncome += (b.profitPerYear / 12) * monthsPassed;
    player.health -= (b.stressImpact / 12) * monthsPassed;
    player.reputation += (b.reputationImpact / 12) * monthsPassed;
  });

  // Profession-based income and impact
if (player.profession === "entrepreneur") {
  player.money += 12000 * (monthsPassed / 12);
  player.health -= 2 * (monthsPassed / 12);
  player.reputation += 1 * (monthsPassed / 12);
} else if (player.profession === "athlete") {
  player.money += 8000 * (monthsPassed / 12);
  player.health -= 4 * (monthsPassed / 12);
  player.happiness += 3 * (monthsPassed / 12);
} else if (player.profession === "licensed") {
  player.money += 6000 * (monthsPassed / 12);
  player.health -= 1 * (monthsPassed / 12);
  player.reputation += 2 * (monthsPassed / 12);
}

  player.money += Math.round(totalIncome);
  clampStats();
  updateStats();
  
  if (player.profession)
  showToast(`You earned income from your ${player.profession} career! Age: ${player.age}`);

}

// ===================== OWNED LUXURY ===================== //
function displayOwnedLuxury() {
  const container = document.getElementById("owned-luxury-grid");
  container.innerHTML = "";

  player.ownedLuxury.forEach(l => {
    const card = document.createElement("div");
    card.className = "luxury-card";
    card.innerHTML = `
      <img src="assets/svgs/${l.icon || "default.svg"}" alt="${l.name}">
      <h3>${l.name}</h3>
      <p>Happiness +${l.happinessBoost || 0}</p>
      <p>Reputation +${l.reputationBoost || 0}</p>
    `;
    container.appendChild(card);
  });

  if (player.ownedLuxury.length === 0) {
    container.innerHTML = `<p>You don't own any luxury items yet.</p>`;
  }
}

// ===================== STATS UPDATE ===================== //
function updateStats() {
  clampStats();
  document.getElementById("money").textContent = `$${player.money.toLocaleString()}`;
  document.getElementById("reputation-text").textContent = `⭐ ${player.reputation}`;
  document.getElementById("age").textContent = `Age: ${player.age}`;
  document.getElementById("month").textContent = `Month: ${player.month}`;
  document.getElementById("profession").textContent = `Profession: ${player.profession || "None"}`;

  const healthFill = document.getElementById("health-fill");
  const happinessFill = document.getElementById("happiness-fill");
  const repFill = document.getElementById("reputation-fill");

  healthFill.style.width = `${player.health}%`;
  happinessFill.style.width = `${player.happiness}%`;
  repFill.style.width = `${player.reputation}%`;

  // Color logic
  healthFill.style.backgroundColor =
    player.health > 70 ? "#4CAF50" : player.health > 40 ? "#FFC107" : "#E53935";
  happinessFill.style.backgroundColor =
    player.happiness > 70 ? "#4CAF50" : player.happiness > 40 ? "#FFC107" : "#E53935";

  displayManagedBusinesses();
  displayOwnedLuxury();
}


// ===================== FAMILY GENERATION ===================== //
function generateFamily() {
  const surnames = ["Santos", "Reyes", "Garcia", "Cruz", "Dela Cruz", "Mendoza", "Lopez"];
  const maleNames = ["Carlos", "Juan", "Miguel", "Jose", "Antonio", "Rafael"];
  const femaleNames = ["Maria", "Ana", "Carmen", "Sofia", "Isabella", "Luz"];

  family.surname = surnames[Math.floor(Math.random() * surnames.length)];

  family.father = { name: `${maleNames[Math.floor(Math.random() * maleNames.length)]} ${family.surname}`, relationship: 80 };
  family.mother = { name: `${femaleNames[Math.floor(Math.random() * femaleNames.length)]} ${family.surname}`, relationship: 90 };

  family.siblings = Array.from({ length: Math.floor(Math.random() * 3) }, () => {
    const gender = Math.random() < 0.5 ? "male" : "female";
    const name = `${gender === "male"
      ? maleNames[Math.floor(Math.random() * maleNames.length)]
      : femaleNames[Math.floor(Math.random() * femaleNames.length)]
    } ${family.surname}`;
    return { name, gender, relationship: 70 };
  });
}
/* ============================================================
BUSINESS & LUXURY SYSTEMS (Optimized v3.1)
============================================================ */

// ===================== BUSINESS TAB ===================== //
function openBusinessTab() {
  const modal = safeGet("businessModal");
  const container = safeGet("business-list");
  container.innerHTML = "";

  const availableBusinesses = [
    { name: "Café", cost: 5000, profitPerYear: 1200, reputationImpact: 1, stressImpact: 1, icon: "cafe.svg" },
    { name: "Tech Startup", cost: 20000, profitPerYear: 6000, reputationImpact: 3, stressImpact: 2, icon: "startup.svg" },
    { name: "Real Estate", cost: 50000, profitPerYear: 10000, reputationImpact: 5, stressImpact: 3, icon: "realestate.svg" },
    { name: "Franchise", cost: 75000, profitPerYear: 15000, reputationImpact: 6, stressImpact: 4, icon: "franchise.svg" }
  ];

  availableBusinesses.forEach(b => {
    const card = document.createElement("div");
    card.className = "business-card";
    card.innerHTML = `
      <img src="assets/svgs/${b.icon}" alt="${b.name}">
      <h3>${b.name}</h3>
      <p>Cost: $${b.cost.toLocaleString()}</p>
      <p>Yearly Profit: $${b.profitPerYear.toLocaleString()}</p>
      <p>Reputation +${b.reputationImpact}</p>
      <button>Buy</button>
    `;
    const btn = card.querySelector("button");
    btn.onclick = () => buyBusiness(b, card, btn);
    container.appendChild(card);
  });

  openModal(modal);
}

function buyBusiness(business, card, btn) {
  if (player.money < business.cost)
    return showToast("Not enough funds to purchase this business!");

  player.money -= business.cost;
  player.ownedBusinesses.push({ ...business });
  btn.disabled = true;
  btn.textContent = "Owned";

  card.animate([{ transform: "scale(0.95)" }, { transform: "scale(1)" }], { duration: 300 });
  updateStats();
  showToast(`You purchased ${business.name}!`);
}

// ===================== LUXURY TAB ===================== //
function openLuxuryTab() {
  const modal = safeGet("luxuryModal");
  const container = safeGet("luxury-list");
  container.innerHTML = "";

  const luxuries = [
    { name: "Sports Car", cost: 80000, happinessBoost: 20, reputationBoost: 5, icon: "car.svg" },
    { name: "Mansion", cost: 200000, happinessBoost: 40, reputationBoost: 10, icon: "mansion.svg" },
    { name: "Yacht", cost: 350000, happinessBoost: 50, reputationBoost: 15, icon: "yacht.svg" },
    { name: "Private Jet", cost: 1000000, happinessBoost: 70, reputationBoost: 20, icon: "jet.svg" }
  ];

  luxuries.forEach(l => {
    const card = document.createElement("div");
    card.className = "luxury-card";
    card.innerHTML = `
      <img src="assets/svgs/${l.icon}" alt="${l.name}">
      <h3>${l.name}</h3>
      <p>Cost: $${l.cost.toLocaleString()}</p>
      <p>Happiness +${l.happinessBoost}</p>
      <p>Reputation +${l.reputationBoost}</p>
      <button>Buy</button>
    `;
    const btn = card.querySelector("button");
    btn.onclick = () => buyLuxury(l, card, btn);
    container.appendChild(card);
  });

  openModal(modal);
}

function buyLuxury(luxury, card, btn) {
  if (player.money < luxury.cost)
    return showToast("Not enough funds to purchase this luxury!");

  player.money -= luxury.cost;
  player.happiness = clamp(player.happiness + luxury.happinessBoost);
  player.reputation = clamp(player.reputation + luxury.reputationBoost);
  player.ownedLuxury.push({ ...luxury });

  btn.disabled = true;
  btn.textContent = "Owned";
  card.animate([{ transform: "scale(0.95)" }, { transform: "scale(1)" }], { duration: 300 });

  updateStats();
  showToast(`You purchased ${luxury.name}!`);
}

// ===================== DOCTOR TAB ===================== //

function openDoctorTab() {
  const modal = document.getElementById("doctorModal");
  const grid = document.getElementById("doctor-choices");
  grid.innerHTML = "";

  const treatments = [
    { name: "Basic Checkup", cost: 500, healthGain: 10, happinessGain: 2 },
    { name: "Full Treatment", cost: 2000, healthGain: 30, happinessGain: 5 },
    { name: "Luxury Spa Therapy", cost: 5000, healthGain: 50, happinessGain: 10 },
  ];

  treatments.forEach(t => {
    const card = document.createElement("div");
    card.className = "doctor-card";
    card.innerHTML = `
      <h3>${t.name}</h3>
      <p>Cost: $${t.cost}</p>
      <p>Health: +${t.healthGain}</p>
      <p>Happiness: +${t.happinessGain}</p>
      <button>Heal</button>
    `;
    card.querySelector("button").onclick = () => healAtDoctor(t);
    grid.appendChild(card);
  });

  openModal(modal);
}

function healAtDoctor(treatment) {
  if (player.money < treatment.cost) return showToast("Not enough money!");
  player.money -= treatment.cost;
  player.health = Math.min(100, player.health + treatment.healthGain);
  player.happiness = Math.min(100, player.happiness + treatment.happinessGain);
  updateStats();
  showToast(`You received ${treatment.name}!`);
  closeModal(document.getElementById("doctorModal"));
}

// ===================== SAVE / LOAD SYSTEM ===================== //
function saveGame() {
  localStorage.setItem("businessLifeSave", JSON.stringify({ player, family }));
  showToast("Game saved!");
}

function loadGame() {
  const save = localStorage.getItem("businessLifeSave");
  if (!save) return showToast("No saved data found.");

  const data = JSON.parse(save);
  Object.assign(player, data.player);
  Object.assign(family, data.family);

  clampStats();
  updateStats();
  
  if (player.profession === "athlete") openSportsTab();
  else if (player.profession === "licensed") openLicensedTab();
  else if (player.profession === "entrepreneur") openBusinessTab();

  showToast("Game loaded successfully!");
}

// ===================== RESTART / SURRENDER ===================== //
function restartLife() {
  const confirmRestart = confirm("Restart your current life but keep your character?");
  if (!confirmRestart) return;

  player.money = 10000;
  player.health = 100;
  player.happiness = 50;
  player.reputation = 0;
  player.ownedBusinesses = [];
  player.ownedLuxury = [];

  clampStats();
  updateStats();
  showToast("Life restarted — new beginning!");
}

function surrenderLife() {
  const confirmSurrender = confirm("Surrender your life? This will erase all progress.");
  if (!confirmSurrender) return;

  localStorage.clear();
  player = {
    money: 10000,
    reputation: 0,
    health: 100,
    happiness: 50,
    age: 18,
    month: 1,
    profession: null,
    ownedBusinesses: [],
    ownedLuxury: []
  };

  family = { surname: "", father: {}, mother: {}, siblings: [] };

  clampStats();
  updateStats();
  showToast("You surrendered your life. Everything has been reset.");
}

// ===================== EVENT LISTENER ===================== //
document.getElementById("open-character-tab").addEventListener("click", openCharacterTab);
document.getElementById("menu-toggle").addEventListener("click", openMenuTab);
document.getElementById("open-doctor-tab").addEventListener("click", openDoctorTab);
document.getElementById("open-profession-btn").addEventListener("click", openProfessionSelection);
document.getElementById("surrender-life").addEventListener("click", surrenderLife);
document.getElementById("restart-life").addEventListener("click", restartLife);
document.querySelectorAll(".toast").forEach(t => t.remove());

window.openProfessionSelection = openProfessionSelection;

// ===================== INITIALIZE ===================== //
(async function init() {
  generateFamily();
  clampStats();
  updateStats();
})();
// ===================== EXPORT FUNCTIONS ===================== //

export { 
  updateStats, 
  showToast, 
  openSportsTab, 
  openLicensedTab, 
  openBusinessTab, 
  displayOwnedLuxury 
};

