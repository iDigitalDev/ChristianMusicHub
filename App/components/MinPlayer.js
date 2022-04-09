import React, {useState, useEffect} from 'react';

import {StyleSheet, View, ActivityIndicator, Image} from 'react-native';
import MarqueeText from 'react-native-marquee';
import {DEVICE_HEIGHT, DEVICE_WIDTH} from '../constants/constants';
import FastImage from 'react-native-fast-image';
import {invertColor} from './Helpers';
import TrackPlayer, {useTrackPlayerEvents} from 'react-native-track-player';
import BackgroundTimer from 'react-native-background-timer';

import {
  updatePlaying,
  updateExpanded,
  updateIds,
} from '../redux/actions/player';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {URL} from '../constants/apirUrls';
import {POST} from '../api/service/service';

import {useDispatch, useSelector} from 'react-redux';
const events = [
  'playback-state',
  'playback-track-changed',
  'remote-next',
  'remote-previous',
  'playback-queue-ended',
  'remote-pause',
  'remote-play',
];

export const MinPlayer = React.memo((props) => {
  console.log('------------------');
  console.log('Rendered Min Player');

  var testTimer = null;

  //local states
  const [trackData, setTrackData] = useState(null);

  //used for dispatching redux
  const dispatch = useDispatch();

  //redux variables
  const playing = useSelector((state) => state.playerReducer.playing);
  const ids = useSelector((state) => state.playerReducer.ids);
  const expanded = useSelector((state) => state.playerReducer.expanded);
  const account = useSelector((state) => state.accountReducer.account);
  const repeat = useSelector((state) => state.accountReducer.repeat);

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

        setTrackData(queue[ids.index]);
      }
    }
    getQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, ids]);

  useTrackPlayerEvents(events, async (event) => {
    // console.log('Event: ', event.type);
    switch (event.type) {
      case 'remote-next':
        try {
          await TrackPlayer.skipToNext();
        } catch (error) {
          console.log('no more next songs');
        }

        break;

      case 'remote-previous':
        try {
          await TrackPlayer.skipToPrevious();
        } catch (error) {
          console.log('no more prev songs');
        }

        break;

      case 'playback-queue-ended':
        // dispatch(updatePlaying(2));
        break;

      case 'remote-pause':
        TrackPlayer.pause();
        break;

      case 'remote-play':
        TrackPlayer.play();
        break;

      case 'playback-track-changed':
        if (event.nextTrack && event.track) {
          let currentTrack = await TrackPlayer.getTrack(event.nextTrack);

          //index
          let index = currentTrack.index;

          //queue
          let queue = await TrackPlayer.getQueue();

          //queue ID
          let queueID = currentTrack.uid;

          dispatch(updateIds({index, queue, queueID}));
        }
        break;

      case 'playback-state':
        console.log(event.state);
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
            dispatch(updatePlaying(2));
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
    dispatch(updateExpanded(true));
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

  function pressPlay() {
    playing === 1 ? TrackPlayer.pause() : TrackPlayer.play();
  }

  //render
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

  const image =
    trackData.is_ad === true
      ? require('../assets/images/cmh_logo_play.png')
      : {uri: URL.IMAGE + trackData.image};

  return (
    <View
      style={
        trackData.trial
          ? [
              styles.minContainer,
              {backgroundColor, bottom: DEVICE_HEIGHT * 0.01},
            ]
          : [styles.minContainer, {backgroundColor}]
      }>
      <View style={styles.imageContainer}>
        <TouchableOpacity onPress={() => pressExpand()}>
          <FastImage
            source={image}
            style={styles.image}
            resizeMode={FastImage.resizeMode.cover}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <TouchableOpacity onPress={() => pressExpand()}>
          <MarqueeText
            style={[styles.minTitle, {color: invertedColor}]}
            duration={5000}
            marqueeOnStart
            loop
            marqueeDelay={1000}
            marqueeResetDelay={1000}>
            {trackData.title}
          </MarqueeText>
          <MarqueeText
            style={[styles.minArtist, {color: invertedColor}]}
            duration={5000}
            marqueeOnStart
            loop
            marqueeDelay={1000}
            marqueeResetDelay={1000}>
            {trackData.artist}
          </MarqueeText>
        </TouchableOpacity>
      </View>
      <View style={styles.playButtonContainer}>
        <PlayButton playing={playing} />
      </View>
    </View>
  );
});

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
    flex: 4,
    justifyContent: 'center',
  },
  playButtonContainer: {
    flex: 1,
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
});
