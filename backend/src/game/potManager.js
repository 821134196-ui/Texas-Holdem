const { evaluateHand, compareHands } = require('./cards');

class PotManager {
  constructor() {
    this.pots = [];
  }
  
  calculatePots(players) {
    this.pots = [];
    
    const activePlayers = players.filter(p => 
      p.status === 'active' || p.status === 'all-in'
    );
    
    if (activePlayers.length === 0) return [];
    
    const sortedByBet = [...activePlayers].sort((a, b) => a.total_bet - b.total_bet);
    
    const pots = [];
    let processedAmount = 0;
    
    for (let i = 0; i < sortedByBet.length; i++) {
      const player = sortedByBet[i];
      const currentAmount = player.total_bet;
      
      if (currentAmount > processedAmount) {
        const potContribution = currentAmount - processedAmount;
        const eligiblePlayers = sortedByBet.slice(i).filter(p => 
          p.status === 'active' || p.status === 'all-in'
        );
        
        if (eligiblePlayers.length > 0) {
          const potAmount = potContribution * eligiblePlayers.length;
          
          pots.push({
            amount: potAmount,
            isMain: pots.length === 0,
            eligiblePlayers: eligiblePlayers.map(p => p.user_id),
            contribution: potContribution
          });
        }
        
        processedAmount = currentAmount;
      }
    }
    
    this.pots = pots;
    return pots;
  }
  
  determineWinners(players, communityCards) {
    const results = [];
    
    for (const pot of this.pots) {
      const eligiblePlayers = players.filter(p => 
        pot.eligiblePlayers.includes(p.user_id) &&
        (p.status === 'active' || p.status === 'all-in')
      );
      
      if (eligiblePlayers.length === 0) continue;
      
      const activeNonAllIn = eligiblePlayers.filter(p => p.status === 'active');
      
      if (activeNonAllIn.length === 1 && eligiblePlayers.length > 1) {
        const winner = activeNonAllIn[0];
        results.push({
          pot: pot,
          winners: [{
            user_id: winner.user_id,
            amount: pot.amount,
            isSplit: false
          }]
        });
        continue;
      }
      
      const playerHands = eligiblePlayers.map(player => {
        const hand = evaluateHand(player.hole_cards, communityCards);
        return {
          user_id: player.user_id,
          player,
          hand,
          holeCards: player.hole_cards
        };
      });
      
      playerHands.sort((a, b) => compareHands(b.hand, a.hand));
      
      const bestHand = playerHands[0].hand;
      const winners = playerHands.filter(ph => 
        compareHands(ph.hand, bestHand) === 0
      );
      
      const winAmount = Math.floor(pot.amount / winners.length);
      const remainder = pot.amount - (winAmount * winners.length);
      
      const winnerResults = winners.map((w, idx) => ({
        user_id: w.user_id,
        amount: winAmount + (idx < remainder ? 1 : 0),
        isSplit: winners.length > 1,
        hand: w.hand,
        holeCards: w.holeCards
      }));
      
      results.push({
        pot: pot,
        winners: winnerResults
      });
    }
    
    return results;
  }
  
  distributeWinnings(players, results) {
    const winnings = {};
    const allPlayers = [...players];
    
    for (const player of allPlayers) {
      winnings[player.user_id] = 0;
    }
    
    for (const result of results) {
      for (const winner of result.winners) {
        winnings[winner.user_id] += winner.amount;
      }
    }
    
    return winnings;
  }
  
  getTotalPot() {
    return this.pots.reduce((sum, pot) => sum + pot.amount, 0);
  }
}

module.exports = PotManager;
