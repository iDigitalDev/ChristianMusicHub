import React, {Component} from 'react';
import RNRestart from 'react-native-restart';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  TextInput,
  Image,
  FlatList,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
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

import Tile from '../../components/Tile@5';

//redux
import {connect} from 'react-redux';
import {login} from '../../redux/actions/account';

//api
import {POST} from '../../api/service/service';
import {URL} from '../../constants/apirUrls';

class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      showSortModal: false,
      alphabet: false,
      date: false,
      fid: null,
      birthdate: null,
      gender: null,
      number: false,
      m_data: [],
      m_page: 1,
      m_status: 1,
      m_records: 5,
      username: null,
      photo: null,
      email: null,
    };
  }

  componentDidMount() {
    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      this.setState({
        m_data: [],
      });
      if (this.props.offline === false) {
        this.getUserInfo();
        this.initData();
      } else {
        let {username, photo, email} = this.props.account;
        this.setState({
          username,
          photo: photo,
          email: email,
          isLoading: false,
        });
      }
    });
  }
  componentDidUpdate(newProps) {
    const {pop} = this.props.navigation;
    if (newProps.tabIndex !== this.props.tabIndex) {
      pop();
    }
    if (newProps.appData !== this.props.appData) {
      this.initData();
    }
  }

  componentWillUnmount() {
    this._unsubscribe();
  }

  onPressTile = (item) => {
    const {is_created} = item;
    if (is_created === 1) {
      let {push} = this.props.navigation;
      push('UserPlaylistInfo', item);
    } else {
      let {push} = this.props.navigation;
      push('PlaylistInfo', item);
    }
  };

  onPressLogin = () => {
    this.props.navigation.navigate('Login');
  };

  onPressSignIn = async () => {
    await AsyncStorage.removeItem('@cacheUser');
    RNRestart.Restart();
  };

  clear = () => {
    this.state.screenData[0].m_data = [];
    this.setState({
      isLoading: false,
    });
  };

  initData = () => {
    this.setState({
      isLoading: true,
    });
    let {user_id, authToken} = this.props.account;
    let data = {user_id};
    let url = URL.FAVORITE_PLAYLISTS;

    const receiver = (response) => {
      this.setState({
        isLoading: false,
        m_data: response.playlists.data,
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

  getUserInfo = () => {
    this.setState({
      isLoading: true,
    });
    let {user_id, authToken} = this.props.account;
    let data = {user_id};
    let url = URL.PROFILE;

    const receiver = (response) => {
      const {success} = response;
      if (success) {
        const {user} = response;
        console.log(user[0]);
        const {username, photo, email, fid, birthdate, gender} = user[0];
        console.log(user[0]);
        const formatPhoto = URL.IMAGE + 'profile/' + photo;
        this.setState({
          username,
          photo: formatPhoto,
          email: email,
          fid,
          birthdate,
          gender,
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
  addData = (id) => {
    let {m_data, m_page, m_status, m_records} = this.state;
    let user_id = this.props.account.user_id;
    let authToken = this.props.account.authToken;
    let page = m_page + 1;
    let data = {user_id, page};
    let url = URL.FAVORITE_PLAYLISTS;

    const receiver = (response) => {
      let currentData = m_data;
      let incomingData = response.playlists.data;
      let mergedData = currentData.concat(incomingData);
      this.setState({
        m_data: mergedData,
        m_page: page,
      });
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

  renderItem = ({item, index}) => {
    const {artist, name} = item;
    return (
      <TouchableOpacity
        onPress={() => this.onPressTile(item)}
        style={styles.playlistSection}>
        <Tile data={item} onPressTile={this.onPressTile} />
        <View style={styles.infoSection}>
          <Text style={styles.label_1}>{name}</Text>
          <Text style={styles.label_2}>{artist}</Text>
        </View>
        {/* <More
          width={DEVICE_WIDTH * 0.03}
          height={DEVICE_HEIGHT * 0.03}
          style={styles.more}
        /> */}
      </TouchableOpacity>
    );
  };

  onPressSort = () => {
    this.toggleSortModal();
  };

  toggleSortModal = () => {
    const {showSortModal} = this.state;
    this.setState({showSortModal: !showSortModal});
  };

  sort = (type) => {
    const {m_data} = this.state;
    let data = m_data;
    switch (type) {
      case 'alphabet':
        this.setState({
          alphabet: true,
          date: false,
          number: false,
        });
        data.sort((a, b) => b.artist < a.artist);
        break;
      case 'date':
        this.setState({
          alphabet: false,
          date: true,
          number: false,
        });
        data.sort((a, b) => b.created_at < a.created_at);
        break;
      case 'number':
        this.setState({
          alphabet: false,
          date: false,
          number: true,
        });
        data.sort((a, b) => b.tracks > a.tracks);
        break;
      default:
        break;
    }
  };

  onPressEdit = () => {
    const {username, photo, email, fid, birthdate, gender} = this.state;
    const data = {username, photo, email, fid, birthdate, gender};
    this.props.navigation.push('Edit', data);
  };
  render() {
    let {m_data, showSortModal, alphabet, number, date} = this.state;
    let recent = m_data;
    const {username, photo} = this.state;
    if (this.props.account.type === 'guest') {
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
            <Text style={styles.headerText}>Profile</Text>
            <View style={styles.back}></View>
          </View>
          <TouchableOpacity
            style={styles.subscribeButton}
            onPress={() => this.onPressSignIn()}>
            <LinearGradient
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              colors={['#66D5F7', '#0EAFE1']}
              locations={[0, 0.5]}
              style={styles.gradient}>
              <Text style={styles.subscribeText}>
                Sign In to Access this feature
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      );
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
            <Back width={DEVICE_WIDTH * 0.03} height={DEVICE_HEIGHT * 0.03} />
          </TouchableOpacity>
          <Text style={styles.headerText}>Profile</Text>
          {/* <TouchableOpacity onPress={this.onPressSort}>
            <Sort width={DEVICE_WIDTH * 0.05} height={DEVICE_HEIGHT * 0.05} />
          </TouchableOpacity> */}
          <View style={styles.back} />
        </View>
        <View style={styles.top}>
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
        {this.props.offline === false && (
          <TouchableOpacity
            onPress={() => this.onPressEdit()}
            style={styles.edit}>
            <Text style={styles.editText}>EDIT PROFILE</Text>
          </TouchableOpacity>
        )}

        {this.props.offline === false && (
          <Text style={styles.playlistText}>My Playlists</Text>
        )}
        {this.props.offline === false && (
          <FlatList
            data={recent}
            extraData={this.state}
            style={styles.flatList}
            renderItem={this.renderItem}
            keyExtractor={(item, index) => `${index}-${item.id}`}
            onEndReached={() => this.addData(0)}
            // onEndReachedThreshold={0.1}
            // ListFooterComponent={this.renderFooter.bind(this)}
            decelerationRate={0.5}
            ListFooterComponent={
              <View style={{margin: DEVICE_HEIGHT * 0.05}} />
            }
          />
        )}
        <Modal
          isVisible={showSortModal}
          onBackdropPress={() => this.toggleSortModal()}
          hideModalContentWhileAnimating={true}>
          <SortOption
            onPressSort={this.sort}
            cancel={this.toggleSortModal}
            alphabet={alphabet}
            date={date}
            number={number}
          />
        </Modal>
        {/* <View style={styles.spacer}></View> */}
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
  edit: {
    width: DEVICE_WIDTH * 0.4,
    height: DEVICE_HEIGHT * 0.05,
    marginLeft: DEVICE_WIDTH * 0.3,
    borderColor: '#FFFFFF',
    borderWidth: 1,
    borderRadius: DEVICE_HEIGHT * 0.1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: DEVICE_HEIGHT * 0.02,
  },
  editText: {
    fontSize: DEVICE_HEIGHT * 0.02,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    marginLeft: DEVICE_WIDTH * 0.02,
  },
  playlistText: {
    fontSize: DEVICE_HEIGHT * 0.03,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    marginLeft: DEVICE_WIDTH * 0.03,
    marginTop: DEVICE_HEIGHT * 0.05,
    marginBottom: DEVICE_HEIGHT * 0.02,
  },
  spacer: {
    height: DEVICE_HEIGHT * 0.08,
    backgroundColor: '#000000',
  },
  name: {
    fontSize: DEVICE_HEIGHT * 0.03,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
  },
  image: {
    height: DEVICE_HEIGHT * 0.2,
    width: DEVICE_HEIGHT * 0.2,
    borderTopLeftRadius: DEVICE_HEIGHT * 0.01,
    borderBottomRightRadius: DEVICE_HEIGHT * 0.01,
    borderTopRightRadius: DEVICE_HEIGHT * 0.03,
    borderBottomLeftRadius: DEVICE_HEIGHT * 0.03,
    backgroundColor: '#FFFFFF',
    marginBottom: DEVICE_HEIGHT * 0.02,
    overflow: 'hidden',
  },
  profileImage: {
    height: '100%',
    width: '100%',
  },

  top: {
    width: DEVICE_WIDTH * 1,
    alignItems: 'center',
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
  back: {
    width: DEVICE_WIDTH * 0.1,
    height: DEVICE_HEIGHT * 0.04,
    justifyContent: 'center',
  },

  flatList: {
    paddingHorizontal: DEVICE_WIDTH * 0.03,
    height: DEVICE_HEIGHT * 0.3,
  },
  label_1: {
    fontSize: DEVICE_HEIGHT * 0.021,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
  },
  label_2: {
    fontSize: DEVICE_HEIGHT * 0.02,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
  },

  playlistSection: {
    flexDirection: 'row',
    marginBottom: DEVICE_HEIGHT * 0.04,
    alignItems: 'center',
    width: DEVICE_WIDTH * 8,
  },

  infoSection: {
    marginLeft: DEVICE_WIDTH * 0.03,
    width: DEVICE_WIDTH * 0.73,
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
    flexDirection: 'row',
  },
  more: {},
});

const mapStateToProps = (state) => {
  return {
    account: state.accountReducer.account,
    isLogin: state.accountReducer.isLogin,
    tabIndex: state.appReducer.tabIndex,
    appData: state.appReducer.appData,
    offline: state.appReducer.offline,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    login: (payload) => dispatch(login(payload)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
