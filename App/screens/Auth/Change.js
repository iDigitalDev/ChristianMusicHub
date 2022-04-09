/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Image,
  ImageBackground,
  Button,
  Platform,
  TextInput,
} from 'react-native';
import {
  LOGIN_BG,
  CHM_LOGO_HEIGHT,
  CHM_LOGO_WIDTH,
  GRADIENT_COLOR_SET_2,
  DEVICE_HEIGHT,
  DEVICE_WIDTH,
} from '../../constants/constants';
import Back from '../../assets/svg/back.svg';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview';
import {GET, POST} from '../../api/service/service';
import {URL} from '../../api/service/urls';
import ImagePicker from 'react-native-image-picker';
import DropDownPicker from 'react-native-dropdown-picker';
import {ScrollView} from 'react-native-gesture-handler';
import Input from '../../components/Input';
import {CMH_ALERT_3} from '../../components/CMH';

export default class Change extends Component {
  constructor(props) {
    super(props);
    this.state = {
      enableButton: false,
      retypePassword: '',
      newPassword: '',
      data: props.route.params,
      passwordInputState: 'default',
      retypePasswordInputState: 'default',
      passwordErrorText: null,
      retypePasswordErrorText: null,
      showPromptModal: false,
      promptMessage: null,
    };
  }

  renderButton = () => {
    const {enableButton} = this.state;

    const style = enableButton
      ? [styles.button, {backgroundColor: '#66D5F7'}]
      : [styles.button, {backgroundColor: '#d5d5d5'}];

    return (
      <TouchableOpacity
        style={style}
        disabled={!enableButton}
        onPress={() => this.onPressDone()}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    );
  };

  createFormData = (photo, body) => {
    const data = new FormData();

    data.append('photo', {
      name: photo.fileName,
      type: photo.type,
      uri:
        Platform.OS === 'android'
          ? photo.uri
          : photo.uri.replace('file://', ''),
    });

    Object.keys(body).forEach((key) => {
      data.append(key, body[key]);
    });

    return data;
  };

  retypeValidatePassword = (password) => {
    if (password === this.state.newPassword) {
      return true;
    } else {
      return false;
    }
  };

  validatePassword = (password) => {
    // var passw = /^[A-Za-z]\w{7,14}$/;

    if (password.length < 7) {
      this.setState({
        passwordErrorText: 'Password must be at least 7 characters',
      });
      return false;
    }

    if (!password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)) {
      this.setState({
        passwordErrorText:
          'Password should contain both lower and uppercase characters',
      });
      return false;
    }

    if (!password.match(/([a-zA-Z])/) && password.match(/([0-9])/)) {
      this.setState({
        passwordErrorText: 'Password should contain a number',
      });
      return false;
    }
    return true;

    // if (password.match(passw)) {
    //   return true;
    // } else {
    //   return false;
    // }
  };

  onPressDone = () => {
    const {retypePassword, newPassword, data} = this.state;
    if (retypePassword !== newPassword) {
      // alert('Passwords mismatched');
      this.setState({
        showPromptModal: true,
        promptMessage: 'Password Mismatched',
      });
      return;
    }

    data.password = newPassword;

    let url = URL.CHANGE_PASSWORD;
    const receiver = (response) => {
      const {success} = response;
      if (success) {
        // alert('Sucessfully Changed Password');
        this.setState({
          showPromptModal: true,
          promptMessage: 'Successfully Changed Password',
        });
      } else {
        console.log(response);
        // alert(
        //   'You have entered the wrong answer to our security question. Please try again.',
        // );
        this.setState({
          showPromptModal: true,
          promptMessage:
            'You have entered the wrong answer to our security question. Please try again.',
        });
      }
    };

    let payload = {
      data,
      url,
      receiver,
    };
    POST(payload);
  };
  inputUpdate = (text, identifier) => {
    switch (identifier) {
      case 0:
        this.setState(
          {
            newPassword: text,
          },
          this.enableButton,
        );
        break;
      case 1:
        this.setState(
          {
            retypePassword: text,
          },
          this.enableButton,
        );
        break;
    }
  };

  password = (input) => {
    const valid = this.validatePassword(input);
    if (valid) {
      this.setState(
        {
          newPassword: input,
          passwordInputState: 'valid',
          enableRetype: true,
          passwordErrorText: null,
        },
        this.enableButton,
      );
    } else {
      this.setState(
        {
          newPassword: input,
          passwordInputState: 'invalid',
          enableRetype: false,
        },
        this.enableButton,
      );
    }
  };

  retypePassword = (input) => {
    const valid = this.retypeValidatePassword(input);
    if (valid) {
      this.setState(
        {
          retypePassword: input,
          retypePasswordInputState: 'valid',
          enableRetype: true,
        },
        this.enableButton,
      );
    } else {
      this.setState(
        {
          retypePassword: input,
          retypePasswordInputState: 'invalid',
          enableRetype: false,
        },
        this.enableButton,
      );
    }
  };

  enableButton = () => {
    const {newPassword, retypePassword} = this.state;

    if (newPassword !== '' && retypePassword !== '') {
      this.setState({
        enableButton: true,
      });
    } else {
      this.setState({
        enableButton: false,
      });
    }
  };
  render() {
    const {
      passwordInputState,
      newPassword,
      retypePassword,
      retypePasswordInputState,
    } = this.state;

    return (
      <KeyboardAwareScrollView style={{flex: 1}}>
        <ImageBackground source={LOGIN_BG} style={styles.ImageBackground}>
          <View style={styles.headerContainer}>
            <TouchableOpacity
              style={styles.backContainer}
              onPress={() => this.props.navigation.pop()}>
              <Back
                width={DEVICE_WIDTH * 0.025}
                height={DEVICE_HEIGHT * 0.025}
                style={styles.back}
              />
            </TouchableOpacity>
            <Text style={styles.headerText}>Security Questions</Text>
            <View />
          </View>
          <ScrollView>
            <Text style={styles.answerLabel}>New Password</Text>
            <Input
              borderColor={'#FFFFFF'}
              placeHolder={'Password'}
              inputUpdate={this.password}
              security={true}
              marginBottom={DEVICE_HEIGHT * 0.01}
              inputState={passwordInputState}
              value={newPassword}
            />
            <Text style={styles.errorText}>{this.state.passwordErrorText}</Text>

            <Text style={styles.answerLabel}>Retype New Password</Text>
            <Input
              borderColor={'#FFFFFF'}
              placeHolder={'Password'}
              inputUpdate={this.retypePassword}
              security={true}
              marginBottom={DEVICE_HEIGHT * 0.05}
              inputState={retypePasswordInputState}
              value={retypePassword}
            />

            {this.renderButton()}
            <CMH_ALERT_3
              isShow={this.state.showPromptModal}
              close={() =>
                this.setState(
                  {showPromptModal: false},
                  this.props.navigation.pop(2),
                )
              }
              yes={() => this.onSendEmail()}
              msg={this.state.promptMessage}
            />
          </ScrollView>
        </ImageBackground>
      </KeyboardAwareScrollView>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  ImageBackground: {
    flex: 1,
    resizeMode: 'cover',
    alignItems: 'center',
    height: DEVICE_HEIGHT * 1,
  },
  buttonText: {
    fontSize: DEVICE_HEIGHT * 0.03,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
  },
  backContainer: {
    height: DEVICE_WIDTH * 0.1,
    width: DEVICE_WIDTH * 0.1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropDown: {
    height: DEVICE_HEIGHT * 0.07,
    width: DEVICE_WIDTH * 0.85,
    borderRadius: DEVICE_WIDTH * 0.02,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    // marginTop: DEVICE_HEIGHT * 0.05,
    borderColor: '#4b4b4b',
    backgroundColor: 'transparent',
  },
  answer: {
    height: DEVICE_HEIGHT * 0.07,
    width: DEVICE_WIDTH * 0.85,
    borderRadius: DEVICE_WIDTH * 0.02,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: DEVICE_HEIGHT * 0.02,
    borderColor: '#4b4b4b',
    backgroundColor: 'transparent',
    padding: 0,
    paddingLeft: DEVICE_WIDTH * 0.03,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Regular',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  questionLabel: {
    fontSize: DEVICE_HEIGHT * 0.025,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Regular',
    width: DEVICE_WIDTH * 0.85,
    marginBottom: DEVICE_HEIGHT * 0.02,
  },
  answerLabel: {
    fontSize: DEVICE_HEIGHT * 0.025,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Regular',
    width: DEVICE_WIDTH * 0.85,
    marginBottom: DEVICE_HEIGHT * 0.02,
    marginTop: DEVICE_HEIGHT * 0.02,
  },
  logo: {
    // width: DEVICE_WIDTH * 0.8,
    height: DEVICE_WIDTH * 0.25,
    marginBottom: DEVICE_HEIGHT * 0.3,
    marginTop: DEVICE_HEIGHT * 0.25,
  },
  headerContainer: {
    flexDirection: 'row',
    width: DEVICE_WIDTH * 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: DEVICE_WIDTH * 0.03,
    marginBottom: DEVICE_HEIGHT * 0.035,
    marginTop: DEVICE_HEIGHT * 0.035,
  },
  headerText: {
    fontSize: DEVICE_HEIGHT * 0.033,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
  },
  button: {
    height: DEVICE_HEIGHT * 0.08,
    width: DEVICE_WIDTH * 0.85,
    borderRadius: DEVICE_WIDTH * 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: DEVICE_HEIGHT * 0.02,
    marginBottom: DEVICE_HEIGHT * 0.03,
  },
  errorText: {
    fontSize: DEVICE_HEIGHT * 0.015,
    color: 'red',
    fontFamily: 'Montserrat-Regular',
    width: DEVICE_WIDTH * 0.85,
    marginBottom: DEVICE_HEIGHT * 0.01,
  },
});
