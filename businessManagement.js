/* ============================================================
 ADVANCED BUSINESS MANAGEMENT SYSTEM
============================================================ */

const manageBusinessBtn = document.getElementById("open-manage-businesses");
const businessManageModal = document.getElementById("businessManageModal");
const closeBusinessManage = document.getElementById("close-manage-business");
const manageBusinessList = document.getElementById("manage-business-list");

// ========== OPEN & CLOSE ========== //
if (manageBusinessBtn) manageBusinessBtn.addEventListener("click", openBusinessManageTab);
if (closeBusinessManage) closeBusinessManage.addEventListener("click", closeBusinessManageTab);

function openBusinessManageTab() {
  displayManagedBusinesses();
  businessManageModal.classList.remove("hidden");
}

function closeBusinessManageTab() {
  businessManageModal.classList.add("hidden");
}

// ========== DISPLAY BUSINESSES ========== //
function displayManagedBusinesses() {
  manageBusinessList.innerHTML = "";

  if (player.ownedBusinesses.length === 0) {
    manageBusinessList.innerHTML = "<p>You don't own any businesses yet!</p>";
    return;
  }

  player.ownedBusinesses.forEach((b, i) => {
    if (!b.level) b.level = 1;
    if (b.hasManager === undefined) b.hasManager = false;
    if (!b.efficiency) b.efficiency = 1; // new stat

    const upgradeCost = Math.round(b.cost * 0.6 * b.level);
    const managerCost = Math.round(b.cost * 0.25);
    const sellValue = Math.round((b.cost * b.level) * 0.75);
    const collectValue = Math.round(b.profitPerYear / 12 * b.level * b.efficiency);
    const advertiseCost = Math.round(b.cost * 0.15);
    const maintenanceCost = Math.round(b.cost * 0.1);
    const expansionCost = Math.round(b.cost * 1.5 * b.level);
    const researchCost = Math.round(b.cost * 0.2 * b.level);

    const card = document.createElement("div");
    card.className = "manage-business-card";

    card.innerHTML = `
      <img src="assets/svgs/${b.image || "default.svg"}" alt="${b.name}">
      <h3>${b.name} (Lvl ${b.level})</h3>
      <p>Profit per Year: $${Math.round(b.profitPerYear * b.level * b.efficiency).toLocaleString()}</p>
      <p>Has Manager: ${b.hasManager ? "✅ Yes" : "❌ No"}</p>
      <div class="business-actions">
        <button class="collect-btn">Collect +$${collectValue.toLocaleString()}</button>
        <button class="upgrade-btn">Upgrade ($${upgradeCost.toLocaleString()})</button>
        <button class="manager-btn">Hire Manager ($${managerCost.toLocaleString()})</button>
        <button class="advertise-btn">Advertise ($${advertiseCost.toLocaleString()})</button>
        <button class="maintain-btn">Maintain ($${maintenanceCost.toLocaleString()})</button>
        <button class="expand-btn">Expand ($${expansionCost.toLocaleString()})</button>
        <button class="research-btn">Research ($${researchCost.toLocaleString()})</button>
        <button class="sell-btn">Sell +$${sellValue.toLocaleString()}</button>
      </div>
    `;

    // Attach event listeners
    card.querySelector(".collect-btn").onclick = () => collectBusinessProfit(b);
    card.querySelector(".upgrade-btn").onclick = () => upgradeBusiness(b);
    card.querySelector(".manager-btn").onclick = () => hireManager(b);
    card.querySelector(".advertise-btn").onclick = () => advertiseBusiness(b);
    card.querySelector(".maintain-btn").onclick = () => maintainBusiness(b);
    card.querySelector(".expand-btn").onclick = () => expandBusiness(b);
    card.querySelector(".research-btn").onclick = () => researchBusiness(b);
    card.querySelector(".sell-btn").onclick = () => sellBusiness(b);

    manageBusinessList.appendChild(card);
  });
}

// ========== ACTIONS ========== //
function collectBusinessProfit(business) {
  const monthlyProfit = business.profitPerYear / 12 * (business.level || 1) * business.efficiency;
  player.money += monthlyProfit;
  player.stress += 2;
  showToast(`Collected $${Math.round(monthlyProfit).toLocaleString()} from ${business.name}.`);
  updateStats();
  displayManagedBusinesses();
}

function upgradeBusiness(business) {
  const upgradeCost = Math.round(business.cost * 0.6 * business.level);
  if (player.money < upgradeCost) return showToast("Not enough money to upgrade!");
  player.money -= upgradeCost;
  business.level++;
  business.profitPerYear = Math.round(business.profitPerYear * 1.3);
  player.reputation += 2;
  showToast(`${business.name} upgraded to Level ${business.level}!`);
  updateStats();
  displayManagedBusinesses();
}

function hireManager(business) {
  const managerCost = Math.round(business.cost * 0.25);
  if (business.hasManager) return showToast(`${business.name} already has a manager!`);
  if (player.money < managerCost) return showToast("Not enough money to hire manager!");
  player.money -= managerCost;
  business.hasManager = true;
  player.stress = Math.max(0, player.stress - 5);
  showToast(`Hired a manager for ${business.name}.`);
  updateStats();
  displayManagedBusinesses();
}

function advertiseBusiness(business) {
  const advertiseCost = Math.round(business.cost * 0.15);
  if (player.money < advertiseCost) return showToast("Not enough money to advertise!");
  player.money -= advertiseCost;
  business.profitPerYear = Math.round(business.profitPerYear * 1.15);
  player.reputation += 3;
  showToast(`${business.name} gained popularity from advertising!`);
  updateStats();
  displayManagedBusinesses();
}

function maintainBusiness(business) {
  const maintenanceCost = Math.round(business.cost * 0.1);
  if (player.money < maintenanceCost) return showToast("Not enough money for maintenance!");
  player.money -= maintenanceCost;
  player.stress -= 2;
  showToast(`${business.name} is well maintained — efficiency stable!`);
  updateStats();
  displayManagedBusinesses();
}

function expandBusiness(business) {
  const expansionCost = Math.round(business.cost * 1.5 * business.level);
  if (player.money < expansionCost) return showToast("Not enough money to expand!");
  player.money -= expansionCost;
  business.level += 2;
  business.profitPerYear = Math.round(business.profitPerYear * 1.6);
  player.reputation += 4;
  showToast(`${business.name} expanded! Profit capacity increased!`);
  updateStats();
  displayManagedBusinesses();
}

function researchBusiness(business) {
  const researchCost = Math.round(business.cost * 0.2 * business.level);
  if (player.money < researchCost) return showToast("Not enough money for research!");
  player.money -= researchCost;
  business.efficiency += 0.1;
  player.reputation += 1;
  showToast(`${business.name} has improved technology! Efficiency up!`);
  updateStats();
  displayManagedBusinesses();
}

function sellBusiness(business) {
  const sellValue = Math.round((business.cost * business.level) * 0.75);
  player.money += sellValue;
  player.ownedBusinesses = player.ownedBusinesses.filter(b => b.name !== business.name);
  player.reputation -= 3;
  showToast(`Sold ${business.name} for $${sellValue.toLocaleString()}`);
  updateStats();
  displayManagedBusinesses();
}

// ========== AUTO-INCOME FOR MANAGED BUSINESSES ========== //
setInterval(() => {
  player.ownedBusinesses.forEach(b => {
    if (b.hasManager) {
      const passiveProfit = b.profitPerYear / 12 * (b.level || 1) * b.efficiency;
      player.money += passiveProfit;
    }
  });
  updateStats();
}, 60000); // every 60 seconds = 1 in-game month
