const crypto = require('crypto');

const SUITS = ['♠', '♥', '♦', '♣'];
const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

const VALUE_RANKS = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
  'J': 11, 'Q': 12, 'K': 13, 'A': 14
};

const HAND_RANKS = {
  'high_card': 1,
  'one_pair': 2,
  'two_pairs': 3,
  'three_of_a_kind': 4,
  'straight': 5,
  'flush': 6,
  'full_house': 7,
  'four_of_a_kind': 8,
  'straight_flush': 9,
  'royal_flush': 10
};

const createDeck = () => {
  const deck = [];
  for (const suit of SUITS) {
    for (const value of VALUES) {
      deck.push({ suit, value });
    }
  }
  return deck;
};

const shuffleDeck = (deck) => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = crypto.randomBytes(4).readUInt32BE(0) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const getCardRank = (card) => VALUE_RANKS[card.value];

const getCardValue = (card) => {
  const rank = getCardRank(card);
  return rank < 10 ? rank.toString() : card.value;
};

const countBySuit = (cards) => {
  const counts = {};
  for (const card of cards) {
    counts[card.suit] = (counts[card.suit] || 0) + 1;
  }
  return counts;
};

const countByValue = (cards) => {
  const counts = {};
  for (const card of cards) {
    counts[card.value] = (counts[card.value] || 0) + 1;
  }
  return counts;
};

const sortCardsByRank = (cards, descending = true) => {
  return [...cards].sort((a, b) => {
    const rankA = getCardRank(a);
    const rankB = getCardRank(b);
    return descending ? rankB - rankA : rankA - rankB;
  });
};

const isFlush = (cards) => {
  const suitCounts = countBySuit(cards);
  return Object.values(suitCounts).some(count => count >= 5);
};

const getFlushCards = (cards) => {
  const suitCounts = countBySuit(cards);
  for (const [suit, count] of Object.entries(suitCounts)) {
    if (count >= 5) {
      const flushCards = cards.filter(c => c.suit === suit);
      return sortCardsByRank(flushCards).slice(0, 5);
    }
  }
  return null;
};

const isStraight = (cards) => {
  const uniqueRanks = [...new Set(cards.map(getCardRank))].sort((a, b) => a - b);
  
  for (let i = 0; i <= uniqueRanks.length - 5; i++) {
    if (uniqueRanks[i + 4] - uniqueRanks[i] === 4) {
      return { isStraight: true, highRank: uniqueRanks[i + 4] };
    }
  }
  
  if (uniqueRanks.includes(14) && uniqueRanks.includes(2) && 
      uniqueRanks.includes(3) && uniqueRanks.includes(4) && uniqueRanks.includes(5)) {
    return { isStraight: true, highRank: 5 };
  }
  
  return { isStraight: false, highRank: 0 };
};

const getStraightCards = (cards) => {
  const uniqueRanks = [...new Set(cards.map(getCardRank))].sort((a, b) => b - a);
  
  for (let i = 0; i <= uniqueRanks.length - 5; i++) {
    if (uniqueRanks[i] - uniqueRanks[i + 4] === 4) {
      const straightRanks = uniqueRanks.slice(i, i + 5);
      const result = [];
      const usedCards = new Set();
      
      for (const rank of straightRanks) {
        for (const card of cards) {
          const cardKey = `${card.suit}-${card.value}`;
          if (!usedCards.has(cardKey) && getCardRank(card) === rank) {
            result.push(card);
            usedCards.add(cardKey);
            break;
          }
        }
      }
      return result;
    }
  }
  
  if (uniqueRanks.includes(14) && uniqueRanks.includes(2) && 
      uniqueRanks.includes(3) && uniqueRanks.includes(4) && uniqueRanks.includes(5)) {
    const wheelRanks = [14, 5, 4, 3, 2];
    const result = [];
    const usedCards = new Set();
    
    for (const rank of wheelRanks) {
      for (const card of cards) {
        const cardKey = `${card.suit}-${card.value}`;
        if (!usedCards.has(cardKey) && getCardRank(card) === rank) {
          result.push(card);
          usedCards.add(cardKey);
          break;
        }
      }
    }
    return result;
  }
  
  return null;
};

const evaluateHand = (holeCards, communityCards) => {
  const allCards = [...holeCards, ...communityCards];
  
  if (allCards.length < 7) {
    return {
      rank: HAND_RANKS.high_card,
      name: 'High Card',
      cards: sortCardsByRank(allCards).slice(0, 5)
    };
  }
  
  const valueCounts = countByValue(allCards);
  const counts = Object.entries(valueCounts)
    .map(([value, count]) => ({ value, count, rank: VALUE_RANKS[value] }))
    .sort((a, b) => b.count - a.count || b.rank - a.rank);
  
  const flushCards = getFlushCards(allCards);
  const straightCards = getStraightCards(allCards);
  
  if (flushCards) {
    const straightFlushCards = getStraightCards(flushCards);
    if (straightFlushCards) {
      const isRoyal = straightFlushCards.every(c => 
        ['A', 'K', 'Q', 'J', '10'].includes(c.value)
      );
      if (isRoyal) {
        return {
          rank: HAND_RANKS.royal_flush,
          name: 'Royal Flush',
          cards: straightFlushCards
        };
      }
      return {
        rank: HAND_RANKS.straight_flush,
        name: 'Straight Flush',
        cards: straightFlushCards
      };
    }
  }
  
  if (counts[0]?.count === 4) {
    const quadsValue = counts[0].value;
    const quadsCards = allCards.filter(c => c.value === quadsValue);
    const kicker = sortCardsByRank(allCards.filter(c => c.value !== quadsValue))[0];
    return {
      rank: HAND_RANKS.four_of_a_kind,
      name: 'Four of a Kind',
      cards: [...quadsCards, kicker]
    };
  }
  
  if (counts[0]?.count === 3 && counts[1]?.count >= 2) {
    const tripsValue = counts[0].value;
    const pairValue = counts[1].value;
    const tripsCards = allCards.filter(c => c.value === tripsValue);
    const pairCards = sortCardsByRank(allCards.filter(c => c.value === pairValue)).slice(0, 2);
    return {
      rank: HAND_RANKS.full_house,
      name: 'Full House',
      cards: [...tripsCards, ...pairCards]
    };
  }
  
  if (flushCards) {
    return {
      rank: HAND_RANKS.flush,
      name: 'Flush',
      cards: flushCards
    };
  }
  
  if (straightCards) {
    return {
      rank: HAND_RANKS.straight,
      name: 'Straight',
      cards: straightCards
    };
  }
  
  if (counts[0]?.count === 3) {
    const tripsValue = counts[0].value;
    const tripsCards = allCards.filter(c => c.value === tripsValue);
    const kickers = sortCardsByRank(allCards.filter(c => c.value !== tripsValue)).slice(0, 2);
    return {
      rank: HAND_RANKS.three_of_a_kind,
      name: 'Three of a Kind',
      cards: [...tripsCards, ...kickers]
    };
  }
  
  if (counts[0]?.count === 2 && counts[1]?.count === 2) {
    const pair1Value = counts[0].value;
    const pair2Value = counts[1].value;
    const pair1Cards = sortCardsByRank(allCards.filter(c => c.value === pair1Value)).slice(0, 2);
    const pair2Cards = sortCardsByRank(allCards.filter(c => c.value === pair2Value)).slice(0, 2);
    const kicker = sortCardsByRank(allCards.filter(c => 
      c.value !== pair1Value && c.value !== pair2Value
    ))[0];
    return {
      rank: HAND_RANKS.two_pairs,
      name: 'Two Pairs',
      cards: [...pair1Cards, ...pair2Cards, kicker]
    };
  }
  
  if (counts[0]?.count === 2) {
    const pairValue = counts[0].value;
    const pairCards = sortCardsByRank(allCards.filter(c => c.value === pairValue)).slice(0, 2);
    const kickers = sortCardsByRank(allCards.filter(c => c.value !== pairValue)).slice(0, 3);
    return {
      rank: HAND_RANKS.one_pair,
      name: 'One Pair',
      cards: [...pairCards, ...kickers]
    };
  }
  
  return {
    rank: HAND_RANKS.high_card,
    name: 'High Card',
    cards: sortCardsByRank(allCards).slice(0, 5)
  };
};

const compareHands = (handA, handB) => {
  if (handA.rank !== handB.rank) {
    return handA.rank - handB.rank;
  }
  
  for (let i = 0; i < 5; i++) {
    const rankA = getCardRank(handA.cards[i]);
    const rankB = getCardRank(handB.cards[i]);
    if (rankA !== rankB) {
      return rankA - rankB;
    }
  }
  
  return 0;
};

module.exports = {
  SUITS,
  VALUES,
  VALUE_RANKS,
  HAND_RANKS,
  createDeck,
  shuffleDeck,
  getCardRank,
  getCardValue,
  countBySuit,
  countByValue,
  sortCardsByRank,
  isFlush,
  getFlushCards,
  isStraight,
  getStraightCards,
  evaluateHand,
  compareHands
};
