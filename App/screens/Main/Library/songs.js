import React, {Component} from 'react';

import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  TextInput,
  FlatList,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  GRADIENT_COLOR_SET_1,
  DEVICE_HEIGHT,
  DEVICE_WIDTH,
} from '../../../constants/constants';
import Back from '../../../assets/svg/back.svg';
import Sort from '../../../assets/svg/Sort.svg';
import More from '../../../assets/svg/more.svg';

import Tile from '../../../components/Tile@5';

//redux
import {connect} from 'react-redux';
import {login} from '../../../redux/actions/account';

//api
import {POST} from '../../../api/service/service';
import {URL} from '../../../constants/apirUrls';

class LibrarySongs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      screenData: [
        {
          m_data: [],
          m_page: 0,
          m_status: 1,
          m_records: 20,
        },
      ],
    };
  }

  componentDidMount() {
    if (this.props.offline === false) {
      this.addData(0);
    }
  }

  componentDidUpdate(newProps) {
    const {pop} = this.props.navigation;
    if (newProps.tabIndex !== this.props.tabIndex) {
      pop();
    }
  }

  onPressLogin = () => {
    this.props.navigation.navigate('Login');
  };

  clear = () => {
    this.state.screenData[0].m_data = [];
    this.setState({
      isLoading: false,
    });
  };

  //   initData = () => {
  //     let {user_id, authToken} = this.props.account;
  //     let {screenData} = this.state;
  //     let data = {user_id};
  //     let url = URL.ARTISTS_ALL;

  //     const receiver = (response) => {
  //       //upcoming
  //       screenData[0].m_data = response.data.upcoming.data;
  //       //suggested
  //       this.setState({
  //         isLoading: false,
  //       });
  //     };

  //     let payload = {
  //       data,
  //       url,
  //       receiver,
  //       authToken,
  //     };
  //     POST(payload);
  //   };

  addData = (id) => {
    let {m_data, m_page, m_status, m_records} = this.state.screenData[id];
    let user_id = this.props.account.user_id;
    let authToken = this.props.account.authToken;
    let page = m_page + 1;
    let data = {user_id, page};
    let url = URL.FAVORITE_SONGS;

    const receiver = (response) => {
      let currentData = m_data;
      let incomingData = response.songs.data;
      let mergedData = currentData.concat(incomingData);
      this.state.screenData[id].m_data = mergedData;
      this.state.screenData[id].m_page = page;
      this.setState({
        isLoading: false,
      });
    };

    let payload = {
      data,
      url,
      receiver,
      authToken,
    };
    POST(payload);
  };

  onPressTile = (item) => {
    let {type, id} = item;
    let {push} = this.props.navigation;
    push('SongInfo', item);
  };

  renderItem = ({item, index}) => {
    console.log(item);
    const {screenData} = this.state;
    let recent = screenData[0].m_data[index - 1];
    let recentFirstLetter = recent ? recent.name[0] : null;
    let name = item.name;
    let firstLetter = name[0];
    let letter = firstLetter === recentFirstLetter ? null : firstLetter;
    item.type = 'song';
    return (
      <View style={styles.alphaSet}>
        {letter && <Text style={styles.alphaText}>{letter}</Text>}
        <TouchableOpacity
          style={styles.artistSection}
          onPress={() => this.onPressTile(item)}>
          <Tile data={item} onPressTile={this.onPressTile} />
          <View style={styles.infoSection}>
            <Text style={styles.label_1}>{name}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  render() {
    let {screenData} = this.state;
    let recent = screenData[0].m_data;
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
          <Text style={styles.headerText}>Songs</Text>
          {/* <Sort width={DEVICE_WIDTH * 0.05} height={DEVICE_HEIGHT * 0.05} /> */}
          <View />
        </View>
        <View style={styles.flatList}>
          <FlatList
            data={recent}
            extraData={this.state}
            style={styles.flatList}
            renderItem={this.renderItem}
            keyExtractor={(item, index) => `${index}-${item.id}`}
            onEndReached={() => this.addData(0)}
            onEndReachedThreshold={0.1}
            decelerationRate={0.5}
          />
        </View>
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
  header: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    paddingHorizontal: DEVICE_WIDTH * 0.04,
    marginBottom: DEVICE_HEIGHT * 0.03,
    marginTop:
      Platform.OS === 'ios' ? DEVICE_HEIGHT * 0.05 : DEVICE_HEIGHT * 0.03,
  },
  headerText: {
    fontSize: DEVICE_HEIGHT * 0.03,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
  },

  flatList: {
    paddingHorizontal: DEVICE_WIDTH * 0.03,
    // height: DEVICE_HEIGHT * 0.5,
    flex: 1,
  },
  label_1: {
    fontSize: DEVICE_HEIGHT * 0.021,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
  },

  artistSection: {
    flexDirection: 'row',
    marginBottom: DEVICE_HEIGHT * 0.02,
    alignItems: 'center',
    width: DEVICE_WIDTH * 8,
  },
  back: {
    width: DEVICE_WIDTH * 0.1,
    height: DEVICE_HEIGHT * 0.04,
    justifyContent: 'center',
  },

  infoSection: {
    marginLeft: DEVICE_WIDTH * 0.03,
  },

  more: {
    marginLeft: DEVICE_WIDTH * 0.65,
  },

  alphaSet: {},

  alphaText: {
    fontSize: DEVICE_HEIGHT * 0.025,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    marginBottom: DEVICE_HEIGHT * 0.03,
  },
});

const mapStateToProps = (state) => {
  return {
    account: state.accountReducer.account,
    isLogin: state.accountReducer.isLogin,
    offline: state.appReducer.offline,
    tabIndex: state.appReducer.tabIndex,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    login: (payload) => dispatch(login(payload)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(LibrarySongs);
