/* ============================================================
ADVANCED BUSINESS MANAGEMENT SYSTEM — ENHANCED v2
============================================================ */

/* ----------------------------
GLOBAL ELEMENTS & REFERENCES
-----------------------------*/
const manageBusinessBtn = document.getElementById("open-manage-businesses");
const businessManageModal = document.getElementById("businessManageModal");
const closeBusinessManage = document.getElementById("close-manage-business");
const manageBusinessList = document.getElementById("manage-business-list");

/* ----------------------------
EVENT LISTENERS
-----------------------------*/
if (manageBusinessBtn) manageBusinessBtn.addEventListener("click", openBusinessManageTab);
if (closeBusinessManage) closeBusinessManage.addEventListener("click", closeBusinessManageTab);

// Universal Modal Management System
function openModal(modalElement) {
  document.querySelectorAll(".modal").forEach(m => {
    if (m !== modalElement) m.classList.add("hidden");
  });
  modalElement.classList.remove("hidden");
}

function closeModal(modalElement) {
  modalElement.classList.add("hidden");
}

/* ----------------------------
MODAL OPEN/CLOSE
-----------------------------*/
function openBusinessManageTab() {
if (typeof openModal === "function") openModal(businessManageModal); // use universal modal manager
displayManagedBusinesses();
}

function closeBusinessManageTab() {
if (typeof closeModal === "function") closeModal(businessManageModal);
}

/* ----------------------------
MAIN DISPLAY FUNCTION
-----------------------------*/
function displayManagedBusinesses() {
manageBusinessList.innerHTML = "";

if (!player.ownedBusinesses || player.ownedBusinesses.length === 0) {
manageBusinessList.innerHTML = `<p class="no-business-msg">You don't own any businesses yet. Start your empire!</p>`;
return;
}

player.ownedBusinesses.forEach((b, i) => {
// Initialize missing properties
Object.assign(b, {
level: b.level || 1,
hasManager: b.hasManager ?? false,
efficiency: b.efficiency || 1,
employeeCount: b.employeeCount || Math.floor(Math.random() * 10) + 5,
marketTrend: b.marketTrend || 1,
riskFactor: b.riskFactor || 0.1,
});

```
// Calculations
const upgradeCost = Math.round(b.cost * 0.7 * b.level);
const managerCost = Math.round(b.cost * 0.25);
const sellValue = Math.round(b.cost * b.level * 0.8);
const collectValue = Math.round(b.profitPerYear / 12 * b.level * b.efficiency * b.marketTrend);
const advertiseCost = Math.round(b.cost * 0.2);
const maintenanceCost = Math.round(b.cost * 0.1);
const expansionCost = Math.round(b.cost * 1.6 * b.level);
const researchCost = Math.round(b.cost * 0.25 * b.level);

// Generate business card
const card = document.createElement("div");
card.className = "manage-business-card";

card.innerHTML = `
  <div class="business-header">
    <img src="assets/svgs/${b.image || "default.svg"}" alt="${b.name}">
    <div>
      <h3>${b.name} <span class="lvl">(Lvl ${b.level})</span></h3>
      <p>Employees: ${b.employeeCount}</p>
      <p>Manager: ${b.hasManager ? "✅ Hired" : "❌ None"}</p>
    </div>
  </div>

  <div class="business-info">
    <p><strong>Market Trend:</strong> ${(b.marketTrend * 100).toFixed(0)}%</p>
    <p><strong>Profit / Year:</strong> $${Math.round(b.profitPerYear * b.level * b.efficiency * b.marketTrend).toLocaleString()}</p>
    <p><strong>Efficiency:</strong> ${(b.efficiency * 100).toFixed(0)}%</p>
    <p><strong>Risk Factor:</strong> ${(b.riskFactor * 100).toFixed(1)}%</p>
  </div>

  <div class="business-actions">
    <button class="collect-btn">💰 Collect +$${collectValue.toLocaleString()}</button>
    <button class="upgrade-btn">⬆️ Upgrade ($${upgradeCost.toLocaleString()})</button>
    <button class="manager-btn">👔 Hire Manager ($${managerCost.toLocaleString()})</button>
    <button class="advertise-btn">📢 Advertise ($${advertiseCost.toLocaleString()})</button>
    <button class="maintain-btn">🧰 Maintain ($${maintenanceCost.toLocaleString()})</button>
    <button class="expand-btn">🏗️ Expand ($${expansionCost.toLocaleString()})</button>
    <button class="research-btn">🔬 Research ($${researchCost.toLocaleString()})</button>
    <button class="sell-btn">💵 Sell +$${sellValue.toLocaleString()}</button>
  </div>
`;

// Event handlers
card.querySelector(".collect-btn").onclick = () => collectBusinessProfit(b);
card.querySelector(".upgrade-btn").onclick = () => upgradeBusiness(b);
card.querySelector(".manager-btn").onclick = () => hireManager(b);
card.querySelector(".advertise-btn").onclick = () => advertiseBusiness(b);
card.querySelector(".maintain-btn").onclick = () => maintainBusiness(b);
card.querySelector(".expand-btn").onclick = () => expandBusiness(b);
card.querySelector(".research-btn").onclick = () => researchBusiness(b);
card.querySelector(".sell-btn").onclick = () => sellBusiness(b);

manageBusinessList.appendChild(card);
```

});
}

/* ----------------------------
ACTION FUNCTIONS
-----------------------------*/
function collectBusinessProfit(b) {
const taxRate = 0.15;
const baseProfit = b.profitPerYear / 12 * b.level * b.efficiency * b.marketTrend;
const taxedProfit = baseProfit * (1 - taxRate);

player.money += taxedProfit;
player.stress += 2;
showToast(`Collected $${Math.round(taxedProfit).toLocaleString()} (after tax) from ${b.name}.`);
updateStats();
displayManagedBusinesses();
}

function upgradeBusiness(b) {
const cost = Math.round(b.cost * 0.7 * b.level);
if (player.money < cost) return showToast("Not enough money to upgrade!");
player.money -= cost;
b.level++;
b.profitPerYear = Math.round(b.profitPerYear * 1.35);
b.efficiency += 0.05;
player.reputation += 3;
showToast(`${b.name} upgraded to Level ${b.level}! Efficiency improved.`);
updateStats();
displayManagedBusinesses();
}

function hireManager(b) {
const cost = Math.round(b.cost * 0.25);
if (b.hasManager) return showToast(`${b.name} already has a manager.`);
if (player.money < cost) return showToast("Not enough money to hire a manager!");
player.money -= cost;
b.hasManager = true;
player.stress = Math.max(0, player.stress - 5);
showToast(`Hired a professional manager for ${b.name}.`);
updateStats();
displayManagedBusinesses();
}

function advertiseBusiness(b) {
const cost = Math.round(b.cost * 0.2);
if (player.money < cost) return showToast("Not enough funds to advertise!");
player.money -= cost;
const boost = Math.random() * 0.2 + 0.1;
b.marketTrend += boost;
player.reputation += 4;
showToast(`${b.name}'s popularity grew! Market trend now ${(b.marketTrend * 100).toFixed(0)}%.`);
updateStats();
displayManagedBusinesses();
}

function maintainBusiness(b) {
const cost = Math.round(b.cost * 0.1);
if (player.money < cost) return showToast("Not enough for maintenance!");
player.money -= cost;
b.efficiency = Math.min(1.5, b.efficiency + 0.05);
showToast(`${b.name} efficiency restored to ${(b.efficiency * 100).toFixed(0)}%.`);
updateStats();
displayManagedBusinesses();
}

function expandBusiness(b) {
const cost = Math.round(b.cost * 1.6 * b.level);
if (player.money < cost) return showToast("Not enough to expand!");
player.money -= cost;
b.level += 2;
b.employeeCount += 10;
b.profitPerYear *= 1.7;
player.reputation += 6;
showToast(`${b.name} expanded! New employees hired, profit capacity increased.`);
updateStats();
displayManagedBusinesses();
}

function researchBusiness(b) {
const cost = Math.round(b.cost * 0.25 * b.level);
if (player.money < cost) return showToast("Not enough for research!");
player.money -= cost;
b.efficiency += 0.15;
b.riskFactor = Math.max(0.05, b.riskFactor - 0.02);
player.reputation += 2;
showToast(`${b.name} developed new technology — efficiency up, risk reduced!`);
updateStats();
displayManagedBusinesses();
}

function sellBusiness(b) {
const value = Math.round(b.cost * b.level * 0.8);
player.money += value;
player.reputation -= 3;
player.ownedBusinesses = player.ownedBusinesses.filter(x => x.name !== b.name);
showToast(`Sold ${b.name} for $${value.toLocaleString()}. Reputation decreased slightly.`);
updateStats();
displayManagedBusinesses();
}

/* ----------------------------
PASSIVE INCOME SYSTEM
-----------------------------*/
setInterval(() => {
player.ownedBusinesses?.forEach(b => {
if (b.hasManager) {
const fluctuation = (Math.random() - 0.5) * 0.1; // +/- 5%
const profit = b.profitPerYear / 12 * b.level * b.efficiency * (b.marketTrend + fluctuation);
player.money += profit;
}
});
updateStats();
}, 60000); // every 60s = 1 in-game month
