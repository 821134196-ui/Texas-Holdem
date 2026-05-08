const {
  evaluateHand,
  compareHands,
  createDeck,
  shuffleDeck,
  HAND_RANKS
} = require('../src/game/cards');

const createCard = (value, suit) => ({ value, suit });

describe('Card Evaluation', () => {
  describe('Hand Rankings', () => {
    test('should identify Royal Flush', () => {
      const holeCards = [createCard('A', '♠'), createCard('K', '♠')];
      const communityCards = [
        createCard('Q', '♠'),
        createCard('J', '♠'),
        createCard('10', '♠'),
        createCard('2', '♥'),
        createCard('3', '♣')
      ];
      
      const result = evaluateHand(holeCards, communityCards);
      expect(result.rank).toBe(HAND_RANKS.royal_flush);
      expect(result.name).toBe('Royal Flush');
    });
    
    test('should identify Straight Flush', () => {
      const holeCards = [createCard('9', '♠'), createCard('8', '♠')];
      const communityCards = [
        createCard('7', '♠'),
        createCard('6', '♠'),
        createCard('5', '♠'),
        createCard('K', '♥'),
        createCard('A', '♣')
      ];
      
      const result = evaluateHand(holeCards, communityCards);
      expect(result.rank).toBe(HAND_RANKS.straight_flush);
      expect(result.name).toBe('Straight Flush');
    });
    
    test('should identify Wheel Straight Flush (A-2-3-4-5)', () => {
      const holeCards = [createCard('A', '♠'), createCard('2', '♠')];
      const communityCards = [
        createCard('3', '♠'),
        createCard('4', '♠'),
        createCard('5', '♠'),
        createCard('K', '♥'),
        createCard('Q', '♣')
      ];
      
      const result = evaluateHand(holeCards, communityCards);
      expect(result.rank).toBe(HAND_RANKS.straight_flush);
      expect(result.name).toBe('Straight Flush');
    });
    
    test('should identify Four of a Kind', () => {
      const holeCards = [createCard('A', '♠'), createCard('A', '♥')];
      const communityCards = [
        createCard('A', '♦'),
        createCard('A', '♣'),
        createCard('K', '♠'),
        createCard('2', '♥'),
        createCard('3', '♣')
      ];
      
      const result = evaluateHand(holeCards, communityCards);
      expect(result.rank).toBe(HAND_RANKS.four_of_a_kind);
      expect(result.name).toBe('Four of a Kind');
    });
    
    test('should identify Full House', () => {
      const holeCards = [createCard('A', '♠'), createCard('A', '♥')];
      const communityCards = [
        createCard('A', '♦'),
        createCard('K', '♠'),
        createCard('K', '♥'),
        createCard('2', '♣'),
        createCard('3', '♦')
      ];
      
      const result = evaluateHand(holeCards, communityCards);
      expect(result.rank).toBe(HAND_RANKS.full_house);
      expect(result.name).toBe('Full House');
    });
    
    test('should identify Flush', () => {
      const holeCards = [createCard('A', '♠'), createCard('10', '♠')];
      const communityCards = [
        createCard('7', '♠'),
        createCard('4', '♠'),
        createCard('2', '♠'),
        createCard('K', '♥'),
        createCard('Q', '♣')
      ];
      
      const result = evaluateHand(holeCards, communityCards);
      expect(result.rank).toBe(HAND_RANKS.flush);
      expect(result.name).toBe('Flush');
    });
    
    test('should identify Straight', () => {
      const holeCards = [createCard('A', '♠'), createCard('K', '♥')];
      const communityCards = [
        createCard('Q', '♦'),
        createCard('J', '♣'),
        createCard('10', '♠'),
        createCard('2', '♥'),
        createCard('3', '♣')
      ];
      
      const result = evaluateHand(holeCards, communityCards);
      expect(result.rank).toBe(HAND_RANKS.straight);
      expect(result.name).toBe('Straight');
    });
    
    test('should identify Wheel Straight (A-2-3-4-5)', () => {
      const holeCards = [createCard('A', '♠'), createCard('2', '♥')];
      const communityCards = [
        createCard('3', '♦'),
        createCard('4', '♣'),
        createCard('5', '♠'),
        createCard('K', '♥'),
        createCard('Q', '♣')
      ];
      
      const result = evaluateHand(holeCards, communityCards);
      expect(result.rank).toBe(HAND_RANKS.straight);
      expect(result.name).toBe('Straight');
    });
    
    test('should identify Three of a Kind', () => {
      const holeCards = [createCard('A', '♠'), createCard('A', '♥')];
      const communityCards = [
        createCard('A', '♦'),
        createCard('K', '♠'),
        createCard('Q', '♥'),
        createCard('2', '♣'),
        createCard('3', '♦')
      ];
      
      const result = evaluateHand(holeCards, communityCards);
      expect(result.rank).toBe(HAND_RANKS.three_of_a_kind);
      expect(result.name).toBe('Three of a Kind');
    });
    
    test('should identify Two Pairs', () => {
      const holeCards = [createCard('A', '♠'), createCard('A', '♥')];
      const communityCards = [
        createCard('K', '♦'),
        createCard('K', '♠'),
        createCard('Q', '♥'),
        createCard('2', '♣'),
        createCard('3', '♦')
      ];
      
      const result = evaluateHand(holeCards, communityCards);
      expect(result.rank).toBe(HAND_RANKS.two_pairs);
      expect(result.name).toBe('Two Pairs');
    });
    
    test('should identify One Pair', () => {
      const holeCards = [createCard('A', '♠'), createCard('A', '♥')];
      const communityCards = [
        createCard('K', '♦'),
        createCard('Q', '♠'),
        createCard('J', '♥'),
        createCard('2', '♣'),
        createCard('3', '♦')
      ];
      
      const result = evaluateHand(holeCards, communityCards);
      expect(result.rank).toBe(HAND_RANKS.one_pair);
      expect(result.name).toBe('One Pair');
    });
    
    test('should identify High Card', () => {
      const holeCards = [createCard('A', '♠'), createCard('K', '♥')];
      const communityCards = [
        createCard('Q', '♦'),
        createCard('J', '♣'),
        createCard('9', '♠'),
        createCard('2', '♥'),
        createCard('3', '♣')
      ];
      
      const result = evaluateHand(holeCards, communityCards);
      expect(result.rank).toBe(HAND_RANKS.high_card);
      expect(result.name).toBe('High Card');
    });
  });
  
  describe('Hand Comparisons', () => {
    test('Four of a Kind should beat Full House', () => {
      const fourOfAKind = evaluateHand(
        [createCard('A', '♠'), createCard('A', '♥')],
        [createCard('A', '♦'), createCard('A', '♣'), createCard('K', '♠'), createCard('2', '♥'), createCard('3', '♣')]
      );
      
      const fullHouse = evaluateHand(
        [createCard('A', '♠'), createCard('A', '♥')],
        [createCard('A', '♦'), createCard('K', '♠'), createCard('K', '♥'), createCard('2', '♣'), createCard('3', '♦')]
      );
      
      expect(compareHands(fourOfAKind, fullHouse)).toBeGreaterThan(0);
    });
    
    test('Higher Four of a Kind should beat lower Four of a Kind', () => {
      const quadAces = evaluateHand(
        [createCard('A', '♠'), createCard('A', '♥')],
        [createCard('A', '♦'), createCard('A', '♣'), createCard('K', '♠'), createCard('2', '♥'), createCard('3', '♣')]
      );
      
      const quadKings = evaluateHand(
        [createCard('K', '♠'), createCard('K', '♥')],
        [createCard('K', '♦'), createCard('K', '♣'), createCard('A', '♠'), createCard('2', '♥'), createCard('3', '♣')]
      );
      
      expect(compareHands(quadAces, quadKings)).toBeGreaterThan(0);
    });
    
    test('Equal hands should tie', () => {
      const hand1 = evaluateHand(
        [createCard('A', '♠'), createCard('K', '♥')],
        [createCard('Q', '♦'), createCard('J', '♣'), createCard('10', '♠'), createCard('2', '♥'), createCard('3', '♣')]
      );
      
      const hand2 = evaluateHand(
        [createCard('A', '♥'), createCard('K', '♦')],
        [createCard('Q', '♠'), createCard('J', '♥'), createCard('10', '♣'), createCard('4', '♠'), createCard('5', '♥')]
      );
      
      expect(compareHands(hand1, hand2)).toBe(0);
    });
    
    test('Higher kicker should win', () => {
      const hand1 = evaluateHand(
        [createCard('A', '♠'), createCard('Q', '♥')],
        [createCard('A', '♦'), createCard('K', '♣'), createCard('J', '♠'), createCard('9', '♥'), createCard('2', '♣')]
      );
      
      const hand2 = evaluateHand(
        [createCard('A', '♥'), createCard('J', '♦')],
        [createCard('A', '♣'), createCard('K', '♠'), createCard('10', '♥'), createCard('9', '♣'), createCard('2', '♠')]
      );
      
      expect(compareHands(hand1, hand2)).toBeGreaterThan(0);
    });
  });
  
  describe('Deck Operations', () => {
    test('should create a deck of 52 cards', () => {
      const deck = createDeck();
      expect(deck.length).toBe(52);
    });
    
    test('should shuffle deck without losing cards', () => {
      const originalDeck = createDeck();
      const shuffledDeck = shuffleDeck([...originalDeck]);
      
      expect(shuffledDeck.length).toBe(52);
      
      const originalValues = originalDeck.map(c => `${c.value}${c.suit}`).sort();
      const shuffledValues = shuffledDeck.map(c => `${c.value}${c.suit}`).sort();
      
      expect(originalValues).toEqual(shuffledValues);
    });
  });
});
