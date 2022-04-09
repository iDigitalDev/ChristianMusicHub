import React, {Component} from 'react';
import RNRestart from 'react-native-restart';
import * as SecureStore from 'expo-secure-store';

import {
  StyleSheet,
  View,
  Dimensions,
  Text,
  ActivityIndicator,
  Image,
  Platform,
  TouchableOpacity,
} from 'react-native';
import MarqueeText from 'react-native-marquee';
import {
  setPurchaseListener,
  finishTransactionAsync,
  IAPResponseCode,
  getProductsAsync,
  purchaseItemAsync,
} from 'expo-in-app-purchases';
import {DEVICE_HEIGHT, DEVICE_WIDTH} from '../constants/constants';
import SeekBar from './SeekBar';
// import Timer from './Timer';
import BigTile from './Tile@6';
import More from '../assets/svg/More2';
import Back from '../assets/svg/back';
import LyricsInactive from '../assets/svg/Lyrics - Inactive';
import FireInactive from '../assets/svg/FireInactive';
import FireActive from '../assets/svg/FireBlueActiveCircle';
import ShuffleInactive from '../assets/svg/ShuffleInactive';
import RepeatInactive from '../assets/svg/RepeatInactive';
import RepeatActive from '../assets/svg/RepeatActive';
import Previous from '../assets/svg/Previous';
import Next from '../assets/svg/Next';
import Modal from 'react-native-modal';
import SongOption from '../components/SongOption';
import {addRecentlyPlayed} from '../api/service/actions';
import {connect} from 'react-redux';

import MusicControl from 'react-native-music-control';
import {Command} from 'react-native-music-control';
import {Audio} from 'expo-av';
import * as FileSystem from 'expo-file-system';
import {invertColor} from './Helpers';
import FastImage from 'react-native-fast-image';
import NetInfo from '@react-native-community/netinfo';
import {OFFLINE_ALERT} from '../components/CMH';
import {BannerAd, TestIds, BannerAdSize} from '@react-native-firebase/admob';
import {
  updatePlaying,
  updateIndex,
  updateList,
  updateShuffle,
  updateRepeat,
  updateCurrentTime,
  updateTotalTime,
  updateShowPlayer,
  updateFlag,
  updatePlayerData,
  updateCommand,
  updateIds,
} from '../redux/actions/player';
import {ScrollView} from 'react-native-gesture-handler';
import Carousel from 'react-native-snap-carousel'; // Version can be specified in package.json
import {updateUserPlaylist, update} from '../redux/actions/app';
import {favorite, unfavorite} from '../api/service/actions';
import {URL} from '../constants/apirUrls';
import LinearGradient from 'react-native-linear-gradient';
import {POST} from '../api/service/service';
import BackgroundTimer from 'react-native-background-timer';

const SLIDER_WIDTH = Dimensions.get('window').width * 1;
const ITEM_WIDTH = Math.round(SLIDER_WIDTH * 0.7);
const DEV_MODE = false;
const adUnitId = DEV_MODE
  ? TestIds.BANNER
  : 'ca-app-pub-5730941372305211/3921558169';
let unsubscribe = null;
let appTimer = null;
let modalTimer = null;
let checkNet = false;

const soundInstance = new Audio.Sound();
const subscribeSound = new Audio.Sound();

class Player extends Component {
  constructor(props) {
    super(props);

    this.state = {
      playbackInstance: null,
      holdUri: null,
      expanded: false,
      showLyrics: false,
      position: null,
      duration: null,
      carouselFirstItem: 0,
      offlineMode: false,
      OS: null,
      showModal: false,
      showOfflineModal: false,
      showOnlineModal: false,
    };
  }

  async componentDidMount() {
    if (this.props.premium === false) {
      this.startTimer();
    }

    // console.log('ios: ', FileSystem.documentDirectory);
    // console.log('android: ', RNBackgroundDownloader.directories.documents);
    console.log('Initializing player....');
    // console.log(Platform);

    // this.setState({playbackInstance: localPlaybackInstance});

    unsubscribe = NetInfo.addEventListener((state) => {
      console.log('isConnected ', state.isConnected);
      if (state.isConnected === true) {
        this.setState({showOfflineModal: false});
      } else if (state.isConnected === false && this.props.offline === false) {
        this.setState({showOfflineModal: true});
      }

      if (state.isConnected === true && this.props.offline === true) {
        if (checkNet) {
          this.setState({showOnlineModal: true});
          checkNet = true;
        }
      } else if (state.isConnected === false) {
        this.setState({showOnlineModal: false});
      }
    });
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        playsInSilentModeIOS: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
        shouldDuckAndroid: true,
        staysActiveInBackground: true,
        playThroughEarpieceAndroid: true,
      });

      // this.loadAudio();
    } catch (e) {
      console.log(e);
    }
    MusicControl.enableControl('play', true);
    MusicControl.enableControl('pause', true);
    MusicControl.enableControl('nextTrack', true);
    MusicControl.enableControl('previousTrack', true);

    MusicControl.enableBackgroundMode(true);

    // on iOS, pause playback during audio interruptions (incoming calls) and resume afterwards.
    // As of {{ INSERT NEXT VERSION HERE}} works for android aswell.
    MusicControl.handleAudioInterruptions(true);

    MusicControl.on(Command.play, () => {
      this.onPressPlayPauseButton();
    });

    MusicControl.on(Command.pause, () => {
      this.onPressPlayPauseButton();
    });

    try {
      // await connectAsync();
      // console.log('connected');
      setPurchaseListener(async ({responseCode, results, errorCode}) => {
        if (responseCode === IAPResponseCode.OK) {
          results.forEach(async (purchase) => {
            if (!purchase.acknowledged) {
              const {
                orderId,
                purchaseToken,
                acknowledged,
                transactionReceipt,
                productId,
              } = purchase;

              // in android, consumeItem should be set to false to acknowlege the purchase
              // in iOS this isn't needed because it's already specified in app store connect
              const consumeItem = Platform.OS === 'ios';

              await finishTransactionAsync(purchase, consumeItem);

              const token = await SecureStore.getItemAsync('user_token');

              // const instance = axios.create({
              //   baseURL: `${config.BASE_URL}/api`,
              //   timeout: 5000,
              //   headers: {Authorization: `Bearer ${token}`},
              // });

              // instance.post('/subscribe2', {
              //   orderId,
              //   purchaseToken,
              //   transactionReceipt,
              //   platform: Platform.OS,
              // });

              let {user_id, authToken} = this.props.account;
              let data = {
                user_id,
                orderId,
                purchaseToken,
                acknowledged,
                transactionReceipt,
                productId,
                platform: Platform.OS,
              };

              let url = URL.SUBSCRIBE_SUCCESS;

              const receiver = (response) => {
                if (response.successs === true) {
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
            }
          });
        } else {
          console.log('response code: ', responseCode);
          console.log('error code: ', errorCode);
          console.log('results:', results);
        }

        if (responseCode === IAPResponseCode.USER_CANCELED) {
          alert('You cancelled. Please try again.');
        } else if (responseCode === IAPResponseCode.DEFERRED) {
          alert(
            "You don't have permission to subscribe. Please use a different account.",
          );
        }
      });
    } catch (err) {
      alert('Error occurred: ' + JSON.stringify(err));
    }
  }

  componentWillUnmount() {
    if (unsubscribe != null) {
      unsubscribe();
    }
  }

  startTimer = async () => {
    modalTimer = setTimeout(async () => {
      await subscribeSound.loadAsync(require('../assets/audio/VO.mp3'));

      await subscribeSound.playAsync();
      this.setState({
        showModal: true,
      });
    }, 1800000);
  };

  onPressNo = async () => {
    await subscribeSound.stopAsync();
    await subscribeSound.unloadAsync();

    this.setState({showModal: false});
    this.startTimer();
  };

  stopTimer = () => {
    console.log('clear timer');
    clearTimeout(modalTimer);
  };

  onPressSubscribe = () => {};

  subscribeAnnual = async () => {
    try {
      const items = Platform.select({
        ios: ['CMH_Subs'],
        android: ['annual'],
      });

      const subscription_plan =
        Platform.OS === 'android' ? 'annual' : 'CMH_Subs';

      const products = await getProductsAsync(items);

      if (products.results.length > 0) {
        // setSubscribeButtonLoading(false);
        await purchaseItemAsync(subscription_plan);
      } else {
        // setSubscribeButtonLoading(false);
      }
    } catch (err) {
      // setSubscribeButtonLoading(false);
      alert('error occured while trying to purchase: ' + err);
    }
  };

  subscribeQuarter = async () => {
    try {
      const items = Platform.select({
        ios: ['CMHQ'],
        android: ['quarterly'],
      });

      const subscription_plan =
        Platform.OS === 'android' ? 'quarterly' : 'CMHQ';

      const products = await getProductsAsync(items);

      if (products.results.length > 0) {
        // setSubscribeButtonLoading(false);
        await purchaseItemAsync(subscription_plan);
      } else {
        // setSubscribeButtonLoading(false);
      }
    } catch (err) {
      // setSubscribeButtonLoading(false);
      alert('error occured while trying to purchase: ' + err);
    }
  };

  onPressPay = (type) => {
    if (type === 0) {
      this.subscribeAnnual();
    } else {
      this.subscribeQuarter();
    }
    // this.setState(
    //   {
    //     showModal: false,
    //   },
    //   this.props.navigation.navigate('Get', {type: type}),
    // );
  };

  componentDidUpdate = async (prevProps) => {
    //console.log('Start Log------------');
    //console.log('Prop change');

    if (this.props.ids.index === null) {
      return;
    }

    let currIndex = this.props.ids.index;
    let prevIndex = prevProps.ids.index;

    let currTrackList = this.props.ids.trackList;
    let prevTrackList = prevProps.ids.trackList;

    let currTrackListUID = this.props.ids.trackListUID;
    let prevTrackListUID = prevProps.ids.trackListUID;

    // if (currTrackList.toString() !== prevTrackList.toString()) {
    // }

    if (
      currTrackListUID !== prevTrackListUID ||
      currIndex !== prevIndex ||
      currTrackList !== prevTrackList
    ) {
      console.log('new');
      console.log(currTrackListUID);
      console.log(prevTrackListUID);
      let link = currTrackList[currIndex].link;
      let extension = currTrackList[currIndex].extension;
      let isDownloaded = currTrackList[currIndex].downloadState;
      let id = currTrackList[currIndex].id;
      this.setState({holdUri: link});
      console.log('=============================');
      console.log(currTrackList[currIndex].title);
      console.log('=============================');

      this.loadAudio(link, id, isDownloaded, extension);
      this.renderExternalControls();
    }

    // if (this.props.ids.index === prevProps.ids) {
    //   alert('same');
    // }

    // console.log(deepEqual(this.props.ids, prevProps.ids));
    // console.log('\n\nold props');
    // console.log(prevProps);
    // console.log('\n\nnew props');
    // console.log(this.props);
  };

  //functions
  loadAudio = async (uri, id, isDownloaded, extension) => {
    console.log('Loading audio');
    console.log(uri);
    await soundInstance.unloadAsync();

    console.log(extension);
    try {
      let useUri =
        this.props.offline === false
          ? uri
          : //  ? `${FileSystem.documentDirectory}/${id}.${extension}`
            `${FileSystem.documentDirectory}/${id}.${extension}`;

      console.log(useUri);
      const source = {
        uri: useUri,
      };

      const status = {
        shouldPlay: true,
      };

      soundInstance.setOnPlaybackStatusUpdate(this.onPlaybackStatusUpdate);
      await soundInstance.loadAsync(source, status, false);
      await soundInstance.playAsync();

      if (this.state.holdUri === uri) {
        this.props.updatePlaying(true);
        MusicControl.updatePlayback({
          state: MusicControl.STATE_PLAYING,
        });
        addRecentlyPlayed(this.props);
        if (appTimer !== null) {
          BackgroundTimer.clearTimeout(appTimer);
        }
        appTimer = BackgroundTimer.setTimeout(async () => {
          this.onRecord30();
        }, 30000);
      } else {
        soundInstance.unloadAsync();
      }
    } catch (e) {
      console.log(e);
    }
  };

  onPlaybackStatusUpdate = async (status) => {
    console.log(status);
    this.setState({
      duration: status.durationMillis,
      position: status.positionMillis,
    });
    if (status.didJustFinish) {
      if (this.props.repeat !== null) {
        await soundInstance.setPositionAsync(0);
        await soundInstance.playAsync();
      } else {
        this.onNextTrack();
      }
    }
  };

  onRecord30() {
    const {user_id, authToken} = this.props.account;
    let trackDetails = this.props.ids.trackList[this.props.ids.index];

    const data = {user_id, song_id: trackDetails.id};
    const url = URL.LISTENED;
    const receiver = (response) => {
      const {success} = response;
      if (success) {
        console.log('Add listened: ' + trackDetails.id);
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

  onScrollCarousel = async (carouselIndex) => {
    if (this.props.ids.index === null) {
      return;
    }
    let trackDetails = this.props.ids.trackList[this.props.ids.index];

    console.log('track index: ', trackDetails.index);
    console.log('carousel index: ', carouselIndex);
    if (carouselIndex === trackDetails.index) {
      console.log('not scrolled');
    } else if (carouselIndex > trackDetails.index) {
      this.props.updateRepeat(null);
      if (this.props.ids.index < this.props.ids.trackList.length - 1) {
        let {index, trackListUID, trackList} = this.props.ids;

        let nextIndex = index + 1;

        this.props.updateIds({index: nextIndex, trackListUID, trackList});
      }
    } else {
      this.props.updateRepeat(null);
      if (this.props.ids.index !== 0) {
        let {index, trackListUID, trackList} = this.props.ids;

        let nextIndex = index - 1;

        this.props.updateIds({index: nextIndex, trackListUID, trackList});
      }
    }
  };

  onNextTrack() {
    console.log('next track');
    this.props.updateRepeat(null);

    if (this.props.ids.index < this.props.ids.trackList.length - 1) {
      let {index, trackListUID, trackList} = this.props.ids;

      let nextIndex = index + 1;

      this.props.updateIds({index: nextIndex, trackListUID, trackList});
      if (this.state.expanded === true) {
        this.carousel.snapToItem(nextIndex);
      }
    } else {
      // this.props.updatePlaying(false);
    }
  }

  onPrevTrack() {
    console.log('prev track');
    this.props.updateRepeat(null);

    if (this.props.ids.index !== 0) {
      let {index, trackListUID, trackList} = this.props.ids;

      let nextIndex = index - 1;

      this.props.updateIds({index: nextIndex, trackListUID, trackList});
      if (this.state.expanded === true) {
        this.carousel.snapToItem(nextIndex);
      }
    } else {
      // this.props.updatePlaying(false);
    }
  }

  onPressPlayPauseButton = async () => {
    if (this.props.playing === true) {
      await soundInstance.pauseAsync();
      MusicControl.updatePlayback({
        state: MusicControl.STATE_PAUSED,
      });
      this.props.updatePlaying(false);
    } else {
      await soundInstance.playAsync();
      MusicControl.updatePlayback({
        state: MusicControl.STATE_PLAYING,
      });
      this.props.updatePlaying(true);
    }
  };

  onPressExpandContract = async () => {
    if (this.state.expanded === false) {
      this.setState({
        expanded: true,
        carouselFirstItem: this.props.ids.index,
      });
    } else {
      this.setState({
        expanded: false,
      });
    }
  };

  onPressShowHideLyrics = () => {
    this.setState({
      showLyrics: !this.state.showLyrics,
    });
  };

  onPressMoreButton = (item) => {
    this.setState({
      showOptionModal: true,
      // selected: item,
    });
  };

  onPressFavoriteButton = async (condition, id, key) => {
    if (condition === true) {
      const configJson = {
        fave_id: id,
        type: 3,
      };
      favorite(this.props, configJson);
      let idsCopy = JSON.parse(JSON.stringify(this.props.ids));
      idsCopy.trackList[idsCopy.index].rating = 1;
      this.props.updateIds(idsCopy);
      this.props.updateCommand(true);
    } else {
      const configJson = {
        fave_id: id,
        type: 3,
      };
      unfavorite(this.props, configJson);
      let idsCopy = JSON.parse(JSON.stringify(this.props.ids));
      idsCopy.trackList[idsCopy.index].rating = 0;
      this.props.updateIds(idsCopy);
      this.props.updateCommand(true);
    }
  };

  onPressRepeatButton = async () => {
    let trackDetails = this.props.ids.trackList[this.props.ids.index];
    this.props.updateRepeat(trackDetails.id);
  };

  onPressShuffleButton = async () => {
    this.props.updateRepeat(null);
    var trackList = JSON.parse(JSON.stringify(this.props.ids.trackList));
    const trackListUID = this.props.ids.trackListUID;
    const shuffleData = this.shuffle(trackList);

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

  toggleOptionModal = () => {
    const {showOptionModal} = this.state;
    this.setState({showOptionModal: !showOptionModal});
  };

  //renders
  renderModal = () => {
    return (
      <View style={styles.modalContainer}>
        <TouchableOpacity
          // style={styles.cancelContainer}
          onPress={() => this.onPressNo()}>
          <Image
            style={styles.cancel}
            source={require('../assets/images/cancel.png')}
          />
        </TouchableOpacity>
        <Text style={styles.modalHeader}>Say Goodbye to Ads!</Text>
        <Text style={styles.modalFont1}>Subscribe Now!</Text>
        <TouchableOpacity
          style={[
            styles.subscribeButton,
            {marginLeft: 0, marginTop: DEVICE_HEIGHT * 0.01},
          ]}
          onPress={() => this.onPressPay(0)}>
          <LinearGradient
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            colors={['#2DCEEF', '#8600FF']}
            locations={[0, 0.5]}
            style={styles.gradient}>
            <Text style={styles.subscribeText}>
              Annual Subscription | 350/year
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.subscribeButton,
            {
              marginLeft: 0,
              marginTop: DEVICE_HEIGHT * 0.02,
              marginBottom: DEVICE_HEIGHT * 0.04,
            },
          ]}
          onPress={() => this.onPressPay(1)}>
          <LinearGradient
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            colors={['#2DCEEF', '#E92667']}
            locations={[0, 0.5]}
            style={styles.gradient}>
            <Text style={styles.subscribeText}>
              Quarterly Subscription | 99/qtr
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };

  renderMinPlayer = () => {
    // console.log('Rendering minimized player');
    if (this.props.ids.index === null) {
      return;
    }
    let trackDetails = this.props.ids.trackList[this.props.ids.index];

    let useBackGround = trackDetails.dominant_color;
    if (trackDetails.dominant_color.length < 6) {
      const zeros = (6 - trackDetails.dominant_color.length) * '0';
      useBackGround = zeros + trackDetails.dominant_color;
    } else if (trackDetails.dominant_color !== null) {
      useBackGround = trackDetails.dominant_color;
    }

    let backgroundColor = '#' + useBackGround;
    let invertedColor = '#' + invertColor(useBackGround);

    const image =
      trackDetails.is_ad === true
        ? require('../assets/images/cmh_logo_play.png')
        : {uri: URL.IMAGE + trackDetails.image};

    return (
      <View
        style={
          trackDetails.trial
            ? [
                styles.minContainer,
                {backgroundColor, bottom: DEVICE_HEIGHT * 0.01},
              ]
            : [styles.minContainer, {backgroundColor}]
        }>
        <Modal
          isVisible={this.state.showModal}
          onBackdropPress={() => this.onPressNo()}
          hideModalContentWhileAnimating={true}>
          {this.renderModal()}
        </Modal>
        <OFFLINE_ALERT
          isShow={this.state.showOfflineModal}
          msg={'You are offline. Please Check your network connection'}
          yes={() => RNRestart.Restart()}
          option1={'Restart'}
          option2={'oy'}
        />
        <OFFLINE_ALERT
          isShow={this.state.showOnlineModal}
          msg={
            'You are now connected to the internet. Restart the app to access online features'
          }
          yes={() => RNRestart.Restart()}
          option1={'Restart'}
          option2={'oy'}
        />
        <TouchableOpacity
          style={{
            height: DEVICE_HEIGHT * 0.09,
            width: DEVICE_WIDTH * 0.8,
            flexDirection: 'row',
          }}
          onPress={() => this.onPressExpandContract()}>
          <View style={styles.imageContainer}>
            {/* <TouchableOpacity onPress={() => this.onPressExpandContract()}> */}
            <FastImage
              source={image}
              style={styles.image}
              resizeMode={FastImage.resizeMode.cover}
            />
            {/* </TouchableOpacity> */}
          </View>

          {/* <TouchableOpacity onPress={() => this.onPressExpandContract()}> */}
          <View pointerEvents="none" style={styles.infoContainer}>
            <MarqueeText
              style={[styles.minTitle, {color: invertedColor}]}
              duration={5000}
              // marqueeOnStart
              loop
              marqueeDelay={1000}
              marqueeResetDelay={1000}>
              {trackDetails.title}
            </MarqueeText>
            <MarqueeText
              style={[styles.minArtist, {color: invertedColor}]}
              duration={5000}
              // marqueeOnStart
              loop
              marqueeDelay={1000}
              marqueeResetDelay={1000}>
              {trackDetails.artist}
            </MarqueeText>
          </View>
        </TouchableOpacity>

        {/* </TouchableOpacity> */}
        <View style={styles.playButtonContainer}>
          {this.renderPlayPauseButton()}
        </View>
      </View>
    );
  };

  renderMaxPlayer = () => {
    // console.log('Rendering maximized player');
    if (this.props.ids.index === null) {
      return;
    }
    let trackDetails = this.props.ids.trackList[this.props.ids.index];
    let useBackGround = trackDetails.dominant_color;
    if (trackDetails.dominant_color.length < 6) {
      const zeros = (6 - trackDetails.dominant_color.length) * '0';
      useBackGround = zeros + trackDetails.dominant_color;
    } else if (trackDetails.dominant_color !== null) {
      useBackGround = trackDetails.dominant_color;
    }
    let backgroundColor = '#' + useBackGround;
    let invertedColor = '#' + invertColor(useBackGround);
    return (
      <LinearGradient
        colors={[backgroundColor, '#909FA4']}
        locations={[0, 1]}
        style={styles.maxContainer}>
        <Modal
          isVisible={this.state.showModal}
          onBackdropPress={() => this.onPressNo()}
          hideModalContentWhileAnimating={true}>
          {this.renderModal()}
        </Modal>
        <OFFLINE_ALERT
          isShow={this.state.showOfflineModal}
          msg={'You are offline. Please Check your network connection'}
          yes={() => RNRestart.Restart()}
          option1={'Restart'}
          option2={'oy'}
        />
        <OFFLINE_ALERT
          isShow={this.state.showOnlineModal}
          msg={
            'You are now connected to the internet. Restart the app to access online features'
          }
          yes={() => RNRestart.Restart()}
          option1={'Restart'}
          option2={'oy'}
        />
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={() => this.onPressExpandContract()}>
            <Back width={DEVICE_WIDTH * 0.04} height={DEVICE_HEIGHT * 0.04} />
          </TouchableOpacity>
          {trackDetails.lyrics !== null && (
            <TouchableOpacity
              style={styles.buttonContainer}
              onPress={() => this.onPressShowHideLyrics()}>
              <LyricsInactive
                width={DEVICE_HEIGHT * 0.04}
                height={DEVICE_HEIGHT * 0.04}
              />
            </TouchableOpacity>
          )}
        </View>
        {this.state.showLyrics === false ? (
          <ScrollView>
            {this.props.premium === false && (
              <BannerAd
                unitId={adUnitId}
                size={BannerAdSize.ADAPTIVE_BANNER}
                requestOptions={{
                  requestNonPersonalizedAdsOnly: true,
                }}
              />
            )}

            <View style={styles.carouselContainer}>
              <Carousel
                ref={(ref) => (this.carousel = ref)}
                data={this.props.ids.trackList}
                renderItem={this.renderCarouselItems}
                sliderWidth={SLIDER_WIDTH}
                itemWidth={ITEM_WIDTH}
                firstItem={this.state.carouselFirstItem}
                scrollEnabled={true}
                swipeThreshold={1}
                onSnapToItem={(slideIndex) => this.onScrollCarousel(slideIndex)}
              />
            </View>
            <View style={styles.rowContainer}>
              {this.props.account.type !== 'guest' &&
                this.renderFavoriteButton()}
              <View style={styles.marqueeContainer}>
                <MarqueeText
                  style={[styles.maxTitle, {color: invertedColor}]}
                  duration={5000}
                  marqueeOnStart
                  loop
                  marqueeDelay={1000}
                  marqueeResetDelay={1000}>
                  {trackDetails.title}
                </MarqueeText>
                <MarqueeText
                  style={[styles.maxArtist, {color: invertedColor}]}
                  duration={5000}
                  marqueeOnStart
                  loop
                  marqueeDelay={1000}
                  marqueeResetDelay={1000}>
                  {trackDetails.artist}
                </MarqueeText>
              </View>
              {this.props.account.type !== 'guest' && this.renderMoreButton()}
            </View>
            <SeekBar
              position={this.state.position}
              duration={this.state.duration}
              playbackInstance={soundInstance}
            />
            <View style={styles.rowContainer2}>
              {!trackDetails.trial && (
                <TouchableOpacity
                  onPress={() => this.onPressShuffleButton()}
                  style={styles.button}>
                  <ShuffleInactive
                    width={DEVICE_WIDTH * 0.05}
                    height={DEVICE_HEIGHT * 0.05}
                  />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => this.onPrevTrack()}
                style={styles.button}>
                <Previous
                  width={DEVICE_WIDTH * 0.05}
                  height={DEVICE_HEIGHT * 0.05}
                />
              </TouchableOpacity>
              {this.renderPlayPauseButton()}
              <TouchableOpacity
                onPress={() => this.onNextTrack()}
                style={styles.button}>
                <Next
                  width={DEVICE_WIDTH * 0.05}
                  height={DEVICE_HEIGHT * 0.05}
                />
              </TouchableOpacity>
              {this.renderRepeatButton()}
            </View>
            {trackDetails.lyrics !== null && (
              <View
                style={[
                  styles.lyricsContainer,
                  {marginLeft: DEVICE_WIDTH * 0.05},
                ]}>
                <Text style={[styles.lyricsHeader, {color: invertedColor}]}>
                  Lyrics
                </Text>

                <Text style={[styles.lyrics, {color: invertedColor}]}>
                  {trackDetails.lyrics}
                </Text>
              </View>
            )}
          </ScrollView>
        ) : (
          <ScrollView>
            <View
              style={[
                styles.lyricsContainer,
                {marginLeft: DEVICE_WIDTH * 0.05},
              ]}>
              <Text style={[styles.lyricsHeader, {color: invertedColor}]}>
                Lyrics
              </Text>

              <Text style={[styles.lyrics, {color: invertedColor}]}>
                {trackDetails.lyrics}
              </Text>
            </View>
          </ScrollView>
        )}
        <Modal
          isVisible={this.state.showOptionModal}
          onBackdropPress={() => this.toggleOptionModal()}
          hideModalContentWhileAnimating={true}>
          <SongOption
            data={trackDetails}
            cancel={this.toggleOptionModal}
            onPressFavorite={this.onPressFavorite}
            props={this.props}
          />
        </Modal>
      </LinearGradient>
    );
  };

  renderCarouselItems({item}) {
    return <BigTile data={item} />;
  }

  renderFavoriteButton(state, id) {
    if (this.props.ids.index === null) {
      return;
    }
    let trackDetails = this.props.ids.trackList[this.props.ids.index];
    if (trackDetails.trial) {
      return <View />;
    }
    const isFave =
      trackDetails.rating === 1 ? (
        <TouchableOpacity
          disabled={this.props.offline}
          onPress={() => this.onPressFavoriteButton(false, trackDetails.id)}>
          <FireActive
            width={DEVICE_WIDTH * 0.07}
            height={DEVICE_HEIGHT * 0.07}
          />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          disabled={this.props.offline}
          onPress={() => this.onPressFavoriteButton(true, trackDetails.id)}>
          <FireInactive
            width={DEVICE_WIDTH * 0.07}
            height={DEVICE_HEIGHT * 0.07}
          />
        </TouchableOpacity>
      );

    return isFave;
  }

  renderRepeatButton() {
    if (this.props.ids.index === null) {
      return;
    }
    let trackDetails = this.props.ids.trackList[this.props.ids.index];
    if (trackDetails.trial) {
      return null;
    }
    const btn =
      this.props.repeat !== null ? (
        <TouchableOpacity onPress={() => this.onPressRepeatButton()}>
          <RepeatActive
            width={DEVICE_WIDTH * 0.05}
            height={DEVICE_HEIGHT * 0.05}
          />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={() => this.onPressRepeatButton()}>
          <RepeatInactive
            width={DEVICE_WIDTH * 0.05}
            height={DEVICE_HEIGHT * 0.05}
          />
        </TouchableOpacity>
      );

    return btn;
  }

  renderMoreButton() {
    if (this.props.ids.index === null) {
      return;
    }
    let trackDetails = this.props.ids.trackList[this.props.ids.index];
    if (trackDetails.trial) {
      return <View />;
    }
    return (
      <TouchableOpacity
        disabled={this.props.offline}
        onPress={() => this.onPressMoreButton()}>
        <More width={DEVICE_WIDTH * 0.07} height={DEVICE_HEIGHT * 0.07} />
      </TouchableOpacity>
    );
  }

  renderExternalControls = async () => {
    let trackDetails = this.props.ids.trackList[this.props.ids.index];

    // console.log('=============\n\n Change Song');
    // console.log(trackDetails);
    // loadAudio(trackDetails.link);

    MusicControl.on(Command.nextTrack, () => {
      this.onNextTrack();
    });

    MusicControl.on(Command.previousTrack, () => {
      this.onPrevTrack();
    });

    console.log('--------------');
    console.log(trackDetails);

    MusicControl.setNowPlaying({
      title: trackDetails.title,
      artwork: trackDetails.artwork, // URL or RN's image require()
      artist: trackDetails.artist,
      color: 0xffffff,
    });
  };

  renderPlayPauseButton = () => {
    if (this.props.playing === null) {
      return <ActivityIndicator size="large" color={'#FFFFFF'} />;
    }
    let source =
      this.props.playing === true
        ? require('../assets/images/Pause.png')
        : require('../assets/images/Play.png');

    let tint = {
      tintColor: 'white',
      height: DEVICE_WIDTH * 0.08,
      width: DEVICE_WIDTH * 0.08,
    };

    return (
      <TouchableOpacity
        onPress={() => this.onPressPlayPauseButton()}
        // disabled={this.props.playing === 0 ? true : false}
      >
        <Image source={source} style={tint} resizeMode={'contain'} />
      </TouchableOpacity>
    );
  };

  render() {
    var toRender = this.state.expanded
      ? this.renderMaxPlayer()
      : this.renderMinPlayer();

    var check =
      toRender === undefined ? (
        <View>
          <Modal
            isVisible={this.state.showModal}
            onBackdropPress={() => this.onPressNo()}
            hideModalContentWhileAnimating={true}>
            {this.renderModal()}
          </Modal>
          <OFFLINE_ALERT
            isShow={this.state.showOfflineModal}
            msg={'You are offline. Please Check your network connection'}
            yes={() => RNRestart.Restart()}
            option1={'Restart'}
            option2={'oy'}
          />
          <OFFLINE_ALERT
            isShow={this.state.showOnlineModal}
            msg={
              'You are now connected to the internet. Restart the app to access online features!'
            }
            yes={() => RNRestart.Restart()}
            option1={'Restart'}
            option2={'oy'}
          />
        </View>
      ) : (
        <View>
          {toRender}
          <OFFLINE_ALERT
            isShow={this.state.showOfflineModal}
            msg={'You are offline. Please Check your network connection'}
            yes={() => RNRestart.Restart()}
            option1={'Restart'}
            option2={'oy'}
          />
          <OFFLINE_ALERT
            isShow={this.state.showOnlineModal}
            msg={
              'You are now connected to the internet. Restart the app to access online features'
            }
            yes={() => RNRestart.Restart()}
            option1={'Restart'}
            option2={'oy'}
          />
        </View>
      );
    return check;
  }
}

const styles = StyleSheet.create({
  //min container styles
  minContainer: {
    height: DEVICE_HEIGHT * 0.09,
    width: DEVICE_WIDTH * 0.92,
    marginHorizontal: DEVICE_WIDTH * 0.04,
    position: 'absolute',
    bottom: DEVICE_HEIGHT * 0.08,
    marginBottom: DEVICE_HEIGHT * 0.02,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 5,
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 20,
    flexDirection: 'row',
    opacity: 0.95,
  },
  imageContainer: {
    width: DEVICE_HEIGHT * 0.09,
    height: DEVICE_HEIGHT * 0.09,
    overflow: 'hidden',
    borderTopRightRadius: DEVICE_HEIGHT * 0.02,
    borderBottomLeftRadius: DEVICE_HEIGHT * 0.02,
    borderBottomRightRadius: DEVICE_HEIGHT * 0.01,
  },
  image: {
    height: '100%',
    width: '100%',
  },
  infoContainer: {
    paddingLeft: DEVICE_WIDTH * 0.02,
    width: DEVICE_WIDTH * 0.6,
    height: DEVICE_HEIGHT * 0.09,

    justifyContent: 'center',
  },
  playButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  minTitle: {
    fontSize: DEVICE_HEIGHT * 0.021,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
  },
  minArtist: {
    fontSize: DEVICE_HEIGHT * 0.02,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Regular',
  },

  //max container styles
  maxContainer: {
    height: DEVICE_HEIGHT * 1,
    width: DEVICE_WIDTH * 1,
    backgroundColor: 'black',
    position: 'absolute',
    bottom: 0,
  },
  headerContainer: {
    width: DEVICE_WIDTH * 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: DEVICE_HEIGHT * 0.04,
  },
  buttonContainer: {
    width: DEVICE_HEIGHT * 0.08,
    height: DEVICE_HEIGHT * 0.08,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselContainer: {
    marginTop: DEVICE_HEIGHT * 0.02,
    height: DEVICE_HEIGHT * 0.45,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: DEVICE_HEIGHT * 0.05,
  },
  rowContainer: {
    flexDirection: 'row',
    width: DEVICE_WIDTH * 1,
    paddingHorizontal: DEVICE_WIDTH * 0.08,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  rowContainer2: {
    flexDirection: 'row',
    width: DEVICE_WIDTH * 1,
    paddingHorizontal: DEVICE_WIDTH * 0.08,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  maxTitle: {
    fontSize: DEVICE_HEIGHT * 0.021,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
  },
  maxArtist: {
    fontSize: DEVICE_HEIGHT * 0.021,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
  },
  marqueeContainer: {
    width: DEVICE_WIDTH * 0.6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lyricsContainer: {
    width: DEVICE_WIDTH * 0.9,
    borderRadius: DEVICE_HEIGHT * 0.02,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    opacity: 0.4,
    marginTop: DEVICE_HEIGHT * 0.05,
    paddingBottom: DEVICE_HEIGHT * 0.03,
    marginBottom: DEVICE_HEIGHT * 0.03,
  },
  lyricsHeader: {
    fontSize: DEVICE_HEIGHT * 0.021,
    color: '#000000',
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
    marginBottom: DEVICE_HEIGHT * 0.03,
    marginTop: DEVICE_HEIGHT * 0.03,
  },
  lyrics: {
    fontSize: DEVICE_WIDTH * 0.035,
    color: '#000000',
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
  },
  modalContainer: {
    // paddingTop: DEVICE_HEIGHT * 0.05,
    backgroundColor: '#151d27',
    borderRadius: DEVICE_HEIGHT * 0.02,
    alignItems: 'center',
    // height: DEVICE_HEIGHT * 0.9,
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
    fontSize: DEVICE_WIDTH * 0.04,
    color: '#2DCEEF',
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
  cancel: {
    height: DEVICE_WIDTH * 0.08,
    width: DEVICE_WIDTH * 0.08,
    tintColor: '#66D5F7',
    marginLeft: DEVICE_WIDTH * 0.8,
  },
  cancelContainer: {
    // position: 'absolute',
    // right: 0,
    marginLeft: DEVICE_WIDTH * 0.8,
    backgroundColor: 'red',
  },
  subscribeButton: {
    height: DEVICE_HEIGHT * 0.08,
    width: DEVICE_WIDTH * 0.8,
    borderRadius: DEVICE_WIDTH * 10,
    marginLeft: DEVICE_WIDTH * 0.1,
    marginTop: DEVICE_HEIGHT * 0.06,
    flexDirection: 'row',
  },
  subscribeText: {
    fontSize: DEVICE_WIDTH * 0.04,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
  },
  gradient: {
    height: '100%',
    width: '100%',
    borderRadius: DEVICE_WIDTH * 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
});

const mapStateToProps = (state) => {
  return {
    playing: state.playerReducer.playing,
    playList: state.playerReducer.playList,
    playIndex: state.playerReducer.playIndex,
    currentTime: state.playerReducer.currentTime,
    totalTime: state.playerReducer.totalTime,
    showPlayer: state.playerReducer.showPlayer,
    shuffle: state.playerReducer.shuffle,
    repeat: state.playerReducer.repeat,
    trackListUID: state.playerReducer.trackListUID,
    flag: state.playerReducer.flag,
    ids: state.playerReducer.ids,
    playlist: state.appReducer.playlist,
    account: state.accountReducer.account,
    premium: state.accountReducer.premium,
    appData: state.appReducer.appData,
    offline: state.appReducer.offline,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    updatePlaying: (payload) => dispatch(updatePlaying(payload)),
    updateList: (payload) => dispatch(updateList(payload)),
    updateIndex: (payload) => dispatch(updateIndex(payload)),
    updateCurrentTime: (payload) => dispatch(updateCurrentTime(payload)),
    updateTotalTime: (payload) => dispatch(updateTotalTime(payload)),
    updateShowPlayer: (payload) => dispatch(updateShowPlayer(payload)),
    updateShuffle: (payload) => dispatch(updateShuffle(payload)),
    updateRepeat: (payload) => dispatch(updateRepeat(payload)),
    updateUserPlaylist: (payload) => dispatch(updateUserPlaylist(payload)),
    update: (payload) => dispatch(update(payload)),
    updateFlag: (payload) => dispatch(updateFlag(payload)),
    updatePlayerData: async (payload) => dispatch(updatePlayerData(payload)),
    updateCommand: async (payload) => dispatch(updateCommand(payload)),
    updateIds: async (payload) => dispatch(updateIds(payload)),
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(Player);
