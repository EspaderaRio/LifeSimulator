/* ============================================================
SCENARIO ENGINE (Final Optimized v4)
Triggers yearly profession/business events that affect stats.
============================================================ */

import { player, updateStats } from './script.js';
import { displayOwnedBusinesses } from './script.js';
import { showToast } from './script.js';

// Utility: clamp number between min and max
function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

// ---------------- Scenario pools ----------------
const scenarioPools = {
  entrepreneur: [
    {
      id: 'ent_competitor',
      title: "New Competitor Appears",
      description: "A low-cost competitor opened nearby, eating into your margins.",
      choices: [
        { text: "Lower prices temporarily", effects: { money: -3000, reputation: +2 }, note: "Short-term losses for market share." },
        { text: "Launch an ad campaign", effects: { money: -4000, marketImpact: +0.12 }, note: "Spend to regain attention." },
        { text: "Improve your product", effects: { money: -2000, reputation: +3, efficiencyImpact: +0.05 }, note: "Invest in quality." }
      ]
    },
    {
      id: 'ent_investor_offer',
      title: "Investor Offer",
      description: "An investor offers capital in exchange for equity.",
      choices: [
        { text: "Accept (Lose 20% ownership)", effects: { money: +15000, ownershipDelta: -20, reputation: +2 }, note: "Fast funds but diluted control." },
        { text: "Negotiate", effects: { money: +8000, reputation: +1 }, note: "You keep more control but less cash." },
        { text: "Decline", effects: { reputation: -1 }, note: "No dilution; slower growth." }
      ]
    }
  ],
  businessOwner: [
    {
      id: 'biz_supply_chain',
      title: "Supply Chain Disruption",
      description: "Suppliers report delays, inventories are low.",
      choices: [
        { text: "Pay premium for faster shipping", effects: { money: -3000, marketImpact: +0.08 }, note: "Expense but keeps shelves full." },
        { text: "Switch supplier", effects: { reputation: -1, efficiencyImpact: -0.05 }, note: "Short-term hit while switching." },
        { text: "Reduce product variety", effects: { marketImpact: -0.05 }, note: "Conserve resources." }
      ]
    },
    {
      id: 'biz_health_inspection',
      title: "Health & Safety Inspection",
      description: "A surprise inspection may affect public trust.",
      choices: [
        { text: "Comply and improve standards", effects: { money: -1500, reputation: +3 }, note: "Costs but builds trust." },
        { text: "Cut corners", effects: { reputation: -4, risk: +0.1 }, note: "Risky and damaging if caught." }
      ]
    },
    {
      id: 'biz_investor_offer',
      title: "Investor Buyout Offer",
      description: "A private equity firm wants to buy 40% of your company for a large sum.",
      choices: [
        { text: "Accept the offer", effects: { money: +25000, ownershipDelta: -40, reputation: +2 }, note: "Cash influx, less control." },
        { text: "Decline politely", effects: { reputation: +1 }, note: "You remain independent." },
        { text: "Negotiate partial stake", effects: { money: +15000, ownershipDelta: -20, reputation: +3 }, note: "Balanced deal." }
      ]
    },
    {
      id: 'biz_market_boom',
      title: "Market Boom!",
      description: "Your industry experiences sudden growth; profits surge!",
      choices: [
        { text: "Invest in expansion", effects: { money: -5000, profitImpact: +0.4, reputation: +2 }, note: "High reward move." },
        { text: "Play it safe", effects: { profitImpact: +0.15 }, note: "Moderate benefit." }
      ]
    },
    {
      id: 'biz_recession',
      title: "Economic Downturn",
      description: "A recession hits, reducing demand for your products.",
      choices: [
        { text: "Cut costs", effects: { profitImpact: -0.3, happiness: -2 }, note: "Tight but efficient." },
        { text: "Keep all staff", effects: { money: -8000, reputation: +2 }, note: "You maintain loyalty." }
      ]
    }
  ],
  athlete: [
    {
      id: 'ath_injury',
      title: "Training Injury",
      description: "You pulled a muscle during practice.",
      choices: [
        { text: "Rest & recover", effects: { health: +5, reputation: -1 }, note: "Long-term health focus." },
        { text: "Push through competition", effects: { health: -8, reputation: +3, stress: +2 }, note: "Short-term glory, long-term risk." }
      ]
    }
  ],
  doctor: [
    {
      id: 'doc_breakthrough',
      title: "Medical Breakthrough",
      description: "A new treatment needs early adopters & investment.",
      choices: [
        { text: "Adopt the treatment", effects: { reputation: +4, money: -2000 }, note: "Be at the forefront." },
        { text: "Wait for more data", effects: { reputation: -1 }, note: "Safer but less recognition." }
      ]
    }
  ],
  celebrity: [
    {
      id: 'celeb_backlash',
      title: "Public Backlash",
      description: "An old tweet resurfaced and fans are upset.",
      choices: [
        { text: "Apologize & donate", effects: { money: -3000, reputation: +3 }, note: "Damage control." },
        { text: "Ignore", effects: { reputation: -4 }, note: "Risky PR strategy." }
      ]
    }
  ]
};

// ---------------- Generate and show a scenario ----------------
export function generateScenario() {
  const pool = [];
  const prof = (player.profession || '').toLowerCase();

  // profession-based pools
  if (prof === 'entrepreneur' || prof === 'licensed' || prof === 'freelancer') pool.push(...scenarioPools.entrepreneur);
  if (prof === 'athlete') pool.push(...scenarioPools.athlete);
  if (prof === 'doctor' || prof === 'licensed') pool.push(...scenarioPools.doctor);
  if (prof === 'celebrity') pool.push(...scenarioPools.celebrity);

  // business-based scenarios
  if ((player.ownedBusinesses || []).length) {
    pool.push(...scenarioPools.businessOwner);
    const totalBusinessValue = player.ownedBusinesses.reduce((sum, b) => sum + (b.cost * b.level), 0);
    if (totalBusinessValue > 50000 && Math.random() < 0.5) pool.push(...scenarioPools.businessOwner);
  }

  // neutral fallback
  pool.push({
    id: 'personal_break',
    title: 'Take a Break?',
    description: 'You feel burnt out. How do you respond?',
    choices: [
      { text: 'Take a short vacation', effects: { happiness: +4, stress: -3, money: -1000 }, note: 'Recharge.' },
      { text: 'Push through', effects: { stress: +3, reputation: +1 }, note: 'Work hard, risk burnout.' }
    ]
  });

  if (!pool.length) return;
  const scenario = pool[Math.floor(Math.random() * pool.length)];
  showScenarioModal(scenario);
}

// ---------------- Modal UI ----------------
function showScenarioModal(scenario) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay scenario-modal';
  modal.innerHTML = `
    <div class="modal-content scenario-box">
      <h2>${scenario.title}</h2>
      <p>${scenario.description}</p>
      <div class="scenario-choices">
        ${scenario.choices.map((c, i) => `<button class="choice-btn" data-i="${i}">${c.text}</button>`).join('')}
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  modal.querySelectorAll('.choice-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.i, 10);
      const choice = scenario.choices[idx];
      applyChoiceEffects(choice);
      if (choice.note) showToast(choice.note);
      if (Math.random() < 0.4) {
        const randomOutcome = [
          "The media praised your decision.",
          "Employees felt motivated.",
          "Competitors took notice.",
          "You gained insights for the future."
        ];
        showToast(randomOutcome[Math.floor(Math.random() * randomOutcome.length)]);
      }
      modal.remove();
    });
  });
}

// ---------------- Apply effects ----------------
function applyChoiceEffects(choice) {
  const effects = choice.effects || {};
  for (const key in effects) {
    const v = effects[key];
    if (key === 'marketImpact') {
      (player.ownedBusinesses || []).forEach(b => b.marketTrend = clamp(b.marketTrend + v, 0.2, 3));
    } else if (key === 'ownershipDelta') {
      const target = player.ownedBusinesses?.[0];
      if (target) target.ownership = clamp((target.ownership || 100) + v, 0, 100);
    } else if (key === 'risk') {
      player.lastRisk = (player.lastRisk || 0) + v;
    } else if (key === 'profitImpact') {
      (player.ownedBusinesses || []).forEach(b => {
        b.profitPerYear = Math.max(1000, b.profitPerYear * (1 + v));
      });
    } else if (key === 'efficiencyImpact') {
      (player.ownedBusinesses || []).forEach(b => {
        b.efficiency = clamp(b.efficiency + v, 0.5, 2);
      });
    } else if (key in player) {
      player[key] = (player[key] || 0) + v;
    } else if (!isNaN(Number(v)) && player.ownedBusinesses?.length) {
      player.ownedBusinesses[0][key] = (player.ownedBusinesses[0][key] || 0) + Number(v);
    }
  }

  // normalize & update
  player.happiness = clamp(player.happiness || 0, -100, 100);
  player.stress = clamp(player.stress || 0, 0, 500);
  updateStats();
  displayOwnedBusinesses();
}

// ---------------- Yearly trigger ----------------
export function checkYearlyScenarioTrigger() {
  (player.ownedBusinesses || []).forEach(biz => {
    const variance = (Math.random() - 0.5) * 0.3; // ±15%
    biz.profitPerYear *= (1 + variance * biz.marketTrend);
    biz.profitPerYear = Math.max(500, biz.profitPerYear);
  });

  if (Math.random() < 0.85) generateScenario();
}
