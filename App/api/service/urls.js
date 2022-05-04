// const IP = 'http://192.168.254.172:8000';
// const IP = 'http://128.199.132.236';
const IP = 'https://app.christianmusichub.net';

export const URL = {
  LOGIN: IP + '/api/v1/login',
  REGISTER: IP + '/api/v1/register',
  GETUSERS: IP + '/api/v1/users',

  FEATURED_ALL: IP + '/api/v1/featured/all',
  FEATURED_SPECIFIC: IP + '/api/v1/featured',

  ARTISTS_ALL: IP + '/api/v1/artists/all',
  ARTISTS_SPECIFIC: IP + '/api/v1/artists',

  ALBUMS_ALL: IP + '/api/v1/albums/all',
  ALBUMS_SPECIFIC: IP + '/api/v1/albums',

  PLAYLIST_ALL: IP + '/api/v1/playlists',

  RECENTLY_PLAYED: IP + '/api/v1/featured',
  SEARCH: IP + '/api/v1/search',
  ARTIST_INFO: IP + '/api/v1/artist/info',
  ALBUM_INFO: IP + '/api/v1/album/info',

  CREATE_PLAYLIST: IP + '/api/v1/playlist/add',
  GET_USER_PLAYLIST: IP + '/api/v1/playlist/list',
  ADD_SONG: IP + '/api/v1/playlist/add/track',
  REMOVE_SONG: IP + '/api/v1/playlist/remove/track',
  PLAYLIST_SONGS: IP + '/api/v1/playlist/tracks',

  //initialize data
  INIT_DATA: IP + '/api/v1/get/all',

  RECENTLY_PLAYED_UPDATE: IP + '/api/v1/recently_played/update',
  LISTENED: IP + '/api/v1/song/play',

  DELETE_PLAYLIST: IP + '/api/v1/playlist/delete',
  RENAME_PLAYLIST: IP + '/api/v1/playlist/update',

  FAVORITE: IP + '/api/v1/favorite/update',
  UNFAVORITE: IP + '/api/v1/unfavorite',

  IMAGE: IP + '/assets/upload/',

  CLEAR_RECENTLY_PLAYED: IP + '/api/v1/recently_played/clear',

  QUESTIONS: IP + '/api/v1/secret/questions',

  CHECK_EMAIL: IP + '/api/v1/validate/email',

  CHANGE_PASSWORD: IP + '/api/v1/change/password',

  PROFILE: IP + '/api/v1/profile',

  FEEDBACK: IP + '/api/v1/profile',

  LOG_OUT: IP + '/api/v1/logout',

  SUBSCRIBE_SUCCESS: IP + '/api/v1/subscribe',
};
