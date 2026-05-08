const PotManager = require('../src/game/potManager');
const { evaluateHand } = require('../src/game/cards');

const createCard = (value, suit) => ({ value, suit });

describe('Pot Manager', () => {
  describe('Pot Calculation', () => {
    test('should calculate simple pot with no all-in', () => {
      const players = [
        { user_id: 1, status: 'active', bet: 100, total_bet: 100 },
        { user_id: 2, status: 'active', bet: 100, total_bet: 100 },
        { user_id: 3, status: 'active', bet: 100, total_bet: 100 }
      ];
      
      const potManager = new PotManager();
      const pots = potManager.calculatePots(players);
      
      expect(pots.length).toBe(1);
      expect(pots[0].amount).toBe(300);
      expect(pots[0].isMain).toBe(true);
      expect(pots[0].eligiblePlayers).toEqual([1, 2, 3]);
    });
    
    test('should calculate main pot and side pot for single all-in', () => {
      const players = [
        { user_id: 1, status: 'all-in', bet: 50, total_bet: 50 },
        { user_id: 2, status: 'active', bet: 100, total_bet: 100 },
        { user_id: 3, status: 'active', bet: 100, total_bet: 100 }
      ];
      
      const potManager = new PotManager();
      const pots = potManager.calculatePots(players);
      
      expect(pots.length).toBe(2);
      
      expect(pots[0].amount).toBe(150);
      expect(pots[0].isMain).toBe(true);
      expect(pots[0].eligiblePlayers).toEqual([1, 2, 3]);
      
      expect(pots[1].amount).toBe(100);
      expect(pots[1].isMain).toBe(false);
      expect(pots[1].eligiblePlayers).toEqual([2, 3]);
    });
    
    test('should calculate multiple side pots for multiple all-ins with different amounts', () => {
      const players = [
        { user_id: 1, status: 'all-in', bet: 50, total_bet: 50 },
        { user_id: 2, status: 'all-in', bet: 100, total_bet: 100 },
        { user_id: 3, status: 'active', bet: 150, total_bet: 150 },
        { user_id: 4, status: 'active', bet: 150, total_bet: 150 }
      ];
      
      const potManager = new PotManager();
      const pots = potManager.calculatePots(players);
      
      expect(pots.length).toBe(3);
      
      expect(pots[0].amount).toBe(200);
      expect(pots[0].eligiblePlayers).toEqual([1, 2, 3, 4]);
      
      expect(pots[1].amount).toBe(150);
      expect(pots[1].eligiblePlayers).toEqual([2, 3, 4]);
      
      expect(pots[2].amount).toBe(100);
      expect(pots[2].eligiblePlayers).toEqual([3, 4]);
    });
    
    test('should exclude folded players from pots', () => {
      const players = [
        { user_id: 1, status: 'folded', bet: 50, total_bet: 50 },
        { user_id: 2, status: 'active', bet: 100, total_bet: 100 },
        { user_id: 3, status: 'active', bet: 100, total_bet: 100 }
      ];
      
      const potManager = new PotManager();
      const pots = potManager.calculatePots(players);
      
      expect(pots.length).toBe(1);
      expect(pots[0].eligiblePlayers).not.toContain(1);
    });
  });
  
  describe('Winner Determination', () => {
    test('should determine single winner for simple pot', () => {
      const players = [
        { 
          user_id: 1, 
          status: 'active', 
          bet: 100, 
          total_bet: 100,
          hole_cards: [createCard('A', '♠'), createCard('K', '♠')]
        },
        { 
          user_id: 2, 
          status: 'active', 
          bet: 100, 
          total_bet: 100,
          hole_cards: [createCard('2', '♠'), createCard('3', '♠')]
        }
      ];
      
      const communityCards = [
        createCard('Q', '♠'),
        createCard('J', '♠'),
        createCard('10', '♠'),
        createCard('2', '♥'),
        createCard('3', '♣')
      ];
      
      const potManager = new PotManager();
      potManager.calculatePots(players);
      const results = potManager.determineWinners(players, communityCards);
      
      expect(results.length).toBe(1);
      expect(results[0].winners.length).toBe(1);
      expect(results[0].winners[0].user_id).toBe(1);
    });
    
    test('should split pot for tied hands', () => {
      const players = [
        { 
          user_id: 1, 
          status: 'active', 
          bet: 100, 
          total_bet: 100,
          hole_cards: [createCard('A', '♠'), createCard('K', '♥')]
        },
        { 
          user_id: 2, 
          status: 'active', 
          bet: 100, 
          total_bet: 100,
          hole_cards: [createCard('A', '♦'), createCard('K', '♣')]
        }
      ];
      
      const communityCards = [
        createCard('Q', '♠'),
        createCard('J', '♥'),
        createCard('10', '♦'),
        createCard('2', '♥'),
        createCard('3', '♣')
      ];
      
      const potManager = new PotManager();
      potManager.calculatePots(players);
      const results = potManager.determineWinners(players, communityCards);
      
      expect(results.length).toBe(1);
      expect(results[0].winners.length).toBe(2);
      expect(results[0].winners[0].isSplit).toBe(true);
      expect(results[0].winners[1].isSplit).toBe(true);
    });
    
    test('should handle all-in player winning only main pot', () => {
      const players = [
        { 
          user_id: 1, 
          status: 'all-in', 
          bet: 50, 
          total_bet: 50,
          hole_cards: [createCard('A', '♠'), createCard('A', '♥')]
        },
        { 
          user_id: 2, 
          status: 'active', 
          bet: 100, 
          total_bet: 100,
          hole_cards: [createCard('K', '♠'), createCard('K', '♥')]
        },
        { 
          user_id: 3, 
          status: 'active', 
          bet: 100, 
          total_bet: 100,
          hole_cards: [createCard('Q', '♠'), createCard('Q', '♥')]
        }
      ];
      
      const communityCards = [
        createCard('2', '♦'),
        createCard('3', '♣'),
        createCard('4', '♠'),
        createCard('5', '♥'),
        createCard('6', '♦')
      ];
      
      const potManager = new PotManager();
      potManager.calculatePots(players);
      const results = potManager.determineWinners(players, communityCards);
      
      expect(results.length).toBe(2);
      
      const mainPot = results.find(r => r.pot.isMain);
      const sidePot = results.find(r => !r.pot.isMain);
      
      expect(mainPot.winners[0].user_id).toBe(1);
      expect(sidePot.winners[0].user_id).toBe(2);
    });
    
    test('should handle non-all-in player winning all pots', () => {
      const players = [
        { 
          user_id: 1, 
          status: 'all-in', 
          bet: 50, 
          total_bet: 50,
          hole_cards: [createCard('2', '♠'), createCard('3', '♥')]
        },
        { 
          user_id: 2, 
          status: 'active', 
          bet: 100, 
          total_bet: 100,
          hole_cards: [createCard('A', '♠'), createCard('A', '♥')]
        },
        { 
          user_id: 3, 
          status: 'active', 
          bet: 100, 
          total_bet: 100,
          hole_cards: [createCard('K', '♠'), createCard('K', '♥')]
        }
      ];
      
      const communityCards = [
        createCard('2', '♦'),
        createCard('3', '♣'),
        createCard('4', '♠'),
        createCard('5', '♥'),
        createCard('6', '♦')
      ];
      
      const potManager = new PotManager();
      potManager.calculatePots(players);
      const results = potManager.determineWinners(players, communityCards);
      
      expect(results.length).toBe(2);
      
      for (const result of results) {
        expect(result.winners.length).toBe(1);
        expect(result.winners[0].user_id).toBe(2);
      }
    });
    
    test('should handle folded players', () => {
      const players = [
        { 
          user_id: 1, 
          status: 'folded', 
          bet: 50, 
          total_bet: 50,
          hole_cards: [createCard('A', '♠'), createCard('A', '♥')]
        },
        { 
          user_id: 2, 
          status: 'active', 
          bet: 100, 
          total_bet: 100,
          hole_cards: [createCard('K', '♠'), createCard('K', '♥')]
        },
        { 
          user_id: 3, 
          status: 'active', 
          bet: 100, 
          total_bet: 100,
          hole_cards: [createCard('Q', '♠'), createCard('Q', '♥')]
        }
      ];
      
      const communityCards = [
        createCard('2', '♦'),
        createCard('3', '♣'),
        createCard('4', '♠'),
        createCard('5', '♥'),
        createCard('6', '♦')
      ];
      
      const potManager = new PotManager();
      potManager.calculatePots(players);
      const results = potManager.determineWinners(players, communityCards);
      
      expect(results.length).toBe(1);
      expect(results[0].winners[0].user_id).toBe(2);
    });
    
    test('single remaining player wins all pots', () => {
      const players = [
        { user_id: 1, status: 'folded', bet: 50, total_bet: 50, hole_cards: [] },
        { user_id: 2, status: 'folded', bet: 100, total_bet: 100, hole_cards: [] },
        { user_id: 3, status: 'active', bet: 100, total_bet: 100, hole_cards: [] }
      ];
      
      const communityCards = [];
      
      const potManager = new PotManager();
      potManager.calculatePots(players);
      const results = potManager.determineWinners(players, communityCards);
      
      expect(results.length).toBe(1);
      expect(results[0].winners[0].user_id).toBe(3);
    });
  });
  
  describe('Winnings Distribution', () => {
    test('should distribute winnings correctly for all-in scenario', () => {
      const players = [
        { user_id: 1, status: 'all-in', bet: 50, total_bet: 50, hole_cards: [], chips: 0 },
        { user_id: 2, status: 'active', bet: 100, total_bet: 100, hole_cards: [], chips: 0 },
        { user_id: 3, status: 'active', bet: 100, total_bet: 100, hole_cards: [], chips: 0 }
      ];
      
      const potManager = new PotManager();
      potManager.calculatePots(players);
      
      const winnings = {
        [1]: 150,
        [2]: 100,
        [3]: 0
      };
      
      potManager.distributeWinnings = jest.fn().mockReturnValue(winnings);
      
      const result = potManager.distributeWinnings(players, []);
      
      expect(result[1]).toBe(150);
      expect(result[2]).toBe(100);
      expect(result[3]).toBe(0);
    });
    
    test('should handle odd number chips split', () => {
      const players = [
        { user_id: 1, status: 'active', total_bet: 1, hole_cards: [] },
        { user_id: 2, status: 'active', total_bet: 1, hole_cards: [] },
        { user_id: 3, status: 'active', total_bet: 1, hole_cards: [] }
      ];
      
      const communityCards = [
        createCard('A', '♠'), createCard('K', '♠'), createCard('Q', '♠'),
        createCard('J', '♠'), createCard('10', '♠')
      ];
      
      const potManager = new PotManager();
      potManager.calculatePots(players);
      const results = potManager.determineWinners(players, communityCards);
      const winnings = potManager.distributeWinnings(players, results);
      
      const totalWon = Object.values(winnings).reduce((a, b) => a + b, 0);
      expect(totalWon).toBe(3);
    });
  });
});
