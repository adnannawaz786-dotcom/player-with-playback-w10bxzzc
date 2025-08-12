import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { loadPlaylist, savePlaylist, loadPlayerState, savePlayerState } from '../utils/storage';

const PlayerContext = createContext();

const initialState = {
  playlist: [],
  currentTrack: null,
  currentIndex: -1,
  isPlaying: false,
  volume: 1,
  currentTime: 0,
  duration: 0,
  isLoading: false,
  error: null,
  repeat: 'none', // 'none', 'one', 'all'
  shuffle: false,
  shuffleOrder: [],
  originalOrder: []
};

function playerReducer(state, action) {
  switch (action.type) {
    case 'SET_PLAYLIST':
      return {
        ...state,
        playlist: action.payload,
        originalOrder: action.payload.map((_, index) => index)
      };

    case 'ADD_TO_PLAYLIST':
      const newPlaylist = [...state.playlist, ...action.payload];
      return {
        ...state,
        playlist: newPlaylist,
        originalOrder: newPlaylist.map((_, index) => index)
      };

    case 'REMOVE_FROM_PLAYLIST':
      const filteredPlaylist = state.playlist.filter((_, index) => index !== action.payload);
      const newCurrentIndex = action.payload < state.currentIndex 
        ? state.currentIndex - 1 
        : action.payload === state.currentIndex 
          ? -1 
          : state.currentIndex;
      
      return {
        ...state,
        playlist: filteredPlaylist,
        currentIndex: newCurrentIndex,
        currentTrack: newCurrentIndex >= 0 ? filteredPlaylist[newCurrentIndex] : null,
        originalOrder: filteredPlaylist.map((_, index) => index)
      };

    case 'SET_CURRENT_TRACK':
      return {
        ...state,
        currentTrack: action.payload.track,
        currentIndex: action.payload.index,
        currentTime: 0
      };

    case 'SET_PLAYING':
      return {
        ...state,
        isPlaying: action.payload
      };

    case 'SET_VOLUME':
      return {
        ...state,
        volume: action.payload
      };

    case 'SET_CURRENT_TIME':
      return {
        ...state,
        currentTime: action.payload
      };

    case 'SET_DURATION':
      return {
        ...state,
        duration: action.payload
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };

    case 'SET_REPEAT':
      return {
        ...state,
        repeat: action.payload
      };

    case 'SET_SHUFFLE':
      const shuffleOrder = action.payload 
        ? shuffleArray([...state.originalOrder])
        : [];
      
      return {
        ...state,
        shuffle: action.payload,
        shuffleOrder
      };

    case 'NEXT_TRACK':
      const nextIndex = getNextTrackIndex(state);
      return {
        ...state,
        currentIndex: nextIndex,
        currentTrack: nextIndex >= 0 ? state.playlist[nextIndex] : null,
        currentTime: 0
      };

    case 'PREVIOUS_TRACK':
      const prevIndex = getPreviousTrackIndex(state);
      return {
        ...state,
        currentIndex: prevIndex,
        currentTrack: prevIndex >= 0 ? state.playlist[prevIndex] : null,
        currentTime: 0
      };

    case 'CLEAR_PLAYLIST':
      return {
        ...state,
        playlist: [],
        currentTrack: null,
        currentIndex: -1,
        isPlaying: false,
        originalOrder: [],
        shuffleOrder: []
      };

    case 'REORDER_PLAYLIST':
      const { startIndex, endIndex } = action.payload;
      const newList = Array.from(state.playlist);
      const [removed] = newList.splice(startIndex, 1);
      newList.splice(endIndex, 0, removed);
      
      let newCurrentIndex = state.currentIndex;
      if (startIndex === state.currentIndex) {
        newCurrentIndex = endIndex;
      } else if (startIndex < state.currentIndex && endIndex >= state.currentIndex) {
        newCurrentIndex = state.currentIndex - 1;
      } else if (startIndex > state.currentIndex && endIndex <= state.currentIndex) {
        newCurrentIndex = state.currentIndex + 1;
      }

      return {
        ...state,
        playlist: newList,
        currentIndex: newCurrentIndex,
        originalOrder: newList.map((_, index) => index)
      };

    default:
      return state;
  }
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getNextTrackIndex(state) {
  const { currentIndex, playlist, repeat, shuffle, shuffleOrder } = state;
  
  if (playlist.length === 0) return -1;
  
  if (repeat === 'one') {
    return currentIndex;
  }
  
  const order = shuffle ? shuffleOrder : state.originalOrder;
  const currentOrderIndex = order.indexOf(currentIndex);
  
  if (currentOrderIndex === -1) return 0;
  
  if (currentOrderIndex < order.length - 1) {
    return order[currentOrderIndex + 1];
  }
  
  if (repeat === 'all') {
    return order[0];
  }
  
  return -1;
}

function getPreviousTrackIndex(state) {
  const { currentIndex, playlist, shuffle, shuffleOrder } = state;
  
  if (playlist.length === 0) return -1;
  
  const order = shuffle ? shuffleOrder : state.originalOrder;
  const currentOrderIndex = order.indexOf(currentIndex);
  
  if (currentOrderIndex === -1) return playlist.length - 1;
  
  if (currentOrderIndex > 0) {
    return order[currentOrderIndex - 1];
  }
  
  return order[order.length - 1];
}

export function PlayerProvider({ children }) {
  const [state, dispatch] = useReducer(playerReducer, initialState);

  // Load saved state on mount
  useEffect(() => {
    const savedPlaylist = loadPlaylist();
    const savedPlayerState = loadPlayerState();
    
    if (savedPlaylist && savedPlaylist.length > 0) {
      dispatch({ type: 'SET_PLAYLIST', payload: savedPlaylist });
      
      if (savedPlayerState) {
        if (savedPlayerState.currentIndex >= 0 && savedPlayerState.currentIndex < savedPlaylist.length) {
          dispatch({
            type: 'SET_CURRENT_TRACK',
            payload: {
              track: savedPlaylist[savedPlayerState.currentIndex],
              index: savedPlayerState.currentIndex
            }
          });
        }
        
        if (savedPlayerState.volume !== undefined) {
          dispatch({ type: 'SET_VOLUME', payload: savedPlayerState.volume });
        }
        
        if (savedPlayerState.repeat) {
          dispatch({ type: 'SET_REPEAT', payload: savedPlayerState.repeat });
        }
        
        if (savedPlayerState.shuffle !== undefined) {
          dispatch({ type: 'SET_SHUFFLE', payload: savedPlayerState.shuffle });
        }
      }
    }
  }, []);

  // Save playlist when it changes
  useEffect(() => {
    if (state.playlist.length > 0) {
      savePlaylist(state.playlist);
    }
  }, [state.playlist]);

  // Save player state when relevant properties change
  useEffect(() => {
    const playerState = {
      currentIndex: state.currentIndex,
      volume: state.volume,
      repeat: state.repeat,
      shuffle: state.shuffle
    };
    savePlayerState(playerState);
  }, [state.currentIndex, state.volume, state.repeat, state.shuffle]);

  const actions = {
    setPlaylist: (playlist) => dispatch({ type: 'SET_PLAYLIST', payload: playlist }),
    
    addToPlaylist: (tracks) => dispatch({ type: 'ADD_TO_PLAYLIST', payload: tracks }),
    
    removeFromPlaylist: (index) => dispatch({ type: 'REMOVE_FROM_PLAYLIST', payload: index }),
    
    setCurrentTrack: (track, index) => dispatch({
      type: 'SET_CURRENT_TRACK',
      payload: { track, index }
    }),
    
    play: () => dispatch({ type: 'SET_PLAYING', payload: true }),
    
    pause: () => dispatch({ type: 'SET_PLAYING', payload: false }),
    
    togglePlay: () => dispatch({ type: 'SET_PLAYING', payload: !state.isPlaying }),
    
    setVolume: (volume) => dispatch({ type: 'SET_VOLUME', payload: Math.max(0, Math.min(1, volume)) }),
    
    setCurrentTime: (time) => dispatch({ type: 'SET_CURRENT_TIME', payload: time }),
    
    setDuration: (duration) => dispatch({ type: 'SET_DURATION', payload: duration }),
    
    setLoading: (loading) => dispatch({ type: 'SET_LOADING', payload: loading }),
    
    setError: (error) => dispatch({ type: 'SET_ERROR', payload: error }),
    
    clearError: () => dispatch({ type: 'SET_ERROR', payload: null }),
    
    nextTrack: () => dispatch({ type: 'NEXT_TRACK' }),
    
    previousTrack: () => dispatch({ type: 'PREVIOUS_TRACK' }),
    
    setRepeat: (mode) => dispatch({ type: 'SET_REPEAT', payload: mode }),
    
    toggleRepeat: () => {
      const modes = ['none', 'all', 'one'];
      const currentIndex = modes.indexOf(state.repeat);
      const nextMode = modes[(currentIndex + 1) % modes.length];
      dispatch({ type: 'SET_REPEAT', payload: nextMode });
    },
    
    setShuffle: (shuffle) => dispatch({ type: 'SET_SHUFFLE', payload: shuffle }),
    
    toggleShuffle: () => dispatch({ type: 'SET_SHUFFLE', payload: !state.shuffle }),
    
    clearPlaylist: () => dispatch({ type: 'CLEAR_PLAYLIST' }),
    
    reorderPlaylist: (startIndex, endIndex) => dispatch({
      type: 'REORDER_PLAYLIST',
      payload: { startIndex, endIndex }
    }),
    
    seekTo: (time) => {
      const clampedTime = Math.max(0, Math.min(state.duration, time));
      dispatch({ type: 'SET_CURRENT_TIME', payload: clampedTime });
      return clampedTime;
    },
    
    skipTo: (index) => {
      if (index >= 0 && index < state.playlist.length) {
        dispatch({
          type: 'SET_CURRENT_TRACK',
          payload: { track: state.playlist[index], index }
        });
      }
    }
  };

  const contextValue = {
    ...state,
    ...actions,
    // Computed values
    hasNext: getNextTrackIndex(state) !== -1,
    hasPrevious: getPreviousTrackIndex(state) !== -1,
    progress: state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0,
    formattedCurrentTime: formatTime(state.currentTime),
    formattedDuration: formatTime(state.duration)
  };

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
    </PlayerContext.Provider>
  );
}

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  
  return context;
}

export default PlayerContext;