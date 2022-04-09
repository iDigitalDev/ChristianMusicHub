import React, {Component} from 'react';

import {StyleSheet, View, Image, Text} from 'react-native';
import {DEVICE_HEIGHT, DEVICE_WIDTH} from '../constants/constants';
import Like from '../assets/svg/like.svg';
import {URL} from '../constants/apirUrls';
import FastImage from 'react-native-fast-image';

export default class BigTile extends Component {
  renderTileImageStyle = (type) => {
    switch (type) {
      case 'artist':
        return styles.artistTile;
      case 'album':
        return styles.albumTile;
      case 'playlist':
        return styles.playListTile;
      default:
        return;
    }
  };

  renderTileLabelStyle = (type, data) => {
    let label = data.label;
    switch (type) {
      //featured screen
      case 0:
        return <Text style={styles.label_0}>{label}</Text>;

      //artists screen
      case 1:
        let favorites = data.favorites;
        return (
          <View style={{alignItems: 'center'}}>
            <Text style={styles.label_1}>{label}</Text>
            <View style={styles.row}>
              <Like
                width={DEVICE_WIDTH * 0.02}
                height={DEVICE_HEIGHT * 0.02}
                style={{marginRight: DEVICE_WIDTH * 0.02}}
              />

              <Text style={styles.favorites}>{favorites}</Text>
            </View>
          </View>
        );

      //albums screen
      case 2:
        let artist = data.artist_name;
        return (
          <View style={{alignItems: 'center'}}>
            <Text style={styles.label_1}>{label}</Text>
            <View style={styles.row}>
              <Text style={styles.artist}>{artist}</Text>
            </View>
          </View>
        );
      default:
        return;
    }
  };

  render() {
    let {data, onPressTile} = this.props;
    let tileType = data.type;
    let is_ad = data.is_ad;
    let labelType = data.labelType;
    let imageName = data.image;
    let tileImageStyle = this.renderTileImageStyle(tileType);
    let tileLabelStyle = this.renderTileLabelStyle(labelType, data);
    let uri = URL.IMAGE + imageName;

    return (
      <View style={tileImageStyle}>
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
        {is_ad === true ? (
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
            resizeMode={FastImage.resizeMode.cover}
          />
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  //tile
  mainTile: {
    height: DEVICE_HEIGHT * 0.23,
    width: DEVICE_WIDTH * 0.7,
    paddingLeft: DEVICE_WIDTH * 0.03,
    marginBottom: DEVICE_HEIGHT * 0.02,
  },
  artistTile: {
    height: DEVICE_WIDTH * 0.7,
    width: DEVICE_WIDTH * 0.7,
    backgroundColor: 'white',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    overflow: 'hidden',
  },
  albumTile: {
    height: DEVICE_WIDTH * 0.7,
    width: DEVICE_WIDTH * 0.7,
    backgroundColor: 'white',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  playListTile: {
    height: DEVICE_HEIGHT * 0.15,
    width: DEVICE_WIDTH * 0.3,
    backgroundColor: 'white',
    borderTopLeftRadius: 5,
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
  image: {
    width: '100%',
    height: '100%',
  },

  gradient: {
    height: '100%',
    width: '100%',
    borderRadius: DEVICE_WIDTH * 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
