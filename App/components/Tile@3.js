import React, {Component} from 'react';

import {StyleSheet, Image, View, TouchableOpacity, Text} from 'react-native';
import {
  DEVICE_HEIGHT,
  DEVICE_WIDTH,
  GRADIENT_COLOR_SET_3,
} from '../constants/constants';
import Like from '../assets/svg/like.svg';
import LinearGradient from 'react-native-linear-gradient';
import {color} from 'react-native-reanimated';

export default class Tile3 extends Component {
  renderTileImageStyle = (type) => {
    switch (type) {
      case 'artist':
        return styles.artistTile;
      case 'album':
        return styles.albumTile;
      case 'playlist':
        return styles.playlistTile;

      default:
        return;
    }
  };

  renderTileLabelStyle = (type, data) => {
    // let label = data.label;
    let label = data.title;

    let favorites = data.favorites;
    switch (type) {
      case 0:
        return <Text style={styles.label_0}>{label}</Text>;
      case 1:
        return (
          <View style={{alignItems: 'center'}}>
            <Text numberOfLines={1} style={styles.label_1}>
              {label}
            </Text>
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
      default:
        return;
    }
  };

  renderLinear = (colorArray, key) => {
    return (
      <LinearGradient
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        // colors={GRADIENT_COLOR_SET_3.COLORS}
        colors={colorArray}
        // locations={GRADIENT_COLOR_SET_3.LOCATIONS}
        style={styles.gradient}
      />
    );
  };
  render() {
    let {data, onPressTile, i} = this.props;
    const {color_1, color_2, color_3, name} = data;
    let colorArray = [];
    if (color_3 !== '') {
      colorArray = ['#' + color_1, '#' + color_2, '#' + color_3];
    } else {
      colorArray = ['#' + color_1, '#' + color_2];
    }
    return (
      <TouchableOpacity
        style={styles.mainTile}
        onPress={() => onPressTile(data)}>
        {/* <Image
          source={{
            uri:
              'https://i.pinimg.com/236x/ec/56/ca/ec56ca390e5ec94b35f48729be88c266.jpg',
          }}
          style={styles.image}
        /> */}
        {this.renderLinear(colorArray, i)}
        <Text style={styles.label}>{name}</Text>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  //tile
  mainTile: {
    height: DEVICE_HEIGHT * 0.15,
    width: DEVICE_WIDTH * 0.42,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 5,
    marginBottom: DEVICE_HEIGHT * 0.02,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: DEVICE_WIDTH * 0.02,
    backgroundColor: 'white',
  },
  gradient: {
    height: DEVICE_HEIGHT * 0.15,
    width: DEVICE_WIDTH * 0.42,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 5,
    position: 'absolute',
    // borderTopLeftRadius: 5,
    // borderTopRightRadius: 30,
  },
  image: {
    height: DEVICE_HEIGHT * 0.15,
    width: DEVICE_WIDTH * 0.42,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 5,
  },
  label: {
    fontSize: DEVICE_HEIGHT * 0.02,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
  },
});
