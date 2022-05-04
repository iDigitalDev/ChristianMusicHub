import React, {Component} from 'react';

import {StyleSheet, View, TouchableOpacity, Image} from 'react-native';
import {DEVICE_HEIGHT, DEVICE_WIDTH} from '../constants/constants';
import Like from '../assets/svg/like.svg';
import {URL} from '../constants/apirUrls';

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
    let {data, onPressTile} = this.props;
    let tileImageType = data.type;
    let imageName = data.image;
    let uri = URL.IMAGE + imageName;
    let tileImageStyle = this.renderTileImageStyle(tileImageType);
    return (
      <TouchableOpacity
        style={styles.mainTile}
        onPress={() => onPressTile(data)}>
        <View style={tileImageStyle}>
          <Image
            source={{
              uri,
            }}
            style={styles.image}
            resizeMode={'cover'}
          />
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  //tile
  mainTile: {},
  artistTile: {
    height: DEVICE_WIDTH * 0.15,
    width: DEVICE_WIDTH * 0.15,
    backgroundColor: 'white',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    overflow: 'hidden',
  },
  albumTile: {
    height: DEVICE_WIDTH * 0.15,
    width: DEVICE_WIDTH * 0.15,
    backgroundColor: 'white',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
  },
  songTile: {
    height: DEVICE_WIDTH * 0.15,
    width: DEVICE_WIDTH * 0.15,
    backgroundColor: 'white',
    borderRadius: DEVICE_WIDTH * 0.04,
    overflow: 'hidden',
  },
  playListTile: {
    height: DEVICE_WIDTH * 0.15,
    width: DEVICE_WIDTH * 0.15,
    backgroundColor: 'white',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
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
  image: {
    width: '100%',
    height: '100%',
  },
});
