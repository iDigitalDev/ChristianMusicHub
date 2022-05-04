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
import {Loading} from '../../../components/Loading';

import Back from '../../../assets/svg/back.svg';
import Plus from '../../../assets/svg/plus.svg';
import Sort from '../../../assets/svg/Sort.svg';
import More from '../../../assets/svg/more.svg';
import SortOption from '../../../components/SortOption';
import Modal, {ModalContent} from 'react-native-modal';

import Tile from '../../../components/Tile@5';
import CreatePlaylist from '../../../components/CreatePlaylist';

//redux
import {connect} from 'react-redux';
import {login} from '../../../redux/actions/account';
import {updateUserPlaylist} from '../../../redux/actions/app';

//api
import {POST} from '../../../api/service/service';
import {URL} from '../../../constants/apirUrls';
import Svg from 'react-native-svg';

class LibraryPlaylists extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      showSortModal: false,
      alphabet: false,
      date: false,
      showOptionModal: false,
      number: false,
      m_data: [],
      m_page: 1,
      m_status: 1,
      m_records: 5,
    };
  }

  componentDidMount() {
    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      this.setState({
        m_data: [],
      });
      if (this.props.offline === false) {
        this.initData();
      }
    });
  }

  componentWillUnmount() {
    this._unsubscribe();
  }

  componentDidUpdate(newProps) {
    const {pop} = this.props.navigation;
    if (newProps.tabIndex !== this.props.tabIndex) {
      pop();
    }
    // if (newProps.appData !== this.props.appData) {
    //   this.initData();
    // }
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
        showOptionModal: false,
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
  renderFooter = () => {
    return <View style={styles.spacer} />;
  };
  renderHeader = () => {
    if (this.props.offline) {
      return null;
    }
    return (
      <View style={styles.createContainer}>
        <TouchableOpacity
          style={styles.playListTile}
          onPress={() => this.onPressCreatePlaylist()}>
          <Plus width={DEVICE_WIDTH * 0.05} height={DEVICE_WIDTH * 0.05} />
        </TouchableOpacity>
        <Text style={styles.createText}>Create Playlist</Text>
      </View>
    );
  };
  renderItem = ({item, index}) => {
    const {artist, name} = item;
    return (
      <TouchableOpacity
        style={styles.playlistSection}
        onPress={() => this.onPressTile(item)}>
        <Tile data={item} />
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

  update = () => {
    this.initData();
  };

  onPressCreatePlaylist = () => {
    this.setState({
      showOptionModal: true,
    });
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
        data.sort((a, b) => b.name < a.name);
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
  render() {
    let {
      m_data,
      showSortModal,
      showOptionModal,
      alphabet,
      number,
      date,
      isLoading,
    } = this.state;
    let recent = m_data;
    if (isLoading) {
      return <Loading />;
    }
    return (
      <LinearGradient
        colors={GRADIENT_COLOR_SET_1.COLORS}
        locations={GRADIENT_COLOR_SET_1.LOCATIONS}
        style={styles.mainContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => this.props.navigation.pop()}>
            <Back width={DEVICE_WIDTH * 0.05} height={DEVICE_WIDTH * 0.05} />
          </TouchableOpacity>
          <Text style={styles.headerText}>Playlists</Text>
          <TouchableOpacity onPress={this.onPressSort}>
            <Sort width={DEVICE_WIDTH * 0.05} height={DEVICE_WIDTH * 0.05} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={recent}
          extraData={this.state}
          style={styles.flatList}
          renderItem={this.renderItem}
          keyExtractor={(item, index) => `${index}-${item.id}`}
          onEndReached={() => this.addData(0)}
          // onEndReachedThreshold={0.1}
          ListFooterComponent={this.renderFooter.bind(this)}
          ListHeaderComponent={this.renderHeader.bind(this)}
          decelerationRate={0.5}
        />
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
        <Modal
          isVisible={showOptionModal}
          onBackdropPress={() => this.setState({showOptionModal: false})}
          hideModalContentWhileAnimating={false}>
          <CreatePlaylist
            // data={selected}
            cancel={() => this.setState({showOptionModal: false})}
            update={this.update}
            props={this.props}
            from={'artist'}
            onPressFavorite={this.onPressFavorite}
            create={true}
          />
        </Modal>
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
    justifyContent: 'space-between',
    paddingHorizontal: DEVICE_WIDTH * 0.04,
    alignItems: 'center',
    marginBottom: DEVICE_HEIGHT * 0.075,
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
    height: DEVICE_HEIGHT * 0.3,
  },
  label_1: {
    fontSize: DEVICE_WIDTH * 0.035,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
  },
  label_2: {
    fontSize: DEVICE_WIDTH * 0.035,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Regular',
  },
  createText: {
    fontSize: DEVICE_WIDTH * 0.035,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    marginLeft: DEVICE_WIDTH * 0.02,
    marginTop: DEVICE_HEIGHT * 0.03,
  },
  createContainer: {
    flexDirection: 'row',
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

  playListTile: {
    height: DEVICE_HEIGHT * 0.09,
    width: DEVICE_HEIGHT * 0.09,
    backgroundColor: 'white',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 5,
    overflow: 'hidden',
    marginBottom: DEVICE_HEIGHT * 0.04,
    opacity: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spacer: {
    height: DEVICE_HEIGHT * 0.1,
  },
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
    updateUserPlaylist: (payload) => dispatch(updateUserPlaylist(payload)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(LibraryPlaylists);
