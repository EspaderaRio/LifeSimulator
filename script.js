let year = 1;
let money = 1000;
let reputation = 50;
let stress = 10;

const yearEl = document.getElementById('year');
const moneyEl = document.getElementById('money');
const reputationEl = document.getElementById('reputation');
const stressEl = document.getElementById('stress');
const eventText = document.getElementById('event-text');
const choice1 = document.getElementById('choice1');
const choice2 = document.getElementById('choice2');

const events = [
  { text: "A competitor releases a new product. Do you spend on marketing ($300) or ignore?", 
    options: [
      { text: "Spend on marketing", money: -300, reputation: +5 },
      { text: "Ignore", reputation: -5 }
    ] 
  },
  { text: "An investor offers you $2000 for 10% of your business.",
    options: [
      { text: "Accept", money: +2000, reputation: +10 },
      { text: "Decline", reputation: +2 }
    ]
  },
  { text: "Your employee quits suddenly! Do you hire a replacement quickly ($500)?",
    options: [
      { text: "Hire quickly", money: -500, stress: +5 },
      { text: "Take extra workload", stress: +10, reputation: -3 }
    ]
  },
  { text: "A viral trend boosts your brand visibility!", 
    options: [
      { text: "Take advantage (spend $200)", money: -200, reputation: +15 },
      { text: "Do nothing", reputation: +5 }
    ]
  },
  { text: "Tax audit incoming. Do you cooperate or hide some numbers?",
    options: [
      { text: "Cooperate honestly", reputation: +10, stress: +5 },
      { text: "Hide data", reputation: -15, money: +1000 }
    ]
  }
];

function updateStats() {
  yearEl.textContent = year;
  moneyEl.textContent = money;
  reputationEl.textContent = reputation;
  stressEl.textContent = stress;
}

function nextYear(eventObj) {
  year++;
  updateStats();
  
  if (eventObj) {
    const { text, options } = eventObj;
    eventText.textContent = text;
    choice1.textContent = options[0].text;
    choice2.textContent = options[1].text;

    choice1.onclick = () => handleChoice(options[0]);
    choice2.onclick = () => handleChoice(options[1]);
  }
}

function handleChoice(choice) {
  money += choice.money || 0;
  reputation += choice.reputation || 0;
  stress += choice.stress || 0;

  const randomEvent = events[Math.floor(Math.random() * events.length)];
  nextYear(randomEvent);
}

choice1.addEventListener('click', () => {
  if (money >= 500) {
    money -= 500;
    money += 1000;
    reputation += 10;
    nextYear(events[Math.floor(Math.random() * events.length)]);
    eventText.textContent = "Your lemonade stand succeeded! You earned $1000.";
  } else {
    eventText.textContent = "You don't have enough capital to start.";
  }
  updateStats();
});

choice2.addEventListener('click', () => {
  stress -= 5;
  nextYear(events[Math.floor(Math.random() * events.length)]);
  eventText.textContent = "You rested this year and planned your next move.";
  updateStats();
});

updateStats();
