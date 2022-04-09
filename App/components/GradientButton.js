import React, {Component} from 'react';

import {StyleSheet, View, TouchableOpacity, Text} from 'react-native';
import {
  DEVICE_HEIGHT,
  DEVICE_WIDTH,
  GRADIENT_COLOR_SET_2,
} from '../constants/constants';
import LinearGradient from 'react-native-linear-gradient';

export default class GradientButton extends Component {
  render() {
    let {
      buttonColor,
      buttonPress,
      buttonText,
      buttonTextColor,
      marginBottom,
      width,
    } = this.props;
    let buttonStyle = {};
    if (width !== undefined) {
      buttonStyle = {
        ...styles.button,
        ...{backgroundColor: buttonColor, marginBottom: marginBottom, width},
      };
    } else {
      buttonStyle = {
        ...styles.button,
        ...{backgroundColor: buttonColor, marginBottom: marginBottom},
      };
    }

    let textStyle = {
      ...styles.text,
      ...{color: buttonTextColor, fontFamily: 'Montserrat-SemiBold'},
    };
    return (
      <TouchableOpacity style={buttonStyle} onPress={() => buttonPress()}>
        <LinearGradient
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          colors={buttonColor.COLORS}
          locations={buttonColor.LOCATIONS}
          style={styles.gradient}>
          <Text style={textStyle}>{buttonText}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    height: DEVICE_HEIGHT * 0.07,
    width: DEVICE_WIDTH * 0.7,
    borderRadius: DEVICE_WIDTH * 10,
    // borderWidth: 1,
    // borderColor: 'white',
  },
  text: {
    fontSize: DEVICE_HEIGHT * 0.024,
  },
  gradient: {
    height: '100%',
    width: '100%',
    borderRadius: DEVICE_WIDTH * 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
