import React, {Component} from 'react';
import RNRestart from 'react-native-restart';
import GradientButton from '../../components/GradientButton';
import * as SecureStore from 'expo-secure-store';
import {
  connectAsync,
  setPurchaseListener,
  finishTransactionAsync,
  IAPResponseCode,
  getProductsAsync,
  purchaseItemAsync,
} from 'expo-in-app-purchases';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  TextInput,
  WebView,
  Alert,
  Image,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

// import {WebView} from '@react-native-community/react-native-webview';
import {
  GRADIENT_COLOR_SET_1,
  DEVICE_HEIGHT,
  DEVICE_WIDTH,
} from '../../constants/constants';
import Back from '../../assets/svg/back.svg';
import Diamond from '../../assets/svg/diamond.svg';
import Sort from '../../assets/svg/Sort.svg';
import More from '../../assets/svg/more.svg';
import SortOption from '../../components/SortOption';
import {LoginButton, AccessToken, LoginManager} from 'react-native-fbsdk';

import Tile from '../../components/Tile@5';
import Modal, {ModalContent} from 'react-native-modal';

import {CMH_ALERT} from '../../components/CMH';

//redux
import {connect} from 'react-redux';
import {updateIsFinished} from '../../redux/actions/app';
import {updateShowPlayer} from '../../redux/actions/player';

//api
import {POST} from '../../api/service/service';
import {URL} from '../../api/service/urls';

import {update} from '../../redux/actions/app';

//api
import {
  initializeAppData,
  updateSpecificAppData,
} from '../../api/service/actions';
import {ScrollView} from 'react-native-gesture-handler';
import {Loading} from '../../components/Loading';

class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      username: null,
      photo: null,
      showLogoutModal: false,
      showClearModal: false,
      showModal: false,
      showSignUpModal: false,
    };
  }

  async saveCache() {
    await AsyncStorage.removeItem('@cacheUser');
  }

  onPressLogout = async () => {
    this.setState({
      showLogoutModal: true,
    });
  };

  logout = async () => {
    this.setState({
      isLoading: true,
    });
    let url = URL.LOG_OUT;
    let {user_id, authToken} = this.props.account;
    let data = {user_id};

    const receiver = async (response) => {
      const {status} = response;
      if (status === true) {
        LoginManager.logOut();

        this.saveCache();
        RNRestart.Restart();
      } else {
        console.log(response);
      }
    };

    let payload = {
      data,
      url,
      receiver,
      authToken,
    };
    POST(payload);
  };

  getUserInfo = () => {
    this.setState({
      isLoading: true,
    });
    let {user_id, authToken} = this.props.account;
    console.log(this.props.account);
    let data = {user_id};
    let url = URL.PROFILE;

    const receiver = (response) => {
      const {success} = response;
      if (success) {
        const {user} = response;
        const {username, photo, email} = user[0];
        const formatPhoto = URL.IMAGE + 'profile/' + photo;
        this.setState({
          username,
          photo: formatPhoto,
          email: email,
          isLoading: false,
        });
      } else {
        alert('failed to load user information');
      }
    };

    let payload = {
      data,
      url,
      receiver,
      authToken,
    };
    POST(payload);
  };

  onSubscribeSuccess = () => {
    let {user_id, authToken} = this.props.account;
    let data = {user_id};
    let url = URL.SUBSCRIBE_SUCCESS;

    const receiver = (response) => {};

    let payload = {
      data,
      url,
      receiver,
      authToken,
    };
    POST(payload);
  };

  onPressClear = () => {
    let {user_id, authToken} = this.props.account;
    let data = {user_id};
    let url = URL.CLEAR_RECENTLY_PLAYED;

    const receiver = (response) => {
      const {success} = response;
      if (success) {
        const {props} = this;
        initializeAppData(props);
        this.setState({
          showClearModal: false,
        });
      } else {
        alert('failed to clear recently played');
      }
    };

    let payload = {
      data,
      url,
      receiver,
      authToken,
    };
    POST(payload);
  };

  async componentDidMount() {
    if (this.props.offline === false) {
      this.getUserInfo();
    } else {
      let {username, photo, email} = this.props.account;
      this.setState({
        username,
        photo: photo,
        email: email,
        isLoading: false,
      });
    }
    try {
      // await connectAsync();
      // console.log('connected');
      setPurchaseListener(async ({responseCode, results, errorCode}) => {
        if (responseCode === IAPResponseCode.OK) {
          results.forEach(async (purchase) => {
            if (!purchase.acknowledged) {
              const {
                orderId,
                purchaseToken,
                acknowledged,
                transactionReceipt,
                productId,
              } = purchase;

              // in android, consumeItem should be set to false to acknowlege the purchase
              // in iOS this isn't needed because it's already specified in app store connect
              const consumeItem = Platform.OS === 'ios';

              await finishTransactionAsync(purchase, consumeItem);
              alert('subscribed');

              const token = await SecureStore.getItemAsync('user_token');

              // const instance = axios.create({
              //   baseURL: `${config.BASE_URL}/api`,
              //   timeout: 5000,
              //   headers: {Authorization: `Bearer ${token}`},
              // });

              // instance.post('/subscribe2', {
              //   orderId,
              //   purchaseToken,
              //   transactionReceipt,
              //   platform: Platform.OS,
              // });

              let {user_id, authToken} = this.props.account;
              let data = {
                user_id,
                orderId,
                purchaseToken,
                acknowledged,
                transactionReceipt,
                productId,
              };
              let url = URL.SUBSCRIBE_SUCCESS;

              const receiver = (response) => {
                if (response.successs === true) {
                  RNRestart.Restart();
                } else {
                  console.log('problem');
                }
              };

              let payload = {
                data,
                url,
                receiver,
                authToken,
              };
              POST(payload);
            }
          });
        } else {
          console.log('response code: ', responseCode);
          console.log('error code: ', errorCode);
          console.log('results:', results);
        }

        if (responseCode === IAPResponseCode.USER_CANCELED) {
          alert('You cancelled. Please try again.');
        } else if (responseCode === IAPResponseCode.DEFERRED) {
          alert(
            "You don't have permission to subscribe. Please use a different account.",
          );
        }
      });
    } catch (err) {
      alert('Error occurred: ' + JSON.stringify(err));
    }
  }

  subscribeAnnual = async () => {
    try {
      const items = Platform.select({
        ios: ['CMH_Subs'],
        android: ['annual'],
      });

      const subscription_plan =
        Platform.OS === 'android' ? 'annual' : 'CMH_Subs';

      const products = await getProductsAsync(items);

      if (products.results.length > 0) {
        // setSubscribeButtonLoading(false);
        await purchaseItemAsync(subscription_plan);
      } else {
        // setSubscribeButtonLoading(false);
      }
    } catch (err) {
      // setSubscribeButtonLoading(false);
      alert('error occured while trying to purchase: ' + err);
    }
  };

  subscribeQuarter = async () => {
    try {
      const items = Platform.select({
        ios: ['CMHQ'],
        android: ['quarterly'],
      });

      const subscription_plan =
        Platform.OS === 'android' ? 'quarterly' : 'CMHQ';

      const products = await getProductsAsync(items);

      if (products.results.length > 0) {
        // setSubscribeButtonLoading(false);
        await purchaseItemAsync(subscription_plan);
      } else {
        // setSubscribeButtonLoading(false);
      }
    } catch (err) {
      // setSubscribeButtonLoading(false);
      alert('error occured while trying to purchase: ' + err);
    }
  };

  onPressTerms = () => {
    this.props.navigation.push('WebView', {
      header: 'Terms and Conditions',
      link: 'https://www.christianmusichub.net/terms-and-conditions/',
    });
  };

  onPressPrivacy = () => {
    this.props.navigation.push('WebView', {
      header: 'Privacy Policy',
      link: 'https://www.christianmusichub.net/privacy-policy/',
    });
  };

  componentDidUpdate(newProps) {
    const {pop} = this.props.navigation;
    if (newProps.tabIndex !== this.props.tabIndex) {
      pop();
    }

    if (newProps.playList !== this.props.playList) {
      this.initData();
    }
  }

  onPressFeedback = () => {
    this.props.navigation.push('Feedback');
  };

  onPressSubscribe = () => {
    this.setState({
      showModal: true,
    });
  };

  onPressPay = (type) => {
    if (type === 0) {
      this.subscribeAnnual();
    } else {
      this.subscribeQuarter();
    }
    // this.setState(
    //   {
    //     showModal: false,
    //   },
    //   this.props.navigation.navigate('Get', {type: type}),
    // );
  };

  onPressSignUp = async () => {
    await AsyncStorage.removeItem('@cacheUser');
    RNRestart.Restart();
  };

  renderModal = () => {
    return (
      <View style={styles.modalContainer}>
        <TouchableOpacity
          style={styles.cancelContainer}
          onPress={() => this.setState({showModal: false})}>
          <Image
            style={styles.cancel}
            source={require('../../assets/images/cancel.png')}
          />
        </TouchableOpacity>
        <Text style={styles.modalHeader}>Say Goodbye to Ads!</Text>
        <Text style={styles.modalFont1}>Subscribe Now!</Text>
        <TouchableOpacity
          style={[
            styles.subscribeButton,
            {marginLeft: 0, marginTop: DEVICE_HEIGHT * 0.01},
          ]}
          onPress={() => this.onPressPay(0)}>
          <LinearGradient
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            colors={['#2DCEEF', '#8600FF']}
            locations={[0, 0.5]}
            style={styles.gradient}>
            <Text style={styles.subscribeText}>
              Annual Subscription | 350/year
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.subscribeButton,
            {
              marginLeft: 0,
              marginTop: DEVICE_HEIGHT * 0.02,
              marginBottom: DEVICE_HEIGHT * 0.04,
            },
          ]}
          onPress={() => this.onPressPay(1)}>
          <LinearGradient
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            colors={['#2DCEEF', '#E92667']}
            locations={[0, 0.5]}
            style={styles.gradient}>
            <Text style={styles.subscribeText}>
              Quarterly Subscription | 99/qtr
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };

  render() {
    const {
      username,
      photo,
      showLogoutModal,
      showClearModal,
      isLoading,
    } = this.state;
    // if (this.props.account.type === 'guest') {
    //   return (
    //     <LinearGradient
    //       colors={GRADIENT_COLOR_SET_1.COLORS}
    //       locations={GRADIENT_COLOR_SET_1.LOCATIONS}
    //       style={styles.mainContainer}>
    //       <View style={styles.header}>
    //         <TouchableOpacity
    //           onPress={() => this.props.navigation.pop()}
    //           style={styles.back}>
    //           <Back width={DEVICE_WIDTH * 0.03} height={DEVICE_HEIGHT * 0.03} />
    //         </TouchableOpacity>
    //         <Text style={styles.headerText}>Account Settings</Text>
    //         <View style={styles.back}></View>
    //       </View>
    //       <TouchableOpacity
    //         style={styles.subscribeButton}
    //         onPress={() => this.onPressSignIn()}>
    //         <LinearGradient
    //           start={{x: 0, y: 0}}
    //           end={{x: 1, y: 0}}
    //           colors={['#66D5F7', '#0EAFE1']}
    //           locations={[0, 0.5]}
    //           style={styles.gradient}>
    //           <Diamond
    //             width={DEVICE_WIDTH * 0.05}
    //             height={DEVICE_HEIGHT * 0.05}
    //             marginRight={DEVICE_WIDTH * 0.03}
    //           />

    //           <Text style={styles.subscribeText}>
    //             Sign In to Access this feature
    //           </Text>
    //         </LinearGradient>
    //       </TouchableOpacity>
    //     </LinearGradient>
    //   );
    // }
    if (isLoading === true) {
      return <Loading />;
    }
    const version = Platform.OS === 'android' ? 'Version 2' : 'Version 2';
    return (
      <LinearGradient
        colors={GRADIENT_COLOR_SET_1.COLORS}
        locations={GRADIENT_COLOR_SET_1.LOCATIONS}
        style={styles.mainContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => this.props.navigation.pop()}
            style={styles.back}>
            <Back width={DEVICE_WIDTH * 0.03} height={DEVICE_HEIGHT * 0.03} />
          </TouchableOpacity>
          <Text style={styles.headerText}>Account Settings</Text>
          <View style={styles.back}></View>
        </View>
        <ScrollView>
          {this.props.account.type !== 'guest' && (
            <View style={styles.topRow}>
              <View style={styles.image}>
                {photo && (
                  <Image
                    source={{
                      uri: photo,
                    }}
                    style={styles.profileImage}
                    resizeMode={'cover'}
                  />
                )}
              </View>
              <Text style={styles.name}>{username}</Text>
            </View>
          )}
          {this.props.premium === false && this.props.account.type !== 'guest' && (
            <TouchableOpacity
              style={styles.subscribeButton}
              onPress={() => this.onPressSubscribe()}>
              <LinearGradient
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                colors={['#66D5F7', '#0EAFE1']}
                locations={[0, 0.5]}
                style={styles.gradient}>
                <Diamond
                  width={DEVICE_WIDTH * 0.05}
                  height={DEVICE_HEIGHT * 0.05}
                  marginRight={DEVICE_WIDTH * 0.03}
                />

                <Text style={styles.subscribeText}>
                  Remove Ads. Subscribe Now
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
          <Text style={styles.big}>About</Text>
          <Text style={styles.small}>{version}</Text>
          <TouchableOpacity onPress={() => this.onPressTerms()}>
            <Text style={styles.small}>Terms and Conditions</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.onPressPrivacy()}>
            <Text style={styles.small}>Privacy Policy</Text>
          </TouchableOpacity>
          {this.props.offline === false && (
            <TouchableOpacity onPress={() => this.onPressFeedback()}>
              <Text style={styles.small}>Contact Us</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.big}>Others</Text>
          {this.props.account.type !== 'guest' && this.props.offline === false && (
            <TouchableOpacity
              onPress={() => this.setState({showClearModal: true})}>
              <Text style={styles.small}>Clear Recently Played</Text>
            </TouchableOpacity>
          )}
          {this.props.account.type === 'guest' && (
            <TouchableOpacity
              onPress={() => this.setState({showSignUpModal: true})}>
              <Text style={styles.small}>Sign Up</Text>
            </TouchableOpacity>
          )}
          {this.props.offline === false && (
            <TouchableOpacity
              onPress={() => this.setState({showLogoutModal: true})}>
              <Text style={styles.small}>Logout</Text>
            </TouchableOpacity>
          )}

          <View style={{height: DEVICE_HEIGHT * 0.15}}></View>
        </ScrollView>

        <CMH_ALERT
          isShow={showLogoutModal}
          yes={this.logout}
          no={() => this.setState({showLogoutModal: false})}
          msg={'Do you wish to logout?'}
        />

        <CMH_ALERT
          isShow={this.state.showSignUpModal}
          yes={this.onPressSignUp}
          no={() => this.setState({showSignUpModal: false})}
          msg={'Do you wish to Sign Up?'}
        />

        <CMH_ALERT
          isShow={showClearModal}
          yes={this.onPressClear}
          no={() => this.setState({showClearModal: false})}
          msg={'Do you want to clear recently played?'}
        />
        <Modal
          isVisible={this.state.showModal}
          onBackdropPress={() => this.setState({showModal: false})}
          hideModalContentWhileAnimating={true}>
          {this.renderModal()}
        </Modal>
      </LinearGradient>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingTop: DEVICE_HEIGHT * 0.05,
  },
  profileImage: {
    height: '100%',
    width: '100%',
  },
  name: {
    fontSize: DEVICE_HEIGHT * 0.03,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
  },
  big: {
    fontSize: DEVICE_HEIGHT * 0.03,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    marginHorizontal: DEVICE_WIDTH * 0.05,
    marginTop: DEVICE_HEIGHT * 0.05,
  },
  small: {
    fontSize: DEVICE_HEIGHT * 0.025,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Regular',
    marginHorizontal: DEVICE_WIDTH * 0.05,
    marginTop: DEVICE_HEIGHT * 0.03,
  },
  image: {
    height: DEVICE_HEIGHT * 0.15,
    width: DEVICE_HEIGHT * 0.15,
    borderTopLeftRadius: DEVICE_HEIGHT * 0.01,
    borderBottomRightRadius: DEVICE_HEIGHT * 0.01,
    borderTopRightRadius: DEVICE_HEIGHT * 0.03,
    borderBottomLeftRadius: DEVICE_HEIGHT * 0.03,
    backgroundColor: '#FFFFFF',
    marginRight: DEVICE_WIDTH * 0.04,
    overflow: 'hidden',
  },
  topRow: {
    width: DEVICE_WIDTH * 1,
    flexDirection: 'row',
    paddingHorizontal: DEVICE_WIDTH * 0.05,
    alignItems: 'center',
  },
  info: {},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: DEVICE_WIDTH * 0.04,
    alignItems: 'center',
    marginBottom: DEVICE_HEIGHT * 0.075,
    marginTop: Platform.OS === 'ios' ? DEVICE_HEIGHT * 0.03 : 0,
  },
  headerText: {
    fontSize: DEVICE_HEIGHT * 0.03,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
  },
  back: {
    width: DEVICE_WIDTH * 0.1,
    height: DEVICE_HEIGHT * 0.04,
    justifyContent: 'center',
  },
  subscribeButton: {
    height: DEVICE_HEIGHT * 0.08,
    width: DEVICE_WIDTH * 0.8,
    borderRadius: DEVICE_WIDTH * 10,
    marginLeft: DEVICE_WIDTH * 0.1,
    marginTop: DEVICE_HEIGHT * 0.06,
    flexDirection: 'row',
  },
  subscribeText: {
    fontSize: DEVICE_WIDTH * 0.04,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
  },
  gradient: {
    height: '100%',
    width: '100%',
    borderRadius: DEVICE_WIDTH * 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    flexDirection: 'row',
  },
  modalContainer: {
    paddingTop: DEVICE_HEIGHT * 0.05,
    backgroundColor: '#151d27',
    borderRadius: DEVICE_HEIGHT * 0.02,
    alignItems: 'center',
    // height: DEVICE_HEIGHT * 0.9,
    paddingHorizontal: 0,
  },
  modalScrollContainer: {
    marginTop: DEVICE_HEIGHT * 0.04,
    height: DEVICE_HEIGHT * 0.6,
    width: DEVICE_WIDTH * 0.8,
    marginBottom: DEVICE_HEIGHT * 0.03,
  },
  modalHeader: {
    fontSize: DEVICE_WIDTH * 0.06,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
  },
  modalFont1: {
    fontSize: DEVICE_WIDTH * 0.04,
    color: '#2DCEEF',
    fontFamily: 'Montserrat-Bold',
    marginBottom: DEVICE_HEIGHT * 0.02,
  },
  modalFont2: {
    fontSize: DEVICE_WIDTH * 0.03,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Regular',
    lineHeight: DEVICE_HEIGHT * 0.035,
    marginBottom: DEVICE_HEIGHT * 0.02,
  },
  cancel: {
    height: DEVICE_WIDTH * 0.08,
    width: DEVICE_WIDTH * 0.08,
    tintColor: '#66D5F7',
  },
  cancelContainer: {
    position: 'absolute',
    right: 0,
  },
});

const mapStateToProps = (state) => {
  return {
    account: state.accountReducer.account,
    isLogin: state.accountReducer.isLogin,
    premium: state.accountReducer.premium,
    tabIndex: state.appReducer.tabIndex,
    appData: state.appReducer.appData,
    offline: state.appReducer.offline,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    updateIsFinished: (payload) => dispatch(updateIsFinished(payload)),
    updateShowPlayer: (payload) => dispatch(updateShowPlayer(payload)),
    update: (payload) => dispatch(update(payload)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
