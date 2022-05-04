import {
  REGISTER,
  LOGIN,
  INDEX,
  LIST,
  SHUFFLE,
  REPEAT,
  PLAYING,
  EXPANDED,
  CURRENT_TIME,
  TOTAL_TIME,
  SHOW_PLAYER,
  PLAYLIST,
  //new
  UPDATE,
  UPDATE_TAB_INDEX,
  UPDATE_IS_FINISHED,
  PLAYLIST_UPDATE_COUNTER,
  PLAYLIST_UID,
  FLAG,
  UPDATE_RECENTLY_PLAYED,
  UPDATE_PLAYER_DATA,
  UPDATE_UID,
  UPDATE_COMMAND,
  UPDATE_IDS,
  UPDATE_AUTOPLAY,
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
} from '../actions/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {URL} from '../../api/service/urls';

const initialState = {
  account: {},
  isLogin: false,
  isRegistered: false,

  flag: false,
  //loading
  initFinished: false,

  //player
  ids: {index: null, trackListUID: null, trackList: null},
  playList: [],
  index: 'aw',
  id: null,
  playing: 0,
  expanded: false,
  repeat: null,
  shuffle: false,
  currentTime: 0,
  totalTime: 1,
  showPlayer: false,
  playlistUpdateCounter: 0,
  trackListUID: null,
  autoPlay: true,

  command: false,

  //playlist
  playlist: [],

  recentlyPlayed: [],

  downloadList: {},

  downloadListInformation: {},

  savedList: {},

  //updated
  appData: [
    {
      name: 'Recently Played',
      jsonName: 'recently_played',
      init_url: URL.ALBUMS_ALL,
      update_URL: URL.ALBUMS_SPECIFIC,
      status: 4,
      data: [],
      page: 2,
      records: 10,
    },
    {
      name: 'Featured Artists',
      jsonName: 'featured_artists',
      init_url: URL.ALBUMS_ALL,
      update_URL: URL.ALBUMS_SPECIFIC,
      status: 1,
      data: [],
      page: 2,
      records: 10,
    },
    {
      name: 'Featured Albums',
      jsonName: 'featured_albums',
      init_url: URL.ALBUMS_ALL,
      update_URL: URL.ALBUMS_SPECIFIC,
      status: 2,
      data: [],
      page: 2,
      records: 10,
    },
    {
      name: 'Featured Playlists',
      jsonName: 'featured_playlists',
      init_url: URL.ALBUMS_ALL,
      update_URL: URL.ALBUMS_SPECIFIC,
      status: 3,
      data: [],
      page: 2,
      records: 10,
    },
    {
      name: 'Suggested Artists',
      jsonName: 'suggested_artists',
      init_url: URL.ALBUMS_ALL,
      update_URL: URL.ALBUMS_SPECIFIC,
      status: 6,
      data: [],
      page: 2,
      records: 10,
    },
    {
      name: 'Trending Artists',
      jsonName: 'trending_artists',
      init_url: URL.ALBUMS_ALL,
      update_URL: URL.ALBUMS_SPECIFIC,
      status: 5,
      data: [],
      page: 2,
      records: 10,
    },
    {
      name: 'New Releases',
      jsonName: 'new_releases_album',
      init_url: URL.ALBUMS_ALL,
      update_URL: URL.ALBUMS_SPECIFIC,
      status: 7,
      data: [],
      page: 2,
      records: 10,
    },
    {
      name: 'Your Regulars',
      jsonName: 'your_regulars_album',
      init_url: URL.ALBUMS_ALL,
      update_URL: URL.ALBUMS_SPECIFIC,
      status: 8,
      data: [],
      page: 2,
      records: 10,
    },
    {
      name: 'Playlists',
      jsonName: 'playlists',
      init_url: URL.ALBUMS_ALL,
      update_URL: URL.ALBUMS_SPECIFIC,
      status: 9,
      data: [],
      page: 2,
      records: 10,
    },
    {
      name: 'Featured Songs',
      jsonName: 'featured_songs',
      init_url: URL.ALBUMS_ALL,
      update_URL: URL.ALBUMS_SPECIFIC,
      status: 10,
      data: [],
      page: 2,
      records: 10,
    },
    {
      name: 'Your Hot Picks',
      jsonName: 'hot_picks',
      init_url: URL.ALBUMS_ALL,
      update_URL: URL.ALBUMS_SPECIFIC,
      status: 11,
      data: [],
      page: 2,
      records: 10,
    },
  ],

  tabIndex: null,

  //test
  playingTrack: null,

  premium: null,
  offline: null,

  downloadedSongIds: [],
  downloadingSongIds: [],
  downloadedData: {},
};

export const accountReducer = (state = initialState, action) => {
  let actionType = action.type;
  switch (actionType) {
    case LOGIN:
      return {
        ...state,
        account: action.payload,
        isLogin: true,
      };

    case REGISTER:
      return {
        ...state,
        account: action.data,
      };

    case PREMIUM:
      return {
        ...state,
        premium: action.data,
      };
    default:
      return state;
  }
};

export const playerReducer = (state = initialState, action) => {
  let actionType = action.type;
  switch (actionType) {
    case INDEX:
      return {
        ...state,
        index: action.data,
      };
    case EXPANDED:
      return {
        ...state,
        expanded: action.data,
      };

    case PLAYING:
      return {
        ...state,
        playing: action.data,
      };

    case SHUFFLE:
      return {
        ...state,
        shuffle: action.data,
      };

    case SHOW_PLAYER:
      return {
        ...state,
        showPlayer: action.data,
      };

    case UPDATE_UID:
      return {
        ...state,
        trackListUID: action.data,
      };

    case FLAG:
      return {
        ...state,
        flag: action.data,
      };

    case UPDATE_COMMAND:
      return {
        ...state,
        command: action.data,
      };

    case UPDATE_IDS:
      // console.log('\n coming \n');
      // console.log(action.data.trackList[0]);

      // if (state.ids.trackList !== null) {
      //   console.log('\n old \n');
      //   console.log(state.ids.trackList[0]);
      // }

      return {
        ...state,
        ids: action.data,
      };
    case REPEAT:
      return {
        ...state,
        repeat: action.data,
      };
    case UPDATE_AUTOPLAY:
      return {
        ...state,
        autoPlay: action.data,
      };

    default:
      return state;
  }
};

export const appReducer = (state = initialState, action) => {
  const {payload, type} = action;
  let arr;
  switch (type) {
    case PLAYLIST:
      return {
        ...state,
        playlist: payload,
      };

    //new
    case UPDATE:
      return {
        ...state,
        initFinished: true,
        appData: payload,
      };

    case UPDATE_TAB_INDEX:
      return {
        ...state,
        tabIndex: payload,
      };

    case UPDATE_IS_FINISHED:
      return {
        ...state,
        initFinished: payload,
      };

    case UPDATE_RECENTLY_PLAYED:
      return {
        ...state,
        recentlyPlayed: payload,
      };

    case ADD_TO_SAVED_LIST:
      return {
        ...state,
        savedList: payload,
      };

    case REMOVE_FROM_SAVED_LIST:
      var {trackListUID} = payload;
      console.log(trackListUID);
      let savedList = {...state.savedList};

      delete savedList[trackListUID];
      const cacheSavedList = JSON.stringify(savedList);
      AsyncStorage.setItem('@cacheSavedList', cacheSavedList);
      console.log(savedList);
      console.log(state.downloadList);
      return {
        ...state,
        savedList: savedList,
      };

    case REMOVE_FROM_DOWNLOAD_LIST:
      let removeArr = {...state.downloadList};
      var {trackListUID, trackID} = payload;

      for (var i = 0; i < removeArr[trackListUID].length; i++) {
        if (removeArr[trackListUID][i] === trackID) {
          removeArr[trackListUID].splice(i, 1);
        }
      }

      if (removeArr[trackListUID].length === 0) {
        let savedList = {...state.savedList};
        delete removeArr[trackListUID];

        savedList[trackListUID] = {
          name: trackListUID,
          data: state.downloadListInformation[trackListUID],
        };

        const cacheSavedList = JSON.stringify(savedList);
        AsyncStorage.setItem('@cacheSavedList', cacheSavedList);
        return {
          ...state,
          downloadList: removeArr,
          savedList: savedList,
        };
      }

      return {
        ...state,
        downloadList: removeArr,
      };

    case ADD_TO_DOWNLOAD_LIST:
      let addArr = {...state.downloadList};
      var {trackListUID, trackID} = payload;

      if (addArr[trackListUID]) {
        addArr[trackListUID].push(trackID);
      } else {
        addArr[trackListUID] = [trackID];
      }

      return {
        ...state,
        downloadList: addArr,
      };

    case ADD_TO_DOWNLOAD_LIST_INFORMATION:
      let downloadListInformation = {...state.downloadListInformation};

      downloadListInformation[payload.trackListUID] = payload;

      console.log('\n\n here========');
      console.log(payload);

      // const cacheDownloadListInformation = JSON.stringify(
      //   downloadListInformation,
      // );
      // AsyncStorage.setItem(
      //   '@cacheDownloadListInformation',
      //   cacheDownloadListInformation,
      // );

      return {
        ...state,
        downloadListInformation: downloadListInformation,
      };

    // addArr.push(payload);
    // return {
    //   ...state,
    //   downloadList: addArr,
    // };

    case OFFLINE:
      return {
        ...state,
        offline: payload,
      };

    case INIT_FINISHED:
      return {
        ...state,
        initFinished: payload,
      };

    //new

    case DOWNLOADED_SONG_IDS:
      switch (payload.type) {
        case 'add':
          arr = [...state.downloadedSongIds, payload.songId];
          break;

        case 'remove':
          arr = [...state.downloadedSongIds];
          const index = arr.indexOf(payload.songId);
          arr.splice(index, 1);
          break;

        case 'init':
          arr = payload.arr;

          break;

        default:
          break;
      }

      AsyncStorage.setItem('@cachedDownloadedSongIds', arr.toString());

      return {
        ...state,
        downloadedSongIds: arr,
      };

    case DOWNLOADING_SONG_IDS:
      switch (payload.type) {
        case 'add':
          arr = [...state.downloadingSongIds, payload.songId];
          break;

        case 'remove':
          arr = [...state.downloadingSongIds];
          const index = arr.indexOf(payload.songId);
          arr.splice(index, 1);
          break;

        default:
          break;
      }

      return {
        ...state,
        downloadingSongIds: arr,
      };
    case DOWNLOADED_DATA:
      let jsonArr = {...state.downloadedData};

      switch (payload.type) {
        case 'add':
          console.log(payload);
          jsonArr[payload.data.trackListUID] = payload.data;
          break;

        case 'remove':
          alert('remove');

          break;

        case 'init':
          jsonArr = payload.data;

          break;

        default:
          break;
      }

      AsyncStorage.setItem('@cachedDownloadedData', JSON.stringify(jsonArr));

      return {
        ...state,
        downloadedData: jsonArr,
      };

    default:
      return state;
  }
};
