const { createDeck, shuffleDeck, evaluateHand, compareHands } = require('./cards');
const PotManager = require('./potManager');
const config = require('../config');

const GAME_PHASES = {
  PRE_FLOP: 'preflop',
  FLOP: 'flop',
  TURN: 'turn',
  RIVER: 'river',
  SHOWDOWN: 'showdown',
  COMPLETE: 'complete'
};

const PLAYER_STATES = {
  ACTIVE: 'active',
  FOLDED: 'folded',
  ALL_IN: 'all-in',
  WAITING: 'waiting'
};

class GameState {
  constructor(tableConfig) {
    this.id = tableConfig.id;
    this.smallBlind = tableConfig.small_blind;
    this.bigBlind = tableConfig.big_blind;
    this.maxPlayers = tableConfig.max_players;
    this.minBuyIn = tableConfig.min_buy_in;
    this.maxBuyIn = tableConfig.max_buy_in;
    
    this.phase = GAME_PHASES.PRE_FLOP;
    this.players = [];
    this.dealerPosition = -1;
    this.currentPlayerIndex = -1;
    this.lastAggressorIndex = -1;
    this.minRaise = this.bigBlind;
    this.currentBet = 0;
    this.communityCards = [];
    this.deck = [];
    this.potManager = new PotManager();
    this.actionTimeout = config.game.actionTimeout;
    this.timerId = null;
  }
  
  addPlayer(user, seatIndex, buyIn) {
    const chips = Math.max(buyIn, this.minBuyIn);
    const actualChips = Math.min(chips, this.maxBuyIn);
    
    const player = {
      user_id: user.id,
      username: user.username,
      avatar: user.avatar,
      seat_position: seatIndex,
      chips: actualChips,
      bet: 0,
      total_bet: 0,
      hole_cards: [],
      status: PLAYER_STATES.WAITING,
      is_turn: false,
      last_action: null,
      action_ends_at: null
    };
    
    this.players.push(player);
    return player;
  }
  
  removePlayer(userId) {
    const playerIndex = this.players.findIndex(p => p.user_id === userId);
    if (playerIndex !== -1) {
      return this.players.splice(playerIndex, 1)[0];
    }
    return null;
  }
  
  getPlayer(userId) {
    return this.players.find(p => p.user_id === userId);
  }
  
  getActivePlayers() {
    return this.players.filter(p => 
      p.status === PLAYER_STATES.ACTIVE || p.status === PLAYER_STATES.ALL_IN
    );
  }
  
  getPlayersInHand() {
    return this.players.filter(p => p.status !== PLAYER_STATES.FOLDED);
  }
  
  getAvailableSeats() {
    const occupiedSeats = this.players.map(p => p.seat_position);
    const available = [];
    for (let i = 0; i < this.maxPlayers; i++) {
      if (!occupiedSeats.includes(i)) {
        available.push(i);
      }
    }
    return available;
  }
  
  canStartGame() {
    return this.players.length >= 2;
  }
  
  startNewHand() {
    if (this.players.length < 2) return false;
    
    this.phase = GAME_PHASES.PRE_FLOP;
    this.communityCards = [];
    this.currentBet = 0;
    this.minRaise = this.bigBlind;
    
    this.deck = shuffleDeck(createDeck());
    
    this.players.forEach(p => {
      p.status = PLAYER_STATES.ACTIVE;
      p.bet = 0;
      p.total_bet = 0;
      p.hole_cards = [];
      p.is_turn = false;
      p.last_action = null;
    });
    
    const playingPlayers = this.players;
    this.dealerPosition = (this.dealerPosition + 1) % playingPlayers.length;
    
    const sortedPlayers = this.getSortedPlayersFromDealer();
    
    let sbIndex = 1 % sortedPlayers.length;
    let bbIndex = 2 % sortedPlayers.length;
    
    if (sortedPlayers.length === 2) {
      sbIndex = 0;
      bbIndex = 1;
    }
    
    const smallBlindPlayer = sortedPlayers[sbIndex];
    const bigBlindPlayer = sortedPlayers[bbIndex];
    
    this.placeBlind(smallBlindPlayer, this.smallBlind, true);
    this.placeBlind(bigBlindPlayer, this.bigBlind, false);
    
    for (const player of sortedPlayers) {
      if (player.hole_cards.length === 0) {
        player.hole_cards = [this.deck.pop(), this.deck.pop()];
      }
    }
    
    this.currentPlayerIndex = (bbIndex + 1) % sortedPlayers.length;
    this.lastAggressorIndex = bbIndex;
    this.currentBet = this.bigBlind;
    
    this.startPlayerTurn();
    
    return true;
  }
  
  getSortedPlayersFromDealer() {
    const activePlayers = this.getActivePlayers();
    return [...activePlayers].sort((a, b) => {
      const diffA = (a.seat_position - this.dealerPosition + this.maxPlayers) % this.maxPlayers;
      const diffB = (b.seat_position - this.dealerPosition + this.maxPlayers) % this.maxPlayers;
      return diffA - diffB;
    });
  }
  
  placeBlind(player, amount, isSmallBlind) {
    const actualAmount = Math.min(amount, player.chips);
    player.chips -= actualAmount;
    player.bet += actualAmount;
    player.total_bet += actualAmount;
    player.last_action = isSmallBlind ? 'small_blind' : 'big_blind';
    
    if (player.chips === 0) {
      player.status = PLAYER_STATES.ALL_IN;
    }
  }
  
  startPlayerTurn() {
    const sortedPlayers = this.getSortedPlayersFromDealer();
    const player = sortedPlayers[this.currentPlayerIndex];
    
    if (!player || player.status === PLAYER_STATES.FOLDED || 
        player.status === PLAYER_STATES.ALL_IN) {
      this.nextPlayer();
      return;
    }
    
    player.is_turn = true;
    player.action_ends_at = new Date(Date.now() + this.actionTimeout * 1000);
    
    this.clearTimer();
    this.timerId = setTimeout(() => {
      this.handleTimeout();
    }, this.actionTimeout * 1000);
  }
  
  handleTimeout() {
    const sortedPlayers = this.getSortedPlayersFromDealer();
    const player = sortedPlayers[this.currentPlayerIndex];
    
    if (player && player.is_turn) {
      this.fold(player.user_id);
    }
  }
  
  clearTimer() {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }
  
  getCallAmount(player) {
    return this.currentBet - player.bet;
  }
  
  getMinRaiseAmount() {
    return this.currentBet + this.minRaise;
  }
  
  fold(userId) {
    const player = this.getPlayer(userId);
    if (!player || !player.is_turn) return false;
    
    player.status = PLAYER_STATES.FOLDED;
    player.is_turn = false;
    player.last_action = 'fold';
    
    const playersInHand = this.getPlayersInHand();
    if (playersInHand.length === 1) {
      this.endHand();
      return true;
    }
    
    this.nextPlayer();
    return true;
  }
  
  check(userId) {
    const player = this.getPlayer(userId);
    if (!player || !player.is_turn) return false;
    
    const callAmount = this.getCallAmount(player);
    if (callAmount > 0) return false;
    
    player.is_turn = false;
    player.last_action = 'check';
    
    this.nextPlayer();
    return true;
  }
  
  call(userId) {
    const player = this.getPlayer(userId);
    if (!player || !player.is_turn) return false;
    
    const callAmount = this.getCallAmount(player);
    if (callAmount <= 0) return false;
    
    const actualAmount = Math.min(callAmount, player.chips);
    player.chips -= actualAmount;
    player.bet += actualAmount;
    player.total_bet += actualAmount;
    player.is_turn = false;
    
    if (player.chips === 0) {
      player.status = PLAYER_STATES.ALL_IN;
      player.last_action = 'all-in';
    } else {
      player.last_action = 'call';
    }
    
    this.nextPlayer();
    return true;
  }
  
  raise(userId, amount) {
    const player = this.getPlayer(userId);
    if (!player || !player.is_turn) return false;
    
    const callAmount = this.getCallAmount(player);
    const minRaiseTotal = this.getMinRaiseAmount();
    const raiseAmount = amount - this.currentBet;
    
    if (raiseAmount < this.minRaise) {
      if (player.chips + player.bet <= amount) {
        // All-in that doesn't complete the raise
        const allInAmount = player.chips;
        player.chips = 0;
        player.bet += allInAmount;
        player.total_bet += allInAmount;
        player.status = PLAYER_STATES.ALL_IN;
        player.is_turn = false;
        player.last_action = 'all-in';
        this.nextPlayer();
        return true;
      }
      return false;
    }
    
    const totalNeeded = amount - player.bet;
    if (player.chips < totalNeeded) return false;
    
    player.chips -= totalNeeded;
    player.bet = amount;
    player.total_bet += totalNeeded;
    player.is_turn = false;
    
    this.minRaise = raiseAmount;
    this.currentBet = amount;
    this.lastAggressorIndex = this.getSortedPlayersFromDealer().indexOf(player);
    
    if (player.chips === 0) {
      player.status = PLAYER_STATES.ALL_IN;
      player.last_action = 'all-in';
    } else {
      player.last_action = 'raise';
    }
    
    this.nextPlayer();
    return true;
  }
  
  allIn(userId) {
    const player = this.getPlayer(userId);
    if (!player || !player.is_turn) return false;
    
    if (player.chips === 0) return false;
    
    const newBet = player.bet + player.chips;
    const raiseAmount = newBet - this.currentBet;
    
    player.total_bet += player.chips;
    player.bet = newBet;
    player.chips = 0;
    player.status = PLAYER_STATES.ALL_IN;
    player.is_turn = false;
    
    if (raiseAmount > 0) {
      if (raiseAmount >= this.minRaise) {
        this.minRaise = raiseAmount;
        this.lastAggressorIndex = this.getSortedPlayersFromDealer().indexOf(player);
      }
      this.currentBet = Math.max(this.currentBet, newBet);
    }
    
    player.last_action = 'all-in';
    this.nextPlayer();
    return true;
  }
  
  nextPlayer() {
    const sortedPlayers = this.getSortedPlayersFromDealer();
    
    if (this.isRoundComplete()) {
      this.nextPhase();
      return;
    }
    
    do {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % sortedPlayers.length;
    } while (
      this.currentPlayerIndex !== this.lastAggressorIndex &&
      (sortedPlayers[this.currentPlayerIndex].status === PLAYER_STATES.FOLDED ||
       sortedPlayers[this.currentPlayerIndex].status === PLAYER_STATES.ALL_IN)
    );
    
    if (this.isRoundComplete()) {
      this.nextPhase();
    } else {
      this.startPlayerTurn();
    }
  }
  
  isRoundComplete() {
    const sortedPlayers = this.getSortedPlayersFromDealer();
    const playersInHand = sortedPlayers.filter(p => 
      p.status !== PLAYER_STATES.FOLDED
    );
    
    const activePlayers = playersInHand.filter(p => p.status === PLAYER_STATES.ACTIVE);
    
    if (activePlayers.length === 0) return true;
    if (playersInHand.length === 1) return true;
    
    const allMatched = playersInHand.every(p => 
      p.status === PLAYER_STATES.ALL_IN || p.bet === this.currentBet
    );
    
    return allMatched && this.currentPlayerIndex === this.lastAggressorIndex;
  }
  
  nextPhase() {
    const playersInHand = this.getPlayersInHand();
    
    if (playersInHand.length === 1) {
      this.endHand();
      return;
    }
    
    this.players.forEach(p => {
      p.bet = 0;
    });
    
    this.currentBet = 0;
    this.minRaise = this.bigBlind;
    
    switch (this.phase) {
      case GAME_PHASES.PRE_FLOP:
        this.phase = GAME_PHASES.FLOP;
        this.deck.pop();
        this.communityCards.push(this.deck.pop(), this.deck.pop(), this.deck.pop());
        break;
        
      case GAME_PHASES.FLOP:
        this.phase = GAME_PHASES.TURN;
        this.deck.pop();
        this.communityCards.push(this.deck.pop());
        break;
        
      case GAME_PHASES.TURN:
        this.phase = GAME_PHASES.RIVER;
        this.deck.pop();
        this.communityCards.push(this.deck.pop());
        break;
        
      case GAME_PHASES.RIVER:
        this.phase = GAME_PHASES.SHOWDOWN;
        this.endHand();
        return;
    }
    
    const sortedPlayers = this.getSortedPlayersFromDealer();
    this.currentPlayerIndex = sortedPlayers.findIndex(p => 
      p.status === PLAYER_STATES.ACTIVE
    );
    
    if (this.currentPlayerIndex === -1) {
      this.endHand();
      return;
    }
    
    this.lastAggressorIndex = this.currentPlayerIndex;
    this.startPlayerTurn();
  }
  
  endHand() {
    this.clearTimer();
    this.phase = GAME_PHASES.COMPLETE;
    
    this.players.forEach(p => {
      p.is_turn = false;
    });
    
    this.potManager.calculatePots(this.players);
    
    const results = this.potManager.determineWinners(
      this.players,
      this.communityCards
    );
    
    const winnings = this.potManager.distributeWinnings(this.players, results);
    
    for (const [userId, amount] of Object.entries(winnings)) {
      const player = this.getPlayer(parseInt(userId));
      if (player) {
        player.chips += amount;
      }
    }
    
    return {
      results,
      winnings,
      communityCards: this.communityCards,
      pot: this.potManager.getTotalPot()
    };
  }
  
  getGameState(userId) {
    const player = this.getPlayer(userId);
    
    return {
      phase: this.phase,
      community_cards: this.communityCards,
      current_bet: this.currentBet,
      min_raise: this.minRaise,
      pot: this.potManager.getTotalPot(),
      pots: this.potManager.pots,
      players: this.players.map(p => ({
        user_id: p.user_id,
        username: p.username,
        avatar: p.avatar,
        seat_position: p.seat_position,
        chips: p.chips,
        bet: p.bet,
        total_bet: p.total_bet,
        status: p.status,
        is_turn: p.is_turn,
        last_action: p.last_action,
        action_ends_at: p.action_ends_at,
        hole_cards: p.user_id === userId ? p.hole_cards : []
      })),
      dealer_position: this.dealerPosition,
      current_player_index: this.currentPlayerIndex,
      your_turn: player?.is_turn || false,
      call_amount: player ? this.getCallAmount(player) : 0,
      min_raise_amount: this.getMinRaiseAmount()
    };
  }
}

module.exports = {
  GameState,
  GAME_PHASES,
  PLAYER_STATES
};
