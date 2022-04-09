import React, {Component} from 'react';

import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';

import Slider from '@react-native-community/slider';
import {DEVICE_HEIGHT, DEVICE_WIDTH} from '../constants/constants';

const formatTime = (secs) => {
  let minutes = Math.floor(secs / 60);
  let seconds = Math.ceil(secs - minutes * 60);

  if (seconds < 10) {
    seconds = '0' + seconds;
  }
  if (minutes < 0) {
    minutes = 0;
    seconds = '00';
  }
  return minutes + ':' + seconds;
};
const handleChange = async (val, playbackInstance) => {
  playbackInstance.setPositionAsync(val, {
    toleranceMillisBefore: val,
    toleranceMillisAfter: val,
  });
};

function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}

const SeekBar = ({position, duration, playbackInstance}) => {
  // const {position, duration} = useProgress();
  let elapsed = '0:00';
  let remaining = '0:00';
  if (position !== undefined && duration !== undefined) {
    elapsed = millisToMinutesAndSeconds(position);

    remaining = millisToMinutesAndSeconds(duration - position);
  }

  return (
    <View style={styles.container}>
      <Slider
        maximumValue={duration}
        // onSlidingStart={onSlidingStart}
        onSlidingComplete={(val) => handleChange(val, playbackInstance)}
        value={position}
        style={styles.slider}
        minimumTrackTintColor="#0EAFE1"
        maximumTrackTintColor="#FFFFFF"
        thumbTintColor="#0EAFE1"
        thumbStyle={styles.thumb}
        trackStyle={styles.track}
      />
      <View style={styles.timeContainer}>
        <Text style={styles.text}>{elapsed}</Text>
        <View style={{flex: 1}} />
        <Text style={styles.text}>{remaining}</Text>
      </View>
    </View>
  );
};

export default SeekBar;

const styles = StyleSheet.create({
  slider: {},
  container: {
    paddingTop: DEVICE_HEIGHT * 0.03,
    paddingHorizontal: DEVICE_WIDTH * 0.04,
    marginBottom: DEVICE_HEIGHT * 0.02,
  },
  timeContainer: {
    flexDirection: 'row',
    paddingHorizontal: DEVICE_WIDTH * 0.04,
  },
  track: {
    height: 2,
    borderRadius: 1,
  },
  thumb: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'yellow',
  },
  text: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontSize: DEVICE_HEIGHT * 0.015,
    textAlign: 'center',
  },
});
