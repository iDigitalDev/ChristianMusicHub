import React, {useState, useEffect, useRef, createRef} from 'react';

import {
  StyleSheet,
  View,
  Dimensions,
  Text,
  Button,
  ActivityIndicator,
  Image,
  AppState,
  SafeAreaView,
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
import FastImage from 'react-native-fast-image';
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
import PlayerSongOption from '../components/PlayerSongOption';
import {
  addListened,
  addRecentlyPlayed,
  initializeAppData,
} from '../api/service/actions';
import {
  updatePlaying,
  updateExpanded,
  updateIds,
  updateCommand,
  updateRepeat,
  updateAutoPlay,
} from '../redux/actions/player';
import {invertColor} from './Helpers';
import {useDispatch, useSelector} from 'react-redux';
import TrackPlayer, {useTrackPlayerEvents} from 'react-native-track-player';

import PlayCount from '../assets/svg/playCount.svg';
import BackgroundTimer from 'react-native-background-timer';

import {ScrollView, TouchableOpacity} from 'react-native-gesture-handler';
import Carousel from 'react-native-snap-carousel'; // Version can be specified in package.json
import {updateUserPlaylist, update} from '../redux/actions/app';
import {songFavorite, songUnfavorite} from '../api/service/actions';
import {URL} from '../constants/apirUrls';
import LinearGradient from 'react-native-linear-gradient';
import {POST, DELETE, PUT} from '../api/service/service';
import {acc} from 'react-native-reanimated';

const SLIDER_WIDTH = Dimensions.get('window').width * 1;
const ITEM_WIDTH = Math.round(SLIDER_WIDTH * 0.7);
var testTimer = null;

const events = [
  'playback-state',
  'playback-track-changed',
  'remote-next',
  'remote-previous',
  'playback-queue-ended',
  'remote-pause',
  'remote-play',
];

export const MaxPlayer = React.memo((props) => {
  console.log('------------------');
  console.log('Rendered Max Player');

  //refs
  const carouselRef = createRef();

  //local states
  const [trackData, setTrackData] = useState(null);
  const [trackList, setTrackList] = useState(null);
  const [carouselFirstIndex, setCarouselFirstIndex] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);

  //used for dispatching redux
  const dispatch = useDispatch();

  //redux variables
  const playing = useSelector((state) => state.playerReducer.playing);
  const ids = useSelector((state) => state.playerReducer.ids);
  const expanded = useSelector((state) => state.playerReducer.expanded);
  const account = useSelector((state) => state.accountReducer.account);
  const playlist = useSelector((state) => state.appReducer.playlist);
  const repeat = useSelector((state) => state.playerReducer.repeat);
  const autoPlay = useSelector((state) => state.playerReducer.autoPlay);

  //effects
  useEffect(() => {
    console.log('\n---Change Track---');
    if (ids === null) {
      return;
    }
    async function getQueue() {
      let queue = await TrackPlayer.getQueue();
      if (queue.length !== 0) {
        let id = queue[ids.index].id;
        console.log('Title: ', queue[ids.index].title);
        console.log('ID: ', id);
        console.log('Index: ', ids.index);
        if (carouselRef.current !== null) {
          carouselRef.current.snapToItem(ids.index);
        }
        setTrackData(queue[ids.index]);
      }
    }
    getQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, ids]);

  useEffect(() => {
    async function intitalize() {
      let queue = await TrackPlayer.getQueue();
      setTrackList(queue);
      let id = await TrackPlayer.getCurrentTrack();
      let track = await TrackPlayer.getTrack(id);
      setCarouselFirstIndex(track.index);
    }
    intitalize();
  }, []);

  useTrackPlayerEvents(events, async (event) => {
    // console.log('Event: ', event.type);
    switch (event.type) {
      case 'remote-next':
        try {
          dispatch(updateRepeat(null));
          await TrackPlayer.skipToNext();
        } catch (error) {
          console.log('no more next songs');
        }

        break;

      case 'remote-previous':
        try {
          dispatch(updateRepeat(null));
          await TrackPlayer.skipToPrevious();
        } catch (error) {
          console.log('no more prev songs');
        }

        break;

      case 'playback-queue-ended':
        break;

      case 'remote-pause':
        dispatch(updateAutoPlay(false));
        TrackPlayer.pause();
        break;

      case 'remote-play':
        dispatch(updateAutoPlay(true));
        TrackPlayer.play();
        break;

      case 'playback-track-changed':
        if (event.nextTrack && event.track) {
          let currentTrack = await TrackPlayer.getTrack(event.nextTrack);

          console.log('\n\n\n -----');
          console.log(currentTrack);

          //track id
          let id = currentTrack.id;
          console.log('bump1');

          if (repeat !== null && id !== repeat) {
            TrackPlayer.skip(repeat.toString());
            return;
          }
          console.log('bump2');

          //index
          let index =
            repeat === true ? currentTrack.index - 1 : currentTrack.index;
          console.log('bump3');

          //queue
          let queue = await TrackPlayer.getQueue();
          console.log('bump3');

          //queue ID
          let queueID = currentTrack.uid;
          console.log('bump4');

          dispatch(updateIds({index, queue, queueID}));
        }
        break;

      case 'playback-state':
        switch (event.state) {
          //play
          case 3:
            dispatch(updatePlaying(1));
            break;
          //pause
          case 2:
            dispatch(updatePlaying(2));
            break;

          //ios

          case 'playing':
            dispatch(updatePlaying(1));
            break;
          case 'paused':
            if (autoPlay === true) {
              console.log('trigger auto play');
              TrackPlayer.play();
            } else {
              dispatch(updatePlaying(2));
            }
            break;
          default:
            break;
        }
        break;

      default:
        break;
    }
  });

  //functions
  async function pressExpand() {
    if (expanded === true) {
      dispatch(updateExpanded(false));
    } else {
      //load for carousel
      let queue = await TrackPlayer.getQueue();
      setTrackList(queue);
      let id = await TrackPlayer.getCurrentTrack();
      let track = await TrackPlayer.getTrack(id);
      setCarouselFirstIndex(track.index);
      dispatch(updateExpanded(true));
    }
  }

  function PlayButton() {
    if (playing === 0) {
      return <ActivityIndicator size="large" color={'#FFFFFF'} />;
    }
    let source =
      playing === 1
        ? require('../assets/images/Pause.png')
        : require('../assets/images/Play.png');

    let tint = {
      tintColor: 'white',
      height: DEVICE_WIDTH * 0.08,
      width: DEVICE_WIDTH * 0.08,
    };

    return (
      <TouchableOpacity
        onPress={() => pressPlay(playing)}
        disabled={playing === 0 ? true : false}>
        <Image source={source} style={tint} resizeMode={'contain'} />
      </TouchableOpacity>
    );
  }

  async function pressPlay() {
    if (playing === 1) {
      dispatch(updateAutoPlay(false));
      await TrackPlayer.pause();
    } else {
      dispatch(updateAutoPlay(true));
      await TrackPlayer.play();
    }
  }

  async function onScrollCarousel(scrollIndex) {
    let id = await TrackPlayer.getCurrentTrack();
    let data = await TrackPlayer.getTrack(id);
    console.log('track index: ', data.index);
    console.log('carousel index: ', scrollIndex);
    if (scrollIndex === data.index) {
      console.log('not scrolled');
    } else if (scrollIndex > data.index) {
      console.log('right');
      dispatch(updateRepeat(null));
      TrackPlayer.skipToNext();
    } else {
      console.log('left');
      dispatch(updateRepeat(null));
      TrackPlayer.skipToPrevious();
    }
  }

  function FavoriteButton(state, id) {
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

  function MoreButton() {
    if (trackData.trial) {
      return <View />;
    }
    return (
      <TouchableOpacity onPress={() => onPressMore()}>
        <More width={DEVICE_WIDTH * 0.07} height={DEVICE_HEIGHT * 0.07} />
      </TouchableOpacity>
    );
  }

  function RepeatButton() {
    if (trackData.trial) {
      return null;
    }
    const btn =
      repeat !== null ? (
        <TouchableOpacity onPress={() => onPressRepeat()}>
          <RepeatActive
            width={DEVICE_WIDTH * 0.05}
            height={DEVICE_HEIGHT * 0.05}
          />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={() => onPressRepeat()}>
          <RepeatInactive
            width={DEVICE_WIDTH * 0.05}
            height={DEVICE_HEIGHT * 0.05}
          />
        </TouchableOpacity>
      );

    return btn;
  }

  async function onPressRepeat() {
    if (repeat === null) {
      let id = await TrackPlayer.getCurrentTrack();
      dispatch(updateRepeat(id));
    } else {
      dispatch(updateRepeat(null));
    }
  }

  async function onPressFavorite(id, key) {
    await TrackPlayer.updateMetadataForTrack(trackData.id.toString(), {
      rating: 1,
    });
    let data = await TrackPlayer.getTrack(trackData.id.toString());
    setTrackData(data);
    const configJson = {
      fave_id: trackData.id,
      type: 3,
    };
    songFavorite(account, configJson);
    dispatch(updateCommand(true));
  }

  async function onPressUnfavorite(id, key) {
    await TrackPlayer.updateMetadataForTrack(trackData.id.toString(), {
      rating: 0,
    });
    let data = await TrackPlayer.getTrack(trackData.id.toString());
    setTrackData(data);
    const configJson = {
      fave_id: trackData.id,
      type: 3,
    };
    songUnfavorite(account, configJson);
    dispatch(updateCommand(true));
  }

  function onPressMore(item) {
    setShowModal(true);
  }

  function toggleOptionModal() {
    setShowModal(!showModal);
  }

  async function onPressNext() {
    try {
      dispatch(updateRepeat(null));
      await TrackPlayer.skipToNext();
    } catch (error) {}
  }

  async function onPressPrevious() {
    try {
      dispatch(updateRepeat(null));
      await TrackPlayer.skipToPrevious();
    } catch (error) {
      console.log('no more prev');
    }
  }

  async function onPressLyrics() {
    setShowLyrics(!showLyrics);
  }

  async function onPressShuffle() {
    dispatch(updateRepeat(null));
    let trackList = await TrackPlayer.getQueue();
    const copy = [...trackList];
    const shuffleData = shuffle(copy);

    shuffleData.forEach((item, index) => {
      shuffleData[index].index = index;
    });

    await TrackPlayer.reset();
    await TrackPlayer.add([...shuffleData]);
    await TrackPlayer.play();
    dispatch(
      updateIds({
        index: 0,
        trackListUID: ids.trackListUID,
        trackList: shuffleData,
      }),
    );
  }

  function shuffle(array) {
    var currentIndex = array.length,
      temporaryValue,
      randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex !== 0) {
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

  function updatePlaylist(playlist) {
    dispatch(updateUserPlaylist(playlist));
  }

  if (trackData === null) {
    return null;
  }

  let useBackGround = trackData.dominant_color;
  if (trackData.dominant_color.length < 6) {
    const zeros = (6 - trackData.dominant_color.length) * '0';
    useBackGround = zeros + trackData.dominant_color;
  } else if (trackData.dominant_color !== null) {
    useBackGround = trackData.dominant_color;
  }
  let backgroundColor = '#' + useBackGround;
  let invertedColor = '#' + invertColor(useBackGround);
  return (
    <LinearGradient
      colors={[backgroundColor, '#909FA4']}
      locations={[0, 1]}
      style={styles.maxContainer}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={() => pressExpand()}>
          <Back width={DEVICE_WIDTH * 0.04} height={DEVICE_HEIGHT * 0.04} />
        </TouchableOpacity>
        {trackData.lyrics !== null && (
          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={() => onPressLyrics()}>
            <LyricsInactive
              width={DEVICE_HEIGHT * 0.04}
              height={DEVICE_HEIGHT * 0.04}
            />
          </TouchableOpacity>
        )}
      </View>
      {showLyrics === false ? (
        <ScrollView>
          <View style={styles.carouselContainer}>
            {trackList && carouselFirstIndex !== null && (
              <CarouselComp
                trackList={trackList}
                onScrollCarousel={onScrollCarousel}
                firstItemIndex={carouselFirstIndex}
                ref={carouselRef}
              />
            )}
          </View>
          <View style={styles.rowContainer}>
            <FavoriteButton />
            <View style={styles.marqueeContainer}>
              <MarqueeText
                style={[styles.maxTitle, {color: invertedColor}]}
                duration={5000}
                marqueeOnStart
                loop
                marqueeDelay={1000}
                marqueeResetDelay={1000}>
                {trackData.title}
              </MarqueeText>
              <MarqueeText
                style={[styles.maxArtist, {color: invertedColor}]}
                duration={5000}
                marqueeOnStart
                loop
                marqueeDelay={1000}
                marqueeResetDelay={1000}>
                {trackData.artist}
              </MarqueeText>
            </View>
            <MoreButton />
          </View>
          <SeekBar trial={trackData.trial} songID={trackData.id} />
          <View style={styles.rowContainer}>
            {!trackData.trial && (
              <TouchableOpacity
                onPress={() => onPressShuffle()}
                style={styles.button}>
                <ShuffleInactive
                  width={DEVICE_WIDTH * 0.05}
                  height={DEVICE_HEIGHT * 0.05}
                />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => onPressPrevious()}
              style={styles.button}>
              <Previous
                width={DEVICE_WIDTH * 0.05}
                height={DEVICE_HEIGHT * 0.05}
              />
            </TouchableOpacity>
            {PlayButton()}
            <TouchableOpacity
              onPress={() => onPressNext()}
              style={styles.button}>
              <Next width={DEVICE_WIDTH * 0.05} height={DEVICE_HEIGHT * 0.05} />
            </TouchableOpacity>
            <RepeatButton />
          </View>
          {trackData.lyrics !== null && (
            <View
              style={[
                styles.lyricsContainer,
                {marginLeft: DEVICE_WIDTH * 0.05},
              ]}>
              <Text style={[styles.lyricsHeader, {color: invertedColor}]}>
                Lyrics
              </Text>

              <Text style={[styles.lyrics, {color: invertedColor}]}>
                {trackData.lyrics}
              </Text>
            </View>
          )}
        </ScrollView>
      ) : (
        <ScrollView>
          <View
            style={[styles.lyricsContainer, {marginLeft: DEVICE_WIDTH * 0.05}]}>
            <Text style={[styles.lyricsHeader, {color: invertedColor}]}>
              Lyrics
            </Text>

            <Text style={[styles.lyrics, {color: invertedColor}]}>
              {trackData.lyrics}
            </Text>
          </View>
        </ScrollView>
      )}
      <Modal
        isVisible={showModal}
        onBackdropPress={() => toggleOptionModal()}
        hideModalContentWhileAnimating={true}>
        <PlayerSongOption
          data={trackData}
          updateUserPlaylist={(playlist) =>
            dispatch(updateUserPlaylist(playlist))
          }
          account={account}
          cancel={toggleOptionModal}
          onPressFavorite={onPressFavorite}
          props={{data: trackData, account, playlist}}
        />
      </Modal>
    </LinearGradient>
  );
});

const CarouselComp = React.forwardRef(
  ({trackList, onScrollCarousel, firstItemIndex}, ref) => {
    console.log(ref);
    return (
      <View>
        <Carousel
          ref={ref}
          data={trackList}
          renderItem={carouselItem}
          sliderWidth={SLIDER_WIDTH}
          itemWidth={ITEM_WIDTH}
          firstItem={firstItemIndex}
          scrollEnabled={true}
          swipeThreshold={1}
          onSnapToItem={(slideIndex) => onScrollCarousel(slideIndex)}
        />
      </View>
    );
  },
);

const carouselItem = ({item}) => {
  return <BigTile data={item} />;
};

const styles = StyleSheet.create({
  //max UI
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
    marginTop: DEVICE_HEIGHT * 0.05,
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
});
