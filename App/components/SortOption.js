import React, {Component} from 'react';

import {StyleSheet, View, FlatList, TouchableOpacity, Text} from 'react-native';
import {DEVICE_HEIGHT, DEVICE_WIDTH} from '../constants/constants';
import Check from '../assets/svg/check.svg';

export default class SortOption extends Component {
  constructor(props) {
    super(props);
    this.state = {
      date: false,
      alphabet: false,
      number: false,
    };
  }

  renderCircle = (state) => {
    if (!state) {
      return (
        <View style={styles.circle}>
          <View style={styles.innerCircle} />
        </View>
      );
    }
    return <Check width={DEVICE_WIDTH * 0.07} height={DEVICE_WIDTH * 0.07} />;
  };

  onPressType = (type) => {
    const {onPressSort, cancel} = this.props;
    onPressSort(type);
    cancel();
  };

  render() {
    const {alphabet, number, date} = this.props;
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Sorting</Text>
        <TouchableOpacity
          style={styles.row}
          onPress={() => this.onPressType('date')}>
          {this.renderCircle(date)}
          <Text style={styles.type}>Date Added</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.row}
          onPress={() => this.onPressType('alphabet')}>
          {this.renderCircle(alphabet)}
          <Text style={styles.type}>A-Z</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.row}
          onPress={() => this.onPressType('number')}>
          {this.renderCircle(number)}
          <Text style={styles.type}>Number of Songs</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#151d27',
    height: DEVICE_HEIGHT * 0.4,
    borderRadius: DEVICE_HEIGHT * 0.02,
  },
  row: {
    flexDirection: 'row',
    marginLeft: DEVICE_WIDTH * 0.05,
    marginBottom: DEVICE_HEIGHT * 0.04,
  },
  header: {
    fontSize: DEVICE_HEIGHT * 0.03,
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'Montserrat-Bold',
    marginBottom: DEVICE_HEIGHT * 0.05,
    marginTop: DEVICE_HEIGHT * 0.03,
  },
  type: {
    fontSize: DEVICE_HEIGHT * 0.03,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    textAlign: 'left',
    marginLeft: DEVICE_WIDTH * 0.03,
  },
  circle: {
    borderRadius: DEVICE_WIDTH * 0.07,
    height: DEVICE_WIDTH * 0.07,
    width: DEVICE_WIDTH * 0.07,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    borderRadius: DEVICE_WIDTH * 0.065,
    height: DEVICE_WIDTH * 0.065,
    width: DEVICE_WIDTH * 0.065,
    backgroundColor: '#151d27',
  },
});
