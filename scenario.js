/* ============================================================
SCENARIO ENGINE (Final Optimized v6)
Triggers yearly profession/business events that affect stats.
Supports athlete sport specialization.
============================================================ */

import { player, updateStats } from './script.js';
import { displayOwnedBusinesses } from './script.js';
import { showToast } from './script.js';
import { applyYearlyHealthAndExpenses } from './script.js';
import { applyYearlyBusinessChanges} from './script.js';
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
  },
  {
    id: 'ent_market_trend',
    title: "Changing Market Trends",
    description: "Your target market is shifting preferences rapidly.",
    choices: [
      { text: "Pivot your product line", effects: { money: -2500, reputation: +3, efficiencyImpact: +0.05 }, note: "Adapt to new trends." },
      { text: "Stay the course", effects: { reputation: -2, stress: +2 }, note: "Risk falling behind." },
      { text: "Conduct market research", effects: { money: -1500, reputation: +1 }, note: "Gain insight for future strategies." }
    ]
  },
  {
    id: 'ent_staff_conflict',
    title: "Staff Conflict",
    description: "Internal conflicts are reducing productivity.",
    choices: [
      { text: "Mediation & team-building", effects: { money: -1000, reputation: +2, stress: -2 }, note: "Improves morale." },
      { text: "Ignore issues", effects: { efficiencyImpact: -0.05, stress: +3 }, note: "May worsen productivity." },
      { text: "Replace staff", effects: { money: -2000, reputation: -1 }, note: "Short-term solution, costly." }
    ]
  },
  {
    id: 'ent_tech_investment',
    title: "Invest in New Technology",
    description: "Upgrading your systems could improve efficiency.",
    choices: [
      { text: "Invest heavily", effects: { money: -5000, efficiencyImpact: +0.15, reputation: +2 }, note: "High cost but long-term gain." },
      { text: "Invest moderately", effects: { money: -2500, efficiencyImpact: +0.08 }, note: "Balanced approach." },
      { text: "Do nothing", effects: { efficiencyImpact: -0.03 }, note: "Risk falling behind competitors." }
    ]
  },
  {
    id: 'ent_client_feedback',
    title: "Important Client Feedback",
    description: "A key client provides critical feedback on your services.",
    choices: [
      { text: "Implement changes immediately", effects: { money: -1500, reputation: +3 }, note: "Shows responsiveness." },
      { text: "Ignore minor feedback", effects: { reputation: -1 }, note: "Could damage relationship." },
      { text: "Negotiate with client", effects: { reputation: +1, stress: +1 }, note: "Compromise approach." }
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
  },
  {
    id: 'biz_tech_upgrade',
    title: "Technology Upgrade",
    description: "A new software system could streamline operations.",
    choices: [
      { text: "Invest heavily", effects: { money: -4000, efficiencyImpact: +0.2, reputation: +1 }, note: "High upfront cost, long-term gain." },
      { text: "Invest moderately", effects: { money: -2000, efficiencyImpact: +0.1 }, note: "Balanced improvement." },
      { text: "Do nothing", effects: { efficiencyImpact: -0.05 }, note: "Risk falling behind competitors." }
    ]
  },
  {
    id: 'biz_employee_strike',
    title: "Employee Strike",
    description: "Workers demand higher wages and better conditions.",
    choices: [
      { text: "Negotiate and raise wages", effects: { money: -5000, reputation: +4, stress: +1 }, note: "Builds loyalty." },
      { text: "Hold firm", effects: { reputation: -3, risk: +0.1 }, note: "May escalate tension." },
      { text: "Replace striking staff", effects: { money: -3000, efficiencyImpact: -0.1 }, note: "Quick solution but costly." }
    ]
  },
  {
    id: 'biz_marketing_campaign',
    title: "Major Marketing Campaign",
    description: "A campaign could attract new customers and boost brand image.",
    choices: [
      { text: "Invest aggressively", effects: { money: -5000, reputation: +5, marketImpact: +0.15 }, note: "High reward, high cost." },
      { text: "Invest moderately", effects: { money: -2000, reputation: +2, marketImpact: +0.07 }, note: "Balanced approach." },
      { text: "Skip campaign", effects: { reputation: -1 }, note: "Missed opportunity for growth." }
    ]
  },
  {
    id: 'biz_regulation_change',
    title: "Regulatory Change",
    description: "New government regulations affect your operations.",
    choices: [
      { text: "Comply fully", effects: { money: -2500, reputation: +3, stress: +1 }, note: "Avoid fines and improve public perception." },
      { text: "Partially comply", effects: { reputation: -2, risk: +0.1 }, note: "Risk of penalties." },
      { text: "Ignore", effects: { risk: +0.3, reputation: -3 }, note: "Could result in severe consequences." }
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
  },
 // Basketball-specific scenarios
{
  id: 'ath_basketball_tryout',
  title: "Basketball Tryout Opportunity",
  description: "A local team invites you to try out for a championship.",
  choices: [
    { text: "Attend the tryout", effects: { reputation: +3, stress: +2 }, note: "Chance to gain recognition." },
    { text: "Decline", effects: { reputation: -1 }, note: "Missed opportunity." }
  ],
  sport: "basketball"
},
{
  id: 'ath_basketball_training_camp',
  title: "Intensive Training Camp",
  description: "Your coach suggests an off-season training camp to improve your skills.",
  choices: [
    { text: "Join the camp", effects: { health: -2, reputation: +3, stress: +2 }, note: "Boost skills but demanding." },
    { text: "Skip the camp", effects: { reputation: -1 }, note: "Save energy but miss growth." }
  ],
  sport: "basketball"
},
{
  id: 'ath_basketball_friendly_match',
  title: "Friendly Match Invitation",
  description: "A friendly game with a rival team could attract scouts.",
  choices: [
    { text: "Play aggressively", effects: { health: -1, reputation: +2, stress: +1 }, note: "High impact performance." },
    { text: "Play safe", effects: { reputation: +1 }, note: "Conserve energy, moderate recognition." }
  ],
  sport: "basketball"
},
{
  id: 'ath_basketball_team_conflict',
  title: "Team Conflict",
  description: "Disagreements among teammates are affecting practice performance.",
  choices: [
    { text: "Mediate the conflict", effects: { reputation: +2, stress: +2 }, note: "Improves team cohesion." },
    { text: "Focus on personal training", effects: { reputation: +1 }, note: "Avoid conflict but team suffers." },
    { text: "Confront aggressively", effects: { reputation: -2, stress: +4 }, note: "Risky move; could backfire." }
  ],
  sport: "basketball"
},
{
  id: 'ath_basketball_championship',
  title: "Regional Championship",
  description: "Your team has qualified for the regional championship. Time to shine!",
  choices: [
    { text: "Play your best", effects: { reputation: +5, health: -3, stress: +3 }, note: "High reward but exhausting." },
    { text: "Play strategically", effects: { reputation: +3, stress: +1 }, note: "Safer approach." },
    { text: "Sit out to avoid injury", effects: { reputation: -2, health: +2 }, note: "Avoid risk but lose opportunity." }
  ],
  sport: "basketball"
},
{
  id: 'ath_basketball_scouting_offer',
  title: "Scout Offer",
  description: "A professional scout is interested in recruiting you.",
  choices: [
    { text: "Accept tryout with the scout", effects: { reputation: +4, stress: +3 }, note: "Potential pro career." },
    { text: "Decline politely", effects: { reputation: -1 }, note: "Stay with current team." }
  ],
  sport: "basketball"
},
 // Boxing-specific scenarios
{
  id: 'ath_boxing_match',
  title: "Upcoming Boxing Match",
  description: "An important match is scheduled soon.",
  choices: [
    { text: "Train intensively", effects: { health: -5, reputation: +4, stress: +3 }, note: "Higher chance of winning." },
    { text: "Train normally", effects: { reputation: +2 }, note: "Balanced approach." }
  ],
  sport: "boxing"
},
{
  id: 'ath_boxing_training_camp',
  title: "Intensive Training Camp",
  description: "A renowned coach invites you to a special training camp.",
  choices: [
    { text: "Attend camp", effects: { health: -3, reputation: +3, stress: +2 }, note: "Improve technique significantly." },
    { text: "Skip camp", effects: { reputation: -1 }, note: "Save energy but miss growth." }
  ],
  sport: "boxing"
},
{
  id: 'ath_boxing_sparring_session',
  title: "Sparring Session Challenge",
  description: "A sparring session with a tougher opponent is scheduled.",
  choices: [
    { text: "Go all out", effects: { health: -4, reputation: +3, stress: +2 }, note: "Gain respect but risk injury." },
    { text: "Take it easy", effects: { reputation: +1 }, note: "Safe but less recognition." }
  ],
  sport: "boxing"
},
{
  id: 'ath_boxing_media_event',
  title: "Media Spotlight",
  description: "A local media outlet wants to cover your upcoming fight.",
  choices: [
    { text: "Give interview", effects: { reputation: +3, stress: +1 }, note: "Boost popularity." },
    { text: "Decline media", effects: { reputation: -1 }, note: "Stay low-profile." }
  ],
  sport: "boxing"
},
{
  id: 'ath_boxing_injury',
  title: "Minor Injury in Training",
  description: "You suffer a minor cut or bruise during practice.",
  choices: [
    { text: "Rest and recover", effects: { health: +5, stress: -1 }, note: "Prevent worsening injury." },
    { text: "Push through", effects: { health: -6, reputation: +2, stress: +3 }, note: "Short-term glory, long-term risk." }
  ],
  sport: "boxing"
},
{
  id: 'ath_boxing_title_fight',
  title: "Title Fight Opportunity",
  description: "You are offered a chance to fight for the championship belt.",
  choices: [
    { text: "Accept the fight", effects: { health: -7, reputation: +6, stress: +4 }, note: "High stakes, high reward." },
    { text: "Decline", effects: { reputation: -2 }, note: "Play it safe, avoid risk." }
  ],
  sport: "boxing"
},
  // Swimming-specific scenarios
{
  id: 'ath_swimming_competition',
  title: "Regional Swimming Competition",
  description: "A major regional competition is approaching.",
  choices: [
    { text: "Focus on technique", effects: { reputation: +3, efficiencyImpact: +0.05 }, note: "Improves long-term skill." },
    { text: "Push for speed", effects: { health: -3, reputation: +4 }, note: "Risk of fatigue but high reward." }
  ],
  sport: "swimming"
},
{
  id: 'ath_swimming_training_camp',
  title: "Intensive Swimming Camp",
  description: "A top coach invites you to a specialized swimming camp.",
  choices: [
    { text: "Attend camp", effects: { health: -2, reputation: +3, efficiencyImpact: +0.05 }, note: "Sharpen your skills." },
    { text: "Skip camp", effects: { reputation: -1 }, note: "Save energy but miss growth." }
  ],
  sport: "swimming"
},
{
  id: 'ath_swimming_sponsorship',
  title: "Sponsorship Opportunity",
  description: "A local sports brand wants to sponsor your swimming career.",
  choices: [
    { text: "Accept sponsorship", effects: { money: +3000, reputation: +2 }, note: "Gain funding and recognition." },
    { text: "Decline politely", effects: { reputation: -1 }, note: "Maintain independence." }
  ],
  sport: "swimming"
},
{
  id: 'ath_swimming_injury',
  title: "Shoulder Strain",
  description: "You experience a minor shoulder strain during training.",
  choices: [
    { text: "Rest and recover", effects: { health: +5, stress: -1 }, note: "Prevent worsening injury." },
    { text: "Push through practice", effects: { health: -4, reputation: +2, stress: +2 }, note: "Short-term gains, long-term risk." }
  ],
  sport: "swimming"
},
{
  id: 'ath_swimming_national_trial',
  title: "National Trials Invitation",
  description: "You are invited to compete in the national trials.",
  choices: [
    { text: "Participate", effects: { reputation: +5, stress: +3, health: -3 }, note: "Chance to qualify for higher level." },
    { text: "Decline", effects: { reputation: -2 }, note: "Avoid stress but miss exposure." }
  ],
  sport: "swimming"
},
{
  id: 'ath_swimming_media_event',
  title: "Media Spotlight",
  description: "A local news channel wants to cover your achievements.",
  choices: [
    { text: "Give interview", effects: { reputation: +3, stress: +1 }, note: "Boost popularity." },
    { text: "Decline media", effects: { reputation: -1 }, note: "Stay low-profile." }
  ],
  sport: "swimming"
},
  // Soccer-specific scenarios
{
  id: 'ath_soccer_trial',
  title: "Soccer Club Trial",
  description: "A professional soccer club invites you for trials.",
  choices: [
    { text: "Attend trial", effects: { reputation: +4, stress: +2 }, note: "Potential career breakthrough." },
    { text: "Skip trial", effects: { reputation: -2 }, note: "Missed exposure." }
  ],
  sport: "soccer"
},
{
  id: 'ath_soccer_injury',
  title: "Minor Knee Injury",
  description: "You suffered a minor knee injury during training.",
  choices: [
    { text: "Rest and recover", effects: { health: +5, stress: -1 }, note: "Prevent worsening injury." },
    { text: "Push through practice", effects: { health: -6, reputation: +2, stress: +2 }, note: "Short-term gains, long-term risk." }
  ],
  sport: "soccer"
},
{
  id: 'ath_soccer_transfer_offer',
  title: "Transfer Offer from Another Club",
  description: "Another club offers you a contract.",
  choices: [
    { text: "Accept the transfer", effects: { money: +5000, reputation: +3, stress: +2 }, note: "New team, new opportunities." },
    { text: "Decline", effects: { reputation: -1 }, note: "Stay loyal to your current team." }
  ],
  sport: "soccer"
},
{
  id: 'ath_soccer_sponsorship',
  title: "Sports Brand Sponsorship",
  description: "A local brand wants to sponsor your soccer career.",
  choices: [
    { text: "Accept sponsorship", effects: { money: +3000, reputation: +2 }, note: "Gain funding and recognition." },
    { text: "Decline", effects: { reputation: -1 }, note: "Maintain independence." }
  ],
  sport: "soccer"
},
{
  id: 'ath_soccer_championship',
  title: "Regional Championship",
  description: "Your team qualifies for the regional championship.",
  choices: [
    { text: "Play aggressively", effects: { reputation: +4, health: -2, stress: +3 }, note: "High risk, high reward." },
    { text: "Play conservatively", effects: { reputation: +2 }, note: "Safer but less glory." }
  ],
  sport: "soccer"
},
{
  id: 'ath_soccer_media_event',
  title: "Media Spotlight",
  description: "A sports channel wants to feature your performance.",
  choices: [
    { text: "Give interview", effects: { reputation: +3, stress: +1 }, note: "Boost popularity." },
    { text: "Decline media", effects: { reputation: -1 }, note: "Stay low-profile." }
  ],
  sport: "soccer"
},
  // Tennis-specific scenarios
{
  id: 'ath_tennis_tournament',
  title: "Tennis Tournament",
  description: "A local tennis tournament could boost your ranking.",
  choices: [
    { text: "Compete aggressively", effects: { reputation: +4, health: -3, stress: +2 }, note: "High reward, high risk." },
    { text: "Play conservatively", effects: { reputation: +2 }, note: "Safer, less impact." }
  ],
  sport: "tennis"
},
{
  id: 'ath_tennis_training_camp',
  title: "Intensive Training Camp",
  description: "A professional coach invites you to an intensive training camp.",
  choices: [
    { text: "Attend camp", effects: { reputation: +3, health: -2, stress: +2 }, note: "Improve skills quickly." },
    { text: "Decline", effects: { reputation: -1 }, note: "Maintain current routine." }
  ],
  sport: "tennis"
},
{
  id: 'ath_tennis_sponsorship',
  title: "Sports Brand Sponsorship",
  description: "A brand offers to sponsor your tennis career.",
  choices: [
    { text: "Accept sponsorship", effects: { money: +4000, reputation: +3 }, note: "Gain funding and recognition." },
    { text: "Decline", effects: { reputation: -1 }, note: "Maintain independence." }
  ],
  sport: "tennis"
},
{
  id: 'ath_tennis_injury',
  title: "Minor Wrist Injury",
  description: "You injured your wrist during practice.",
  choices: [
    { text: "Rest and recover", effects: { health: +5, stress: -1 }, note: "Prevent further injury." },
    { text: "Play through pain", effects: { health: -6, reputation: +2, stress: +2 }, note: "Short-term gains, long-term risk." }
  ],
  sport: "tennis"
},
{
  id: 'ath_tennis_championship',
  title: "Regional Championship",
  description: "You qualify for a regional tennis championship.",
  choices: [
    { text: "Go all out", effects: { reputation: +4, health: -3, stress: +3 }, note: "High risk, high reward." },
    { text: "Play safe", effects: { reputation: +2 }, note: "Safer but less glory." }
  ],
  sport: "tennis"
},
{
  id: 'ath_tennis_media_event',
  title: "Media Spotlight",
  description: "A sports channel wants to feature your performance.",
  choices: [
    { text: "Give interview", effects: { reputation: +3, stress: +1 }, note: "Boost popularity." },
    { text: "Decline media", effects: { reputation: -1 }, note: "Stay low-profile." }
  ],
  sport: "tennis"
},
  {
    id: 'ath_media_interview',
    title: "Media Interview Opportunity",
    description: "A sports channel wants to interview you after your recent performance.",
    choices: [
      { text: "Give an interview", effects: { reputation: +3, stress: +1 }, note: "Boosts visibility." },
      { text: "Decline politely", effects: { reputation: -1 }, note: "Stay focused on training." }
    ]
  },
  {
    id: 'ath_sponsorship_offer',
    title: "Sponsorship Offer",
    description: "A brand offers you a sponsorship deal.",
    choices: [
      { text: "Accept the deal", effects: { money: +5000, reputation: +2, stress: +1 }, note: "Extra cash and fame." },
      { text: "Negotiate terms", effects: { money: +3000, reputation: +3 }, note: "Better control, slightly less money." },
      { text: "Decline", effects: { reputation: -1 }, note: "Maintain independence." }
    ]
  },
  {
    id: 'ath_team_conflict',
    title: "Team Conflict",
    description: "A conflict arose with teammates affecting team morale.",
    choices: [
      { text: "Mediate and resolve", effects: { reputation: +2, stress: +2 }, note: "Improves team cohesion." },
      { text: "Focus on your own performance", effects: { reputation: +1 }, note: "Avoids extra stress but morale suffers." },
      { text: "Confront aggressively", effects: { reputation: -2, stress: +4 }, note: "Risky move; could backfire." }
    ]
  },
  {
    id: 'ath_fitness_challenge',
    title: "Fitness Challenge",
    description: "Your coach suggests a new intense training routine to boost performance.",
    choices: [
      { text: "Take the challenge", effects: { health: -4, reputation: +3, stress: +2 }, note: "High risk, high reward." },
      { text: "Modify intensity", effects: { health: -2, reputation: +1 }, note: "Balanced approach." },
      { text: "Decline", effects: { reputation: -1 }, note: "Avoid potential injury but miss growth." }
    ]
  },
  {
    id: 'ath_international_invite',
    title: "International Competition Invitation",
    description: "You've been invited to compete internationally.",
    choices: [
      { text: "Accept and travel", effects: { reputation: +5, money: -2000, stress: +3 }, note: "Gain global recognition." },
      { text: "Decline to focus locally", effects: { reputation: -2 }, note: "Safer, but missed opportunity." }
    ]
  }
],
  licensed: [
  {
  id: 'doc_breakthrough',
  title: "Medical Breakthrough",
  description: "A new treatment needs early adopters & investment.",
  choices: [
    { text: "Adopt the treatment", effects: { reputation: +4, money: -2000 }, note: "Be at the forefront." },
    { text: "Wait for more data", effects: { reputation: -1 }, note: "Safer but less recognition." }
  ],
  career: "doctor"
},
{
  id: 'doc_conference',
  title: "Medical Conference Invitation",
  description: "You're invited to present your research at a prestigious conference.",
  choices: [
    { text: "Attend and present", effects: { reputation: +3, stress: +2, money: -500 }, note: "Boost your professional standing." },
    { text: "Decline", effects: { reputation: -1 }, note: "Stay focused on practice." }
  ],
  career: "doctor"
},
{
  id: 'doc_patient_emergency',
  title: "Emergency Patient Case",
  description: "An unusual case requires your immediate attention.",
  choices: [
    { text: "Handle personally", effects: { reputation: +3, stress: +3 }, note: "Gain recognition, but exhausting." },
    { text: "Refer to colleague", effects: { reputation: -1 }, note: "Safe, but no acclaim." }
  ],
  career: "doctor"
},
{
  id: 'doc_research_grant',
  title: "Research Grant Opportunity",
  description: "Funding is available for a promising study.",
  choices: [
    { text: "Apply for grant", effects: { money: +5000, stress: +2 }, note: "Chance to fund research." },
    { text: "Ignore", effects: { reputation: -1 }, note: "Missed opportunity." }
  ],
  career: "doctor"
},
{
  id: 'doc_publication',
  title: "Publish Medical Paper",
  description: "Your research could be published in a top journal.",
  choices: [
    { text: "Submit paper", effects: { reputation: +4, stress: +2 }, note: "Boost career profile." },
    { text: "Delay submission", effects: { reputation: -1 }, note: "Missed timely recognition." }
  ],
  career: "doctor"
},
{
  id: 'doc_clinic_upgrade',
  title: "Upgrade Clinic Equipment",
  description: "New technology could improve patient care.",
  choices: [
    { text: "Invest in equipment", effects: { money: -3000, reputation: +2 }, note: "Better care, happier patients." },
    { text: "Maintain old equipment", effects: { reputation: -1 }, note: "Save money, but less effective." }
  ],
  career: "doctor"
},
{
  id: 'doc_medical_error',
  title: "Medical Error Risk",
  description: "A complex case has high risk of complications.",
  choices: [
    { text: "Take the case", effects: { reputation: +3, stress: +3, health: -2 }, note: "Potential prestige, but risky." },
    { text: "Decline", effects: { reputation: -2 }, note: "Safer choice." }
  ],
  career: "doctor"
},
{
  id: 'doc_team_collaboration',
  title: "Collaborate with Specialist",
  description: "Another expert offers to co-manage a case.",
  choices: [
    { text: "Accept collaboration", effects: { reputation: +2, stress: +1 }, note: "Shared knowledge, shared credit." },
    { text: "Work alone", effects: { reputation: +1, stress: +3 }, note: "More stress, solo recognition." }
  ],
  career: "doctor"
},
{
  id: 'doc_ethical_dilemma',
  title: "Ethical Dilemma",
  description: "A treatment is risky but could save a life.",
  choices: [
    { text: "Proceed", effects: { reputation: +3, stress: +2 }, note: "High risk, high reward." },
    { text: "Decline", effects: { reputation: -1 }, note: "Safer, but criticized." }
  ],
  career: "doctor"
},
{
  id: 'doc_patient_feedback',
  title: "Patient Satisfaction Survey",
  description: "Feedback could affect your reputation.",
  choices: [
    { text: "Implement improvements", effects: { reputation: +2, money: -1000 }, note: "Invest in better service." },
    { text: "Ignore feedback", effects: { reputation: -2 }, note: "No cost, but reputation suffers." }
  ],
  career: "doctor"
},
 {
  id: 'eng_new_project',
  title: "New Engineering Project",
  description: "A client requests a complex system design.",
  choices: [
    { text: "Take the project", effects: { money: +4000, stress: +3, reputation: +2 }, note: "High reward, high effort." },
    { text: "Decline politely", effects: { reputation: -1 }, note: "Preserve your workload." }
  ],
  career: "engineer"
},
{
  id: 'eng_tech_conference',
  title: "Tech Conference Invitation",
  description: "You're invited to speak at a leading technology conference.",
  choices: [
    { text: "Attend and present", effects: { reputation: +3, stress: +2, money: -500 }, note: "Enhances your reputation." },
    { text: "Decline", effects: { reputation: -1 }, note: "Missed exposure." }
  ],
  career: "engineer"
},
{
  id: 'eng_team_collaboration',
  title: "Team Collaboration Challenge",
  description: "A team project requires coordination with new colleagues.",
  choices: [
    { text: "Lead the team", effects: { reputation: +4, stress: +3 }, note: "Gain leadership recognition." },
    { text: "Assist quietly", effects: { reputation: +1, stress: +1 }, note: "Lower impact, safer option." }
  ],
  career: "engineer"
},
{
  id: 'eng_equipment_upgrade',
  title: "Upgrade Engineering Tools",
  description: "Modern tools could increase efficiency.",
  choices: [
    { text: "Invest in upgrades", effects: { money: -2000, efficiencyImpact: +0.05, reputation: +2 }, note: "Better tools improve output." },
    { text: "Stick with old tools", effects: { reputation: -1 }, note: "No cost, but slower workflow." }
  ],
  career: "engineer"
},
{
  id: 'eng_client_deadline',
  title: "Tight Client Deadline",
  description: "The client demands a project delivered sooner than planned.",
  choices: [
    { text: "Push the team hard", effects: { stress: +4, reputation: +3 }, note: "Risk burnout for recognition." },
    { text: "Negotiate deadline", effects: { reputation: +1 }, note: "Safer but slower recognition." }
  ],
  career: "engineer"
},
{
  id: 'eng_innovation_award',
  title: "Innovation Award Opportunity",
  description: "Submit your design for a prestigious engineering award.",
  choices: [
    { text: "Submit design", effects: { reputation: +4, stress: +2 }, note: "Potential career highlight." },
    { text: "Hold off", effects: { reputation: -1 }, note: "Missed recognition." }
  ],
  career: "engineer"
},
{
  id: 'eng_risk_analysis',
  title: "High-Risk Project Proposal",
  description: "A project could earn huge returns but carries technical risks.",
  choices: [
    { text: "Accept project", effects: { money: +5000, stress: +4, reputation: +3 }, note: "High risk, high reward." },
    { text: "Decline", effects: { reputation: -2 }, note: "Safer choice." }
  ],
  career: "engineer"
},
{
  id: 'eng_patent_filing',
  title: "Patent Filing",
  description: "You've developed a unique solution that can be patented.",
  choices: [
    { text: "File for patent", effects: { money: +3000, reputation: +3 }, note: "Protect your innovation." },
    { text: "Keep internal", effects: { reputation: -1 }, note: "Save cost but no recognition." }
  ],
  career: "engineer"
},
{
  id: 'eng_team_conflict',
  title: "Team Conflict",
  description: "Two team members clash on project direction.",
  choices: [
    { text: "Mediate the conflict", effects: { reputation: +2, stress: +1 }, note: "Leadership earns respect." },
    { text: "Ignore", effects: { reputation: -2 }, note: "Avoid conflict but reputation suffers." }
  ],
  career: "engineer"
},
{
  id: 'eng_training_opportunity',
  title: "Professional Training",
  description: "Advanced technical training is available.",
  choices: [
    { text: "Attend training", effects: { reputation: +2, money: -1000, efficiencyImpact: +0.05 }, note: "Gain skills and recognition." },
    { text: "Skip training", effects: { reputation: -1 }, note: "No cost, but slower skill growth." }
  ],
  career: "engineer"
},
  {
  id: 'law_major_case',
  title: "High-profile Case Offer",
  description: "A client offers you a major case that could make your reputation.",
  choices: [
    { text: "Accept the case", effects: { reputation: +4, stress: +2, money: +3000 }, note: "Boost your career." },
    { text: "Decline", effects: { reputation: -2 }, note: "Avoid stress but lose exposure." }
  ],
  career: "lawyer"
},
{
  id: 'law_contract_dispute',
  title: "Contract Dispute",
  description: "Two companies ask you to handle a complex contract dispute.",
  choices: [
    { text: "Take the case", effects: { money: +4000, stress: +3, reputation: +3 }, note: "Good pay and recognition." },
    { text: "Decline", effects: { reputation: -1 }, note: "Avoid stress, no reward." }
  ],
  career: "lawyer"
},
{
  id: 'law_legal_audit',
  title: "Legal Audit Request",
  description: "A firm requests your expertise for an internal audit.",
  choices: [
    { text: "Perform audit", effects: { money: +2500, stress: +2, reputation: +2 }, note: "Professional recognition." },
    { text: "Decline politely", effects: { reputation: -1 }, note: "Missed opportunity." }
  ],
  career: "lawyer"
},
{
  id: 'law_court_trial',
  title: "Court Trial Preparation",
  description: "You are assigned to defend a critical case in court.",
  choices: [
    { text: "Prepare intensively", effects: { stress: +4, reputation: +4 }, note: "Win earns reputation." },
    { text: "Prepare normally", effects: { reputation: +2 }, note: "Balanced approach." }
  ],
  career: "lawyer"
},
{
  id: 'law_ethical_dilemma',
  title: "Ethical Dilemma",
  description: "You discover a conflict of interest in a case.",
  choices: [
    { text: "Report and withdraw", effects: { reputation: +3, stress: +1 }, note: "Maintain integrity." },
    { text: "Ignore and continue", effects: { reputation: -3, risk: +0.1 }, note: "Short-term gain, long-term risk." }
  ],
  career: "lawyer"
},
{
  id: 'law_client_negotiation',
  title: "Critical Client Negotiation",
  description: "A client wants you to negotiate a high-stakes deal.",
  choices: [
    { text: "Negotiate assertively", effects: { reputation: +3, stress: +2, money: +2000 }, note: "High reward, stressful." },
    { text: "Negotiate cautiously", effects: { reputation: +1, money: +1000 }, note: "Safer approach." }
  ],
  career: "lawyer"
},
{
  id: 'law_public_speech',
  title: "Public Legal Seminar",
  description: "You are invited to speak at a legal seminar.",
  choices: [
    { text: "Accept invitation", effects: { reputation: +3, stress: +1 }, note: "Raise your profile." },
    { text: "Decline", effects: { reputation: -1 }, note: "No exposure gained." }
  ],
  career: "lawyer"
},
{
  id: 'law_case_review',
  title: "Case Review Request",
  description: "A junior lawyer requests your review for a tricky case.",
  choices: [
    { text: "Provide detailed review", effects: { reputation: +2, stress: +1 }, note: "Mentorship improves reputation." },
    { text: "Quick review only", effects: { reputation: +1 }, note: "Saves time, lower impact." }
  ],
  career: "lawyer"
},
{
  id: 'law_legislation_update',
  title: "New Legislation Impact",
  description: "New laws affect your current clients; guidance is required.",
  choices: [
    { text: "Proactively advise clients", effects: { reputation: +3, stress: +2 }, note: "Client trust improves." },
    { text: "Wait and see", effects: { reputation: -1 }, note: "Missed chance to impress." }
  ],
  career: "lawyer"
},
{
  id: 'law_media_attention',
  title: "Media Attention on Case",
  description: "A case you handled is gaining media attention.",
  choices: [
    { text: "Engage and give statement", effects: { reputation: +4, stress: +2 }, note: "Positive exposure." },
    { text: "Stay silent", effects: { reputation: +1 }, note: "Safer, but less recognition." }
  ],
  career: "lawyer"
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
  },
  {
    id: 'celeb_interview',
    title: "High-Profile Interview",
    description: "A top magazine wants to interview you.",
    choices: [
      { text: "Give an honest interview", effects: { reputation: +4, stress: +1 }, note: "Fans love your authenticity." },
      { text: "Decline politely", effects: { reputation: -1 }, note: "Missed PR opportunity." }
    ]
  },
  {
    id: 'celeb_endorsement',
    title: "Product Endorsement Offer",
    description: "A major brand wants you as their face for a campaign.",
    choices: [
      { text: "Accept the deal", effects: { money: +5000, reputation: +2 }, note: "Gain fame and cash." },
      { text: "Decline", effects: { reputation: -1 }, note: "Maintain personal freedom." }
    ]
  },
  {
    id: 'celeb_scandal',
    title: "Scandal Hits Social Media",
    description: "Rumors about you are going viral online.",
    choices: [
      { text: "Address it publicly", effects: { reputation: +3, stress: +2 }, note: "Control the narrative." },
      { text: "Ignore it", effects: { reputation: -3 }, note: "Could blow over or worsen." }
    ]
  },
  {
    id: 'celeb_fan_meet',
    title: "Fan Meet-and-Greet Invitation",
    description: "Fans are organizing a big event in your honor.",
    choices: [
      { text: "Attend and interact", effects: { reputation: +3, stress: +1 }, note: "Fans adore you." },
      { text: "Skip it", effects: { reputation: -2 }, note: "Fans disappointed." }
    ]
  },
  {
    id: 'celeb_collab_offer',
    title: "Collaboration Proposal",
    description: "Another celebrity wants to collaborate on a project.",
    choices: [
      { text: "Accept collaboration", effects: { reputation: +4, stress: +1, money: +2000 }, note: "High visibility." },
      { text: "Decline", effects: { reputation: -1 }, note: "Missed networking opportunity." }
    ]
  },
  {
    id: 'celeb_award_nomination',
    title: "Award Nomination",
    description: "You are nominated for a prestigious award.",
    choices: [
      { text: "Attend the ceremony", effects: { reputation: +5, stress: +2 }, note: "Showcase yourself." },
      { text: "Skip it", effects: { reputation: -2 }, note: "Missed recognition." }
    ]
  },
  {
    id: 'celeb_charity_event',
    title: "Charity Event Invitation",
    description: "A charity invites you to be their ambassador for an event.",
    choices: [
      { text: "Participate", effects: { reputation: +3, money: -500 }, note: "Good PR and goodwill." },
      { text: "Decline", effects: { reputation: -1 }, note: "Missed opportunity to give back." }
    ]
  },
  {
    id: 'celeb_media_gossip',
    title: "Media Gossip Article",
    description: "Tabloid publishes exaggerated rumors about you.",
    choices: [
      { text: "Respond publicly", effects: { reputation: +2, stress: +1 }, note: "Clarify the story." },
      { text: "Ignore", effects: { reputation: -2 }, note: "Rumors may persist." }
    ]
  },
  {
    id: 'celeb_brand_controversy',
    title: "Brand Controversy",
    description: "A brand you promoted faces backlash.",
    choices: [
      { text: "Dissociate publicly", effects: { reputation: +2, money: -2000 }, note: "Protect your image." },
      { text: "Stay silent", effects: { reputation: -3 }, note: "Risk reputation damage." }
    ]
  },
  {
    id: 'celeb_social_trend',
    title: "Viral Trend Challenge",
    description: "Fans challenge you to participate in a viral social media trend.",
    choices: [
      { text: "Join the trend", effects: { reputation: +3, stress: +1 }, note: "Fun and exposure." },
      { text: "Ignore", effects: { reputation: -1 }, note: "Missed viral opportunity." }
    ]
  },
  {
    id: 'celeb_exclusive_event',
    title: "Exclusive Party Invitation",
    description: "An A-list party invites you for networking.",
    choices: [
      { text: "Attend", effects: { reputation: +2, stress: +1 }, note: "Network with influencers." },
      { text: "Decline", effects: { reputation: -1 }, note: "Missed connections." }
    ]
  },
  {
    id: 'celeb_reputation_boost',
    title: "Positive Press Coverage",
    description: "A leading publication writes a feature praising you.",
    choices: [
      { text: "Promote the article", effects: { reputation: +4 }, note: "Maximize visibility." },
      { text: "Do nothing", effects: { reputation: +1 }, note: "Subtle boost." }
    ]
  },
  {
    id: 'celeb_fashion_show',
    title: "Fashion Show Invitation",
    description: "You're invited to walk the runway at a major fashion event.",
    choices: [
      { text: "Accept", effects: { reputation: +3, stress: +1, money: +1000 }, note: "High exposure." },
      { text: "Decline", effects: { reputation: -1 }, note: "Missed spotlight." }
    ]
  },
  {
    id: 'celeb_controversial_comment',
    title: "Controversial Comment Online",
    description: "A statement you made is being criticized online.",
    choices: [
      { text: "Apologize & clarify", effects: { reputation: +3, stress: +1 }, note: "Mitigate damage." },
      { text: "Ignore the criticism", effects: { reputation: -3 }, note: "Risk backlash." }
    ]
  },
  {
    id: 'celeb_product_launch',
    title: "Personal Product Launch",
    description: "You plan to release your own merchandise line.",
    choices: [
      { text: "Invest heavily", effects: { money: -5000, reputation: +4, stress: +2 }, note: "Potential big reward." },
      { text: "Launch modestly", effects: { money: -2000, reputation: +2 }, note: "Lower risk, smaller gains." }
    ]
  },
  {
    id: 'celeb_collab_scandal',
    title: "Collaboration Scandal",
    description: "Your collaboration partner is involved in a scandal.",
    choices: [
      { text: "Publicly dissociate", effects: { reputation: +2, stress: +1 }, note: "Protect your image." },
      { text: "Stay silent", effects: { reputation: -3 }, note: "Risk being associated." }
    ]
  },
  {
    id: 'celeb_fan_critique',
    title: "Critique from Fans",
    description: "Fans criticize your latest project.",
    choices: [
      { text: "Respond positively", effects: { reputation: +3, stress: +1 }, note: "Shows humility." },
      { text: "Ignore feedback", effects: { reputation: -1 }, note: "Could seem unapproachable." }
    ]
  },
  {
    id: 'celeb_award_speech',
    title: "Award Acceptance Speech",
    description: "You win an award; how do you handle the speech?",
    choices: [
      { text: "Give heartfelt speech", effects: { reputation: +4, stress: +1 }, note: "Fans love authenticity." },
      { text: "Keep it short", effects: { reputation: +2 }, note: "Less impact but safe." }
    ]
  },
  {
    id: 'celeb_charity_collab',
    title: "Collaborate on Charity Project",
    description: "A charity invites you for a high-profile campaign.",
    choices: [
      { text: "Participate", effects: { reputation: +3, money: -1000, stress: +1 }, note: "Boost public image." },
      { text: "Decline", effects: { reputation: -1 }, note: "Missed positive exposure." }
    ]
  }
],
  model: [
  {
    id: 'model_campaign',
    title: "High-Profile Campaign Offer",
    description: "A major brand offers you a modeling contract.",
    choices: [
      { text: "Accept the contract", effects: { money: +5000, reputation: +3 }, note: "Gain fame and cash." },
      { text: "Decline politely", effects: { reputation: -1 }, note: "Maintain personal freedom." }
    ]
  },
  {
    id: 'model_photoshoot',
    title: "Exclusive Photoshoot Invitation",
    description: "A renowned photographer wants to shoot your portfolio.",
    choices: [
      { text: "Attend the shoot", effects: { reputation: +4, stress: +1 }, note: "High exposure." },
      { text: "Decline", effects: { reputation: -2 }, note: "Missed opportunity." }
    ]
  },
  {
    id: 'model_runway_show',
    title: "Runway Show Opportunity",
    description: "You’re invited to walk in an international fashion show.",
    choices: [
      { text: "Walk the runway", effects: { reputation: +5, stress: +2, money: +2000 }, note: "High prestige." },
      { text: "Decline", effects: { reputation: -1 }, note: "Missed spotlight." }
    ]
  },
  {
    id: 'model_endorsement',
    title: "Brand Endorsement Offer",
    description: "A luxury brand offers you an endorsement deal.",
    choices: [
      { text: "Accept", effects: { money: +4000, reputation: +3 }, note: "Increase fame and income." },
      { text: "Decline", effects: { reputation: -1 }, note: "Maintain independence." }
    ]
  },
  {
    id: 'model_media_critique',
    title: "Media Critique",
    description: "Fashion critics comment on your recent shoot.",
    choices: [
      { text: "Address positively", effects: { reputation: +3, stress: +1 }, note: "Shows humility." },
      { text: "Ignore", effects: { reputation: -2 }, note: "Could seem unapproachable." }
    ]
  },
  {
    id: 'model_collab',
    title: "Collaboration Offer",
    description: "Another top model invites you for a collaborative campaign.",
    choices: [
      { text: "Accept", effects: { reputation: +4, stress: +1, money: +1500 }, note: "Boost exposure." },
      { text: "Decline", effects: { reputation: -1 }, note: "Missed networking." }
    ]
  },
  {
    id: 'model_fashion_week',
    title: "Fashion Week Invitation",
    description: "You’re invited to a prestigious Fashion Week event.",
    choices: [
      { text: "Attend and network", effects: { reputation: +4, stress: +2 }, note: "High visibility." },
      { text: "Skip", effects: { reputation: -2 }, note: "Missed opportunities." }
    ]
  },
  {
    id: 'model_social_media_boost',
    title: "Viral Social Media Post",
    description: "Your post goes viral, gaining huge attention.",
    choices: [
      { text: "Leverage the post", effects: { reputation: +5, stress: +1 }, note: "Maximize benefits." },
      { text: "Ignore the buzz", effects: { reputation: +2 }, note: "Minimal impact." }
    ]
  },
  {
    id: 'model_travel_shoot',
    title: "International Travel for Shoot",
    description: "You’re invited to a shoot abroad.",
    choices: [
      { text: "Go for the shoot", effects: { reputation: +4, stress: +2, money: +2000 }, note: "High reward, tiring trip." },
      { text: "Decline", effects: { reputation: -1 }, note: "Stay local, less exposure." }
    ]
  },
  {
    id: 'model_magazine_feature',
    title: "Magazine Feature",
    description: "A leading magazine wants a feature on you.",
    choices: [
      { text: "Feature yourself prominently", effects: { reputation: +4 }, note: "Boost career." },
      { text: "Decline", effects: { reputation: -1 }, note: "Missed publicity." }
    ]
  },
  {
    id: 'model_brand_backlash',
    title: "Brand Association Controversy",
    description: "A brand you promoted faces criticism.",
    choices: [
      { text: "Publicly dissociate", effects: { reputation: +2, money: -1000 }, note: "Protect image." },
      { text: "Stay silent", effects: { reputation: -3 }, note: "Risk reputation damage." }
    ]
  },
  {
    id: 'model_health_issue',
    title: "Health Concern Before Shoot",
    description: "You feel unwell before an important shoot.",
    choices: [
      { text: "Rest and postpone", effects: { health: +5, reputation: -1 }, note: "Long-term health first." },
      { text: "Push through", effects: { health: -4, reputation: +3, stress: +2 }, note: "Short-term glory." }
    ]
  },
  {
    id: 'model_fan_event',
    title: "Fan Meet-and-Greet",
    description: "Fans organize an event to meet you.",
    choices: [
      { text: "Attend", effects: { reputation: +3, stress: +1 }, note: "Engage with fans." },
      { text: "Decline", effects: { reputation: -2 }, note: "Fans disappointed." }
    ]
  },
  {
    id: 'model_charity_collab',
    title: "Charity Campaign Collaboration",
    description: "A charity invites you for a high-profile campaign.",
    choices: [
      { text: "Participate", effects: { reputation: +3, money: -1000, stress: +1 }, note: "Boosts image." },
      { text: "Decline", effects: { reputation: -1 }, note: "Missed positive exposure." }
    ]
  },
  {
    id: 'model_contract_renewal',
    title: "Contract Renewal Negotiation",
    description: "Your agency offers a new contract.",
    choices: [
      { text: "Negotiate for better terms", effects: { money: +2000, stress: +2 }, note: "Potential gains." },
      { text: "Accept as is", effects: { money: +1000 }, note: "Safe, minimal stress." }
    ]
  },
  {
    id: 'model_collab_scandal',
    title: "Collaboration Scandal",
    description: "Your shoot partner is involved in a scandal.",
    choices: [
      { text: "Publicly dissociate", effects: { reputation: +2, stress: +1 }, note: "Protect image." },
      { text: "Stay silent", effects: { reputation: -3 }, note: "Risk being associated." }
    ]
  },
  {
    id: 'model_media_gossip',
    title: "Media Gossip Article",
    description: "Tabloids exaggerate rumors about you.",
    choices: [
      { text: "Respond publicly", effects: { reputation: +3, stress: +1 }, note: "Control narrative." },
      { text: "Ignore", effects: { reputation: -2 }, note: "Rumors persist." }
    ]
  },
  {
    id: 'model_award_nomination',
    title: "Modeling Award Nomination",
    description: "You are nominated for a prestigious modeling award.",
    choices: [
      { text: "Attend ceremony", effects: { reputation: +4, stress: +2 }, note: "Gain prestige." },
      { text: "Decline", effects: { reputation: -2 }, note: "Missed recognition." }
    ]
  },
  {
    id: 'model_social_trend',
    title: "Join Viral Fashion Trend",
    description: "A trending fashion challenge is taking over social media.",
    choices: [
      { text: "Participate", effects: { reputation: +3, stress: +1 }, note: "Increase visibility." },
      { text: "Skip", effects: { reputation: -1 }, note: "Missed exposure." }
    ]
  },
  {
    id: 'model_international_collab',
    title: "International Collaboration Offer",
    description: "A foreign brand offers you a modeling collaboration.",
    choices: [
      { text: "Accept", effects: { reputation: +5, money: +3000, stress: +2 }, note: "Global exposure." },
      { text: "Decline", effects: { reputation: -1 }, note: "Missed international fame." }
    ]
  }
],
 freelancer: [
  {
    id: 'freelance_project_highpay',
    title: "High-Paying Client Project",
    description: "A client offers a lucrative short-term project.",
    choices: [
      { text: "Accept", effects: { money: +5000, stress: +3, reputation: +3 }, note: "Good pay but more work." },
      { text: "Decline", effects: { reputation: -2 }, note: "Missed income and exposure." }
    ]
  },
  {
    id: 'freelance_deadline_crunch',
    title: "Tight Deadline Project",
    description: "A project requires urgent completion within 48 hours.",
    choices: [
      { text: "Work extra hours", effects: { stress: +5, reputation: +3, money: +2000 }, note: "High risk, high reward." },
      { text: "Decline", effects: { reputation: -1 }, note: "Avoid stress but lose trust." }
    ]
  },
  {
    id: 'freelance_collaboration_offer',
    title: "Collaboration with Another Freelancer",
    description: "A well-known freelancer proposes a joint project.",
    choices: [
      { text: "Collaborate", effects: { reputation: +4, money: +1500, stress: +2 }, note: "Expand your network." },
      { text: "Decline", effects: { reputation: -1 }, note: "Missed opportunity." }
    ]
  },
  {
    id: 'freelance_client_complaint',
    title: "Client Complaint",
    description: "A client is unhappy with your work quality.",
    choices: [
      { text: "Fix the issue immediately", effects: { stress: +2, reputation: +2 }, note: "Builds trust." },
      { text: "Ignore politely", effects: { reputation: -3 }, note: "Risk losing clients." }
    ]
  },
  {
    id: 'freelance_urgent_revision',
    title: "Last-Minute Revision Request",
    description: "A client asks for major changes before the deadline.",
    choices: [
      { text: "Do the revision", effects: { stress: +3, money: +1000, reputation: +2 }, note: "Extra effort, extra reward." },
      { text: "Refuse", effects: { reputation: -2 }, note: "Maintain workload balance." }
    ]
  },
  {
    id: 'freelance_testimonial',
    title: "Client Offers Testimonial",
    description: "A satisfied client wants to write a glowing testimonial.",
    choices: [
      { text: "Allow it", effects: { reputation: +3 }, note: "Improves portfolio." },
      { text: "Decline", effects: { reputation: -1 }, note: "Missed promotion chance." }
    ]
  },
  {
    id: 'freelance_network_event',
    title: "Freelancer Networking Event",
    description: "A networking event could boost your contacts and clients.",
    choices: [
      { text: "Attend", effects: { reputation: +4, stress: +2 }, note: "Potential new clients." },
      { text: "Skip", effects: { reputation: -1 }, note: "Lose networking opportunities." }
    ]
  },
  {
    id: 'freelance_tech_upgrade',
    title: "Upgrade Your Equipment",
    description: "Investing in new tools can improve efficiency.",
    choices: [
      { text: "Upgrade now", effects: { money: -2000, efficiencyImpact: +0.1, reputation: +2 }, note: "Better future output." },
      { text: "Postpone upgrade", effects: { reputation: -1 }, note: "Lower efficiency." }
    ]
  },
  {
    id: 'freelance_training_course',
    title: "Online Training Course",
    description: "An advanced course could boost your skills.",
    choices: [
      { text: "Enroll", effects: { money: -1000, efficiencyImpact: +0.08, reputation: +2 }, note: "Invest in yourself." },
      { text: "Skip", effects: { reputation: -1 }, note: "Missed learning opportunity." }
    ]
  },
  {
    id: 'freelance_new_client',
    title: "Promising New Client",
    description: "A potential long-term client contacts you.",
    choices: [
      { text: "Accept project", effects: { money: +3000, reputation: +3, stress: +2 }, note: "New opportunity." },
      { text: "Decline politely", effects: { reputation: -1 }, note: "Avoid overwork." }
    ]
  },
  {
    id: 'freelance_late_payment',
    title: "Client Late Payment",
    description: "A client delays payment for completed work.",
    choices: [
      { text: "Follow up politely", effects: { reputation: +2, stress: +1 }, note: "Secure payment." },
      { text: "Wait silently", effects: { reputation: -1 }, note: "Delayed cashflow." }
    ]
  },
  {
    id: 'freelance_competitor_project',
    title: "Competitor Wins Your Client",
    description: "A rival freelancer got a client you wanted.",
    choices: [
      { text: "Accept gracefully", effects: { reputation: +1 }, note: "Professional approach." },
      { text: "Complain publicly", effects: { reputation: -3 }, note: "Harm reputation." }
    ]
  },
  {
    id: 'freelance_featured_article',
    title: "Featured in Industry Blog",
    description: "A popular blog wants to highlight your work.",
    choices: [
      { text: "Agree to feature", effects: { reputation: +4, stress: +1 }, note: "Increase visibility." },
      { text: "Decline", effects: { reputation: -1 }, note: "Missed exposure." }
    ]
  },
  {
    id: 'freelance_feedback_request',
    title: "Client Requests Feedback Session",
    description: "Client wants to discuss your work performance.",
    choices: [
      { text: "Provide honest feedback", effects: { reputation: +2, stress: +1 }, note: "Build trust." },
      { text: "Avoid", effects: { reputation: -2 }, note: "Risk client dissatisfaction." }
    ]
  },
  {
    id: 'freelance_emergency_project',
    title: "Emergency Project Request",
    description: "A client needs urgent help outside working hours.",
    choices: [
      { text: "Help immediately", effects: { stress: +4, money: +2500, reputation: +3 }, note: "Extra effort pays off." },
      { text: "Decline", effects: { reputation: -2 }, note: "Avoid overwork." }
    ]
  },
  {
    id: 'freelance_longterm_contract',
    title: "Offer for Long-Term Contract",
    description: "A company wants to hire you for multiple projects over months.",
    choices: [
      { text: "Accept", effects: { money: +8000, reputation: +5, stress: +3 }, note: "Stable income." },
      { text: "Decline", effects: { reputation: -1 }, note: "Keep flexibility." }
    ]
  },
  {
    id: 'freelance_reputation_boost',
    title: "Positive Client Review",
    description: "A client leaves a glowing review on your profile.",
    choices: [
      { text: "Share widely", effects: { reputation: +3 }, note: "Boosts credibility." },
      { text: "Ignore", effects: { reputation: +1 }, note: "Minimal gain." }
    ]
  },
  {
    id: 'freelance_skill_showcase',
    title: "Showcase Your Skills Online",
    description: "An opportunity to share your work in a major platform arises.",
    choices: [
      { text: "Showcase", effects: { reputation: +4, stress: +1 }, note: "Increase visibility." },
      { text: "Skip", effects: { reputation: -1 }, note: "Missed recognition." }
    ]
  },
  {
    id: 'freelance_international_client',
    title: "International Client Offers Project",
    description: "A foreign client contacts you with a high-paying project.",
    choices: [
      { text: "Accept", effects: { money: +6000, reputation: +4, stress: +3 }, note: "Expand global presence." },
      { text: "Decline", effects: { reputation: -1 }, note: "Missed opportunity." }
    ]
  }
]
};

// ---------------- Generate and show a scenario ----------------
export function generateScenario() {
  const pool = [];
  const prof = (player.profession || '').toLowerCase();

  // Profession-specific pools
  switch (prof) {
    case 'entrepreneur':
      pool.push(...scenarioPools.entrepreneur);
      break;
    case 'licensed':
      const career = player.licensedCareer;
      pool.push(...scenarioPools.licensed.filter(s => !s.career || s.career === career));
      break;
    case 'athlete':
      const sport = player.sport;
      pool.push(...scenarioPools.athlete.filter(s => !s.sport || s.sport === sport));
      break;
    case 'celebrity':
      pool.push(...scenarioPools.celebrity);
      break;
    case 'model':
      pool.push(...scenarioPools.model);
      break;
    case 'freelancer':
      const freeCareer = player.freelancerCareer;
      pool.push(...scenarioPools.freelancer.filter(s => !s.career || s.career === freeCareer));
      break;
    default:
      break;
  }

  // Business-based scenarios
  if ((player.ownedBusinesses || []).length) {
    pool.push(...scenarioPools.businessOwner);
    const totalBusinessValue = player.ownedBusinesses.reduce((sum, b) => sum + (b.cost * b.level), 0);
    if (totalBusinessValue > 50000 && Math.random() < 0.5) pool.push(...scenarioPools.businessOwner);
  }

  // Neutral fallback scenario
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

  player.happiness = clamp(player.happiness || 0, -100, 100);
  player.stress = clamp(player.stress || 0, 0, 500);
  updateStats();
  displayOwnedBusinesses();
}

// ---------------- Yearly trigger ----------------
export function checkYearlyScenarioTrigger() {
  // Existing business profit updates
  (player.ownedBusinesses || []).forEach(biz => {
    const variance = (Math.random() - 0.5) * 0.3; // ±15%
    biz.profitPerYear *= (1 + variance * biz.marketTrend);
    biz.profitPerYear = Math.max(500, biz.profitPerYear);
  });
  
applyYearlyBusinessChanges();
  // Apply Gym & Diet yearly cost/effects
 applyYearlyHealthAndExpenses(); 

  if (Math.random() < 0.85) generateScenario();
}

