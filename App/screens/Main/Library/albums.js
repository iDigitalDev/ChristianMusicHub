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
import SortOption from '../../../components/SortOption';
import Tile from '../../../components/Tile@5';

//redux
import {connect} from 'react-redux';
import {login} from '../../../redux/actions/account';

//api
import {POST} from '../../../api/service/service';
import {URL} from '../../../constants/apirUrls';

import Modal, {ModalContent} from 'react-native-modal';

class LibraryAlbums extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      showSortModal: false,
      alphabet: false,
      date: false,
      number: false,
      screenData: [
        {
          m_data: [],
          m_page: 1,
          m_status: 1,
          m_records: 5,
        },
      ],
    };
  }

  componentDidMount() {
    if (this.props.offline === false) {
      this.initData();
    }
  }
  componentDidUpdate(newProps) {
    const {pop} = this.props.navigation;
    if (newProps.tabIndex !== this.props.tabIndex) {
      pop();
    }
  }

  toggleSortModal = () => {
    const {showSortModal} = this.state;
    this.setState({showSortModal: !showSortModal});
  };

  onPressTile = (item) => {
    let {type, id} = item;
    let {push} = this.props.navigation;

    if (type === 'artist') {
      push('ArtistInfo', {id});
    } else if (type === 'album') {
      push('AlbumInfo', {id});
    }
  };

  onPressLogin = () => {
    this.props.navigation.navigate('Login');
  };

  onPressSort = () => {
    this.toggleSortModal();
  };

  clear = () => {
    this.state.screenData[0].m_data = [];
    this.setState({
      isLoading: false,
    });
  };

  initData = () => {
    let {user_id, authToken} = this.props.account;
    let {screenData} = this.state;
    let data = {user_id};
    let url = URL.FAVORITE_ALBUMS;

    const receiver = (response) => {
      screenData[0].m_data = response.albums.data;
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

  sort = (type) => {
    const {screenData} = this.state;
    let data = screenData[0].m_data;
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

  addData = (id) => {
    let {m_data, m_page, m_status, m_records} = this.state.screenData[id];
    let user_id = this.props.account.user_id;
    let authToken = this.props.account.authToken;
    let page = m_page + 1;
    let data = {user_id, page};
    let url = URL.FAVORITE_ALBUMS;

    const receiver = (response) => {
      let currentData = m_data;
      let incomingData = response.albums.data;
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

  renderItem = ({item, index}) => {
    const {artist, name} = item;
    return (
      <TouchableOpacity
        style={styles.playlistSection}
        onPress={() => this.onPressTile(item)}>
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

  render() {
    let {screenData, showSortModal, date, number, alphabet} = this.state;
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
            <Back width={DEVICE_WIDTH * 0.03} height={DEVICE_WIDTH * 0.05} />
          </TouchableOpacity>
          <Text style={styles.headerText}>Albums</Text>
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
          // ListFooterComponent={this.renderFooter.bind(this)}
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
  },
  back: {
    width: DEVICE_WIDTH * 0.1,
    height: DEVICE_HEIGHT * 0.04,
    justifyContent: 'center',
  },

  more: {
    marginLeft: DEVICE_WIDTH * 0.65,
  },
});

const mapStateToProps = (state) => {
  return {
    account: state.accountReducer.account,
    isLogin: state.accountReducer.isLogin,
    tabIndex: state.appReducer.tabIndex,
    offline: state.appReducer.offline,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    login: (payload) => dispatch(login(payload)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(LibraryAlbums);
