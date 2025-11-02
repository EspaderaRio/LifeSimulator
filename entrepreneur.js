// ===================== ENTREPRENEUR TAB (Realistic Expanded Version) ===================== //
function openEntrepreneurTab(currentBusiness = null) {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";

  // If the player already owns businesses, show management view
  if (currentBusiness || (player.ownedBusinesses && player.ownedBusinesses.length > 0)) {
    return openSpecificBusinessTab(currentBusiness);
  }

  // Otherwise choose what type to start
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <h2>Start Your Company</h2>
      <p>Choose the industry for your business. Each has unique risks, rewards, and startup costs.</p>
      <div class="business-grid">
        <button data-business="tech">💻 Tech Startup</button>
        <button data-business="restaurant">🍽️ Restaurant</button>
        <button data-business="gym">🏋️ Fitness Gym</button>
        <button data-business="fashion">👗 Fashion Brand</button>
        <button data-business="media">🎬 Media Company</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector(".close").onclick = () => modal.remove();

  modal.querySelectorAll("[data-business]").forEach(btn => {
    btn.onclick = () => {
      const type = btn.dataset.business;
      modal.remove();
      openBusinessFundingDecision(type);
    };
  });
}

// ===================== BUSINESS FUNDING DECISION ===================== //
function openBusinessFundingDecision(type) {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";

  const fundingOptions = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <h2>Funding Your ${capitalize(type)} Business</h2>
      <p>You need startup capital. Choose how to fund your business:</p>
      <div class="button-group">
        <button id="self-fund">💰 Self-Fund (Use personal money)</button>
        <button id="loan">🏦 Take a Loan (Pay interest yearly)</button>
        <button id="investor">🤝 Seek Investor (Lose some control)</button>
      </div>
    </div>
  `;
  modal.innerHTML = fundingOptions;
  document.body.appendChild(modal);
  modal.querySelector(".close").onclick = () => modal.remove();

  modal.querySelector("#self-fund").onclick = () => {
    modal.remove();
    createNewBusiness(type, "self");
  };
  modal.querySelector("#loan").onclick = () => {
    modal.remove();
    createNewBusiness(type, "loan");
  };
  modal.querySelector("#investor").onclick = () => {
    modal.remove();
    createNewBusiness(type, "investor");
  };
}

// ===================== CREATE NEW BUSINESS ===================== //
function createNewBusiness(type, fundingType = "self") {
  if (!player.ownedBusinesses) player.ownedBusinesses = [];

  const businessTemplates = {
    tech: { name: "Tech Startup", startupCost: 6000, baseProfit: 2500, trend: 1.3, risk: 0.25 },
    restaurant: { name: "Restaurant", startupCost: 4000, baseProfit: 1800, trend: 1.05, risk: 0.15 },
    gym: { name: "Fitness Gym", startupCost: 4500, baseProfit: 2000, trend: 1.1, risk: 0.18 },
    fashion: { name: "Fashion Brand", startupCost: 3500, baseProfit: 1600, trend: 1.2, risk: 0.22 },
    media: { name: "Media Company", startupCost: 5000, baseProfit: 2200, trend: 1.15, risk: 0.20 }
  };

  const b = businessTemplates[type];
  const newBiz = {
    id: Date.now(),
    type,
    name: b.name,
    level: 1,
    funding: fundingType,
    startupCost: b.startupCost,
    loanBalance: fundingType === "loan" ? b.startupCost * 1.1 : 0,
    investorShare: fundingType === "investor" ? 0.2 : 0,
    baseProfit: b.baseProfit,
    profitPerYear: b.baseProfit,
    marketTrend: b.trend,
    reputation: 0,
    employees: 0,
    morale: 80,
    satisfaction: 75,
    happinessImpact: 2,
    risk: b.risk
  };

  // Handle funding type
  if (fundingType === "self") {
    if (player.money < b.startupCost) return showToast("Not enough money to self-fund!");
    player.money -= b.startupCost;
  } else if (fundingType === "loan") {
    player.money += b.startupCost;
  } else if (fundingType === "investor") {
    player.money += b.startupCost * 0.7;
    showToast("An investor funded your startup! They’ll take 20% of profits.");
  }

  player.ownedBusinesses.push(newBiz);
  showToast(`You founded a ${b.name}!`);
  updateStats();
  openSpecificBusinessTab(type);
}

// ===================== BUSINESS MANAGEMENT TAB ===================== //
function openSpecificBusinessTab(businessType = null) {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";

  // If showing all businesses
  if (!businessType) {
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close">&times;</span>
        <h2>Your Businesses</h2>
        <p>Manage or expand your business empire:</p>
        <div class="business-list">
          ${(player.ownedBusinesses || [])
            .map(
              biz =>
                `<button data-biz="${biz.type}">🏢 ${biz.name} (Lvl ${biz.level}) - $${biz.profitPerYear}/yr</button>`
            )
            .join("")}
        </div>
        <button id="new-business-btn">➕ Start New Business</button>
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector(".close").onclick = () => modal.remove();

    modal.querySelectorAll("[data-biz]").forEach(btn => {
      btn.onclick = () => {
        const type = btn.dataset.biz;
        modal.remove();
        openSpecificBusinessTab(type);
      };
    });
    modal.querySelector("#new-business-btn").onclick = () => {
      modal.remove();
      openEntrepreneurTab();
    };
    return;
  }

  // Find specific business
  const biz = player.ownedBusinesses.find(b => b.type === businessType);
  if (!biz) return showToast("Business not found!");

  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <h2>${biz.name}</h2>
      <p><strong>Level:</strong> ${biz.level} | <strong>Profit/Year:</strong> $${biz.profitPerYear}</p>
      <p><strong>Market Trend:</strong> ${biz.marketTrend.toFixed(2)} | <strong>Reputation:</strong> ${biz.reputation}</p>
      <p><strong>Employees:</strong> ${biz.employees} | <strong>Morale:</strong> ${biz.morale}% | <strong>Customer Sat.:</strong> ${biz.satisfaction}%</p>
      <hr>
      <div class="button-group">
        <button id="invest-btn">💰 Expand ($${biz.level * 3000})</button>
        <button id="hire-btn">👥 Hire Employees</button>
        <button id="train-btn">📚 Employee Training</button>
        <button id="market-btn">📈 Marketing</button>
        <button id="sell-btn">💵 Sell Business</button>
        <button id="back-btn">⬅️ Back</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector(".close").onclick = () => modal.remove();

  // Investment
  modal.querySelector("#invest-btn").onclick = () => {
    const cost = biz.level * 3000;
    if (player.money < cost) return showToast("Not enough money to expand!");
    player.money -= cost;
    biz.level++;
    biz.profitPerYear += 1500 * Math.random() + 500;
    biz.marketTrend += 0.05;
    biz.reputation += 3;
    showToast(`${biz.name} expanded successfully!`);
    updateStats();
    modal.remove();
    openSpecificBusinessTab(businessType);
  };

  // Hire employees
  modal.querySelector("#hire-btn").onclick = () => {
    const cost = 1200 + biz.employees * 800;
    if (player.money < cost) return showToast("Not enough money to hire!");
    player.money -= cost;
    biz.employees++;
    biz.morale += 5;
    biz.satisfaction += 3;
    biz.profitPerYear += 400;
    showToast(`You hired new staff for ${biz.name}.`);
    updateStats();
    modal.remove();
    openSpecificBusinessTab(businessType);
  };

  // Train employees
  modal.querySelector("#train-btn").onclick = () => {
    const cost = 1000 + biz.employees * 200;
    if (player.money < cost) return showToast("Can't afford training!");
    player.money -= cost;
    biz.morale += 10;
    biz.satisfaction += 5;
    biz.reputation += 2;
    showToast(`Employee training improved morale and satisfaction!`);
    updateStats();
    modal.remove();
    openSpecificBusinessTab(businessType);
  };

  // Marketing
  modal.querySelector("#market-btn").onclick = () => {
    const cost = 2000;
    if (player.money < cost) return showToast("Not enough funds for marketing!");
    player.money -= cost;
    biz.reputation += 5 + Math.floor(Math.random() * 10);
    biz.satisfaction += 2;
    biz.profitPerYear += 500;
    showToast(`${biz.name} gained public attention!`);
    updateStats();
    modal.remove();
    openSpecificBusinessTab(businessType);
  };

  // Sell business
  modal.querySelector("#sell-btn").onclick = () => {
    const value = biz.profitPerYear * 3 + biz.reputation * 50;
    player.money += value;
    player.ownedBusinesses = player.ownedBusinesses.filter(b => b.id !== biz.id);
    showToast(`You sold ${biz.name} for $${value.toLocaleString()}.`);
    updateStats();
    modal.remove();
    openSpecificBusinessTab();
  };

  // Back
  modal.querySelector("#back-btn").onclick = () => {
    modal.remove();
    openSpecificBusinessTab();
  };
}

// ===================== YEARLY BUSINESS UPDATES ===================== //
export function applyYearlyBusinessChanges() {
  if (!player.ownedBusinesses) return;
  player.ownedBusinesses.forEach(biz => {
    // Random yearly event modifier
    const eventRoll = Math.random();
    let eventMessage = null;

    if (eventRoll < 0.1) {
      biz.profitPerYear *= 1.3;
      eventMessage = `${biz.name} had a breakout year! Profits skyrocketed.`;
    } else if (eventRoll < 0.2) {
      biz.profitPerYear *= 0.7;
      eventMessage = `${biz.name} faced supply issues, profits dipped.`;
    } else if (eventRoll < 0.25) {
      biz.reputation += 5;
      eventMessage = `${biz.name} won an industry award!`;
    } else if (eventRoll < 0.3) {
      biz.morale -= 10;
      eventMessage = `${biz.name} had staff resignations, morale fell.`;
    }

    // Apply morale & satisfaction impact
    const moraleMultiplier = biz.morale / 100;
    const satisfactionMultiplier = biz.satisfaction / 100;
    const randomVariance = 0.9 + Math.random() * 0.2;

    biz.profitPerYear *= biz.marketTrend * moraleMultiplier * satisfactionMultiplier * randomVariance;

    // Minimum and maximum caps
    biz.profitPerYear = Math.max(500, Math.min(biz.profitPerYear, biz.baseProfit * 20));

    // Loan or investor deduction
    if (biz.funding === "loan") {
      const interest = biz.loanBalance * 0.05;
      player.money -= interest;
      showToast(`Paid $${interest.toFixed(0)} in loan interest for ${biz.name}.`);
    } else if (biz.funding === "investor") {
      const investorCut = biz.profitPerYear * 0.2;
      player.money -= investorCut;
    }

    // Add yearly profit
    player.money += biz.profitPerYear;

    // Recover morale slightly each year
    biz.morale = Math.min(100, biz.morale + 3);
    biz.satisfaction = Math.min(100, biz.satisfaction + 2);

    if (eventMessage) showToast(eventMessage);
  });

  updateStats();
}
