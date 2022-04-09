import React, {Component} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNRestart from 'react-native-restart';

import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  TouchableOpacityComponent,
  Platform,
} from 'react-native';
import Profile from '../assets/svg/Profile.svg';
import Settings from '../assets/svg/Settings.svg';
import {CMH_ALERT_5} from '../components/CMH';

import {
  DEVICE_HEIGHT,
  DEVICE_WIDTH,
  BOTTOM_TAB_ICON_HEIGHT,
  BOTTOM_TAB_ICON_WIDTH,
  GRADIENT_COLOR_SET_2,
  THEME_COLOR_1,
} from '../constants/constants';

import LinearGradient from 'react-native-linear-gradient';
//redux
import {connect} from 'react-redux';

import {
  InterstitialAd,
  RewardedAd,
  BannerAd,
  TestIds,
  BannerAdSize,
} from '@react-native-firebase/admob';
const DEV_MODE = false;
const adUnitId = DEV_MODE
  ? TestIds.BANNER
  : 'ca-app-pub-5730941372305211/3921558169';

class HomeTabs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
    };
  }

  componentDidMount() {
    // alert(this.props.initFinished);
  }

  onPressProfile = () => {
    if (this.props.account.type === 'guest') {
      this.setState({showModal: true});
    } else {
      this.props.navigation.navigate('Profile');
    }
  };

  onPressSettings = () => {
    // if (this.props.account.type === 'guest') {
    //   this.setState({showModal: true});
    // } else {
    this.props.navigation.navigate('Settings');
    // }
  };

  onPressSignIn = () => {
    this.saveCache();
    RNRestart.Restart();
  };

  async saveCache() {
    await AsyncStorage.removeItem('@cacheUser');
  }

  render() {
    let {state, descriptors, navigation, initFinished} = this.props;
    return initFinished ? (
      <View style={styles.mainView}>
        {this.props.premium === false && (
          <BannerAd
            unitId={adUnitId}
            size={BannerAdSize.ADAPTIVE_BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly: true,
            }}
          />
        )}
        <CMH_ALERT_5
          isShow={this.state.showModal}
          yes={this.onPressSignIn}
          no={() => this.setState({showModal: false})}
          msg={
            'Get a more personalized experience by signing up! Create your own playlists, enable your library, and collect your favorites.'
          }
          option1={'Sign Up'}
          option2={'Cancel'}
        />

        <View style={styles.header}>
          <TouchableOpacity onPress={() => this.onPressProfile()}>
            <Profile width={DEVICE_WIDTH * 0.06} height={DEVICE_WIDTH * 0.06} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.onPressSettings()}>
            <Settings
              width={DEVICE_WIDTH * 0.06}
              height={DEVICE_WIDTH * 0.06}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.tabView}>
          {state.routes.map((route, index) => {
            const {options} = descriptors[route.key];
            const label =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                ? options.title
                : route.name;

            const isFocused = state.index === index;
            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            return (
              <TouchableOpacity
                key={index}
                accessibilityRole="button"
                accessibilityStates={isFocused ? ['selected'] : []}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                onLongPress={onLongPress}
                style={{alignItems: 'center'}}>
                <Text style={styles.tabText}>{label.toUpperCase()}</Text>
                <LinearGradient
                  colors={GRADIENT_COLOR_SET_2.COLORS}
                  locations={GRADIENT_COLOR_SET_2.LOCATIONS}
                  style={isFocused ? styles.activeTabView : null}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    ) : null;
  }
}

const styles = StyleSheet.create({
  settingsButton: {
    height: DEVICE_HEIGHT * 0.04,
    width: DEVICE_HEIGHT * 0.04,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: DEVICE_WIDTH * 0.03,
  },
  tabText: {
    fontSize: DEVICE_WIDTH * 0.04,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Regular',
  },
  mainView: {
    backgroundColor: THEME_COLOR_1,
    paddingTop:
      Platform.OS === 'android' ? DEVICE_HEIGHT * 0.03 : DEVICE_HEIGHT * 0.05,
  },
  tabView: {
    paddingVertical: DEVICE_HEIGHT * 0.01,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: DEVICE_WIDTH * 0.01,
  },
  activeTabView: {
    marginTop: DEVICE_HEIGHT * 0.01,
    borderBottomColor: '#94ceda',
    borderBottomWidth: 3,
    width: DEVICE_WIDTH * 0.1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: DEVICE_WIDTH * 0.04,
    alignItems: 'center',
    marginTop: DEVICE_HEIGHT * 0.03,
  },
  headerText: {
    fontSize: DEVICE_HEIGHT * 0.03,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
  },
});
const mapStateToProps = (state) => {
  return {
    initFinished: state.appReducer.initFinished,
    account: state.accountReducer.account,
    premium: state.accountReducer.premium,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};
export default connect(mapStateToProps, mapDispatchToProps)(HomeTabs);
