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
        return styles.playlistTile;
      case 'userPlaylist':
        return styles.playlistTile;

      default:
        return;
    }
  };

  renderTileLabelStyle = (type, data) => {
    // let label = data.label;
    let {name, favorites} = data;

    switch (type) {
      case 0:
        return <Text style={styles.label_0}>{name}</Text>;
      case 1:
        return (
          <View style={styles.labelView}>
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
      default:
        return;
    }
  };

  render() {
    let {data, onPressTile} = this.props;
    let tileImageType = data.type;
    let tileLabelType = data.labelType;
    let imageName = data.image;
    let uri = URL.IMAGE + imageName;
    let tileImageStyle = this.renderTileImageStyle(tileImageType);
    let tileLabelStyle = this.renderTileLabelStyle(tileLabelType, data);
    return (
      <TouchableOpacity
        style={styles.mainTile}
        onPress={() => onPressTile(data)}>
        <View style={tileImageStyle}>
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
    width: DEVICE_WIDTH * 0.45,
    marginBottom: DEVICE_HEIGHT * 0.07,
    marginLeft: DEVICE_WIDTH * 0.035,
    // overflow: 'hidden',
  },
  artistTile: {
    height: DEVICE_HEIGHT * 0.23,
    width: DEVICE_WIDTH * 0.42,
    backgroundColor: 'white',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  albumTile: {
    height: DEVICE_HEIGHT * 0.23,
    width: DEVICE_WIDTH * 0.42,
    backgroundColor: 'white',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },

  playlistTile: {
    height: DEVICE_WIDTH * 0.42,
    width: DEVICE_WIDTH * 0.42,
    backgroundColor: 'white',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 5,
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
  labelView: {
    paddingLeft: DEVICE_WIDTH * 0.02,
  },
});
