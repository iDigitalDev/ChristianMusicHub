import React, {Component} from 'react';

import {StyleSheet, View, TouchableOpacity, Text} from 'react-native';
import {DEVICE_HEIGHT, DEVICE_WIDTH} from '../constants/constants';

export default class AlbumTile extends Component {
  render() {
    let {data, labelType, onPressTile} = this.props;
    let label = data.label;
    return (
      <TouchableOpacity
        style={styles.mainTile}
        onPress={() => onPressTile(data)}>
        <View style={styles.imageTile}></View>
        <Text style={styles.label}>{label}</Text>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  mainTile: {
    height: DEVICE_HEIGHT * 0.2,
    width: DEVICE_WIDTH * 0.33,
    paddingLeft: DEVICE_WIDTH * 0.03,
  },
  imageTile: {
    height: DEVICE_HEIGHT * 0.15,
    width: DEVICE_WIDTH * 0.3,
    backgroundColor: 'white',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  label: {
    fontSize: DEVICE_HEIGHT * 0.02,
    fontFamily: 'Montserrat-Regular',
    color: '#FFFFFF',
    textAlign: 'left',
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
