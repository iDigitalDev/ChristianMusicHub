import React, {Component} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Image,
  ScrollView,
  ImageBackground,
} from 'react-native';
import Back from '../../assets/svg/back.svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal, {ModalContent} from 'react-native-modal';

import {Loading} from '../../components/Loading';
import {login} from '../../redux/actions/account';
import {connect} from 'react-redux';

import RNRestart from 'react-native-restart';
import {POST} from '../../api/service/service';
import {URL} from '../../constants/apirUrls';
import Tile from '../../components/Tile@5';
import Play from '../../assets/svg/Play';
import Pause from '../../assets/svg/Pause';
import {
  updatePlaying,
  updateExpanded,
  updateIndex,
  updateList,
  updateShuffle,
  updateRepeat,
  updateShowPlayer,
  updateUserPlaylist,
  updateTrackListUID,
  updatePlayerData,
  updateCommand,
  updateIds,
} from '../../redux/actions/player';
import {LoginButton, AccessToken, LoginManager} from 'react-native-fbsdk';

import {
  LOGIN_BG,
  GRADIENT_COLOR_SET_2,
  DEVICE_HEIGHT,
  DEVICE_WIDTH,
} from '../../constants/constants';
import GradientButton from '../../components/GradientButton';
class Trial extends Component {
  constructor(props) {
    super(props);
    this.state = this._getState();
  }

  _getState = () => ({
    showLogin: false,
    isLoading: false,
    tracks: [],
    activeIndex: null,
    showModal: false,
    isPlaying: false,
  });

  componentDidMount = () => {
    this.initData();
  };

  onPressPremium = () => {
    this.setState({
      showModal: true,
    });
  };

  onPressPay = () => {
    // alert('todo');
    this.setState(
      {
        showModal: false,
      },
      this.props.navigation.navigate('Get'),
    );
  };

  renderModal = () => {
    return (
      <View style={styles.modalContainer}>
        <TouchableOpacity
          style={styles.cancelContainer}
          onPress={() => this.setState({showModal: false})}>
          <Image
            style={styles.cancel}
            source={require('../../assets/images/cancel.png')}
          />
        </TouchableOpacity>
        <Text style={styles.modalHeader}>Be Our Member</Text>
        <View style={styles.modalScrollContainer}>
          <ScrollView>
            <Text style={styles.modalFont1}>Benefits of being a member:</Text>
            <Text style={styles.modalFont2}>
              1. Find the right music for every activity – for your worship
              services, events, acoustic moments, and many more.
            </Text>
            <Text style={styles.modalFont2}>
              2. Listen to thousands of tracks; old and new. Whether you’re
              driving, riding, working out, partying or relaxing, the right
              music is always at your fingertips. Choose what you want to listen
              to, or let Christian Music Hub surprise you.
            </Text>
            <Text style={styles.modalFont2}>
              3. Create your own playlist and be the DJ.
            </Text>
            <Text style={styles.modalFont2}>
              4. Follow along with lyrics. We’ve made it even better by having
              minus 1’s in the catalog (when available).
            </Text>
          </ScrollView>
        </View>
        <GradientButton
          buttonColor={GRADIENT_COLOR_SET_2}
          buttonText={'Subscribe Now!'}
          buttonTextColor={'#FFFFFF'}
          buttonPress={this.onPressPay}
          width={DEVICE_WIDTH * 0.8}
        />
      </View>
    );
  };

  formatArray = (tracks, ads) => {
    var formatAds = [];
    var mergedList = [];
    var customID = 0;

    ads.map((adItem, index) => {
      let item = {
        album: 'Christian Music Hub',
        // album_id: null,
        // album_image: null,
        artist: 'ad',
        // artist_id: null,
        // artist_image: null,
        dominant_color: '235463',
        extracted_mp3: adItem,
        gallery: null,
        id: 0,
        // ads_id: index,
        // image: null,
        // is_favorite: 0,
        link: adItem,
        lyrics: null,
        // play: false,
        // plays: null,
        song_image: null,
        title: 'Christian Music Hub',
        trial: true,
        is_ad: true,
        type: 'artist',
      };
      formatAds.push(item);
    });

    let i = 0;

    for (let k in tracks) {
      mergedList.push(Object.assign({}, tracks[k]));
      mergedList.push(Object.assign({}, formatAds[i]));
      i = (i + 1) % ads.length;
    }

    mergedList.map((item, index) => {
      item.index = index;
    });
    this.setState({
      tracks: mergedList,
    });
  };

  initData = () => {
    let {user_id, authToken} = this.props.account;
    let {screenData, playlist_id} = this.state;
    let data = {user_id};
    let url = URL.TRIAL_PLAYLIST;

    const receiver = (response) => {
      const {success} = response;
      if (success) {
        const {tracks, ads} = response;
        this.formatArray(tracks, ads);
        // if (tracks !== null) {
        //   this.setState({
        //     tracks,
        //   });
        // }
        this.setState({
          isLoading: false,
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

  renderPlayButton = (index) => {
    const {activeIndex} = this.state;
    const play = activeIndex === index && this.state.isPlaying ? true : false;
    const returnThis = play ? (
      <Pause width={DEVICE_WIDTH * 0.04} height={DEVICE_HEIGHT * 0.04} />
    ) : (
      <Play width={DEVICE_WIDTH * 0.04} height={DEVICE_HEIGHT * 0.04} />
    );

    return returnThis;
  };

  componentDidUpdate(newProps) {
    if (newProps.playIndex !== this.props.playIndex) {
      this.setState({
        activeIndex: this.props.playIndex,
      });
    } else if (this.props.playIndex !== null) {
      // if (this.props.playing === true) {
      //   alert('true');
      // } else {
      //   alert('false');
      //   this.setState({
      //     activeIndex: null,
      //   });
      // }
    }
  }

  onPressTile = async (data) => {
    const {index, song_id} = data;
    try {
      let currentTrackId = await TrackPlayer.getCurrentTrack();

      if (currentTrackId === song_id.toString()) {
        this.togglePlayer(index);
        return;
      }
    } catch (error) {}

    console.log(this.props.trackListUID);
    if (this.props.trackListUID === 'trial') {
      TrackPlayer.skip(song_id.toString());
      return;
    }
    this.props.updateRepeat(null);
    const {tracks} = this.state;
    const trackListUID = 'trial';
    const trackID = tracks[index].song_id;
    await TrackPlayer.reset();
    await TrackPlayer.add([...tracks]);
    await TrackPlayer.skip(trackID.toString());
    await TrackPlayer.play();
    if (index === 0) {
      this.props.updateIds({index, trackListUID, trackList: tracks});
    }
  };

  togglePlayer = async (index) => {
    console.log(index);
    if (this.state.isPlaying === true) {
      await TrackPlayer.pause();
      this.setState({
        activeIndex: null,
        isPlaying: false,
      });
    } else {
      await TrackPlayer.play();
      this.setState({
        activeIndex: index,
        isPlaying: true,
      });
    }
  };

  renderSongs = (songs) => {
    const list = songs.map((item, key) => {
      const {
        title,
        is_favorite,
        song_id,
        artist,
        extracted_mp3,
        artist_id,
        gallery,
        song_image,
        is_ad,
      } = item;
      if (!is_ad) {
        const id = song_id;
        item.id = id;
      } else {
        item.id = 1000000000 + key;
      }

      item.type = 'artist';
      item.link = extracted_mp3;
      if (is_ad === false) {
        item.artist_image = artist_id + '/' + gallery.split(',')[0];
      }
      item.play = false;
      item.trial = true;
      if (song_image !== null) {
        item.image = song_image.split(',')[0];
        item.artwork = URL.IMAGE + song_image.split(',')[0];
      }

      item.artist = artist;
      item.album = null;
      item.playlist = null;
      item.song = null;

      item.song_id = song_id;
      item.playlist_id = null;
      item.uid = 'trial';

      item.is_Active = true;
      item.index = key;
      item.url = extracted_mp3;
      item.rating = is_favorite;

      if (is_ad) {
        return null;
      }

      return (
        <View style={styles.section} key={key}>
          <TouchableOpacity
            style={styles.sectionRow}
            onPress={() => this.onPressTile(item)}>
            <Tile data={item} onPressTile={this.onPressTile} />
            <View style={styles.infoSection}>
              <Text style={styles.song}>{title}</Text>
              <Text style={styles.artist}>{artist}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.onPressTile(item)}>
            {/* {this.renderPlayButton(item.index)} */}
          </TouchableOpacity>
        </View>
      );
    });

    return list;
  };

  onPressLogout = async () => {
    this.setState({
      isLoading: true,
    });
    let url = URL.LOG_OUT;
    let {user_id, authToken} = this.props.account;
    let data = {user_id};

    const receiver = async (response) => {
      const {status} = response;
      if (status === true) {
        LoginManager.logOut();
        await TrackPlayer.reset();
        await TrackPlayer.destroy();
        this.saveCache();
        RNRestart.Restart();
      } else {
        console.log(response);
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

  async saveCache() {
    await AsyncStorage.removeItem('@cacheUser');
  }

  render() {
    const {tracks, showModal, isLoading} = this.state;
    if (isLoading === true) {
      return <Loading />;
    }
    return (
      <ImageBackground source={LOGIN_BG} style={styles.ImageBackground}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backContainer}
            onPress={() => this.onPressLogout()}>
            <Back
              width={DEVICE_WIDTH * 0.05}
              height={DEVICE_WIDTH * 0.05}
              style={styles.back}
            />
          </TouchableOpacity>
          <View />
        </View>
        <Text style={styles.greetings}> We Made A Playlist For You</Text>
        <Text style={styles.subGreetings}>
          Get a taste and checkout our curated trial playlist. Have a go then
          head on and subscribe to premium to enjoy the whole catalog
        </Text>
        <GradientButton
          buttonColor={GRADIENT_COLOR_SET_2}
          buttonText={'Subscribe Now!'}
          buttonTextColor={'#FFFFFF'}
          marginBottom={DEVICE_HEIGHT * 0.05}
          buttonPress={this.onPressPremium}
        />
        <View style={styles.songList}>
          <ScrollView>
            {this.renderSongs(tracks)}
            <View style={styles.spacer} />
          </ScrollView>
        </View>
        <Modal
          isVisible={showModal}
          onBackdropPress={() => this.setState({showModal: false})}
          hideModalContentWhileAnimating={true}>
          {this.renderModal()}
        </Modal>
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  ImageBackground: {
    flex: 1,
    resizeMode: 'cover',
    alignItems: 'center',
  },
  greetings: {
    fontSize: DEVICE_WIDTH * 0.065,
    color: '#66D5F7',
    fontFamily: 'Montserrat-Bold',
    marginTop: DEVICE_HEIGHT * 0.02,
    width: DEVICE_WIDTH * 0.7,
    textAlign: 'center',
  },
  subGreetings: {
    fontSize: DEVICE_WIDTH * 0.035,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Regular',
    marginTop: DEVICE_HEIGHT * 0.02,
    width: DEVICE_WIDTH * 0.85,
    textAlign: 'center',
    marginBottom: DEVICE_HEIGHT * 0.04,
  },
  sectionRow: {
    flexDirection: 'row',
    width: DEVICE_WIDTH * 0.75,
  },
  infoSection: {
    marginLeft: DEVICE_WIDTH * 0.03,
    justifyContent: 'center',
  },
  section: {
    flexDirection: 'row',
    marginBottom: DEVICE_HEIGHT * 0.04,
    width: DEVICE_WIDTH * 1,
    paddingHorizontal: DEVICE_WIDTH * 0.04,
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontFamily: 'Montserrat-Regular',
  },
  songList: {
    height: DEVICE_HEIGHT * 0.55,
  },
  spacer: {
    height: DEVICE_HEIGHT * 0.2,
  },
  headerContainer: {
    flexDirection: 'row',
    width: DEVICE_WIDTH * 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: DEVICE_WIDTH * 0.03,
    marginBottom: DEVICE_HEIGHT * 0.035,
    marginTop: DEVICE_HEIGHT * 0.035,
  },
  headerText: {
    fontSize: DEVICE_HEIGHT * 0.033,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
  },
  modalContainer: {
    paddingTop: DEVICE_HEIGHT * 0.05,
    backgroundColor: '#151d27',
    borderRadius: DEVICE_HEIGHT * 0.02,
    alignItems: 'center',
    height: DEVICE_HEIGHT * 0.9,
    paddingHorizontal: 0,
  },
  modalScrollContainer: {
    marginTop: DEVICE_HEIGHT * 0.04,
    height: DEVICE_HEIGHT * 0.6,
    width: DEVICE_WIDTH * 0.8,
    marginBottom: DEVICE_HEIGHT * 0.03,
  },
  modalHeader: {
    fontSize: DEVICE_WIDTH * 0.06,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
  },
  modalFont1: {
    fontSize: DEVICE_WIDTH * 0.03,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    marginBottom: DEVICE_HEIGHT * 0.02,
  },
  modalFont2: {
    fontSize: DEVICE_WIDTH * 0.03,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Regular',
    lineHeight: DEVICE_HEIGHT * 0.035,
    marginBottom: DEVICE_HEIGHT * 0.02,
  },
  back: {
    width: DEVICE_WIDTH * 0.1,
    height: DEVICE_HEIGHT * 0.04,
    justifyContent: 'center',
    marginTop: DEVICE_HEIGHT * 0.02,
  },
  cancel: {
    height: DEVICE_WIDTH * 0.08,
    width: DEVICE_WIDTH * 0.08,
    tintColor: '#66D5F7',
  },
  cancelContainer: {
    position: 'absolute',
    right: 0,
  },
});

const mapStateToProps = (state) => {
  return {
    account: state.accountReducer.account,
    isLogin: state.accountReducer.isLogin,
    playList: state.playerReducer.playList,
    playing: state.playerReducer.playing,
    playlist: state.appReducer.playlist,
    isPlaying: state.playerReducer.isPlaying,
    tabIndex: state.appReducer.tabIndex,
    playIndex: state.playerReducer.playIndex,
    uid: state.playerReducer.uid,
    command: state.playerReducer.command,
    trackListUID: state.playerReducer.trackListUID,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    login: (payload) => dispatch(login(payload)),
    updatePlaying: (payload) => dispatch(updatePlaying(payload)),
    updateList: (payload) => dispatch(updateList(payload)),
    updateIndex: (payload) => dispatch(updateIndex(payload)),
    updateShowPlayer: (payload) => dispatch(updateShowPlayer(payload)),
    updateUserPlaylist: (payload) => dispatch(updateUserPlaylist(payload)),
    updateTrackListUID: (payload) => dispatch(updateTrackListUID(payload)),
    updateRepeat: (payload) => dispatch(updateRepeat(payload)),
    updateCommand: (payload) => dispatch(updateCommand(payload)),
    updateIds: (payload) => dispatch(updateIds(payload)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Trial);
