/* ============================================================
 BUSINESS MANAGEMENT SYSTEM
 Works with script.js and businesses.json
============================================================ */

// ====== Modal and Button Setup ======
const manageBusinessBtn = document.getElementById("open-manage-businesses");
const businessManageModal = document.getElementById("businessManageModal");
const closeBusinessManage = document.getElementById("close-manage-business");
const manageBusinessList = document.getElementById("manage-business-list");

if (manageBusinessBtn) {
  manageBusinessBtn.addEventListener("click", openBusinessManageTab);
}
if (closeBusinessManage) {
  closeBusinessManage.addEventListener("click", closeBusinessManageTab);
}

// ====== Open & Close ======
function openBusinessManageTab() {
  displayManagedBusinesses();
  businessManageModal.classList.remove("hidden");
}

function closeBusinessManageTab() {
  businessManageModal.classList.add("hidden");
}

// ====== Display Owned Businesses ======
function displayManagedBusinesses() {
  manageBusinessList.innerHTML = "";

  if (player.ownedBusinesses.length === 0) {
    manageBusinessList.innerHTML = "<p>You don't own any businesses yet!</p>";
    return;
  }

  player.ownedBusinesses.forEach((b, i) => {
    // Add upgrade and manager fields if missing
    if (!b.level) b.level = 1;
    if (b.hasManager === undefined) b.hasManager = false;

    const card = document.createElement("div");
    card.className = "manage-business-card";

    card.innerHTML = `
      <img src="assets/svgs/${b.image || "default.svg"}" alt="${b.name}">
      <h3>${b.name} (Lvl ${b.level})</h3>
      <p>Profit per Year: $${Math.round(b.profitPerYear * b.level).toLocaleString()}</p>
      <p>Has Manager: ${b.hasManager ? "✅ Yes" : "❌ No"}</p>
      <div class="business-actions">
        <button class="collect-btn">Collect Profit</button>
        <button class="upgrade-btn">Upgrade</button>
        <button class="manager-btn">Hire Manager</button>
        <button class="sell-btn">Sell</button>
      </div>
    `;

    // Attach event listeners
    card.querySelector(".collect-btn").onclick = () => collectBusinessProfit(b);
    card.querySelector(".upgrade-btn").onclick = () => upgradeBusiness(b);
    card.querySelector(".manager-btn").onclick = () => hireManager(b);
    card.querySelector(".sell-btn").onclick = () => sellBusiness(b);

    manageBusinessList.appendChild(card);
  });
}

// ====== Actions ======
function collectBusinessProfit(business) {
  const monthlyProfit = business.profitPerYear / 12 * (business.level || 1);
  player.money += monthlyProfit;
  player.stress += 2;
  showToast(`Collected $${Math.round(monthlyProfit).toLocaleString()} from ${business.name}.`);
  updateStats();
}

function upgradeBusiness(business) {
  const upgradeCost = Math.round(business.cost * 0.5 * business.level);
  if (player.money < upgradeCost) return showToast("Not enough money to upgrade!");
  player.money -= upgradeCost;
  business.level++;
  business.profitPerYear = Math.round(business.profitPerYear * 1.25);
  player.reputation += 2;
  showToast(`${business.name} upgraded to Level ${business.level}!`);
  updateStats();
  displayManagedBusinesses();
}

function hireManager(business) {
  if (business.hasManager) return showToast(`${business.name} already has a manager!`);
  const managerCost = Math.round(business.cost * 0.25);
  if (player.money < managerCost) return showToast("Not enough money to hire manager!");
  player.money -= managerCost;
  business.hasManager = true;
  player.stress = Math.max(0, player.stress - 5);
  showToast(`Hired a manager for ${business.name}. Stress reduced!`);
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
