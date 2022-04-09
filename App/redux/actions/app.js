import {
  ALBUMS_TAB,
  ARTISTS_TAB,
  PLAYLIST_TAB,
  FEATURED_TAB,
  UPDATE_RECENTLY_PLAYED,
  UPDATE_FEATURED_ARTISTS,
  UPDATE_UPCOMING_ARTISTS,
  UPDATE_SUGGESTED_ARTISTS,
  UPDATE_REGULARS,
  UPDATE_PICKS,
  UPDATE_NEW_RELEASES,
  PLAYLIST,
  UPDATE,
  UPDATE_TAB_INDEX,
  UPDATE_IS_FINISHED,
  UPDATE_DOWNLOAD_LIST,
  REMOVE_FROM_DOWNLOAD_LIST,
  ADD_TO_DOWNLOAD_LIST,
  ADD_TO_SAVED_LIST,
  ADD_TO_DOWNLOAD_LIST_INFORMATION,
  PREMIUM,
  REMOVE_FROM_SAVED_LIST,
  OFFLINE,
  INIT_FINISHED,
  DOWNLOADED_SONG_IDS,
  DOWNLOADING_SONG_IDS,
  DOWNLOADED_DATA,
} from './types';

export const updateFeaturedTabData = (payload) => ({
  type: FEATURED_TAB,
  payload: payload,
});

export const updateRecentlyPlayed = (payload) => ({
  type: UPDATE_RECENTLY_PLAYED,
  payload: payload,
});

export const updateFeaturedArtists = (payload) => ({
  type: UPDATE_FEATURED_ARTISTS,
  payload: payload,
});

export const updateArtistsTab = (payload) => ({
  type: ARTISTS_TAB,
  payload: payload,
});

export const updateUpcomingArtists = (payload) => ({
  type: UPDATE_UPCOMING_ARTISTS,
  payload: payload,
});

export const updateSuggestedArtists = (payload) => ({
  type: UPDATE_SUGGESTED_ARTISTS,
  payload: payload,
});

export const updateAlbumsTab = (payload) => ({
  type: ALBUMS_TAB,
  payload: payload,
});

export const updateNewReleases = (payload) => ({
  type: UPDATE_NEW_RELEASES,
  payload: payload,
});

export const updateRegulars = (payload) => ({
  type: UPDATE_REGULARS,
  payload: payload,
});

export const updatePicks = (payload) => ({
  type: UPDATE_PICKS,
  payload: payload,
});

export const updateUserPlaylist = (payload) => ({
  type: PLAYLIST,
  payload: payload,
});

//new
export const update = (payload) => ({
  type: UPDATE,
  payload: payload,
});

export const updateTabIndex = (payload) => ({
  type: UPDATE_TAB_INDEX,
  payload: payload,
});

export const updateIsFinished = (payload) => ({
  type: UPDATE_IS_FINISHED,
  payload: payload,
});

export const removeFromDownloadList = (payload) => ({
  type: REMOVE_FROM_DOWNLOAD_LIST,
  payload: payload,
});

export const addToDownloadList = (payload) => ({
  type: ADD_TO_DOWNLOAD_LIST,
  payload: payload,
});

export const addToSavedList = (payload) => ({
  type: ADD_TO_SAVED_LIST,
  payload: payload,
});

export const removedFromSavedList = (payload) => ({
  type: REMOVE_FROM_SAVED_LIST,
  payload: payload,
});

export const addToDownloadListInformation = (payload) => ({
  type: ADD_TO_DOWNLOAD_LIST_INFORMATION,
  payload: payload,
});

export const premium = (payload) => ({
  type: PREMIUM,
  payload: payload,
});

export const offline = (payload) => ({
  type: OFFLINE,
  payload: payload,
});

export const updateInitFinished = (payload) => ({
  type: INIT_FINISHED,
  payload: payload,
});

export const updateDownloadingSongIds = (payload) => ({
  type: DOWNLOADING_SONG_IDS,
  payload: payload,
});

export const updateDownloadedSongIds = (payload) => ({
  type: DOWNLOADED_SONG_IDS,
  payload: payload,
});

export const updateDownloadedData = (payload) => ({
  type: DOWNLOADED_DATA,
  payload: payload,
});
