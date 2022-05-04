import React, {Component} from 'react';

import {StyleSheet, View, TextInput, KeyboardAvoidingView} from 'react-native';
import {
  DEVICE_HEIGHT,
  DEVICE_WIDTH,
  GRADIENT_COLOR_SET_2,
} from '../constants/constants';
export default class Input extends Component {
  constructor(props) {
    super(props);
    this.state = this._getState();
  }

  _getState = () => ({
    borderColor: '#FFFFFF',
  });

  componentDidMount() {
    this.setBorderColor();
  }

  setBorderColor = () => {
    const {inputState} = this.props;
    switch (inputState) {
      case 'default':
        this.setState({
          borderColor: '#4b4b4b',
        });
        break;
      case 'typing':
        this.setState({
          borderColor: '#2DCEEF',
        });
        break;
      case 'invalid':
        this.setState({
          borderColor: '#E23636',
        });
        break;
      case 'valid':
        this.setState({
          borderColor: '#82DD55',
        });
        break;
      default:
        break;
    }
  };

  componentDidUpdate(newProps) {
    if (newProps.inputState !== this.props.inputState) {
      this.setBorderColor();
    }
  }

  onBlur = () => {
    const {borderColor} = this.state;
    // if (borderColor === '#2c99aa') {
    this.setBorderColor();
    // }
  };

  render() {
    const {
      placeHolder,
      inputUpdate,
      marginBottom,
      security,
      value,
      enable,
      type,
      maxLength,
    } = this.props;

    const {borderColor} = this.state;

    // let borderColor = this.setBorderColor();
    let inputStyle = {
      ...styles.inputBox,
      ...{borderColor: borderColor, marginBottom: marginBottom},
    };
    return (
      <TextInput
        ref={(r) => {
          this._textInputRef = r;
        }}
        style={inputStyle}
        maxLength={maxLength !== null ? maxLength : null}
        // placeholder={placeHolder}
        // placeholderTextColor={'gray'}
        editable={enable}
        onChangeText={(username) => inputUpdate(username)}
        secureTextEntry={security}
        value={value}
        keyboardType={type ? type : 'default'}
        // onFocus={() =>
        //   this.setState({
        //     borderColor: '#2c99aa',
        //   })
        // }
        // onBlur={() => this.onBlur()}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: DEVICE_HEIGHT * 0.1,
    backgroundColor: 'red',
  },
  inputBox: {
    height: DEVICE_HEIGHT * 0.07,
    width: DEVICE_WIDTH * 0.85,
    borderRadius: DEVICE_WIDTH * 0.02,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    paddingLeft: DEVICE_WIDTH * 0.03,
    borderWidth: 1,
    // fontSize: DEVICE_HEIGHT * 0.025,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Regular',
  },
});
