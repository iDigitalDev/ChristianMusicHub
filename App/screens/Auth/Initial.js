import React, {Component} from 'react';
import NetInfo from '@react-native-community/netinfo';

import RNBackgroundDownloader from 'react-native-background-downloader';
import {
  AppleButton,
  appleAuth,
} from '@invertase/react-native-apple-authentication';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Image,
  ImageBackground,
  Platform,
  Linking,
} from 'react-native';
import {
  connectAsync,
  setPurchaseListener,
  finishTransactionAsync,
  IAPResponseCode,
  getProductsAsync,
  purchaseItemAsync,
} from 'expo-in-app-purchases';
import {Loading} from '../../components/Loading';
import {login, premium} from '../../redux/actions/account';
import {
  addToSavedList,
  offline,
  initFinished,
  updateDownloadedSongIds,
  updateDownloadedData,
} from '../../redux/actions/app';
import {
  updatePlaylistUpdateCounter,
  updatePlaying,
  updateShowPlayer,
} from '../../redux/actions/player';
import {connect} from 'react-redux';

import RNRestart from 'react-native-restart';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {LoginButton, AccessToken, LoginManager} from 'react-native-fbsdk';
import {
  LOGIN_BG,
  GRADIENT_COLOR_SET_2,
  DEVICE_HEIGHT,
  DEVICE_WIDTH,
} from '../../constants/constants';
import {URL} from '../../constants/apirUrls';
import {POST, GET, GET_WITH_BODY} from '../../api/service/service';
import NormalButton from '../../components/NormalButton';
import GradientButton from '../../components/GradientButton';
import BackgroundTimer from 'react-native-background-timer';
import {getUniqueId} from 'react-native-device-info';
import admob, {MaxAdContentRating} from '@react-native-firebase/admob';
import firebase from '@react-native-firebase/app';
import {OFFLINE_ALERT} from '../../components/CMH';
import {
  InterstitialAd,
  RewardedAd,
  BannerAd,
  TestIds,
  BannerAdSize,
} from '@react-native-firebase/admob';
class Initial extends Component {
  constructor(props) {
    super(props);
    this.state = this._getState();
  }

  _getState = () => ({
    showLogin: false,
    loading: true,
    showOfflineModal: false,
  });
  async componentDidMount() {
    NetInfo.fetch().then((networkState) => {
      console.log('Connection type - ', networkState.type);
      console.log('Is connected? - ', networkState.isConnected);

      //check if offline or online mode
      if (networkState.isConnected === true) {
        // this.startOffline();
        this.start();
        // this.loadCache();
        // this.props.navigation.navigate('Main');
        // alert('no connection starting in offline mode');
      } else {
        this.startOffline();
      }
    });
  }

  async start() {
    const firebaseConfig = {
      apiKey: 'AIzaSyBb3-LN3yRX7pD1eI8ER_eKYhbNYtnV4ps',
      storageBucket: 'christian-music-hub-8e3b2.appspot.com',
      appId:
        Platform.OS === 'android'
          ? '1:528239853991:android:09c7297aa72a73a08cf682'
          : '1:528239853991:ios:09c7297aa72a73a08cf682',
      authDomain: '',
      databaseURL: '',
      messagingSenderId: '',
      projectId: 'christian-music-hub-8e3b2',
    };
    let firebaseApp;

    if (!firebase.apps.length) {
      firebaseApp = await firebase.initializeApp(firebaseConfig);
    } else {
      firebase.app(); // if already initialized, use that one
    }
    console.log(firebaseApp);
    admob()
      .setRequestConfiguration({
        maxAdContentRating: MaxAdContentRating.PG,

        tagForChildDirectedTreatment: true,

        tagForUnderAgeOfConsent: true,
      })
      .then((result) => {
        console.log(result);
      });

    let lostTasks = await RNBackgroundDownloader.checkForExistingDownloads();
    for (let task of lostTasks) {
      console.log(`Task ${task.id} was found!`);
      task
        .progress((percent) => {
          console.log(`Downloaded: ${percent * 100}%`);
        })
        .done(() => {
          console.log('Downlaod is done!');
        })
        .error((error) => {
          console.log('Download canceled due to error: ', error);
        });
    }
    const cachedDownloadedSongIds = await AsyncStorage.getItem(
      '@cachedDownloadedSongIds',
    );
    if (cachedDownloadedSongIds !== null) {
      const arr = cachedDownloadedSongIds.split(',').map((x) => +x);
      this.props.updateDownloadedSongIds({arr: arr, type: 'init'});
    } else {
      console.log('empty');
    }
    const cachedDownloadedData = await AsyncStorage.getItem(
      '@cachedDownloadedData',
    );
    if (cachedDownloadedData !== null) {
      const downloadedData = JSON.parse(cachedDownloadedData);

      this.props.updateDownloadedData({data: downloadedData, type: 'init'});
    } else {
      console.log('empty');
    }
    this.loadCache();
    await connectAsync();
  }

  async startOffline() {
    const cachedDownloadedSongIds = await AsyncStorage.getItem(
      '@cachedDownloadedSongIds',
    );
    if (cachedDownloadedSongIds !== null) {
      const arr = cachedDownloadedSongIds.split(',').map((x) => +x);
      this.props.updateDownloadedSongIds({arr: arr, type: 'init'});
    } else {
      console.log('empty');
    }
    const cachedDownloadedData = await AsyncStorage.getItem(
      '@cachedDownloadedData',
    );
    if (cachedDownloadedData !== null) {
      const downloadedData = JSON.parse(cachedDownloadedData);

      this.props.updateDownloadedData({data: downloadedData, type: 'init'});
    } else {
      console.log('empty');
    }
    const cacheUser = await AsyncStorage.getItem('@cacheUser');
    if (cacheUser !== null) {
      const object = JSON.parse(cacheUser);
      this.props.login(object);

      if (object.is_premium === 0) {
        this.setState({
          showLogin: true,
          loading: false,
          showOfflineModal: true,
        });
      } else {
        this.props.offline(false);
        this.props.premium(true);
        this.props.navigation.navigate('Main');
      }
    } else {
      console.log('No cache data found');
      this.setState({
        showLogin: true,
        loading: false,
        showOfflineModal: true,
      });
    }
  }

  async loadCache() {
    console.log('load cache');
    try {
      const cacheUser = await AsyncStorage.getItem('@cacheUser');
      if (cacheUser !== null) {
        const object = JSON.parse(cacheUser);
        this.props.login(object);
        const {user_id} = object;

        let data = {user_id};
        let url = URL.IS_PREMIUM;

        const receiver = (response) => {
          const {status} = response;
          if (status === true) {
            this.props.offline(false);
            this.props.premium(true);
            this.props.navigation.navigate('Main');
          } else {
            this.props.offline(false);
            this.props.premium(false);
            this.props.navigation.navigate('Main');
            // this.props.navigation.navigate('Trial');
          }
        };

        let payload = {
          data,
          url,
          receiver,
        };
        GET_WITH_BODY(payload);

        // this.props.navigation.navigate('Main');
        // this.props.navigation.navigate('Trial');
      } else {
        console.log('No cache data found');
        this.setState({
          showLogin: true,
          loading: false,
        });
      }
    } catch (error) {
      console.log('No cache data found');
      this.setState({
        showLogin: true,
        loading: false,
      });
    }
  }

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

  getType(url) {
    if (url.includes('album')) {
      return 'album';
    } else if (url.includes('artist')) {
      return 'artist';
    } else if (url.includes('song')) {
      return 'song';
    } else if (url.includes('playlist')) {
      return 'playlist';
    }
  }

  onPressRegister = () => {
    this.props.navigation.push('Register');
  };

  onPressLogin = () => {
    // LoginManager.logOut();
    this.props.navigation.push('Login');
  };

  onPressGuest = () => {
    // return;
    this.setState({
      isLoading: true,
    });
    let device_id = getUniqueId();
    let email = 'guest@cmh.com';
    let password = 'qqww1122';
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
          type: 'guest',
          photo,
        };
        this.saveCache(propData);
        this.props.login(propData);

        if (Platform.OS === 'android') {
          Linking.getInitialURL().then((linkUrl) => {
            this.navigate(linkUrl);
          });
        } else {
          // Linking.addEventListener('url', this.handleOpenURL);
        }
        this.props.offline(false);
        this.props.premium(false);
        this.props.navigation.navigate('Main');
      } else {
        console.log(response);
      }
    };

    let payload = {
      data,
      url,
      receiver,
    };
    POST(payload);
  };

  socialLogin = (details, accessToken) => {
    let device_id = getUniqueId();
    console.log(details);
    let {id, name, birthday, gender, first_name, last_name, email} = details;
    let data = {
      user_name: name,
      birthday,
      gender,
      user_id: id,
      is_social: true,
      device_id,
      first_name,
      last_name,
      email: email,
      accessToken,
    };
    console.log(data);
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
          username,
          is_premium,
          photo,
        };
        this.saveCache(propData);
        this.props.login(propData);
        if (is_premium === 1) {
          this.props.premium(true);
          this.props.offline(false);
          this.props.navigation.push('Main');
        } else {
          this.props.premium(false);
          this.props.offline(false);
          this.props.navigation.push('Main');
        }
        // this.props.navigation.push('Trial');
      } else {
        this.setState({
          loading: false,
        });
        alert(response.message);
      }
    };

    let payload = {
      data,
      url,
      receiver,
    };
    POST(payload);
  };

  async saveCache(data) {
    const cacheUser = JSON.stringify(data);
    await AsyncStorage.setItem('@cacheUser', cacheUser);
  }

  stopLoading = () => {
    this.setState({
      loading: false,
    });
  };
  handleFacebookLogin = async () => {
    this.setState({
      loading: true,
    });
    const _this = this.socialLogin;
    const _stopLoading = this.stopLoading;
    LoginManager.logInWithPermissions([
      "email",
      "public_profile",
      "user_friends"
    ]).then(function(result) {
        if (result.isCancelled) {
          _stopLoading();
          console.log("Login cancelled");
        } else {
          console.log("Login success with permissions: " + result.grantedPermissions.toString());
          AccessToken.getCurrentAccessToken().then(data => {
            const { accessToken } = data;
            console.log(data);
            fetch("https://graph.facebook.com/v9.0/me?fields=email,id,name,gender,birthday,first_name,last_name,friends&access_token=" + accessToken)
              .then(response => response.json())
              .then(json => {
                console.log("-----");
                console.log(json);
                _this(json, accessToken);
              })
              .catch(e => {
                console.log(e);
                alert(e);
                // reject('ERROR GETTING DATA FROM FACEBOOK');
              });
          });
        }
      }, function(error) {
        console.log("Login fail with error: " + error);
      });
  };

  onAppleButtonPress = async () => {
    // performs login request
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    });

    console.log(appleAuthRequestResponse);

    let device_id = getUniqueId();

    let data = {
      user_name: null,
      birthday: null,
      gender: null,
      user_id: appleAuthRequestResponse.user,
      is_social: true,
      device_id,
      first_name: appleAuthRequestResponse.fullName.givenName,
      last_name: appleAuthRequestResponse.fullName.familyName,
      email: appleAuthRequestResponse.email,
      accessToken: null,
      apple: appleAuthRequestResponse,
    };
    console.log('------------------------');
    console.log(data);
    console.log('------------------------');
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
          username,
          is_premium,
          photo,
        };
        this.saveCache(propData);
        this.props.login(propData);
        if (is_premium === 1) {
          this.props.premium(true);
          this.props.offline(false);
          this.props.navigation.push('Main');
        } else {
          this.props.premium(false);
          this.props.offline(false);
          this.props.navigation.push('Main');
        }
        // this.props.navigation.push('Trial');
      } else {
        this.setState({
          loading: false,
        });
        alert(response.message);
        console.log(response.message);
      }
    };

    let payload = {
      data,
      url,
      receiver,
    };
    POST(payload);

    // // get current authentication state for user
    // // /!\ This method must be tested on a real device. On the iOS simulator it always throws an error.
    // const credentialState = await appleAuth.getCredentialStateForUser(
    //   appleAuthRequestResponse.user,
    // );

    // alert('3');
    // // use credentialState response to ensure the user is authenticated
    // if (credentialState === appleAuth.State.AUTHORIZED) {
    //   // user is authenticated
    // }
  };

  initUser = (token) => {
    fetch(
      'https://graph.facebook.com/v9.0/me?fields=email,id,name,friends&access_token=' +
        token,
    )
      .then((response) => response.json())
      .then((json) => {
        // Some user object has been set up somewhere, build that user here
        // user.name = json.name;
        // user.id = json.id;
        // user.user_friends = json.friends;
        // user.email = json.email;
        // user.username = json.name;
        // user.loading = false;
        // user.loggedIn = true;
        // user.avatar = setAvatar(json.id);
        console.log(json);
      })
      .catch(() => {
        reject('ERROR GETTING DATA FROM FACEBOOK');
      });
  };

  render() {
    const {loading} = this.state;
    return loading ? (
      <Loading />
    ) : (
      <View style={styles.mainContainer}>
        <ImageBackground source={LOGIN_BG} style={styles.ImageBackground}>
          <OFFLINE_ALERT
            isShow={this.state.showOfflineModal}
            msg={'You are offline. Please Check your network connection'}
            yes={() => RNRestart.Restart()}
            option1={'Restart'}
            option2={'oy'}
          />
          <Image
            source={require('../../assets/images/cmh_logo.png')}
            style={styles.logo}
            resizeMode={'contain'}
          />

          {Platform.OS === 'ios' && (
            <GradientButton
              buttonColor={GRADIENT_COLOR_SET_2}
              buttonText={'Continue As Guest'}
              buttonTextColor={'#FFFFFF'}
              marginBottom={DEVICE_HEIGHT * 0.02}
              buttonPress={this.onPressGuest}
            />
          )}

          <GradientButton
            buttonColor={GRADIENT_COLOR_SET_2}
            buttonText={'Sign In'}
            buttonTextColor={'#FFFFFF'}
            marginBottom={DEVICE_HEIGHT * 0.02}
            buttonPress={this.onPressLogin}
          />
          <NormalButton
            buttonColor={'transparent'}
            buttonText={'Sign Up'}
            buttonTextColor={'#FFFFFF'}
            buttonPress={this.onPressRegister}
            // buttonPress={() => {
            //   LoginManager.logOut();
            // }}
            borderColor={'#FFFFFF'}
          />
          <TouchableOpacity
            onPress={() => this.handleFacebookLogin()}
            style={styles.fbButton}>
            <Text style={styles.fb}>Sign in with Facebook</Text>
          </TouchableOpacity>

          {Platform.OS === 'ios' && (
            <View style={styles.AppleButton}>
              <AppleButton
                buttonStyle={AppleButton.Style.WHITE}
                buttonType={AppleButton.Type.SIGN_IN}
                style={{
                  width: DEVICE_WIDTH * 0.7,
                  height: DEVICE_HEIGHT * 0.07,
                  borderRadius: DEVICE_WIDTH * 0.1,
                }}
                onPress={() => this.onAppleButtonPress()}
              />
            </View>
          )}
          {/* <LoginButton
            onLoginFinished={(error, result) => {
              if (error) {
                console.log('login has error: ' + result.error);
              } else if (result.isCancelled) {
                console.log('login is cancelled.');
              } else {
                AccessToken.getCurrentAccessToken().then((data) => {
                  const {accessToken} = data;
                  console.log(data);
                  this.initUser(accessToken);
                });
              }
            }}
            onLogoutFinished={() => console.log('logout.')}
          /> */}
        </ImageBackground>
      </View>
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
  },
  logo: {
    // width: DEVICE_WIDTH * 0.8,
    height: DEVICE_WIDTH * 0.25,
    marginBottom:
      Platform.OS === 'ios' ? DEVICE_HEIGHT * 0.1 : DEVICE_HEIGHT * 0.15,
    marginTop: DEVICE_HEIGHT * 0.25,
  },
  fbButton: {
    width: DEVICE_WIDTH * 0.7,
    height: DEVICE_HEIGHT * 0.07,
    borderRadius: DEVICE_WIDTH * 0.1,
    backgroundColor: '#4267B2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: DEVICE_HEIGHT * 0.02,
  },
  AppleButton: {
    width: DEVICE_WIDTH * 0.7,
    height: DEVICE_HEIGHT * 0.07,
    borderRadius: DEVICE_WIDTH * 0.1,
    overflow: 'hidden',
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fb: {
    fontSize: DEVICE_HEIGHT * 0.024,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-SemiBold',
  },
});

const mapStateToProps = (state) => {
  return {
    account: state.accountReducer.account,
    isLogin: state.accountReducer.isLogin,
    playList: state.playerReducer.playList,
    flag: state.playerReducer.flag,
    playlistUpdateCounter: state.playerReducer.playlistUpdateCounter,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    login: (payload) => dispatch(login(payload)),
    updatePlaylistUpdateCounter: (payload) =>
      dispatch(updatePlaylistUpdateCounter(payload)),
    updatePlaying: (payload) => dispatch(updatePlaying(payload)),
    updateShowPlayer: (payload) => dispatch(updateShowPlayer(payload)),
    addToSavedList: (payload) => dispatch(addToSavedList(payload)),
    premium: (payload) => dispatch(premium(payload)),
    offline: (payload) => dispatch(offline(payload)),
    initFinished: (payload) => dispatch(initFinished(payload)),
    updateDownloadedSongIds: (payload) =>
      dispatch(updateDownloadedSongIds(payload)),
    updateDownloadedData: (payload) => dispatch(updateDownloadedData(payload)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Initial);
