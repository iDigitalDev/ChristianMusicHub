import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  ImageBackground,
  Text,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  TouchableOpacityComponent,
  Platform,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getUniqueId} from 'react-native-device-info';
import qs from 'qs';

import {
  LOGIN_BG,
  GRADIENT_COLOR_SET_2,
  DEVICE_HEIGHT,
  DEVICE_WIDTH,
} from '../../constants/constants';

import GradientButton from '../../components/GradientButton';
import {CMH_ALERT_3} from '../../components/CMH';
import Input from '../../components/Input';

//redux
import {connect} from 'react-redux';
import {login, premium} from '../../redux/actions/account';
import {offline} from '../../redux/actions/app';

import {Loading} from '../../components/Loading';

//api
import {POST} from '../../api/service/service';
import {URL} from '../../constants/apirUrls';

import Back from '../../assets/svg/back.svg';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = this._getState();
  }

  _getState = () => ({
    email: '',
    password: '',
    // email: 'dev.apps.code@gmail.com',
    // password: 'qweqweqwe',
    // email: 'dev.apps.code@gmail.com',
    // password: 'Devvvvvv',
    emailInputState: 'default',
    passwordInputState: 'default',
    isLoading: false,
    prompt: null,
    showPromptModal: false,
  });

  validateEmail = (mail) => {
    if (
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
        mail,
      )
    ) {
      return true;
    }
    return false;
  };

  validatePassword = (password) => {
    var passw = /^[A-Za-z]\w{7,14}$/;
    if (password.match(passw)) {
      return true;
    } else {
      return false;
    }
  };

  async saveCache(data) {
    const cacheUser = JSON.stringify(data);
    await AsyncStorage.setItem('@cacheUser', cacheUser);
  }

  onSendEmail = async () => {
    let url = `mailto:${'info@christianmusichub.net'}`;

    const query = qs.stringify({
      subject: 'Reset',
      // cc: 'Christian Music Hub Feedback',
      // bcc: 'Christian Music Hub Feedback',
    });

    if (query.length) {
      url += `?${query}`;
    }

    // check if we can use this link
    const canOpen = await Linking.canOpenURL(url);

    if (!canOpen) {
      throw new Error('Provided URL can not be handled');
    }

    Linking.openURL(url);
    this.props.navigation.pop();
  };

  navigate = (url) => {
    if (url === null) {
      return;
    }
    console.log(url);

    const urlParts = url.split('/');

    console.log(urlParts);

    const type = urlParts[3];
    const id = urlParts[4];

    let {push} = this.props.navigation;
    if (type === 'artist') {
      push('ArtistInfo', {id});
    } else if (type === 'album') {
      push('AlbumInfo', {id});
    } else if (type === 'song') {
      const id2 = urlParts[5];
      push('SongInfo', {song_id: id, album_id: id2});
    } else if (type === 'playlist') {
      push('PlaylistInfo', {id});
    }

    // if (routeName === 'people') {
    //   navigate('People', {id, name: 'chris'});
    // }
  };

  onPressLogin = () => {



    this.setState({
      isLoading: true,
    });
    let device_id = getUniqueId();
    let {email, password} = this.state;
    let data = {email, password, is_social: false, device_id};
    let url = URL.LOGIN;

    const receiver = (response) => {
      const {status} = response;
      if (status === true) {
        const {access_token, user_id, username, is_premium, photo} = response;
        const authToken = access_token;
        let propData = {
          ...data,
          user_id,
          authToken,
          is_premium,
          username,
          photo,
        };
        this.saveCache(propData);
        this.props.login(propData);

        if (is_premium) {
          // Linking.addEventListener('url', callback);

          if (Platform.OS === 'android') {
            Linking.getInitialURL().then((linkUrl) => {
              this.navigate(linkUrl);
            });
          } else {
            // Linking.addEventListener('url', this.handleOpenURL);
          }
          this.props.premium(true);
          this.props.offline(false);
          this.props.navigation.navigate('Main');
        } else {
          this.props.premium(false);
          this.props.offline(false);
          this.props.navigation.navigate('Main');
        }
      } else {
        console.log(response);
        const {message} = response;
        let promptMessage = null;
        console.log(message);
        if (message === 'The given data was invalid.') {
          promptMessage = 'Invalid Credentials';
        } else if (message === 'login limit') {
          promptMessage = `You have exceeded the 3 logins for your devices. Please log out of the others to free up your limit. 

          If you have lost access to your device and wish to have your limit reset, please click below and we’ll be happy to help you.`;
        } else {
          promptMessage = message;
        }

        this.setState({
          emailInputState: 'invalid',
          passwordInputState: 'invalid',
          email: '',
          password: '',
          isLoading: false,
          prompt: promptMessage,
          showPromptModal: true,
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

  email = (input) => {
    const valid = this.validateEmail(input);
    if (valid) {
      this.setState({
        email: input,
        emailInputState: 'valid',
      });
    } else {
      this.setState({
        email: input,
        emailInputState: 'invalid',
      });
    }
  };

  password = (input) => {
    const valid = this.validatePassword(input);
    if (valid) {
      this.setState({
        password: input,
        passwordInputState: 'valid',
        enableRetype: true,
      });
    } else {
      this.setState({
        password: input,
        passwordInputState: 'invalid',
        enableRetype: false,
      });
    }
  };

  onPressForgot = () => {
    const {push} = this.props.navigation;
    push('Forgot');
  };

  componentDidMount() {}

  render() {
    const {
      passwordInputState,
      emailInputState,
      email,
      password,
      isLoading,
      showPromptModal,
      prompt,
    } = this.state;

    if (isLoading === true) {
      return <Loading />;
    }
    return (
      <KeyboardAwareScrollView style={{flex: 1, backgroundColor: 'black'}}>
        <ImageBackground source={LOGIN_BG} style={styles.ImageBackground}>
          <TouchableOpacity
            style={styles.backContainer}
            onPress={() => this.props.navigation.navigate('Initial')}>
            <Back
              marginTop={Platform.OS === 'ios' ? DEVICE_HEIGHT * 0.1 : 0}
              width={DEVICE_WIDTH * 0.03}
              height={DEVICE_HEIGHT * 0.03}
            />
          </TouchableOpacity>
          <Image
            source={require('../../assets/images/cmh_logo.png')}
            style={styles.logo}
            resizeMode={'contain'}
          />
          <Text style={styles.labelText}>Your email</Text>
          <Input
            borderColor={'#FFFFFF'}
            placeHolder={'Email address'}
            inputUpdate={this.email}
            marginBottom={DEVICE_HEIGHT * 0.03}
            inputState={emailInputState}
            value={email}
          />
          <Text style={styles.labelText}>Your password</Text>
          <Input
            borderColor={'#FFFFFF'}
            placeHolder={'Password'}
            inputUpdate={this.password}
            security={true}
            marginBottom={DEVICE_HEIGHT * 0.1}
            inputState={passwordInputState}
            value={password}
          />

          <GradientButton
            buttonColor={GRADIENT_COLOR_SET_2}
            buttonText={'Sign In'}
            buttonTextColor={'#FFFFFF'}
            marginBottom={DEVICE_HEIGHT * 0.01}
            buttonPress={this.onPressLogin}
          />
          <TouchableOpacity onPress={() => this.onPressForgot()}>
            <Text style={styles.forgot}>forgot password?</Text>
          </TouchableOpacity>
        </ImageBackground>
        <CMH_ALERT_3
          isShow={showPromptModal}
          close={() => this.setState({showPromptModal: false})}
          yes={() => this.onSendEmail()}
          msg={prompt}
        />
      </KeyboardAwareScrollView>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  ImageBackground: {
    height: DEVICE_HEIGHT * 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    height: DEVICE_WIDTH * 0.25,

    marginTop: DEVICE_HEIGHT * 0.1,
    marginBottom: DEVICE_HEIGHT * 0.1,
  },
  labelText: {
    fontSize: DEVICE_HEIGHT * 0.02,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    width: DEVICE_WIDTH * 0.85,
    marginBottom: DEVICE_HEIGHT * 0.01,
  },
  forgot: {
    fontSize: DEVICE_HEIGHT * 0.015,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    width: DEVICE_WIDTH * 0.85,
    textAlign: 'center',
    marginTop: DEVICE_HEIGHT * 0.02,
  },
  backContainer: {
    position: 'absolute',
    top: DEVICE_HEIGHT * 0.02,
    left: DEVICE_WIDTH * 0.05,
    height: DEVICE_WIDTH * 0.1,
    width: DEVICE_WIDTH * 0.1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const mapStateToProps = (state) => {
  return {
    account: state.accountReducer.account,
    premium: state.accountReducer.premium,
    isLogin: state.accountReducer.isLogin,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    login: (payload) => dispatch(login(payload)),
    premium: (payload) => dispatch(premium(payload)),
    offline: (payload) => dispatch(offline(payload)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
