import React, {Component} from 'react';
import RNRestart from 'react-native-restart';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  TextInput,
  Linking,
  FlatList,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Modal, {ModalContent} from 'react-native-modal';
import SongOption from '../../../components/SongOption';
import {
  GRADIENT_COLOR_SET_1,
  DEVICE_HEIGHT,
  DEVICE_WIDTH,
} from '../../../constants/constants';
import Profile from '../../../assets/svg/Profile.svg';
import Back from '../../../assets/svg/back.svg';

import Settings from '../../../assets/svg/Settings.svg';
import Playlist from '../../../assets/svg/Playlist.svg';
import Album from '../../../assets/svg/Album.svg';
import Artist from '../../../assets/svg/Artists.svg';
import Song from '../../../assets/svg/songs.svg';
import More from '../../../assets/svg/more.svg';
import Like from '../../../assets/svg/like.svg';
import Share from '../../../assets/svg/Share.svg';
import Tile from '../../../components/Tile@5';
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
//redux
import {connect} from 'react-redux';
import {
  updatePlaying,
  updateExpanded,
  updateIndex,
  updateList,
  updateShuffle,
  updateRepeat,
  updateShowPlayer,
} from '../../../redux/actions/player';
import {updateUserPlaylist} from '../../../redux/actions/app';

//api
import {POST} from '../../../api/service/service';
import {URL} from '../../../constants/apirUrls';

class Library extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      showOptionModal: false,
      selected: null,
      recentlyPlayed: [],
      screenData: [
        {
          m_data: [],
          m_page: 0,
          m_status: 1,
          m_records: 5,
        },
      ],
    };
  }

  componentDidMount() {
    this.initData();
    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      this.setState({
        m_data: [],
      });
      if (this.props.offline === false) {
        this.getRecentlyPlayed();
      }
    });
    Linking.addEventListener('url', (data) => {
      console.log('Listener on search');
      this.navigate(data.url);
    });
  }
  componentWillUnmount() {
    this._unsubscribe();
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

  onPressPlaylists = () => {
    let {push} = this.props.navigation;
    push('LibraryPlaylists');
  };

  onPressAlbums = () => {
    let {push} = this.props.navigation;
    push('LibraryAlbums');
  };

  onPressArtists = () => {
    let {push} = this.props.navigation;
    push('LibraryArtists');
  };

  onPressSongs = () => {
    let {push} = this.props.navigation;
    push('LibrarySongs');
  };

  onPressMore = (item) => {
    this.setState({
      showOptionModal: true,
      selected: item,
    });
  };

  onPressSignIn = async () => {
    await AsyncStorage.removeItem('@cacheUser');
    RNRestart.Restart();
  };

  initData = () => {
    let {user_id, authToken} = this.props.account;
    let {screenData} = this.state;
    let data = {user_id};
    let url = URL.ALBUMS_ALL;

    const receiver = (response) => {
      screenData[0].m_data = response.data.new_release.data;
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

  toggleOptionModal = () => {
    const {showOptionModal} = this.state;
    this.setState({showOptionModal: !showOptionModal});
  };

  getRecentlyPlayed = (id) => {
    const {user_id, authToken} = this.props.account;

    const data = {page: 0, status: 4, records: 10, user_id};

    const url = URL.INIT_DATA;

    const receiver = (response) => {
      const responseStatus = response.status;
      if (responseStatus === true) {
        let itemData = response.data.recently_played.data;
        const {order_ids} = response.data.recently_played;
        if (order_ids === null) {
          return;
        }
        var orderIdsArr = order_ids.split(',');
        let sortedArr = [];
        orderIdsArr.find((element) => {
          for (var i = 0; i < itemData.length; i++) {
            if (itemData[i].song_id.toString() === element) {
              sortedArr.push(itemData[i]);
            }
          }
        });
        this.setState({
          recentlyPlayed: sortedArr.reverse(),
        });
      } else {
        console.log('fail');
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

  onPressTile = (item) => {
    let {push} = this.props.navigation;
    push('SongInfo', item);
  };

  renderItem = ({item, index}) => {
    if (item.plays !== undefined) {
      item.type = 'song';
    }
    const {name, artist} = item;
    return (
      <View style={styles.recentSection}>
        <TouchableOpacity
          style={styles.sectionRow}
          onPress={() => this.onPressTile(item)}>
          <Tile data={item} />
          <View style={styles.infoSection}>
            <Text style={styles.song}>{name}</Text>
            <Text style={styles.artist}>{artist}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => this.onPressMore(item)}>
          <More
            width={DEVICE_WIDTH * 0.03}
            height={DEVICE_HEIGHT * 0.03}
            style={styles.more}
          />
        </TouchableOpacity>
      </View>
    );
  };

  renderFooter = () => {
    return <View style={styles.spacer} />;
  };
  render() {
    let {screenData, showOptionModal, selected, recentlyPlayed} = this.state;
    // const {appData} = this.props;
    // let recent = screenData[0].m_data;
    if (this.props.account.type === 'guest') {
      return (
        <LinearGradient
          colors={GRADIENT_COLOR_SET_1.COLORS}
          locations={GRADIENT_COLOR_SET_1.LOCATIONS}
          style={styles.mainContainer}>
          {this.props.premium === false && (
            <BannerAd
              unitId={adUnitId}
              size={BannerAdSize.ADAPTIVE_BANNER}
              requestOptions={{
                requestNonPersonalizedAdsOnly: true,
              }}
            />
          )}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => this.props.navigation.push('Profile')}>
              <Profile
                width={DEVICE_WIDTH * 0.06}
                height={DEVICE_HEIGHT * 0.06}
              />
            </TouchableOpacity>
            <Text style={styles.headerText}>Library</Text>
            <TouchableOpacity
              onPress={() => this.props.navigation.push('Settings')}>
              <Settings
                width={DEVICE_WIDTH * 0.06}
                height={DEVICE_HEIGHT * 0.06}
              />
            </TouchableOpacity>
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
        {this.props.premium === false && (
          <BannerAd
            unitId={adUnitId}
            size={BannerAdSize.ADAPTIVE_BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly: true,
            }}
          />
        )}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => this.props.navigation.push('Profile')}>
            <Profile
              width={DEVICE_WIDTH * 0.06}
              height={DEVICE_HEIGHT * 0.06}
            />
          </TouchableOpacity>
          <Text style={styles.headerText}>Library</Text>
          <TouchableOpacity
            onPress={() => this.props.navigation.push('Settings')}>
            <Settings
              width={DEVICE_WIDTH * 0.06}
              height={DEVICE_HEIGHT * 0.06}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.section}
          onPress={() => this.onPressPlaylists()}>
          <Playlist
            width={DEVICE_WIDTH * 0.055}
            height={DEVICE_HEIGHT * 0.055}
          />
          <Text style={styles.sectionText}>Playlists</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.section}
          onPress={() => this.onPressAlbums()}>
          <Album width={DEVICE_WIDTH * 0.055} height={DEVICE_HEIGHT * 0.055} />
          <Text style={styles.sectionText}>Albums</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.section}
          onPress={() => this.onPressArtists()}>
          <Artist width={DEVICE_WIDTH * 0.055} height={DEVICE_HEIGHT * 0.055} />
          <Text style={styles.sectionText}>Artists</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.section}
          onPress={() => this.onPressSongs()}>
          <Song width={DEVICE_WIDTH * 0.055} height={DEVICE_HEIGHT * 0.055} />
          <Text style={styles.sectionText}>Songs</Text>
        </TouchableOpacity>
        <Text style={styles.recentText}>Recently Played</Text>
        <FlatList
          data={recentlyPlayed}
          extraData={this.state}
          style={styles.flatList}
          renderItem={this.renderItem}
          keyExtractor={(item, index) => `${index}-${item.id}`}
          // onEndReached={() => this.addData(0)}
          // onEndReachedThreshold={0.1}
          ListFooterComponent={this.renderFooter.bind(this)}
          decelerationRate={0.5}
        />
        <Modal
          isVisible={showOptionModal}
          onBackdropPress={() => this.toggleOptionModal()}
          hideModalContentWhileAnimating={true}>
          <SongOption
            data={selected}
            cancel={this.toggleOptionModal}
            props={this.props}
            from={'playlist'}
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
    paddingTop: DEVICE_HEIGHT * 0.05,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: DEVICE_WIDTH * 0.04,
    alignItems: 'center',
    marginBottom: DEVICE_HEIGHT * 0.075,
  },
  headerText: {
    fontSize: DEVICE_HEIGHT * 0.03,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
  },
  section: {
    width: DEVICE_WIDTH * 0.6,
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: DEVICE_HEIGHT * 0.025,
    paddingHorizontal: DEVICE_WIDTH * 0.04,
  },
  sectionText: {
    fontSize: DEVICE_WIDTH * 0.039,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Regular',
    marginLeft: DEVICE_WIDTH * 0.03,
  },
  recentText: {
    fontSize: DEVICE_HEIGHT * 0.027,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    marginLeft: DEVICE_WIDTH * 0.03,
    marginTop: DEVICE_HEIGHT * 0.01,
    marginBottom: DEVICE_HEIGHT * 0.03,
  },
  flatList: {
    paddingHorizontal: DEVICE_WIDTH * 0.03,
  },
  spacer: {
    height: DEVICE_HEIGHT * 0.1,
  },
  song: {
    fontSize: DEVICE_HEIGHT * 0.021,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Regular',
    width: DEVICE_WIDTH * 0.6,
  },
  artist: {
    fontSize: DEVICE_HEIGHT * 0.018,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Regular',
    width: DEVICE_WIDTH * 0.6,
  },
  recentSection: {
    flexDirection: 'row',
    marginBottom: DEVICE_HEIGHT * 0.04,
    alignItems: 'center',
  },
  infoSection: {
    marginLeft: DEVICE_WIDTH * 0.03,
    width: DEVICE_WIDTH * 0.77,
  },
  optionModal: {
    height: DEVICE_HEIGHT * 0.55,
    justifyContent: 'center',
    width: '100%',
    paddingVertical: DEVICE_HEIGHT * 0.03,
    paddingHorizontal: DEVICE_WIDTH * 0.04,
    backgroundColor: '#151d27',
    borderRadius: DEVICE_HEIGHT * 0.02,
  },
  sectionRow: {
    flexDirection: 'row',
    width: DEVICE_WIDTH * 0.9,
  },
  optionSection: {
    flexDirection: 'row',
    width: DEVICE_WIDTH * 0.7,
    marginBottom: DEVICE_HEIGHT * 0.025,
    alignItems: 'center',
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
    premium: state.accountReducer.premium,
    playlist: state.appReducer.playlist,
    tabIndex: state.appReducer.tabIndex,
    appData: state.appReducer.appData,
    offline: state.appReducer.offline,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    updatePlaying: (payload) => dispatch(updatePlaying(payload)),
    updateList: (payload) => dispatch(updateList(payload)),
    updateIndex: (payload) => dispatch(updateIndex(payload)),
    updateShowPlayer: (payload) => dispatch(updateShowPlayer(payload)),
    updateUserPlaylist: (payload) => dispatch(updateUserPlaylist(payload)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Library);
