import React, {Component} from 'react';

import {
  StyleSheet,
  View,
  Dimensions,
  Text,
  ActivityIndicator,
  Image,
  AppState,
  Platform,
  DeviceEventEmitter,
  NativeAppEventEmitter,
} from 'react-native';
import MarqueeText from 'react-native-marquee';
import {
  DEVICE_HEIGHT,
  DEVICE_WIDTH,
  GRADIENT_COLOR_SET_2,
} from '../constants/constants';
import SeekBar from './SeekBar';
// import Timer from './Timer';
import Tile from './Tile@4';
import BigTile from './Tile@6';
import Play from '../assets/svg/Play';
import Pause from '../assets/svg/Pause';
import More from '../assets/svg/More2';
import Back from '../assets/svg/back';
import LyricsInactive from '../assets/svg/Lyrics - Inactive';
import LyricsActive from '../assets/svg/Lyrics - Active';
import FireInactive from '../assets/svg/FireInactive';
import FireActive from '../assets/svg/FireBlueActiveCircle';
import ShuffleInactive from '../assets/svg/ShuffleInactive';
import RepeatInactive from '../assets/svg/RepeatInactive';
import RepeatActive from '../assets/svg/RepeatActive';
import Previous from '../assets/svg/Previous';
import Next from '../assets/svg/Next';
import Modal, {ModalContent} from 'react-native-modal';
import SongOption from '../components/SongOption';
import {addListened, addRecentlyPlayed} from '../api/service/actions';
import {connect} from 'react-redux';
import TrackPlayer, {
  Capability,
  useProgress,
  Event,
  State,
} from 'react-native-track-player';
import PlayCount from '../assets/svg/playCount.svg';
import BackgroundTimer from 'react-native-background-timer';

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
} from '../redux/actions/player';
import {ScrollView, TouchableOpacity} from 'react-native-gesture-handler';
import Carousel from 'react-native-snap-carousel'; // Version can be specified in package.json
import {updateUserPlaylist, update} from '../redux/actions/app';
import {favorite, unfavorite} from '../api/service/actions';
import {URL} from '../constants/apirUrls';
import LinearGradient from 'react-native-linear-gradient';
import {POST, DELETE, PUT} from '../api/service/service';

const SLIDER_WIDTH = Dimensions.get('window').width * 1;
const ITEM_WIDTH = Math.round(SLIDER_WIDTH * 0.7);

var playTimer;

var appTimer = null;
class Player extends Component {
  constructor(props) {
    super(props);

    this.state = {
      appState: AppState.currentState,
      paused: false,
      background: '#909FA4',
      totalLength: 1,
      repeatOn: false,
      shuffleOn: false,
      expand: false,
      showOptionModal: false,
      selected: null,
      fullscreenLyrics: false,
      overrideShow: false,
      slideIndex: null,
      clickChange: false,
      repeatTrackId: null,
      firstItem: null,
      queue: [],

      trackPlayerOpen: false,
      trackList: [],
      track: null,

      isPlaying: null,
      isExpand: false,
    };
  }

  async componentDidMount() {
    // const EventEmitter = Platform.select({
    //   ios: () => NativeAppEventEmitter,
    //   android: () => DeviceEventEmitter,
    // })();
    const {flag} = this.props;
    if (flag === false) {
      //console.log('Initiating player');
      TrackPlayer.setupPlayer().then(async () => {
        await TrackPlayer.updateOptions({
          stopWithApp: true,
          capabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
            Capability.SkipToPrevious,
          ],
        });

        // EventEmitter.addListener('backgroundTimer', () => {
        //   // this will be executed once after 5 seconds
        //   console.log('toe');
        // });

        TrackPlayer.addEventListener(
          'playback-track-changed',
          async ({nextTrack, track}) => {
            console.log('change');
            console.log(nextTrack);
            console.log(track);
            console.log('\n');
            if (nextTrack && track) {
              let currentTrack = await TrackPlayer.getTrack(nextTrack);
              // let previousTrack = await TrackPlayer.getTrack(track);

              let currentIndex = currentTrack.index;
              // let previousIndex = previousTrack.index;

              if (this.props.repeat !== null) {
                if (nextTrack !== this.props.repeat) {
                  TrackPlayer.skip(this.props.repeat);
                }
              } else {
                if (this.state.isExpand === true) {
                  this.carousel.snapToItem(currentIndex);
                }
                this.setState({
                  track: currentTrack,
                  trackPlayerOpen: true,
                });
                if (appTimer !== null) {
                  BackgroundTimer.clearTimeout(appTimer);
                }
                appTimer = BackgroundTimer.setTimeout(async () => {
                  this.recordPlayed();
                  console.log('test area 2');
                  console.log('id:');
                  console.log(currentTrack.id);
                }, 30000);
                this.addToRecent();
              }
            }
            // else if (nextTrack) {
            //   let currentTrack = await TrackPlayer.getTrack(nextTrack);
            //   if (this.props.playIndex === 0) {
            //     this.setState({
            //       track: currentTrack,
            //       trackPlayerOpen: true,
            //     });
            //   }
            // }
          },
        );
        TrackPlayer.addEventListener('playback-queue-ended', async (event) => {
          if (this.props.repeat !== null) {
            try {
              TrackPlayer.skip(this.props.repeat);
            } catch (error) {
              console.log(error);
            }
          }
        });
        TrackPlayer.addEventListener('remote-pause', async (event) => {
          //console.log('Remote pause');
          await TrackPlayer.pause();
        });
        TrackPlayer.addEventListener('remote-play', async (event) => {
          //console.log('Remote play');
          await TrackPlayer.play();
        });

        TrackPlayer.addEventListener('remote-next', async (event) => {
          //console.log('Remote next');
          try {
            this.props.updateRepeat(null);
            await TrackPlayer.skipToNext();
          } catch (_) {
            //console.log('No More Songs Left');
          }
        });
        TrackPlayer.addEventListener('remote-previous', async (event) => {
          try {
            this.props.updateRepeat(null);
            await TrackPlayer.skipToPrevious();
          } catch (_) {
            //console.log('No More Songs Left');
          }
        });
        TrackPlayer.addEventListener('playback-state', async (event) => {
          console.log('state: ' + event.state);

          if (Platform.OS === 'android') {
            switch (event.state) {
              //connecting
              case 8:
                // let trackList = await TrackPlayer.getQueue();
                // this.setState({
                //   trackList,
                // });
                break;
              case 6:
                //buffering
                let id = await TrackPlayer.getCurrentTrack();
                let trackData = await TrackPlayer.getTrack(id);
                this.setState({
                  isPlaying: null,
                  track: trackData,
                  trackPlayerOpen: true,
                });

                // console.log('SAVED ID: ' + currentID);
                // const Timer = BackgroundTimer.setTimeout(async () => {
                //   console.log('id:');
                //   console.log(trackData.id);
                // }, 30000);
                // if (currentID === null) {
                //   console.log('diri');
                //   console.log(currentID);
                //   console.log(trackData.id);
                //   currentID = trackData.id;
                //   this.addToRecent();
                // }
                // this.addToRecent();
                if (trackData.index === 0) {
                  if (appTimer !== null) {
                    BackgroundTimer.clearTimeout(appTimer);
                  }
                  appTimer = BackgroundTimer.setTimeout(async () => {
                    console.log('test area 1');
                    console.log('id:');
                    console.log(trackData.id);
                    this.recordPlayed();
                  }, 30000);
                  this.addToRecent();
                }

                break;
              case 1:
                this.setState({
                  isPlaying: false,
                  // trackPlayerOpen: false,
                });
                break;
              case 3:
                this.setState({
                  isPlaying: true,
                });
                break;
              case 2:
                this.setState({
                  isPlaying: false,
                });
                break;
              default:
                break;
            }
          } else {
            switch (event.state) {
              //connecting
              case 8:
                // let trackList = await TrackPlayer.getQueue();
                // this.setState({
                //   trackList,
                // });
                break;
              case 'buffering':
                //buffering
                let id = await TrackPlayer.getCurrentTrack();
                let trackData = await TrackPlayer.getTrack(id);
                this.setState({
                  isPlaying: null,
                  track: trackData,
                  trackPlayerOpen: true,
                });
                this.addToRecent();
                break;
              case 1:
                this.setState({
                  isPlaying: false,
                  // trackPlayerOpen: false,
                });
                break;
              case 'playing':
                this.setState({
                  isPlaying: true,
                });
                break;
              case 'paused':
                this.setState({
                  isPlaying: false,
                });
                break;
              default:
                break;
            }
          }
        });
        this.props.updateFlag(true);
      });
    }
  }

  componentWillUnmount = async () => {
    await TrackPlayer.reset();
    await TrackPlayer.destroy();
  };

  startTimer = () => {
    playTimer = setTimeout(function () {
      alert('record');
      this.stopTimer();
    }, 3000);
  };

  stopTimer = () => {
    console.log('clear timer');
    clearTimeout(playTimer);
  };

  componentDidUpdate = async (newProps) => {
    //console.log('Start Log------------');
    //console.log('Prop change');
    const currentUID = this.props.trackListUID;
    const previousUID = newProps.trackListUID;

    if (currentUID !== previousUID) {
      //playlist change
      console.log('Track list updated');
      console.log('Current Track UID: ', currentUID);
      // this.setState({
      //   trackPlayerOpen: true,
      // });
    }
  };

  onPressPlay = () => {
    if (this.state.isPlaying) {
      TrackPlayer.pause();
    } else {
      TrackPlayer.play();
    }
  };

  next = async () => {
    try {
      this.props.updateRepeat(null);
      await TrackPlayer.pause();
      await TrackPlayer.skipToNext();
      await TrackPlayer.play();
    } catch (_) {
      console.log('No More Songs Left');
    }
  };

  previous = async () => {
    try {
      this.props.updateRepeat(null);
      await TrackPlayer.skipToPrevious();
    } catch (_) {
      console.log('No More Songs Left');
    }
  };

  recordPlayed() {
    const {user_id, authToken} = this.props.account;
    const data = {user_id, song_id: this.state.track.song_id};
    const url = URL.LISTENED;
    const receiver = (response) => {
      const {success} = response;
      if (success) {
        console.log('Add listened: ' + this.state.track.song_id);
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

  addToRecent = () => {
    const {user_id, authToken} = this.props.account;
    const data = {user_id, song_id: this.state.track.song_id};
    const url = URL.RECENTLY_PLAYED_UPDATE;
    const receiver = (response) => {
      const {success} = response;
      if (success) {
        console.log('Updated Recently Played: ' + this.state.track.song_id);
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
  };

  onPressMore = (item) => {
    this.setState({
      showOptionModal: true,
      selected: item,
    });
  };

  onPressShuffle = async () => {
    let trackList = await TrackPlayer.getQueue();

    const copy = [...trackList];
    const shuffleData = this.shuffle(copy);

    shuffleData.forEach((item, index) => {
      shuffleData[index].index = index;
    });

    await TrackPlayer.reset();
    await TrackPlayer.add(shuffleData);
    await TrackPlayer.play();
    this.setState({
      trackList: shuffleData,
      isExpand: true,
    });
    this.carousel.snapToItem(0);
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

  onPressRepeat = async () => {
    if (this.props.repeat === null) {
      let id = await TrackPlayer.getCurrentTrack();

      this.props.updateRepeat(id);
    } else {
      this.props.updateRepeat(null);
    }
  };

  onPressExpand = async () => {
    const {isExpand} = this.state;
    if (isExpand === false) {
      let trackList = await TrackPlayer.getQueue();
      let id = await TrackPlayer.getCurrentTrack();
      let trackData = await TrackPlayer.getTrack(id);
      let trackIndex = trackData.index;
      console.log(trackData);
      this.setState({
        trackList,
        isExpand: true,
        firstItem: trackIndex,
        track: trackData,
      });
    } else {
      this.setState({
        isExpand: false,
      });
    }
  };

  toggleOptionModal = () => {
    const {showOptionModal} = this.state;
    this.setState({showOptionModal: !showOptionModal});
  };

  onPressFavorite = async (id, key) => {
    const configJson = {
      fave_id: id,
      type: 3,
    };
    favorite(this.props, configJson);
    await TrackPlayer.updateMetadataForTrack(id.toString(), {
      rating: 1,
    });
    let trackData = await TrackPlayer.getTrack(id.toString());
    this.setState({
      track: trackData,
    });
    this.props.updateCommand(true);
  };

  onPressUnfavorite = async (id, key) => {
    const configJson = {
      fave_id: id,
      type: 3,
    };
    unfavorite(this.props, configJson);
    await TrackPlayer.updateMetadataForTrack(id.toString(), {
      rating: 0,
    });
    let trackData = await TrackPlayer.getTrack(id.toString());
    this.setState({
      track: trackData,
    });
    this.props.updateCommand(true);
  };

  renderIsFave = (state, id) => {
    const isFave =
      state === 1 ? (
        <TouchableOpacity onPress={() => this.onPressUnfavorite(id)}>
          <FireActive
            width={DEVICE_WIDTH * 0.07}
            height={DEVICE_HEIGHT * 0.07}
          />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={() => this.onPressFavorite(id)}>
          <FireInactive
            width={DEVICE_WIDTH * 0.07}
            height={DEVICE_HEIGHT * 0.07}
          />
        </TouchableOpacity>
      );

    return isFave;
  };

  invertColor(hex) {
    if (hex === null) {
      return '000000';
    }
    var r = parseInt(hex.slice(0, 2), 16),
      g = parseInt(hex.slice(2, 4), 16),
      b = parseInt(hex.slice(4, 6), 16);

    const brightness = Math.round(
      (parseInt(r) * 299 + parseInt(g) * 587 + parseInt(b) * 114) / 1000,
    );

    return brightness > 125 ? '000000' : 'ffffff';
  }
  padZero(str, len) {
    len = len || 2;
    var zeros = new Array(len).join('0');
    return (zeros + str).slice(-len);
  }

  onScrollCarousel = async (index) => {
    let id = await TrackPlayer.getCurrentTrack();
    let trackData = await TrackPlayer.getTrack(id);
    console.log('track index: ', trackData.index);
    console.log('carousel index: ', index);
    if (index === trackData.index) {
      console.log('not scrolled');
    } else if (index > trackData.index) {
      this.props.updateRepeat(null);
      await TrackPlayer.pause();
      await TrackPlayer.skipToNext();
      await TrackPlayer.play();
    } else {
      this.props.updateRepeat(null);
      await TrackPlayer.pause();
      await TrackPlayer.skipToPrevious();
      await TrackPlayer.play();
    }
  };

  renderItem({item}) {
    return <BigTile data={item} />;
  }

  renderPlayButton = (invertedColor) => {
    let icon = null;
    if (this.state.isPlaying === null) {
      icon = <ActivityIndicator size="large" color={invertedColor} />;
    } else if (this.state.isPlaying === false) {
      icon = (
        <Image
          source={require('../assets/images/Play.png')}
          style={[styles.playBtn, {tintColor: invertedColor}]}
          resizeMode={'contain'}
        />
      );
    } else if (this.state.isPlaying === true) {
      icon = (
        <Image
          source={require('../assets/images/Pause.png')}
          style={[styles.playBtn, {tintColor: invertedColor}]}
          resizeMode={'contain'}
        />
      );
    }

    return (
      <TouchableOpacity
        onPress={() => this.onPressPlay()}
        disabled={this.state.isPlaying === null ? true : false}>
        {icon}
      </TouchableOpacity>
    );
  };

  renderMinPlayer = () => {
    // let uri = this.state.track.artwork;
    // let uri = URL.IMAGE + this.state.track.image;

    let useBackGround = this.state.track.dominant_color;
    if (this.state.track.dominant_color.length < 6) {
      const zeros = (6 - this.state.track.dominant_color.length) * '0';
      useBackGround = zeros + this.state.track.dominant_color;
    } else if (this.state.track.dominant_color !== null) {
      useBackGround = this.state.track.dominant_color;
    }
    let backgroundColor = '#' + useBackGround;
    let invertedColor = '#' + this.invertColor(useBackGround);

    let playerStyle = [];
    if (this.state.track.trial) {
      playerStyle = [
        styles.minimizedPlayerContainer,
        {backgroundColor: backgroundColor, bottom: DEVICE_HEIGHT * 0.01},
      ];
    } else {
      playerStyle = [
        styles.minimizedPlayerContainer,
        {backgroundColor: backgroundColor},
      ];
    }

    const tileImage =
      this.state.track.is_ad === true
        ? require('../assets/images/cmh_logo_play.png')
        : {uri: URL.IMAGE + this.state.track.image};

    return (
      <View style={playerStyle}>
        <TouchableOpacity
          onPress={() => this.onPressExpand()}
          // eslint-disable-next-line react-native/no-inline-styles
          style={{flexDirection: 'row', alignItems: 'center'}}>
          <View style={styles.imageContainer}>
            <View style={styles.minTile}>
              <Image
                source={tileImage}
                style={styles.image}
                resizeMode={'cover'}
              />
            </View>
          </View>
          <View style={styles.infoContainer}>
            {/* <Text
              adjustsFontSizeToFit={true}
              style={[styles.songMinimized, {color: invertedColor}]}>
              {this.state.track.title}
            </Text> */}
            <MarqueeText
              style={[styles.songMinimized, {color: invertedColor}]}
              duration={10000}
              marqueeOnStart
              loop
              marqueeDelay={1000}
              marqueeResetDelay={1000}>
              {this.state.track.title}
            </MarqueeText>
            {/* <Text style={[styles.artist, {color: invertedColor}]}>
              {this.state.track.artist}
            </Text> */}
            <MarqueeText
              style={[styles.artist, {color: invertedColor}]}
              duration={10000}
              marqueeOnStart
              loop
              marqueeDelay={1000}
              marqueeResetDelay={1000}>
              {this.state.track.artist}
            </MarqueeText>
          </View>
        </TouchableOpacity>
        {this.renderPlayButton(invertedColor)}
        <SeekBar
          recordPlayed={this.recordPlayed.bind(this)}
          trial={this.state.track.trial}
          min={true}
          songID={this.state.track.id}
        />
      </View>
    );
  };

  renderMaxPlayer = () => {
    let uri = this.state.track.artwork;
    let useBackGround = this.state.track.dominant_color;
    if (this.state.track.dominant_color.length < 6) {
      const zeros = (6 - this.state.track.dominant_color.length) * '0';
      useBackGround = zeros + this.state.track.dominant_color;
    } else if (this.state.track.dominant_color !== null) {
      useBackGround = this.state.track.dominant_color;
    }
    let backgroundColor = '#' + useBackGround;
    let invertedColor = '#' + this.invertColor(this.state.track.dominant_color);

    const repeatIcon = this.props.repeat ? (
      <RepeatActive width={DEVICE_WIDTH * 0.05} height={DEVICE_HEIGHT * 0.05} />
    ) : (
      <RepeatInactive
        width={DEVICE_WIDTH * 0.05}
        height={DEVICE_HEIGHT * 0.05}
      />
    );

    return (
      <LinearGradient
        colors={[backgroundColor, '#909FA4']}
        locations={[0, 1]}
        style={styles.maximizedPlayerContainer}>
        <View style={styles.header}>
          <View style={styles.leftHeader}>
            <TouchableOpacity
              style={styles.minimize}
              onPress={() => this.onPressExpand()}>
              <Back width={DEVICE_WIDTH * 0.03} height={DEVICE_HEIGHT * 0.03} />
            </TouchableOpacity>
          </View>
          <View style={styles.middleHeader}></View>
          <View style={styles.rightHeader}>
            {this.state.track.lyrics !== null && (
              <TouchableOpacity
                style={styles.lyricsButton}
                onPress={() => this.toggleFullscreenLyrics()}>
                <LyricsInactive
                  width={DEVICE_WIDTH * 0.06}
                  height={DEVICE_HEIGHT * 0.06}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <ScrollView>
          <View style={styles.carouselStyle}>
            <Carousel
              ref={(ref) => (this.carousel = ref)}
              data={this.state.trackList}
              renderItem={this.renderItem}
              sliderWidth={SLIDER_WIDTH}
              itemWidth={ITEM_WIDTH}
              firstItem={this.state.firstItem}
              scrollEnabled={true}
              swipeThreshold={1}
              onSnapToItem={(slideIndex) => this.onScrollCarousel(slideIndex)}
            />
          </View>
          <View style={styles.topOptionContainer}>
            {!this.state.track.trial &&
              this.renderIsFave(this.state.track.rating, this.state.track.id)}
            <View style={styles.middleOptionContainer}>
              <MarqueeText
                style={styles.song}
                // style={[styles.songMinimized, {color: invertedColor}]}
                duration={10000}
                marqueeOnStart
                loop
                marqueeDelay={1000}
                marqueeResetDelay={1000}>
                {this.state.track.title}
              </MarqueeText>
              {/* <Text style={[styles.artist, {color: invertedColor}]}>
              {this.state.track.artist}
            </Text> */}
              <MarqueeText
                style={styles.artist}
                duration={10000}
                marqueeOnStart
                loop
                marqueeDelay={1000}
                marqueeResetDelay={1000}>
                {this.state.track.artist}
              </MarqueeText>
              {!this.state.track.trial && (
                <View style={styles.playsContainer}>
                  <PlayCount
                    width={DEVICE_WIDTH * 0.02}
                    height={DEVICE_HEIGHT * 0.02}
                    style={styles.plays}
                  />
                  <Text style={styles.playsText}>
                    {this.state.track.plays === null
                      ? 0
                      : this.state.track.plays}
                  </Text>
                </View>
              )}
            </View>
            {!this.state.track.trial && (
              <TouchableOpacity onPress={() => this.onPressMore()}>
                <More
                  width={DEVICE_WIDTH * 0.07}
                  height={DEVICE_HEIGHT * 0.07}
                />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.seekbarContainer}>
            <SeekBar
              recordPlayed={this.recordPlayed.bind(this)}
              trial={this.state.track.trial}
              songID={this.state.track.id}
            />
          </View>
          <View style={styles.playerButtonContainer}>
            {!this.state.track.trial && (
              <TouchableOpacity
                onPress={() => this.onPressRepeat()}
                style={styles.button}>
                {repeatIcon}
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => this.previous()}
              style={styles.button}>
              <Previous
                width={DEVICE_WIDTH * 0.05}
                height={DEVICE_HEIGHT * 0.05}
              />
            </TouchableOpacity>
            {this.renderPlayButton('#FFFFFF')}
            <TouchableOpacity onPress={() => this.next()} style={styles.button}>
              <Next width={DEVICE_WIDTH * 0.05} height={DEVICE_HEIGHT * 0.05} />
            </TouchableOpacity>
            {!this.state.track.trial && (
              <TouchableOpacity
                onPress={() => this.onPressShuffle()}
                style={styles.button}>
                <ShuffleInactive
                  width={DEVICE_WIDTH * 0.05}
                  height={DEVICE_HEIGHT * 0.05}
                />
              </TouchableOpacity>
            )}
          </View>
          {this.state.track.lyrics !== null && (
            <View
              style={[
                styles.lyricsContainer,
                {marginLeft: DEVICE_WIDTH * 0.05},
              ]}>
              <Text style={[styles.lyricsHeader, {color: invertedColor}]}>
                Lyrics
              </Text>

              <Text style={[styles.lyrics, {color: invertedColor}]}>
                {this.state.track.lyrics}
              </Text>
            </View>
          )}

          <Modal
            isVisible={this.state.showOptionModal}
            onBackdropPress={() => this.toggleOptionModal()}
            hideModalContentWhileAnimating={true}>
            <SongOption
              data={this.state.track}
              cancel={this.toggleOptionModal}
              onPressFavorite={this.onPressFavorite}
              props={this.props}
            />
          </Modal>
        </ScrollView>
      </LinearGradient>
    );
  };

  renderFavoriteButton(state, id) {
    if (trackData.trial) {
      return <View />;
    }
    const isFave =
      trackData.rating === 1 ? (
        <TouchableOpacity onPress={() => onPressUnfavorite()}>
          <FireActive
            width={DEVICE_WIDTH * 0.07}
            height={DEVICE_HEIGHT * 0.07}
          />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={() => onPressFavorite()}>
          <FireInactive
            width={DEVICE_WIDTH * 0.07}
            height={DEVICE_HEIGHT * 0.07}
          />
        </TouchableOpacity>
      );

    return isFave;
  }

  toggleFullscreenLyrics = () => {
    const {fullscreenLyrics} = this.state;
    this.setState({
      fullscreenLyrics: !fullscreenLyrics,
    });
  };

  getQueue = async () => {
    let queue = await TrackPlayer.getQueue();
    this.setState({
      queue,
    });
    return;
  };

  render() {
    return (
      <View>
        {this.state.trackPlayerOpen && this.state.track !== null
          ? this.state.isExpand === true
            ? this.renderMaxPlayer()
            : this.renderMinPlayer()
          : null}
        {/* <Timer /> */}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    height: DEVICE_HEIGHT * 1,
  },
  minimizedPlayerContainer: {
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
    alignItems: 'center',
    backgroundColor: 'yellow',
  },
  minTile: {
    height: DEVICE_HEIGHT * 0.09,
    width: DEVICE_HEIGHT * 0.09,
    overflow: 'hidden',
    borderTopRightRadius: DEVICE_HEIGHT * 0.02,
    borderBottomLeftRadius: DEVICE_HEIGHT * 0.02,
    borderBottomRightRadius: DEVICE_HEIGHT * 0.01,
  },
  imageContainer: {
    justifyContent: 'center',
    width: DEVICE_WIDTH * 0.2,
    height: DEVICE_HEIGHT * 0.09,
  },
  infoContainer: {
    justifyContent: 'center',
    width: DEVICE_WIDTH * 0.55,
    height: DEVICE_HEIGHT * 0.09,
    marginRight: DEVICE_WIDTH * 0.03,
  },
  btnContainer: {
    justifyContent: 'center',
    width: DEVICE_WIDTH * 0.2,
    height: DEVICE_HEIGHT * 0.09,
    backgroundColor: 'green',
  },
  maximizedPlayerContainer: {
    height: DEVICE_HEIGHT * 1,
    width: DEVICE_WIDTH * 1,
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
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
  lyricsContainer: {
    width: DEVICE_WIDTH * 0.9,
    borderRadius: DEVICE_HEIGHT * 0.02,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    opacity: 0.4,
    marginBottom: DEVICE_HEIGHT * 0.02,
    paddingBottom: DEVICE_HEIGHT * 0.02,
  },

  song: {
    fontSize: DEVICE_HEIGHT * 0.021,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
  },
  songMinimized: {
    fontSize: DEVICE_HEIGHT * 0.021,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
  },
  artist: {
    fontSize: DEVICE_HEIGHT * 0.02,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Regular',
  },
  type: {
    fontSize: DEVICE_HEIGHT * 0.02,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
  },
  header: {
    flexDirection: 'row',
    height: DEVICE_HEIGHT * 0.15,
    width: DEVICE_WIDTH * 1,
  },
  leftHeader: {
    flex: 1,
    justifyContent: 'center',
  },
  playBtn: {
    height: DEVICE_WIDTH * 0.08,
    width: DEVICE_WIDTH * 0.08,
    tintColor: 'white',
  },
  rightHeader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  middleHeader: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: DEVICE_WIDTH * 0.13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  minimize: {
    width: DEVICE_WIDTH * 0.1,
    height: DEVICE_WIDTH * 0.1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lyricsButton: {
    width: DEVICE_WIDTH * 0.1,
    height: DEVICE_WIDTH * 0.1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'red',
    marginRight: DEVICE_WIDTH * 0.025,
  },
  topOptionContainer: {
    flexDirection: 'row',
    width: DEVICE_WIDTH * 0.9,
    height: DEVICE_HEIGHT * 0.1,
    marginLeft: DEVICE_WIDTH * 0.05,
    marginTop: DEVICE_HEIGHT * 0.05,
    marginBottom: DEVICE_HEIGHT * 0.02,
    justifyContent: 'space-around',
  },
  middleOptionContainer: {
    alignItems: 'center',
    width: DEVICE_WIDTH * 0.6,
  },
  seekbarContainer: {
    width: DEVICE_WIDTH * 1,
  },
  playerButtonContainer: {
    marginTop: DEVICE_HEIGHT * 0.05,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: DEVICE_WIDTH * 1,
    height: DEVICE_HEIGHT * 0.1,
  },
  carouselStyle: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plays: {
    marginRight: DEVICE_WIDTH * 0.01,
    marginBottom: DEVICE_HEIGHT * 0.003,
  },
  playsText: {
    fontSize: DEVICE_HEIGHT * 0.02,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
  },
  playsContainer: {
    marginTop: DEVICE_HEIGHT * 0.01,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },

  image: {
    width: '100%',
    height: '100%',
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
    playlist: state.appReducer.playlist,
    account: state.accountReducer.account,
    appData: state.appReducer.appData,
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
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(Player);
