import React, {Component} from 'react';

import {StyleSheet, View, Image, TouchableOpacity, Text} from 'react-native';
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

  renderTileLabelStyle = (type, data) => {
    let {name} = data;
    switch (type) {
      //featured screen
      case 0:
        return (
          <Text numberOfLines={1} style={styles.label_0}>
            {name}
          </Text>
        );

      //artists screen
      case 1:
        let favorites = data.favorites;
        return (
          <View style={styles.center}>
            <Text numberOfLines={1} style={styles.label_1}>
              {name}
            </Text>
            <View style={styles.row}>
              <Like
                width={DEVICE_WIDTH * 0.02}
                height={DEVICE_HEIGHT * 0.02}
                style={{marginRight: DEVICE_WIDTH * 0.02}}
              />

              <Text style={styles.favorites}>
                {favorites === null ? 0 : favorites}
              </Text>
            </View>
          </View>
        );

      //albums screen
      case 2:
        let {artist} = data;
        return (
          <View style={styles.center}>
            <Text numberOfLines={1} style={styles.label_1}>
              {name}
            </Text>
            <View style={styles.row}>
              <Text numberOfLines={1} style={styles.artist}>
                {artist}
              </Text>
            </View>
          </View>
        );
      default:
        return;
    }
  };

  render() {
    let {data, onPressTile, customStyle} = this.props;
    let tileType = data.type;
    let labelType = data.labelType;
    let imageName = data.image;

    let tileImageStyle = this.renderTileImageStyle(tileType);
    let tileLabelStyle = this.renderTileLabelStyle(labelType, data);

    let uri = URL.IMAGE + imageName;
    // if (tileType === 'album' && data.name === 'Bayawon Ka') {
    //   console.log(data.name);
    //   console.log(imageName);
    //   console.log(uri);
    // }

    return (
      <TouchableOpacity
        style={[styles.mainTile, customStyle]}
        onPress={() => onPressTile(data)}>
        <View style={tileImageStyle}>
          {imageName === undefined ? (
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
          {/* <Image
            // source={require('../../assets/images/cmh_logo.png')}
            // source={{
            //   uri:
            //     'https://services.tineye.com/developers/img/meloncat.20c77523.jpg',
            // }}
            source={{
              uri,
            }}
            style={styles.image}
            resizeMode={'cover'}
          /> */}
        </View>
        {tileLabelStyle}
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  //tile
  mainTile: {
    height: DEVICE_WIDTH * 0.45,
    width: DEVICE_WIDTH * 0.33,
    marginLeft: DEVICE_WIDTH * 0.005,
    // overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  artistTile: {
    height: DEVICE_WIDTH * 0.3,
    width: DEVICE_WIDTH * 0.3,
    backgroundColor: 'white',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    overflow: 'hidden',
  },
  albumTile: {
    height: DEVICE_WIDTH * 0.3,
    width: DEVICE_WIDTH * 0.3,
    backgroundColor: 'white',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  playListTile: {
    height: DEVICE_WIDTH * 0.3,
    width: DEVICE_WIDTH * 0.3,
    backgroundColor: 'white',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  songTile: {
    height: DEVICE_WIDTH * 0.3,
    width: DEVICE_WIDTH * 0.3,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
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

  artist: {
    fontSize: DEVICE_HEIGHT * 0.015,
    fontFamily: 'Montserrat-Regular',
    color: '#FFFFFF',
    textAlign: 'left',
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

  center: {
    alignItems: 'center',
  },
});
