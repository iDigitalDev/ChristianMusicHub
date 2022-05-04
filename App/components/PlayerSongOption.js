import React, {Component} from 'react';

import {StyleSheet, View, FlatList, TouchableOpacity, Text} from 'react-native';
import {DEVICE_HEIGHT, DEVICE_WIDTH} from '../constants/constants';
import Tile from './Tile@5';
import Like from '../assets/svg/FireBlue.svg';
import Album from '../assets/svg/Album.svg';
import Playlist from '../assets/svg/Playlist.svg';
import Remove from '../assets/svg/remove.svg';
import Artist from '../assets/svg/Artists.svg';
import Share from '../assets/svg/ShareBlue.svg';
import Check from '../assets/svg/check.svg';
import {Switch, TextInput} from 'react-native-gesture-handler';
import PopUp from './PopUp';
import {POST, DELETE, PUT} from '../api/service/service';

import {share} from './Share';

import {
  createPlaylist,
  getUserPlaylist,
  addSong,
  removeSong,
} from '../api/service/actions';
import {URL} from '../api/service/urls';
import FastImage from 'react-native-fast-image';

export default class PlayerSongOption extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mainOption: true,
      addToPlaylist: false,
      createPlaylist: false,
      popUp: false,
      userPlaylist: [],
      playlistName: null,
      description: null,
      popUpText: null,
    };
  }

  componentDidMount() {
    let {user_id, authToken} = this.props.account;
    const data = {user_id};
    const url = URL.GET_USER_PLAYLIST;
    const receiver = (response) => {
      const {success} = response;
      if (success) {
        console.log('fetched user playlist ');
        let {playlist} = response;
        this.props.updateUserPlaylist(playlist);
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
  onPressAddToPlaylist = () => {
    //api get list of playlist here

    this.setState({
      mainOption: false,
      addToPlaylist: true,
    });
  };

  onPressRemoveFromPlaylist = async () => {
    const song_id = this.props.data.id;
    const playlist_id = this.props.trackListId;
    const data = {
      user_id: this.props.props.account.user_id,
      playlist_id,
      song_id,
    };

    const url = URL.REMOVE_SONG;
    const receiver = async (response) => {
      const {success} = response;
      if (success === true) {
        console.log('removed song to playlist');
        //check if playlist is currently playing
        if (this.props.props.trackListUID === 'playlist' + playlist_id) {
          //check if song is playing
          let trackID = await TrackPlayer.getCurrentTrack();

          if (trackID === song_id.toString()) {
            try {
              await TrackPlayer.skipToNext();
              await TrackPlayer.remove(song_id.toString());
              let trackList = await TrackPlayer.getQueue();
              trackList.forEach(async (element, index) => {
                await TrackPlayer.updateMetadataForTrack(
                  element.id.toString(),
                  {
                    index: index,
                  },
                );
              });
            } catch (_) {
              await TrackPlayer.skipToPrevious();
              await TrackPlayer.remove(song_id.toString());
              let trackList = await TrackPlayer.getQueue();
              trackList.forEach(async (element, index) => {
                await TrackPlayer.updateMetadataForTrack(
                  element.id.toString(),
                  {
                    index: index,
                  },
                );
              });
            }
          } else {
            await TrackPlayer.remove(song_id.toString());
            let trackList = await TrackPlayer.getQueue();

            trackList.forEach(async (element, index) => {
              await TrackPlayer.updateMetadataForTrack(element.id.toString(), {
                index: index,
              });
            });
          }
        }
        this.props.props.updateCommand(true);
        this.onSuccess('Removed from playlist');
      } else {
        console.log('fail');
      }
    };
    const config = {
      url,
      receiver,
      data,
      authToken: this.props.props.account.authToken,
    };
    POST(config);
  };

  onPressPlaylist = (item) => {
    //send playlstid and song id to api
    const {props, data} = this.props;
    const song_id = this.props.data.id;
    const playlist_id = item.id;
    const config = {
      playlist_id,
      song_id,
    };
    addSong(props, config, this.onSuccess, data);
    // addSong(props, config);
  };

  onPressCancel = () => {
    const {cancel} = this.props;
    cancel();
  };

  onPressCreate = () => {
    this.setState({
      addToPlaylist: false,
      createPlaylist: true,
    });
  };

  onPressConfirmCreate = () => {
    const {playlistName, description} = this.state;
    const {props} = this.props;
    const song_id = this.props.data.id;

    createPlaylist(props, playlistName, description, song_id, this.onSuccess);
  };

  onSuccess = (text) => {
    this.setState(
      {
        addToPlaylist: false,
        createPlaylist: false,
        mainOption: false,
        popUp: true,
        popUpText: text,
      },
      this.autoClose,
    );
  };

  autoClose = () => {
    const {cancel} = this.props;
    // this.props.props.updatePlaylistUpdateCounter();
    setTimeout(() => {
      cancel();
    }, 1000);
  };

  gotoArtist = () => {
    const {data, props, cancel} = this.props;
    cancel();
    const {artist_id, artist_image} = data;
    const item = {
      id: artist_id,
      image: artist_image,
    };

    let {push} = props.navigation;
    push('ArtistInfo', item);
  };

  gotoAlbum = () => {
    const {data, props, cancel} = this.props;
    cancel();
    const {album_id, album_image} = data;

    let {push} = props.navigation;
    const item = {
      id: album_id,
      image: album_image,
    };
    push('AlbumInfo', item);
  };

  renderItem = ({item, index}) => {
    const {title, songs, image} = item;
    const numOfSongs = songs !== null ? songs.split(',').length : 0;
    let uri = URL.IMAGE + image;
    return (
      <TouchableOpacity
        onPress={() => this.onPressPlaylist(item)}
        style={styles.playlistRowContainer}>
        <View style={styles.playlistTile}>
          {image === undefined ? (
            <FastImage
              source={require('../assets/images/cmh_logo_play.png')}
              style={styles.image}
              resizeMode={FastImage.resizeMode.cover}
            />
          ) : (
            <FastImage
              // source={require('../../assets/images/cmh_logo.png')}
              // source={{
              //   uri:
              //     'https://services.tineye.com/developers/img/meloncat.20c77523.jpg',
              // }}
              source={{
                uri,
              }}
              style={styles.image}
              // resizeMode={'cover'}
              resizeMode={FastImage.resizeMode.cover}
            />
          )}
        </View>
        <View style={styles.songInfo}>
          <Text style={styles.playlistName}>{title}</Text>
          <Text style={styles.playlistSongCount}>{numOfSongs} songs</Text>
        </View>
      </TouchableOpacity>
    );
  };

  renderGoTo = () => {
    const {from} = this.props;

    let UI = null;
    switch (from) {
      case 'artist':
        UI = (
          <TouchableOpacity
            style={styles.optionSection}
            onPress={() => this.gotoAlbum()}>
            <Album
              width={DEVICE_WIDTH * 0.055}
              height={DEVICE_HEIGHT * 0.055}
            />
            <Text style={styles.sectionText}>Go To Album</Text>
          </TouchableOpacity>
        );
        break;
      case 'album':
        UI = (
          <TouchableOpacity
            style={styles.optionSection}
            onPress={() => this.gotoArtist()}>
            <Artist
              width={DEVICE_WIDTH * 0.055}
              height={DEVICE_HEIGHT * 0.055}
            />
            <Text style={styles.sectionText}>Go To Artist</Text>
          </TouchableOpacity>
        );
        break;
      case 'playlist':
        UI = (
          <View>
            <TouchableOpacity
              style={styles.optionSection}
              onPress={() => this.gotoAlbum()}>
              <Album
                width={DEVICE_WIDTH * 0.055}
                height={DEVICE_HEIGHT * 0.055}
              />
              <Text style={styles.sectionText}>Go To Album</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.optionSection}
              onPress={() => this.gotoArtist()}>
              <Artist
                width={DEVICE_WIDTH * 0.055}
                height={DEVICE_HEIGHT * 0.055}
              />
              <Text style={styles.sectionText}>Go To Artist</Text>
            </TouchableOpacity>
          </View>
        );

        break;

      case 'userPlaylist':
        UI = (
          <View>
            <TouchableOpacity
              style={styles.optionSection}
              onPress={() => this.gotoAlbum()}>
              <Album
                width={DEVICE_WIDTH * 0.055}
                height={DEVICE_HEIGHT * 0.055}
              />
              <Text style={styles.sectionText}>Go To Album</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.optionSection}
              onPress={() => this.gotoArtist()}>
              <Artist
                width={DEVICE_WIDTH * 0.055}
                height={DEVICE_HEIGHT * 0.055}
              />
              <Text style={styles.sectionText}>Go To Artist</Text>
            </TouchableOpacity>
          </View>
        );

        break;

      default:
        break;
    }

    return UI;
  };

  onPressAddToFavorite = () => {
    const {data, onPressFavorite, cancel} = this.props;
    const {index, id} = data;

    onPressFavorite(id, index);
    cancel();
  };

  render() {
    const {data, props, from} = this.props;
    const {
      addToPlaylist,
      mainOption,
      userPlaylist,
      createPlaylist,
      popUp,
      popUpText,
    } = this.state;

    const {playlist} = props;
    const {artist, title} = data;
    return (
      <View style={{alignItems: 'center', justifyContent: 'center'}}>
        {mainOption && (
          <View style={styles.optionModal}>
            <View style={styles.optionSection}>
              <Tile data={data} onPressTile={this.onPressTile} />
              <View style={styles.infoSection}>
                <Text style={styles.song}>{title}</Text>
                <Text style={styles.artist}>{artist}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.optionSection}
              onPress={() => this.onPressAddToPlaylist()}>
              <Playlist
                width={DEVICE_WIDTH * 0.055}
                height={DEVICE_HEIGHT * 0.055}
              />
              <Text style={styles.sectionText}>Add to Playlist</Text>
            </TouchableOpacity>
            {from === 'userPlaylist' && (
              <TouchableOpacity
                style={styles.optionSection}
                onPress={() => this.onPressRemoveFromPlaylist()}>
                <Remove
                  width={DEVICE_WIDTH * 0.055}
                  height={DEVICE_HEIGHT * 0.055}
                />
                <Text style={styles.sectionText}>Remove from Playlist</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.optionSection}
              onPress={this.onPressAddToFavorite}>
              <Like
                width={DEVICE_WIDTH * 0.055}
                height={DEVICE_HEIGHT * 0.055}
              />
              <Text style={styles.sectionText}>Add to My Favourite Songs</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.optionSection}
              onPress={() =>
                share('song', this.props.data.id, this.props.data.album_id)
              }>
              <Share
                width={DEVICE_WIDTH * 0.055}
                height={DEVICE_HEIGHT * 0.055}
              />
              <Text style={styles.sectionText}>Share</Text>
            </TouchableOpacity>

            {this.renderGoTo()}
          </View>
        )}
        {addToPlaylist && (
          <View style={styles.optionModal}>
            <Text style={styles.playlistHeader}>Add To Playlist</Text>
            <FlatList
              data={playlist}
              extraData={this.state}
              style={styles.flatList}
              renderItem={this.renderItem}
              keyExtractor={(item, index) => `${index}-${item.id}`}
              decelerationRate={0.5}
            />
            <View style={styles.buttonRowContainer}>
              <TouchableOpacity onPress={() => this.onPressCancel()}>
                <Text style={styles.cancel}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this.onPressCreate()}>
                <Text style={styles.create}>CREATE NEW PLAYLIST</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        {createPlaylist && (
          <View style={styles.optionModal}>
            <Text style={styles.createHeader}>Create new playlist</Text>
            <Text style={styles.subCreateHeader}>Playlist Name</Text>
            <TextInput
              style={styles.createInput}
              onChangeText={(text) => this.setState({playlistName: text})}
            />
            <Text style={styles.subCreateHeader}>Description</Text>
            <TextInput
              style={styles.createInput}
              onChangeText={(text) => this.setState({description: text})}
            />
            <View style={styles.buttonRowContainer}>
              <TouchableOpacity onPress={() => this.onPressCancel()}>
                <Text style={styles.cancel}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this.onPressConfirmCreate()}>
                <Text style={styles.create}>CREATE</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        {popUp && (
          <View style={styles.popUpContainer}>
            <Check width={DEVICE_WIDTH * 0.2} height={DEVICE_WIDTH * 0.2} />
            <Text style={styles.popUpText}>{popUpText}</Text>
          </View>
        )}
        {/* <PopUp ref={(ref) => (this.PopUp = ref)} /> */}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: DEVICE_WIDTH * 0.04,
    alignItems: 'center',
    marginBottom: DEVICE_HEIGHT * 0.075,
  },

  section: {
    width: DEVICE_WIDTH * 0.3,
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: DEVICE_HEIGHT * 0.025,
    paddingHorizontal: DEVICE_WIDTH * 0.04,
  },
  sectionText: {
    fontSize: DEVICE_WIDTH * 0.04,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    marginLeft: DEVICE_WIDTH * 0.03,
  },

  song: {
    fontSize: DEVICE_HEIGHT * 0.021,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
  },
  artist: {
    fontSize: DEVICE_HEIGHT * 0.02,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
  },

  infoSection: {
    marginLeft: DEVICE_WIDTH * 0.03,
  },
  optionModal: {
    // minHeight: DEVICE_HEIGHT * 0.4,
    width: '100%',
    maxHeight: DEVICE_HEIGHT * 0.8,
    paddingVertical: DEVICE_HEIGHT * 0.03,
    paddingHorizontal: DEVICE_WIDTH * 0.04,
    backgroundColor: '#151d27',
    borderRadius: DEVICE_HEIGHT * 0.02,
  },
  optionSection: {
    flexDirection: 'row',
    width: DEVICE_WIDTH * 0.7,
    marginBottom: DEVICE_HEIGHT * 0.025,
    alignItems: 'center',
  },

  playlistRowContainer: {
    width: DEVICE_WIDTH * 0.7,
    height: DEVICE_HEIGHT * 0.1,
    marginBottom: DEVICE_HEIGHT * 0.03,
    flexDirection: 'row',
  },
  playlistName: {
    fontSize: DEVICE_HEIGHT * 0.025,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
  },
  playlistSongCount: {
    fontSize: DEVICE_HEIGHT * 0.025,
    color: 'gray',
    fontFamily: 'Montserrat-Bold',
  },
  playlistTile: {
    width: DEVICE_HEIGHT * 0.1,
    height: DEVICE_HEIGHT * 0.1,
    borderTopLeftRadius: DEVICE_HEIGHT * 0.005,
    borderBottomRightRadius: DEVICE_HEIGHT * 0.005,
    borderTopRightRadius: DEVICE_HEIGHT * 0.03,
    borderBottomLeftRadius: DEVICE_HEIGHT * 0.03,
    borderColor: '#FFFFFF',
    borderWidth: DEVICE_HEIGHT * 0.001,
    overflow: 'hidden',
  },
  songInfo: {
    marginLeft: DEVICE_WIDTH * 0.025,
  },
  playlistHeader: {
    fontSize: DEVICE_HEIGHT * 0.03,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
    marginBottom: DEVICE_HEIGHT * 0.03,
  },
  image: {
    height: '100%',
    width: '100%',
  },
  flatList: {
    maxHeight: DEVICE_HEIGHT * 0.5,
  },
  buttonRowContainer: {
    marginTop: DEVICE_HEIGHT * 0.05,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  popUpContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: DEVICE_WIDTH * 0.5,
    height: DEVICE_WIDTH * 0.5,
    backgroundColor: '#151d27',
    borderRadius: DEVICE_HEIGHT * 0.02,
  },
  popUpText: {
    fontSize: DEVICE_WIDTH * 0.04,
    color: '#66D5F7',
    fontFamily: 'Montserrat-Bold',
    marginTop: DEVICE_HEIGHT * 0.02,
  },
  cancel: {
    fontSize: DEVICE_WIDTH * 0.04,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
  },
  create: {
    fontSize: DEVICE_WIDTH * 0.04,
    color: 'skyblue',
    fontFamily: 'Montserrat-Bold',
  },

  createHeader: {
    fontSize: DEVICE_WIDTH * 0.05,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
    marginBottom: DEVICE_HEIGHT * 0.05,
  },
  subCreateHeader: {
    fontSize: DEVICE_WIDTH * 0.04,
    color: '#929292',
    fontFamily: 'Montserrat-Regular',
    textAlign: 'left',
  },
  createInput: {
    width: '100%',
    borderBottomColor: 'skyblue',
    borderBottomWidth: DEVICE_HEIGHT * 0.001,
    color: '#FFFFFF',
    fontSize: DEVICE_WIDTH * 0.04,
    marginBottom: DEVICE_HEIGHT * 0.03,
    paddingBottom: 0,
  },
});
