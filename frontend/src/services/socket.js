import { io } from 'socket.io-client';
import { store } from '../store';
import { setGameState, setPrivateCards, addChatMessage, setHandResult } from '../store/gameSlice';
import { updateChips } from '../store/authSlice';

let socket = null;

export const getSocket = () => socket;

export const initSocket = (token) => {
  socket = io({
    auth: {
      token
    }
  });
  
  socket.on('connect', () => {
    console.log('Connected to socket');
  });
  
  socket.on('disconnect', () => {
    console.log('Disconnected from socket');
  });
  
  socket.on('game_state', (gameState) => {
    store.dispatch(setGameState(gameState));
  });
  
  socket.on('private_cards', (data) => {
    const state = store.getState();
    if (data.user_id === state.auth.user?.id) {
      store.dispatch(setPrivateCards(data.hole_cards));
    }
  });
  
  socket.on('player_joined', (player) => {
    const state = store.getState();
    const currentState = state.game.gameState;
    if (currentState) {
      const updatedPlayers = [...currentState.players, player];
      store.dispatch(setGameState({
        ...currentState,
        players: updatedPlayers
      }));
    }
  });
  
  socket.on('player_left', (data) => {
    const state = store.getState();
    const currentState = state.game.gameState;
    if (currentState) {
      const updatedPlayers = currentState.players.filter(
        p => p.user_id !== data.user_id
      );
      store.dispatch(setGameState({
        ...currentState,
        players: updatedPlayers
      }));
    }
  });
  
  socket.on('action_performed', (data) => {
    const state = store.getState();
    const currentState = state.game.gameState;
    if (currentState) {
      const updatedPlayers = currentState.players.map(p =>
        p.user_id === data.user_id
          ? { ...p, bet: data.bet, chips: data.chips, last_action: data.action }
          : p
      );
      store.dispatch(setGameState({
        ...currentState,
        players: updatedPlayers
      }));
    }
  });
  
  socket.on('game_started', (data) => {
    console.log('Game started:', data);
  });
  
  socket.on('hand_ended', (data) => {
    store.dispatch(setHandResult(data));
    
    const state = store.getState();
    const myUserId = state.auth.user?.id;
    if (myUserId && data.winnings[myUserId]) {
      const myPlayer = data.players.find(p => p.user_id === myUserId);
      if (myPlayer) {
        store.dispatch(updateChips(myPlayer.chips));
      }
    }
  });
  
  socket.on('chat_message', (message) => {
    store.dispatch(addChatMessage(message));
  });
  
  socket.on('tables_updated', (tables) => {
    store.dispatch({
      type: 'game/fetchTables/fulfilled',
      payload: tables
    });
  });
  
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const socketActions = {
  joinLobby: () => {
    if (socket) socket.emit('join_lobby');
  },
  
  leaveLobby: () => {
    if (socket) socket.emit('leave_lobby');
  },
  
  createTable: (options, callback) => {
    if (socket) socket.emit('create_table', options, callback);
  },
  
  joinTable: (tableId, password, buyIn, callback) => {
    if (socket) socket.emit('join_table', { tableId, password, buyIn }, callback);
  },
  
  leaveTable: (callback) => {
    if (socket) socket.emit('leave_table', callback);
  },
  
  startGame: (callback) => {
    if (socket) socket.emit('start_game', callback);
  },
  
  playerAction: (action, amount, callback) => {
    if (socket) socket.emit('player_action', { action, amount }, callback);
  },
  
  sendMessage: (message, callback) => {
    if (socket) socket.emit('send_message', { message }, callback);
  }
};
