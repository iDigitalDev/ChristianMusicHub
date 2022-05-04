import {
  INDEX,
  LIST,
  SHUFFLE,
  REPEAT,
  PLAYING,
  EXPANDED,
  CURRENT_TIME,
  TOTAL_TIME,
  SHOW_PLAYER,
  PLAYLIST_UPDATE_COUNTER,
  PLAYLIST_UID,
  FLAG,
  UPDATE_PLAYER_DATA,
  UPDATE_UID,
  UPDATE_COMMAND,
  UPDATE_IDS,
  UPDATE_AUTOPLAY,
} from './types';

export const updateIndex = (data) => ({
  type: INDEX,
  data: data,
});

export const updateList = (data) => ({
  type: LIST,
  data: data,
});

export const updatePlaying = (data) => ({
  type: PLAYING,
  data: data,
});

export const updateShuffle = (data) => ({
  type: SHUFFLE,
  data: data,
});

export const updateRepeat = (data) => ({
  type: REPEAT,
  data: data,
});

export const updateExpanded = (data) => ({
  type: EXPANDED,
  data: data,
});

export const updateCurrentTime = (data) => ({
  type: CURRENT_TIME,
  data: data,
});

export const updateTotalTime = (data) => ({
  type: TOTAL_TIME,
  data: data,
});

export const updateShowPlayer = (data) => ({
  type: SHOW_PLAYER,
  data: data,
});

export const updatePlaylistUpdateCounter = (data) => ({
  type: PLAYLIST_UPDATE_COUNTER,
  data: data,
});

export const updateTrackListUID = (data) => ({
  type: UPDATE_UID,
  data: data,
});

export const updateFlag = (data) => ({
  type: FLAG,
  data: data,
});

//test
export const updatePlayerData = (data) => ({
  type: UPDATE_PLAYER_DATA,
  data: data,
});

export const updateCommand = (data) => ({
  type: UPDATE_COMMAND,
  data: data,
});

export const updateIds = (data) => ({
  type: UPDATE_IDS,
  data: data,
});

export const updateAutoPlay = (data) => ({
  type: UPDATE_AUTOPLAY,
  data: data,
});

