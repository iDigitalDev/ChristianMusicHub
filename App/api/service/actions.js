/* eslint-disable no-shadow */
import {URL} from './urls';
import {POST, DELETE, PUT} from './service';
import {update} from '../../redux/actions/app';

export function createPlaylist(
  props,
  playlist_name,
  description,
  song_id,
  onAddSuccess,
) {
  let {user_id, authToken} = props.account;
  const data = {user_id, playlist_name, description};
  //note: temporary URL no api for featured data yet
  const url = URL.CREATE_PLAYLIST;
  const receiver = (response) => {
    const {success} = response;
    if (success) {
      console.log('Created playlist: ' + playlist_name);
      console.log(response);
      const {playlist_id} = response;
      const configJson = {
        song_id,
        playlist_id,
      };
      addSong(props, configJson, onAddSuccess);
      // getUserPlaylist(props);
    } else {
      console.log('fail');
    }
  };
  const config = {
    url,
    receiver,
    data,
    authToken,
  };
  POST(config);
}

export function getUserPlaylist(props) {
  let {user_id, authToken} = props.account;
  const data = {user_id};
  const url = URL.GET_USER_PLAYLIST;
  const receiver = (response) => {
    const {success} = response;
    if (success) {
      console.log('fetched user playlist ');
      let {playlist} = response;
      props.updateUserPlaylist(playlist);
    } else {
      console.log('fail');
    }
  };
  const config = {
    url,
    receiver,
    data,
    authToken,
  };
  POST(config);
}

export function addSong(props, configJson, addSuccess, songData) {
  const {user_id, authToken} = props.account;
  const {song_id, playlist_id} = configJson;
  const data = {user_id, playlist_id, song_id};
  //note: temporary URL no api for featured data yet
  const url = URL.ADD_SONG;
  const receiver = async (response) => {
    const {success} = response;
    if (success) {
      console.log('added song to playlist: ');

      //check here if the current playlist is active
      // console.log(props.trackListUID);
      console.log('playlist' + playlist_id);
      if (props.trackListUID === 'playlist' + playlist_id) {
        // let trackList = await TrackPlayer.getQueue();
        // let useIndex = trackList.length;
        // songData.index = useIndex;
        // TrackPlayer.add(songData, null);
      } else {
        console.log('not playing');
      }
      addSuccess('Added to playlist');
    } else {
      console.log('fail');
    }
  };
  const config = {
    url,
    receiver,
    data,
    authToken,
  };
  POST(config);
}

export function removeSong(props, configJson, addSuccess, songData) {
  const {user_id, authToken} = props.account;
  const {song_id, playlist_id} = configJson;
  const data = {user_id, playlist_id, song_id};
  //note: temporary URL no api for featured data yet
  const url = URL.ADD_SONG;
  const receiver = (response) => {
    const {success} = response;
    if (success) {
      console.log('removed song to playlist: ');

      //check here if the current playlist is active
      console.log(props.playListUID);
      console.log('playlist' + playlist_id);
      // if (props.playListUID === 'playlist' + playlist_id) {
      //   let playListHandler = props.playList;
      //   let useIndex = playListHandler.length;
      //   playListHandler.push(songData);
      //   props.updateList(playListHandler);
      //   const track = {
      //     url: songData.link,
      //     id: songData.id,
      //     title: songData.title,
      //     artist: songData.artist,
      //     genre: '',
      //     album: '',
      //     artwork: URL.IMAGE + songData.image,
      //     sampleHere: 'sample',
      //     index: useIndex,
      //   };
      //   TrackPlayer.add(track, null);
      // } else {
      //   console.log('not playing');
      // }
      // getUserPlaylist(props);
      addSuccess('Removed from playlist');

      // const updateConfig = {
      //   identifier,
      //   props,
      //   data,
      // };
      // updateProp(updateConfig);
    } else {
      console.log('fail');
    }
  };
  const config = {
    url,
    receiver,
    data,
    authToken,
  };
  POST(config);
}

export function addListened(props, configJson) {
  const {user_id, authToken} = props.account;
  const {playList, playIndex} = props;
  const playingData = playList[playIndex];
  const {id} = playingData;
  const data = {user_id, song_id: id};
  const url = URL.LISTENED;
  const receiver = (response) => {
    const {success} = response;
    if (success) {
      console.log('Add listened: ' + id);
      console.log(response);
    } else {
      console.log('fail');
    }
  };
  const config = {
    url,
    receiver,
    data,
    authToken,
  };
  POST(config);
}

export function addRecentlyPlayed(props, configJson) {
  const {user_id, authToken} = props.account;
  let trackDetails = props.ids.trackList[props.ids.index];

  const data = {user_id, song_id: trackDetails.id};
  const url = URL.RECENTLY_PLAYED_UPDATE;
  const receiver = (response) => {
    const {success} = response;
    if (success) {
      console.log('Updated Recently Played: ' + trackDetails.id);
      // initializeAppData(props);
    } else {
      console.log('fail');
    }
  };
  const config = {
    url,
    receiver,
    data,
    authToken,
  };
  POST(config);
}

export function removePlaylist(props, configJson, callback) {
  const {user_id, authToken} = props.account;
  const {playlist_id} = configJson;
  const data = {user_id, playlist_id};
  const url = URL.DELETE_PLAYLIST;
  const receiver = (response) => {
    const {success} = response;
    if (success) {
      console.log('Removed playlist: ' + playlist_id);
      callback('Removed Playlist');
      // initializeAppData(props);
    } else {
      console.log('fail');
    }
  };
  const config = {
    url,
    receiver,
    data,
    authToken,
  };
  DELETE(config);
}

export function renamePlaylist(props, configJson, callback) {
  const {user_id, authToken} = props.account;
  const {playlist_id, playlist_name} = configJson;
  const data = {user_id, playlist_id, playlist_name};
  const url = URL.RENAME_PLAYLIST;
  const receiver = (response) => {
    const {success} = response;
    if (success) {
      console.log('Renamed playlist: ' + playlist_id);
      callback('Renamed Playlist');
      // initializeAppData(props);
    } else {
      console.log('fail');
    }
  };
  const config = {
    url,
    receiver,
    data,
    authToken,
  };
  PUT(config);
}

export function favorite(props, configJson) {
  const {user_id, authToken} = props.account;
  const {fave_id, type} = configJson;
  console.log('faveid: ' + fave_id);
  console.log('type: ' + type);

  const data = {fave_id, user_id, type};
  const url = URL.FAVORITE;
  const receiver = (response) => {
    const {success} = response;
    if (success) {
      console.log('favorite: ' + fave_id);
    } else {
      console.log('fail');
    }
  };
  const config = {
    url,
    receiver,
    data,
    authToken,
  };
  POST(config);
}

export function unfavorite(props, configJson) {
  const {user_id, authToken} = props.account;
  const {fave_id, type} = configJson;
  console.log('faveid: ' + fave_id);
  console.log('type: ' + type);

  const data = {fave_id, user_id, type};
  const url = URL.UNFAVORITE;
  const receiver = (response) => {
    const {success} = response;
    if (success) {
      console.log('unfavorite: ' + fave_id);
    } else {
      console.log('fail');
    }
  };
  const config = {
    url,
    receiver,
    data,
    authToken,
  };
  POST(config);
}

export function songFavorite(account, configJson) {
  const {user_id, authToken} = account;
  const {fave_id, type} = configJson;
  console.log('faveid: ' + fave_id);
  console.log('type: ' + type);

  const data = {fave_id, user_id, type};
  const url = URL.FAVORITE;
  const receiver = (response) => {
    const {success} = response;
    if (success) {
      console.log('favorite: ' + fave_id);
    } else {
      console.log('fail');
    }
  };
  const config = {
    url,
    receiver,
    data,
    authToken,
  };
  POST(config);
}

export function songUnfavorite(account, configJson) {
  const {user_id, authToken} = account;
  const {fave_id, type} = configJson;
  console.log('faveid: ' + fave_id);
  console.log('type: ' + type);

  const data = {fave_id, user_id, type};
  const url = URL.UNFAVORITE;
  const receiver = (response) => {
    const {success} = response;
    if (success) {
      console.log('unfavorite: ' + fave_id);
    } else {
      console.log('fail');
    }
  };
  const config = {
    url,
    receiver,
    data,
    authToken,
  };
  POST(config);
}

export function initializeAppData(props) {
  const {update, appData} = props;
  const {user_id, authToken} = props.account;
  const url = URL.INIT_DATA;
  const data = {user_id, records: 10};
  const receiver = (response) => {
    const responseStatus = response.status;
    if (responseStatus) {
      const {data} = response;
      const currentData = [...appData];
      const dataSets = {
        data,
        currentData,
      };
      console.log('Received Initial Data');
      const initData = formatData(dataSets);
      update(initData);
    } else {
      console.log(response);
      console.log('fail');
    }
  };

  let payload = {
    data,
    url,
    receiver,
    authToken,
  };
  POST(payload);
}

export function updateSpecificAppData(props, id) {
  const {user_id, authToken} = props.account;
  const {appData, update} = props;
  const {page, status, records, name} = appData[id];

  const data = {page, status, records, user_id};

  const url = URL.INIT_DATA;

  const receiver = (response) => {
    const responseStatus = response.status;
    if (responseStatus) {
      const {data} = response;
      const {appData} = props;
      const dataSets = {
        data,
        appData,
        id,
      };
      console.log('Received Specific Data on: ' + name);
      const updatedData = updateData(dataSets);
      update(updatedData);
    } else {
      console.log('fail');
    }
  };

  let payload = {
    data,
    url,
    receiver,
    authToken,
  };
  POST(payload);
}

function formatData(dataSets) {
  const {data, currentData} = dataSets;

  currentData.forEach((element) => {
    let {jsonName} = element;
    let itemData = data[jsonName].data;
    // if (jsonName === 'recently_played') {
    //   const {order_ids} = data[jsonName];
    //   var orderIdsArr = order_ids.split(',');
    //   let sortedArr = [];
    //   orderIdsArr.find((element) => {
    //     for (var i = 0; i < itemData.length; i++) {
    //       if (itemData[i].song_id.toString() === element) {
    //         sortedArr.push(itemData[i]);
    //       }
    //     }
    //   });

    //   itemData = sortedArr.reverse();
    // }
    element.data = itemData;
  });

  return currentData;
}

function updateData(dataSets) {
  const {data, appData, id} = dataSets;
  const currentAppData = [...appData];
  const {jsonName, page} = currentAppData[id];

  const currentData = currentAppData[id].data;
  const incomingData = data[jsonName].data;
  if (incomingData.length === 0) {
    return currentAppData;
  }
  const mergedData = currentData.concat(incomingData);

  console.log(incomingData);
  currentAppData[id].data = mergedData;
  currentAppData[id].page = page + 1;

  return currentAppData;
}
