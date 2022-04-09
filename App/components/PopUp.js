import React, {Component} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Toast from 'react-native-easy-toast';
import {DEVICE_HEIGHT, DEVICE_WIDTH} from '../constants/constants';

class PopUp extends Component {
  renderMessage = (message) => <Text style={styles.toastText}>{message}</Text>;

  show = (message, duration, callback) => {
    if (typeof duration === 'undefined') {
      duration = 100000;
    }

    if (typeof callback === 'undefined') {
      callback = () => {};
    }

    this.toast.show(this.renderMessage(message), duration, callback);
  };

  render() {
    return (
      <Toast ref={(ref) => (this.toast = ref)} style={styles.toastContainer} />
    );
  }
}

const styles = StyleSheet.create({
  toastContainer: {
    height: DEVICE_HEIGHT * 0.25,
    width: DEVICE_HEIGHT * 0.25,
    paddingVertical: DEVICE_HEIGHT * 0.03,
    paddingHorizontal: DEVICE_WIDTH * 0.04,
    backgroundColor: 'red',
    borderRadius: DEVICE_HEIGHT * 0.02,
    bottom: DEVICE_HEIGHT,
    justifyContent: 'center',
  },
  toastText: {
    textAlign: 'center',
    color: 'white',
  },
});

export default PopUp;
