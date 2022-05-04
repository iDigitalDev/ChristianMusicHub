import React, {Component} from 'react';

import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  TextInput,
  Platform,
  Image,
} from 'react-native';
import {CMH_ALERT} from '../../components/CMH';
import LinearGradient from 'react-native-linear-gradient';
import * as FileSystem from 'expo-file-system';
import {
  GRADIENT_COLOR_SET_1,
  DEVICE_HEIGHT,
  DEVICE_WIDTH,
} from '../../constants/constants';

import NetInfo from '@react-native-community/netinfo';
import {
  InterstitialAd,
  RewardedAd,
  BannerAd,
  TestIds,
  BannerAdSize,
} from '@react-native-firebase/admob';
const DEV_MODE = false;
const adUnitId = DEV_MODE
  ? TestIds.BANNER
  : 'ca-app-pub-5730941372305211/3921558169';
import SongOption from '../../components/SongOption';
import EditPlaylist from '../../components/EditPlaylist';
import Like from '../../assets/svg/LikeActive.svg';
import LikeInactive from '../../assets/svg/LikeInActive.svg';
import Back from '../../assets/svg/back.svg';
import Share from '../../assets/svg/Share.svg';
import More from '../../assets/svg/more.svg';
import ShuffleInactive from '../../assets/svg/Shuffle - Inactive.svg';
import {favorite, unfavorite} from '../../api/service/actions';
import {Loading} from '../../components/Loading';
import Tile from '../../components/Tile@5';
import FastImage from 'react-native-fast-image';

//redux
import {connect} from 'react-redux';
import {
  updatePlaying,
  updateIndex,
  updateList,
  updateShowPlayer,
  updateTrackListUID,
  updatePlayerData,
  updateRepeat,
  updateCommand,
  updateIds,
} from '../../redux/actions/player';

import {share} from '../../components/Share';
import {
  update,
  updateUserPlaylist,
  removeFromDownloadList,
  addToDownloadListInformation,
  addToDownloadList,
  removedFromSavedList,
  updateDownloadingSongIds,
  updateDownloadedSongIds,
  updateDownloadedData,
} from '../../redux/actions/app';
import RNFetchBlob from 'react-native-fetch-blob';
import RNBackgroundDownloader from 'react-native-background-downloader';
import Download from '../../assets/svg/download.svg';
import Downloaded from '../../assets/svg/downloaded.svg';
//api
import {POST} from '../../api/service/service';
import {URL} from '../../constants/apirUrls';
import {ScrollView} from 'react-native-gesture-handler';
import Modal, {ModalContent} from 'react-native-modal';
let unsubscribe = null;
class UserPlaylistInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      background: '#235463',
      isDownloaded: props.route.params.isDownloaded,
      offlineMode: true,
      playlist_id: props.route.params.id || props.route.params.playlist_id,
      playlist: props.route.params.name,
      favorites: props.route.params.favorites,
      showOptionModal: false,
      showEditModal: false,
      image: props.route.params.image,
      selected: null,
      description: null,
      username: null,
      showDeleteModal: false,
      screenData: [
        {
          m_data: [],
          m_page: 0,
          m_status: 1,
          m_records: 3,
        },
        {
          m_data: [],
          m_page: 0,
          m_status: 1,
          m_records: 5,
        },
      ],
    };
  }

  componentDidMount() {
    this.props.navigation.setOptions({
      headerShown: false,
    });
    if (this.props.offline === false) {
      this.initData();
    } else {
      this.initDownloadedData();
    }
  }

  componentWillUnmount() {
    if (unsubscribe != null) {
      unsubscribe();
    }
  }

  initDownloadedData = async () => {
    if (this.state.isDownloaded) {
      await Promise.all(
        this.props.route.params.screenData[0].m_data.map(async (item, key) => {
          item.downloadState = await this.checkDownload(item.id);
          return item;
        }),
      );
      // console.log('here');
      // console.log(this.props.route.params);
      this.setState(this.props.route.params);
      this.setState({offlineMode: true});
    }
  };

  componentDidUpdate(newProps) {
    const {pop} = this.props.navigation;
    if (newProps.tabIndex !== this.props.tabIndex) {
      pop();
    }
    if (this.props.command === true) {
      this.initData();
      this.props.updateCommand(false);
    }
  }

  initData = () => {
    let {user_id, authToken} = this.props.account;
    let {screenData, playlist_id} = this.state;
    let data = {playlist_id, user_id};
    let url = URL.PLAYLIST_SONGS;

    console.log(data);

    const receiver = async (response) => {
      const {success} = response;
      if (success) {
        const {tracks, description, username} = response;

        screenData[0].m_data = tracks;
        this.setState({
          isLoading: false,
          description,
          username,
          trackListUID: 'playlist' + playlist_id,
          type: 'userPlaylist',
        });
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
  };

  checkDownload = async (id) => {
    const localDir = `${RNBackgroundDownloader.directories.documents}/${id}.mp3`;
    // console.log(localDir);
    const downloaded = await RNFetchBlob.fs.exists(localDir);
    // return {...item, downloaded, localDir};
    // console.log({...id, downloaded, localDir});

    return downloaded;
  };
  renderIsDownloaded = (item) => {
    if (this.props.downloadingSongIds.includes(item.id)) {
      return (
        <FastImage
          style={styles.loading}
          source={require('../../assets/images/downloading.gif')}
          resizeMode={FastImage.resizeMode.contain}
        />
      );
    } else if (this.props.downloadedSongIds.includes(item.id)) {
      return (
        <Downloaded width={DEVICE_WIDTH * 0.04} height={DEVICE_HEIGHT * 0.04} />
      );
    } else {
      console.log('?');
      return <View />;
    }
  };

  remove = async () => {
    this.state.screenData[0].m_data.map(async (item, key) => {
      let destination = `${FileSystem.documentDirectory}${item.id}.${item.extension}`;

      await FileSystem.deleteAsync(destination);
      this.props.updateDownloadedSongIds({
        songId: item.id,
        type: 'remove',
      });
      const downloaded = await RNFetchBlob.fs.exists(destination);
      console.log(item.id, 'exists?: ', downloaded);
      console.log('removed: ', item.id);
    });
    this.setState({showDeleteModal: false});
  };

  onPressRemove = () => {
    this.setState({showDeleteModal: true});
  };

  renderIsListDownloaded = () => {
    let isCompleted = true;
    for (let x = 0; x < this.state.screenData[0].m_data.length; x++) {
      let songId = this.state.screenData[0].m_data[x].song_id;
      if (!this.props.downloadedSongIds.includes(songId)) {
        console.log('here');
        console.log(songId);
        isCompleted = false;
      }
      if (this.props.downloadingSongIds.includes(songId)) {
        return (
          <FastImage
            style={styles.loading}
            source={require('../../assets/images/downloading.gif')}
            resizeMode={FastImage.resizeMode.contain}
          />
        );
      }
    }

    if (isCompleted === true) {
      return (
        <TouchableOpacity onPress={() => this.onPressRemove()}>
          <Downloaded
            width={DEVICE_WIDTH * 0.04}
            height={DEVICE_WIDTH * 0.04}
          />
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity onPress={() => this.onPressDownloadAll()}>
          <Download width={DEVICE_WIDTH * 0.04} height={DEVICE_WIDTH * 0.04} />
        </TouchableOpacity>
      );
    }
  };

  onPressDownloadAll = async () => {
    this.props.updateDownloadedData({data: this.state, type: 'add'});
    this.state.screenData[0].m_data.map((item, key) => {
      this.props.updateDownloadingSongIds({songId: item.id, type: 'add'});

      let task = RNBackgroundDownloader.download({
        id: item.id.toString(),
        url: item.link,
        destination:
          Platform.OS === 'ios'
            ? `${RNBackgroundDownloader.directories.documents}/${item.id}.${item.extension}`
            : `${FileSystem.documentDirectory}${item.id}.${item.extension}`,
      })
        .begin((expectedBytes) => {
          console.log(`Going to download ${expectedBytes} bytes!`);
        })
        .progress((percent) => {
          console.log(`Downloaded: ${percent * 100}%`);
        })
        .done(async () => {
          console.log('Download is done!');
          this.props.updateDownloadingSongIds({
            songId: item.id,
            type: 'remove',
          });
          this.props.updateDownloadedSongIds({
            songId: item.id,
            type: 'add',
          });
        })
        .error((error) => {
          console.log('Download canceled due to error: ', error);
        });
    });
  };

  onPressTile = async (data) => {
    this.props.updateRepeat(null);
    const {index} = data;
    const {screenData} = this.state;
    const trackList = screenData[0].m_data;
    const trackListUID = screenData[0].m_data[index].uid;
    this.props.updateIds({index, trackListUID, trackList});
  };
  onPressShuffle = async () => {
    this.props.updateRepeat(null);

    const {screenData} = this.state;
    var trackList = JSON.parse(JSON.stringify(screenData[0].m_data));

    const trackListUID = screenData[0].m_data[0].uid;
    const copy = [...trackList];
    const shuffleData = this.shuffle(copy);
    shuffleData.map((item, key) => {
      shuffleData[key].index = key;
    });

    this.props.updateIds({index: 0, trackListUID, trackList: shuffleData});
  };

  shuffle(array) {
    var currentIndex = array.length,
      temporaryValue,
      randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }

  onPressMore = (item) => {
    this.setState({
      showOptionModal: true,
      selected: item,
    });
  };

  toggleOptionModal = () => {
    const {showOptionModal} = this.state;
    this.setState({showOptionModal: !showOptionModal});
  };

  rename = (name) => {
    this.setState({
      playlist: name,
    });
  };

  toggleEditModal = () => {
    const {showEditModal} = this.state;
    this.setState({showEditModal: !showEditModal});
  };

  renderIsFollowed = (state) => {
    const isFollowed =
      state === 1 ? (
        <TouchableOpacity
          onPress={() => this.onPressUnfollow()}
          style={styles.follow}>
          <Like width={DEVICE_WIDTH * 0.03} height={DEVICE_HEIGHT * 0.03} />
          <Text style={styles.followText}>FOLLOWING</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={() => this.onPressFollow()}
          style={styles.follow}>
          <LikeInactive
            width={DEVICE_WIDTH * 0.03}
            height={DEVICE_HEIGHT * 0.03}
          />
          <Text style={styles.followText}>FOLLOW</Text>
        </TouchableOpacity>
      );

    return isFollowed;
  };
  onPressFavorite = async (id, key) => {
    const configJson = {
      fave_id: id,
      type: 3,
    };
    favorite(this.props, configJson);
    this.state.screenData[0].m_data[key].is_favorite = 1;
    this.setState({
      isFave: true,
    });
  };

  onPressUnfavorite = async (id, key) => {
    const configJson = {
      fave_id: id,
      type: 3,
    };
    unfavorite(this.props, configJson);
    this.state.screenData[0].m_data[key].is_favorite = 0;
    this.setState({
      isFave: false,
    });
  };

  renderIsFave = (state, id, key) => {
    const isFave =
      state === 1 ? (
        <TouchableOpacity
          disabled={this.props.offline}
          onPress={() => this.onPressUnfavorite(id, key)}
          style={styles.ActionButton}>
          <Like width={DEVICE_WIDTH * 0.03} height={DEVICE_HEIGHT * 0.03} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          disabled={this.props.offline}
          onPress={() => this.onPressFavorite(id, key)}
          style={styles.ActionButton}>
          <LikeInactive
            width={DEVICE_WIDTH * 0.03}
            height={DEVICE_HEIGHT * 0.03}
          />
        </TouchableOpacity>
      );

    return isFave;
  };
  getExtension(str) {
    let r = str.match(/\.([^.]+?)(\?.*)?$/);
    return r && r[1] ? r[1] : '';
  }

  renderSongs = (songs) => {
    const list = songs.map((item, key) => {
      const {
        title,
        artist,
        song_id,
        is_favorite,
        gallery,
        artist_id,
        extracted_mp3,
        song_image,
        aws_mp3,
      } = item;
      const id = song_id;
      item.type = 'artist';
      item.index = key;
      item.id = song_id;
      if (song_image !== null) {
        item.image = song_image.split(',')[0];
      }

      if (gallery !== null) {
        item.artist_image = artist_id + '/' + gallery.split(',')[0];
        item.artwork = URL.IMAGE + artist_id + '/' + gallery.split(',')[0];
      }

      //for player
      item.artist = artist;
      item.album = null;
      item.playlist = null;
      item.song = null;

      item.song_id = id;
      item.playlist_id = null;
      item.uid = 'playlist' + this.state.playlist_id;

      item.is_Active = true;
      item.index = key;
      item.url = extracted_mp3;
      item.rating = is_favorite;

      item.url = aws_mp3 || extracted_mp3;
      item.link = aws_mp3 || extracted_mp3;

      item.extension = this.getExtension(item.link);

      console.log(item.extension);

      return (
        <View style={styles.section} key={key}>
          <TouchableOpacity
            style={styles.sectionRow}
            onPress={() => this.onPressTile(item)}>
            <Tile data={item} />
            <View style={styles.infoSection}>
              <Text style={styles.song}>{title}</Text>
              <Text style={styles.artist}>{artist}</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.songOptionsContainer}>
            {this.renderIsFave(is_favorite, id, key)}
            {this.props.premium && this.renderIsDownloaded(item)}
            <TouchableOpacity
              disabled={this.props.offline}
              onPress={() => this.onPressMore(item)}
              style={styles.ActionButton}>
              <More
                width={DEVICE_WIDTH * 0.03}
                height={DEVICE_HEIGHT * 0.03}
                style={styles.more}
              />
            </TouchableOpacity>
          </View>
        </View>
      );
    });

    return list;
  };

  render() {
    let {
      screenData,
      playlist,
      favorites,
      showOptionModal,
      showEditModal,
      selected,
      background,
      isLoading,
      description,
      image,
      username,
    } = this.state;
    let songs = screenData[0].m_data;
    const tileImage = {uri: URL.IMAGE + image};
    if (isLoading) {
      return <Loading />;
    }

    return (
      <LinearGradient
        colors={[background, '#909FA4']}
        locations={[0, 1]}
        style={styles.gradient}>
        <CMH_ALERT
          isShow={this.state.showDeleteModal}
          yes={this.remove}
          no={() => this.setState({showDeleteModal: false})}
          msg={'Do you want to delete downloads?'}
        />
        {this.props.premium === false && (
          <BannerAd
            unitId={adUnitId}
            size={BannerAdSize.ADAPTIVE_BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly: true,
            }}
          />
        )}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => this.props.navigation.pop()}
            style={styles.back}>
            <Back width={DEVICE_WIDTH * 0.05} height={DEVICE_WIDTH * 0.05} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => share('playlist', this.state.playlist_id)}>
            <View style={styles.rightHeader}>
              <Share width={DEVICE_WIDTH * 0.05} height={DEVICE_WIDTH * 0.05} />
            </View>
          </TouchableOpacity>
        </View>
        <ScrollView>
          <View style={styles.mainContainer}>
            <View style={styles.tile}>
              {image === undefined || image === null ? (
                <Image
                  source={require('../../assets/images/cmh_logo_play.png')}
                  style={styles.image}
                  resizeMode={'cover'}
                />
              ) : (
                <FastImage
                  // source={require('../../assets/images/cmh_logo.png')}
                  // source={{
                  //   uri:
                  //     'https://services.tineye.com/developers/img/meloncat.20c77523.jpg',
                  // }}
                  source={tileImage}
                  style={styles.image}
                  // resizeMode={'cover'}
                  resizeMode={FastImage.resizeMode.cover}
                />
              )}
            </View>

            <Text style={styles.label}>{playlist}</Text>
            <Text style={styles.creator}>{username}</Text>
            {this.props.premium && this.renderIsListDownloaded()}

            {/* <View style={styles.row}>
              <Like
                width={DEVICE_WIDTH * 0.02}
                height={DEVICE_HEIGHT * 0.02}
                style={styles.like}
              />
              <Text style={styles.favourites}>{favorites}</Text>
            </View> */}

            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                disabled={this.props.offline}
                onPress={() => this.setState({showEditModal: true})}
                style={styles.follow}>
                <Text style={styles.followText}>EDIT PLAYLIST</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.shuffle}
                onPress={this.onPressShuffle}>
                <ShuffleInactive
                  width={DEVICE_WIDTH * 0.03}
                  height={DEVICE_HEIGHT * 0.03}
                />
                <Text style={styles.shuffleText}>SHUFFLE</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.description}>{description}</Text>
            <Text style={styles.pop}>Playlist Songs</Text>
            {this.renderSongs(songs)}
          </View>
        </ScrollView>
        <Modal
          isVisible={showEditModal}
          animationIn="slideInUp"
          onBackdropPress={() => this.setState({showEditModal: false})}
          hideModalContentWhileAnimating={true}>
          <EditPlaylist
            data={this.state}
            props={this.props}
            cancel={() => this.setState({showEditModal: false})}
            rename={this.rename}
            back={() => this.props.navigation.pop()}
          />
        </Modal>
        <Modal
          isVisible={showOptionModal}
          onBackdropPress={() => this.setState({showOptionModal: false})}
          hideModalContentWhileAnimating={false}>
          <SongOption
            data={selected}
            cancel={() => this.setState({showOptionModal: false})}
            props={this.props}
            from={'userPlaylist'}
            onPressFavorite={this.onPressFavorite}
            trackListId={this.state.playlist_id}
            initData={this.initData}
          />
        </Modal>
      </LinearGradient>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingTop: DEVICE_HEIGHT * 0.03,
    paddingBottom: DEVICE_HEIGHT * 0.1,
    alignItems: 'center',
  },
  sectionRow: {
    flexDirection: 'row',
    width: DEVICE_WIDTH * 0.75,
  },
  spacer: {
    height: DEVICE_HEIGHT * 0.08,
    backgroundColor: '#000000',
  },
  gradient: {
    paddingTop: DEVICE_HEIGHT * 0.04,
    backgroundColor: 'transparent',
    flex: 1,
  },

  tile: {
    height: DEVICE_WIDTH * 0.3,
    width: DEVICE_WIDTH * 0.3,
    backgroundColor: 'white',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 5,
    overflow: 'hidden',
  },

  albums: {
    alignSelf: 'flex-start',
    fontSize: DEVICE_HEIGHT * 0.025,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    marginLeft: DEVICE_WIDTH * 0.04,
  },

  label: {
    fontSize: DEVICE_HEIGHT * 0.035,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    marginTop: DEVICE_HEIGHT * 0.01,
    textAlign: 'center',
    width: DEVICE_WIDTH * 0.8,
  },
  favourites: {
    fontSize: DEVICE_HEIGHT * 0.02,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: DEVICE_WIDTH * 0.04,
    marginTop:
      Platform.OS === 'ios' ? DEVICE_HEIGHT * 0.05 : DEVICE_HEIGHT * 0.03,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },

  share: {
    marginRight: DEVICE_WIDTH * 0.04,
  },

  pop: {
    alignSelf: 'flex-start',
    fontSize: DEVICE_HEIGHT * 0.02,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    marginTop: DEVICE_HEIGHT * 0.03,
    marginBottom: DEVICE_HEIGHT * 0.03,
    marginLeft: DEVICE_WIDTH * 0.04,
  },
  follow: {
    width: DEVICE_WIDTH * 0.4,
    height: DEVICE_HEIGHT * 0.05,
    borderColor: '#FFFFFF',
    borderWidth: 1,
    borderRadius: DEVICE_HEIGHT * 0.1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  followText: {
    fontSize: DEVICE_HEIGHT * 0.02,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    marginLeft: DEVICE_WIDTH * 0.02,
  },

  shuffle: {
    width: DEVICE_WIDTH * 0.4,
    height: DEVICE_HEIGHT * 0.05,
    backgroundColor: '#000000',
    borderRadius: DEVICE_HEIGHT * 0.1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  shuffleText: {
    fontSize: DEVICE_HEIGHT * 0.02,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    marginLeft: DEVICE_WIDTH * 0.02,
  },

  buttonsContainer: {
    flexDirection: 'row',
    width: DEVICE_WIDTH * 0.92,
    justifyContent: 'space-between',
    marginTop: DEVICE_HEIGHT * 0.02,
  },

  flatList: {
    marginTop: DEVICE_HEIGHT * 0.02,
    flex: 1,
  },
  infoSection: {
    marginLeft: DEVICE_WIDTH * 0.03,
    justifyContent: 'center',
  },
  rightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  like: {
    marginRight: DEVICE_WIDTH * 0.01,
    marginBottom: DEVICE_HEIGHT * 0.003,
  },

  section: {
    flexDirection: 'row',
    marginBottom: DEVICE_HEIGHT * 0.04,
    width: DEVICE_WIDTH * 1,
    paddingHorizontal: DEVICE_WIDTH * 0.04,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  songOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ActionButton: {
    width: DEVICE_WIDTH * 0.07,
    justifyContent: 'center',
    alignItems: 'center',
  },
  song: {
    fontSize: DEVICE_HEIGHT * 0.021,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    width: DEVICE_WIDTH * 0.6,
  },
  artist: {
    fontSize: DEVICE_HEIGHT * 0.018,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Regular',
    width: DEVICE_WIDTH * 0.6,
  },
  back: {
    width: DEVICE_WIDTH * 0.1,
    height: DEVICE_HEIGHT * 0.04,
  },
  description: {
    fontSize: DEVICE_HEIGHT * 0.018,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Regular',
    width: DEVICE_WIDTH * 0.6,
    marginTop: DEVICE_HEIGHT * 0.025,
    textAlign: 'center',
  },
  creator: {
    fontSize: DEVICE_HEIGHT * 0.02,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    width: DEVICE_WIDTH * 0.8,
    marginBottom: DEVICE_HEIGHT * 0.01,
  },
  loading: {
    width: DEVICE_WIDTH * 0.04,
    height: DEVICE_WIDTH * 0.04,
  },
});

const mapStateToProps = (state) => {
  return {
    account: state.accountReducer.account,
    premium: state.accountReducer.premium,
    playlist: state.appReducer.playlist,
    tabIndex: state.appReducer.tabIndex,
    appData: state.appReducer.appData,
    playList: state.playerReducer.playList,
    offline: state.appReducer.offline,
    playIndex: state.playerReducer.playIndex,
    playListUID: state.playerReducer.playListUID,
    command: state.playerReducer.command,
    trackListUID: state.playerReducer.trackListUID,
    downloadList: state.appReducer.downloadList,
    downloadListInformation: state.appReducer.downloadListInformation,
    savedList: state.appReducer.savedList,
    downloadingSongIds: state.appReducer.downloadingSongIds,
    downloadedSongIds: state.appReducer.downloadedSongIds,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    updatePlaying: (payload) => dispatch(updatePlaying(payload)),
    updateList: (payload) => dispatch(updateList(payload)),
    updateIndex: (payload) => dispatch(updateIndex(payload)),
    updateShowPlayer: (payload) => dispatch(updateShowPlayer(payload)),
    updateUserPlaylist: (payload) => dispatch(updateUserPlaylist(payload)),
    update: (payload) => dispatch(update(payload)),
    updateTrackListUID: (payload) => dispatch(updateTrackListUID(payload)),
    updatePlayerData: (payload) => dispatch(updatePlayerData(payload)),
    updateRepeat: (payload) => dispatch(updateRepeat(payload)),
    updateCommand: (payload) => dispatch(updateCommand(payload)),
    updateIds: (payload) => dispatch(updateIds(payload)),
    addToDownloadList: (payload) => dispatch(addToDownloadList(payload)),
    removeFromDownloadList: (payload) =>
      dispatch(removeFromDownloadList(payload)),
    addToDownloadListInformation: (payload) =>
      dispatch(addToDownloadListInformation(payload)),
    removedFromSavedList: (payload) => dispatch(removedFromSavedList(payload)),
    updateDownloadedSongIds: (payload) =>
      dispatch(updateDownloadedSongIds(payload)),
    updateDownloadingSongIds: (payload) =>
      dispatch(updateDownloadingSongIds(payload)),
    updateDownloadedData: (payload) => dispatch(updateDownloadedData(payload)),
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(UserPlaylistInfo);
