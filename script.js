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

choice1.addEventListener('click', () => {
  if (money >= 500) {
    money -= 500;
    year++;
    reputation += 10;
    eventText.textContent = "Your lemonade stand is a success! You earn $1000 profit.";
    money += 1000;
  } else {
    eventText.textContent = "You don't have enough money to start the business.";
  }
  updateStats();
});

choice2.addEventListener('click', () => {
  year++;
  stress -= 5;
  eventText.textContent = "You decided to save money and rest this year.";
  updateStats();
});

function updateStats() {
  yearEl.textContent = year;
  moneyEl.textContent = money;
  reputationEl.textContent = reputation;
  stressEl.textContent = stress;
}
