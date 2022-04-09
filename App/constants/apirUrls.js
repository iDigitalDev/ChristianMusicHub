// const IP = '157.245.195.5';
const IP = 'https://app.christianmusichub.net';

// const IP = '192.168.254.172:8000';

export const URL = {
  LOGIN: IP + '/api/v1/login',
  REGISTER: IP + '/api/v1/register',
  GETUSERS: IP + '/api/v1/users',
  ARTISTS_ALL: IP + '/api/v1/artists/all',
  FAVORITE_ARTISTS: IP + '/api/v1/favorite/artists',
  FAVORITE_ALBUMS: IP + '/api/v1/favorite/albums',
  FAVORITE_PLAYLISTS: IP + '/api/v1/favorite/playlists',
  FAVORITE_SONGS: IP + '/api/v1/favorite/songs',
  GET_GENRES: IP + '/api/v1/genre/get',
  GET_GENRE_SONGS: IP + '/api/v1/genre/featured',

  ARTISTS_SPECIFIC: IP + '/api/v1/artists',
  ALBUMS_ALL: IP + '/api/v1/albums/all',
  ALBUMS_SPECIFIC: IP + '/api/v1/albums',
  PLAYLIST_ALL: IP + '/api/v1/playlists',
  RECENTLY_PLAYED: IP + '/api/v1/featured',
  SEARCH: IP + '/api/v1/search',
  ADD_SEARCH: IP + '/api/v1/search/add',
  CLEAR_SEARCH: IP + '/api/v1/search/clear',
  RECENT_SEARCH: IP + '/api/v1/search/recent',
  ARTIST_INFO: IP + '/api/v1/artist/info',
  ALBUM_INFO: IP + '/api/v1/album/info',
  PLAYLIST_SONGS: IP + '/api/v1/playlist/tracks',
  IMAGE: IP + '/assets/upload/',
  PROFILE: IP + '/api/v1/profile',
  EDIT_PROFILE: IP + '/api/v1/edit/profile',
  CHECK_EMAIL: IP + '/api/v1/validate/email',
  TRIAL_PLAYLIST: IP + '/api/v1/playlist/trial',
  IS_PREMIUM: IP + '/api/v1/check-account-status',
  LOG_OUT: IP + '/api/v1/logout',
  INIT_DATA: IP + '/api/v1/get/all',
  LISTENED: IP + '/api/v1/song/play',
  RECENTLY_PLAYED_UPDATE: IP + '/api/v1/recently_played/update',
  SUBSCRIBE_SUCCESS: IP + '/api/v1/subscribe',
};
