import React, {Component} from 'react';

import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';

import Slider from '@react-native-community/slider';
import {DEVICE_HEIGHT, DEVICE_WIDTH} from '../constants/constants';
import TrackPlayer, {useProgress} from 'react-native-track-player';
import BackgroundTimer from 'react-native-background-timer';

var currentSongID = null;
var playTimer;

var currentSecondCount = 0;
var currentElapsed = null;

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
const handleChange = (val) => {
  TrackPlayer.seekTo(val);
};

const startTimer = () => {
  playTimer = setTimeout(function () {
    alert('Hello');
    stopTimer();
  }, 3000);
};

const stopTimer = () => {
  console.log('clear timer');
  clearTimeout(playTimer);
};

export const Timer = BackgroundTimer.setTimeout(async () => {
  // this will be executed once after 10 seconds
  // even when app is the the background
  // console.log('tac');
  //   let songID = await TrackPlayer.getCurrentTrack();
  //   let trackData = await TrackPlayer.getTrack(songID);
  //   console.log('id:');
  //   console.log(trackData.id);
}, 5000);

// export default Timer;

const styles = StyleSheet.create({
  slider: {
    marginTop: -12,
  },
  container: {
    paddingTop: 16,
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
