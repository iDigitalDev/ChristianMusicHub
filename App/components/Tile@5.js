import React, {Component} from 'react';

import {StyleSheet, Image, View, TouchableOpacity, Text} from 'react-native';
import {DEVICE_HEIGHT, DEVICE_WIDTH} from '../constants/constants';
import Like from '../assets/svg/like.svg';
import {URL} from '../api/service/urls';
import FastImage from 'react-native-fast-image';

export default class Tile extends Component {
  renderTileImageStyle = (type) => {
    switch (type) {
      case 'artist':
        return styles.artistTile;
      case 'album':
        return styles.albumTile;
      case 'playlist':
        return styles.playListTile;
      case 'song':
        return styles.songTile;
      default:
        return;
    }
  };

  render() {
    let {data} = this.props;
    let tileImageType = data.type;
    let tileImageStyle = this.renderTileImageStyle(tileImageType);
    let imageName = data.image;
    let uri = URL.IMAGE + imageName;
    return (
      <View style={styles.mainTile}>
        <View style={tileImageStyle}>
          {imageName === undefined || imageName === null ? (
            <Image
              source={require('../assets/images/cmh_logo_play.png')}
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
              source={{
                uri,
              }}
              style={styles.image}
              // resizeMode={'cover'}
              resizeMode={FastImage.resizeMode.cover}
            />
          )}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  //tile
  mainTile: {},
  artistTile: {
    height: DEVICE_HEIGHT * 0.09,
    width: DEVICE_HEIGHT * 0.09,
    backgroundColor: 'white',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    overflow: 'hidden',
  },
  albumTile: {
    height: DEVICE_HEIGHT * 0.09,
    width: DEVICE_HEIGHT * 0.09,
    backgroundColor: 'white',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    overflow: 'hidden',
  },
  playListTile: {
    height: DEVICE_HEIGHT * 0.09,
    width: DEVICE_HEIGHT * 0.09,
    backgroundColor: 'white',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 5,
    overflow: 'hidden',
  },
  songTile: {
    height: DEVICE_WIDTH * 0.1,
    width: DEVICE_WIDTH * 0.1,
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },

  //label
  label_0: {
    fontSize: DEVICE_HEIGHT * 0.02,
    fontFamily: 'Montserrat-Regular',
    color: '#FFFFFF',
    textAlign: 'left',
    marginTop: DEVICE_HEIGHT * 0.01,
  },
  label_1: {
    fontSize: DEVICE_HEIGHT * 0.02,
    fontFamily: 'Montserrat-Regular',
    color: '#FFFFFF',
    textAlign: 'left',
    marginTop: DEVICE_HEIGHT * 0.01,
  },
  favorites: {
    fontSize: DEVICE_HEIGHT * 0.015,
    fontFamily: 'Montserrat-Regular',
    color: '#FFFFFF',
    textAlign: 'left',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  row: {
    flexDirection: 'row',
    marginTop: DEVICE_HEIGHT * 0.01,
  },

  gradient: {
    height: '100%',
    width: '100%',
    borderRadius: DEVICE_WIDTH * 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
