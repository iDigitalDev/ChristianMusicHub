import React, {Component} from 'react';
import RNRestart from 'react-native-restart';
// import AdyenCheckout from '@adyen/adyen-web';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  TextInput,
  Image,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

import qs from 'qs';
import {Linking} from 'react-native';
import {
  GRADIENT_COLOR_SET_1,
  DEVICE_HEIGHT,
  DEVICE_WIDTH,
} from '../../constants/constants';
import Back from '../../assets/svg/back.svg';
import Sort from '../../assets/svg/Sort.svg';
import More from '../../assets/svg/more.svg';
import SortOption from '../../components/SortOption';
import Modal, {ModalContent} from 'react-native-modal';
import {WebView} from 'react-native-webview';
import Tile from '../../components/Tile@5';

import {CMH_ALERT_4} from '../../components/CMH';
//redux
import {connect} from 'react-redux';
import {updateIsFinished} from '../../redux/actions/app';
import {updateShowPlayer} from '../../redux/actions/player';

//api
import {POST} from '../../api/service/service';
import {URL} from '../../api/service/urls';

import {update} from '../../redux/actions/app';
import {Loading} from '../../components/Loading';

class Get extends Component {
  constructor(props) {
    super(props);
    this.state = {
      //   header: props.route.params.header,
      //   link: props.route.params.link,
      showSuccessModal: false,
      modalMessage: null,
      btnMsg: null,
      isLoading: false,
      type: props.route.params.type,
    };
  }

  componentDidMount = () => {
    // this.initCheckout();
  };

  _onMessage = (event) => {
    const {message} = JSON.parse(event.nativeEvent.data);
    console.log(message);
    if (message === 'Congratulations! You can now enjoy premium features.') {
      this.setState({
        showSuccessModal: true,
        modalMessage: 'Congratulations! You can now enjoy premium features.',
        btnMsg: 'Proceed',
      });
    } else if (
      message ===
      'Thank you! To complete the subscription process, please check your email.'
    ) {
      this.setState({
        showSuccessModal: true,
        modalMessage:
          'Thank you! To complete the subscription process, please check your email. Once payment is verified, kindly re-login back to the app.',
        btnMsg: 'Okay',
      });
    } else if (message === 'Payment Cancelled') {
      this.setState({
        showSuccessModal: true,
        modalMessage: 'Payment Cancelled',
        btnMsg: 'Okay',
      });
    } else {
      this.setState({
        showSuccessModal: true,
        modalMessage: 'Payment Failed!',
        btnMsg: 'Okay',
      });
    }

    // switch (message) {
    //   case 'play':
    //     this.play();
    //   case 'next':
    //     this.next();
    //   case 'previous':
    //     this.previous();
    //   default:
    //     return;
    // }
  };

  onPressProceed = () => {
    if (
      this.state.modalMessage ===
      'Congratulations! You can now enjoy premium features.'
    ) {
      this.setState({
        isLoading: true,
      });
      RNRestart.Restart();
    }
    this.setState({
      showSuccessModal: false,
    });
    this.props.navigation.pop();
    return;
  };

  render() {
    const appOS = Platform.OS;
    const {user_id} = this.props.account;
    const {showSuccessModal, isLoading} = this.state;
    console.log(this.state.type);
    const uri =
      this.state.type === 0
        ? 'https://app.christianmusichub.net/payments?user_id=' + user_id
        : 'https://app.christianmusichub.net/payments?user_id=' + user_id;
    console.log(uri);
    if (isLoading === true) {
      return <Loading />;
    }
    return (
      <LinearGradient
        colors={GRADIENT_COLOR_SET_1.COLORS}
        locations={GRADIENT_COLOR_SET_1.LOCATIONS}
        style={styles.mainContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => this.props.navigation.pop()}
            style={styles.back}>
            <Back width={DEVICE_WIDTH * 0.05} height={DEVICE_WIDTH * 0.05} />
          </TouchableOpacity>
          {/* <Text style={styles.headerText}>{header}</Text> */}
          {/* <View style={styles.back}></View> */}
        </View>
        <WebView
          ref={(webview) => (this.webview = webview)}
          source={{
            // uri: 'file:///android_asset/index.html',
            uri,
          }}
          allowFileAccess={true}
          originWhitelist={['*']}
          javaScriptEnabledAndroid={true}
          javaScriptEnabled={true}
          // injectedJavaScriptBeforeContentLoaded={myScript}
          onMessage={this._onMessage}
          onError={(syntheticEvent) => {
            const {nativeEvent} = syntheticEvent;
            console.warn('WebView error: ', nativeEvent);
          }}
        />
        {/* <ScrollView contentContainerStyle={{flexGrow: 1}}> */}
        {/* {appOS === 'android' ? (
          <WebView
            ref={(webview) => (this.webview = webview)}
            source={{
              // uri: 'file:///android_asset/index.html',
              uri,
            }}
            allowFileAccess={true}
            originWhitelist={['*']}
            javaScriptEnabledAndroid={true}
            javaScriptEnabled={true}
            // injectedJavaScriptBeforeContentLoaded={myScript}
            onMessage={this._onMessage}
            onError={(syntheticEvent) => {
              const {nativeEvent} = syntheticEvent;
              console.warn('WebView error: ', nativeEvent);
            }}
          />
        ) : (
          <WebView
            ref={(webview) => (this.webview = webview)}
            source={require('./index.html')}
            // originWhitelist={['*']}
            javaScriptEnabled={true}
            injectedJavaScript={myScript}
            onMessage={this._onMessage}
            domStorageEnabled={true}
            nativeConfig={{props: {webContentsDebuggingEnabled: true}}}
            setAllowFileAccessFromFileURLs={true}
            setAllowUniversalAccessFromFileURLs={true}
          />
        )} */}
        {/* <WebView
          ref={(webview) => (this.webview = webview)}
          source={{
            uri: 'file:///android_asset/index.html',
          }}
          originWhitelist={['*']}
          javaScriptEnabledAndroid={true}
          javaScriptEnabled={true}
          injectedJavaScriptBeforeContentLoaded={myScript}
          onMessage={this._onMessage}
        /> */}
        <CMH_ALERT_4
          isShow={showSuccessModal}
          yes={this.onPressProceed}
          no={null}
          btnMsg={this.state.btnMsg}
          msg={this.state.modalMessage}
        />
      </LinearGradient>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: DEVICE_HEIGHT * 0.03,
  },
  web: {
    height: DEVICE_HEIGHT * 0.8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: DEVICE_WIDTH * 0.04,
    alignItems: 'center',
    marginBottom: DEVICE_HEIGHT * 0.02,
  },
  spacer: {
    height: DEVICE_HEIGHT * 0.1,
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
    marginTop: DEVICE_HEIGHT * 0.02,
  },
  topText: {
    fontSize: DEVICE_WIDTH * 0.07,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
  },
  subTopText: {
    fontSize: DEVICE_WIDTH * 0.035,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    width: DEVICE_WIDTH * 0.8,
    marginLeft: DEVICE_WIDTH * 0.1,
    marginTop: DEVICE_HEIGHT * 0.02,
  },
  email: {
    fontSize: DEVICE_WIDTH * 0.035,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
    width: DEVICE_WIDTH * 0.8,
    marginLeft: DEVICE_WIDTH * 0.1,
    textDecorationLine: 'underline',
  },
  input: {
    width: DEVICE_WIDTH * 0.8,
    height: DEVICE_HEIGHT * 0.07,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: DEVICE_WIDTH * 0.03,
    marginLeft: DEVICE_WIDTH * 0.1,
    fontSize: DEVICE_HEIGHT * 0.03,
    paddingLeft: DEVICE_WIDTH * 0.05,
    color: '#FFFFFF',
  },
  label: {
    fontSize: DEVICE_WIDTH * 0.035,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Regular',
    width: DEVICE_WIDTH * 0.8,
    marginLeft: DEVICE_WIDTH * 0.1,
    marginTop: DEVICE_HEIGHT * 0.025,
    textAlign: 'left',
    marginBottom: DEVICE_HEIGHT * 0.01,
  },
  comments: {
    width: DEVICE_WIDTH * 0.8,
    height: DEVICE_HEIGHT * 0.2,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: DEVICE_WIDTH * 0.03,
    marginLeft: DEVICE_WIDTH * 0.1,
    // fontSize: DEVICE_HEIGHT * 0.03,
    paddingLeft: DEVICE_WIDTH * 0.05,
    paddingRight: DEVICE_WIDTH * 0.05,
    color: '#FFFFFF',
    flexWrap: 'wrap',
  },
  button: {
    height: DEVICE_HEIGHT * 0.08,
    width: DEVICE_WIDTH * 0.8,
    borderRadius: DEVICE_WIDTH * 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#66D5F7',
    marginLeft: DEVICE_WIDTH * 0.1,
    marginTop: DEVICE_HEIGHT * 0.02,
    marginBottom: DEVICE_HEIGHT * 0.02,
  },
  buttonText: {
    fontSize: DEVICE_WIDTH * 0.05,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
  },
});

const mapStateToProps = (state) => {
  return {
    account: state.accountReducer.account,
    isLogin: state.accountReducer.isLogin,
    tabIndex: state.appReducer.tabIndex,
    appData: state.appReducer.appData,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    updateIsFinished: (payload) => dispatch(updateIsFinished(payload)),
    updateShowPlayer: (payload) => dispatch(updateShowPlayer(payload)),
    update: (payload) => dispatch(update(payload)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Get);
