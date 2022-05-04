import React, {Component} from 'react';
import RNRestart from 'react-native-restart';
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

class WebViewScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      header: props.route.params.header,
      link: props.route.params.link,
    };
  }

  render() {
    const {link, header} = this.state;
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
          <Text style={styles.headerText}>{header}</Text>
          <View style={styles.back}></View>
        </View>
        <ScrollView contentContainerStyle={{flexGrow: 1}}>
          <WebView
            source={{
              uri: link,
            }}
          />
        </ScrollView>
      </LinearGradient>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: 'transparent',
    flex: 1,
    paddingTop: DEVICE_HEIGHT * 0.05,
  },
  web: {
    height: DEVICE_HEIGHT * 0.8,
  },

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
  spacer: {
    height: DEVICE_HEIGHT * 0.1,
  },

  back: {
    width: DEVICE_WIDTH * 0.1,
    height: DEVICE_HEIGHT * 0.04,
    justifyContent: 'center',
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

export default connect(mapStateToProps, mapDispatchToProps)(WebViewScreen);
