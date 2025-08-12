// Storage keys
const STORAGE_KEYS = {
  PLAYLIST: 'mp3_player_playlist',
  CURRENT_TRACK: 'mp3_player_current_track',
  VOLUME: 'mp3_player_volume',
  REPEAT_MODE: 'mp3_player_repeat_mode',
  SHUFFLE: 'mp3_player_shuffle',
  AUDIO_FILES: 'mp3_player_audio_files'
};

// Generic storage operations
export const getFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage for key ${key}:`, error);
    return defaultValue;
  }
};

export const setToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage for key ${key}:`, error);
    return false;
  }
};

export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage for key ${key}:`, error);
    return false;
  }
};

export const clearAllStorage = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
};

// Playlist-specific storage operations
export const savePlaylist = (playlist) => {
  return setToStorage(STORAGE_KEYS.PLAYLIST, playlist);
};

export const getPlaylist = () => {
  return getFromStorage(STORAGE_KEYS.PLAYLIST, []);
};

export const addTrackToPlaylist = (track) => {
  const playlist = getPlaylist();
  const updatedPlaylist = [...playlist, { ...track, id: Date.now() }];
  return savePlaylist(updatedPlaylist);
};

export const removeTrackFromPlaylist = (trackId) => {
  const playlist = getPlaylist();
  const updatedPlaylist = playlist.filter(track => track.id !== trackId);
  return savePlaylist(updatedPlaylist);
};

export const updateTrackInPlaylist = (trackId, updates) => {
  const playlist = getPlaylist();
  const updatedPlaylist = playlist.map(track => 
    track.id === trackId ? { ...track, ...updates } : track
  );
  return savePlaylist(updatedPlaylist);
};

// Current track storage
export const saveCurrentTrack = (track) => {
  return setToStorage(STORAGE_KEYS.CURRENT_TRACK, track);
};

export const getCurrentTrack = () => {
  return getFromStorage(STORAGE_KEYS.CURRENT_TRACK, null);
};

// Player settings storage
export const saveVolume = (volume) => {
  return setToStorage(STORAGE_KEYS.VOLUME, volume);
};

export const getVolume = () => {
  return getFromStorage(STORAGE_KEYS.VOLUME, 1);
};

export const saveRepeatMode = (mode) => {
  return setToStorage(STORAGE_KEYS.REPEAT_MODE, mode);
};

export const getRepeatMode = () => {
  return getFromStorage(STORAGE_KEYS.REPEAT_MODE, 'none');
};

export const saveShuffle = (shuffle) => {
  return setToStorage(STORAGE_KEYS.SHUFFLE, shuffle);
};

export const getShuffle = () => {
  return getFromStorage(STORAGE_KEYS.SHUFFLE, false);
};

// Audio file storage (for uploaded files)
export const saveAudioFile = async (file) => {
  try {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const audioFiles = getAudioFiles();
        const fileData = {
          id: Date.now(),
          name: file.name,
          size: file.size,
          type: file.type,
          data: reader.result,
          uploadedAt: new Date().toISOString()
        };
        
        const updatedFiles = [...audioFiles, fileData];
        if (setToStorage(STORAGE_KEYS.AUDIO_FILES, updatedFiles)) {
          resolve(fileData);
        } else {
          reject(new Error('Failed to save audio file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  } catch (error) {
    console.error('Error saving audio file:', error);
    throw error;
  }
};

export const getAudioFiles = () => {
  return getFromStorage(STORAGE_KEYS.AUDIO_FILES, []);
};

export const removeAudioFile = (fileId) => {
  const audioFiles = getAudioFiles();
  const updatedFiles = audioFiles.filter(file => file.id !== fileId);
  return setToStorage(STORAGE_KEYS.AUDIO_FILES, updatedFiles);
};

// Storage info utilities
export const getStorageUsage = () => {
  try {
    let totalSize = 0;
    const usage = {};
    
    Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
      const item = localStorage.getItem(storageKey);
      const size = item ? new Blob([item]).size : 0;
      usage[key.toLowerCase()] = size;
      totalSize += size;
    });
    
    return {
      total: totalSize,
      breakdown: usage,
      formatted: formatBytes(totalSize)
    };
  } catch (error) {
    console.error('Error calculating storage usage:', error);
    return { total: 0, breakdown: {}, formatted: '0 B' };
  }
};

export const isStorageAvailable = () => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    return false;
  }
};

// Helper function to format bytes
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Export storage keys for use in other files
export { STORAGE_KEYS };