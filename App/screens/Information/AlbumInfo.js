import React, {Component} from 'react';

import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  TextInput,
  Image,
  ImageBackground,
  ActivityIndicator,
  Platform,
} from 'react-native';
import * as FileSystem from 'expo-file-system';

import LinearGradient from 'react-native-linear-gradient';
import {
  GRADIENT_COLOR_SET_1,
  DEVICE_HEIGHT,
  DEVICE_WIDTH,
} from '../../constants/constants';
import SongOption from '../../components/SongOption';
import {share} from '../../components/Share';
import PlayCount from '../../assets/svg/playCount.svg';
import Back from '../../assets/svg/back.svg';
import ShareIcon from '../../assets/svg/Share.svg';
import More from '../../assets/svg/more.svg';
import Like from '../../assets/svg/LikeActive.svg';
import LikeInactive from '../../assets/svg/LikeInActive.svg';
import ShuffleInactive from '../../assets/svg/Shuffle - Inactive.svg';
import {CMH_ALERT} from '../../components/CMH';
import {Loading} from '../../components/Loading';
import Tile from '../../components/Tile@5';

import RNFetchBlob from 'react-native-fetch-blob';
import RNBackgroundDownloader from 'react-native-background-downloader';
import Download from '../../assets/svg/download.svg';
import Downloaded from '../../assets/svg/downloaded.svg';

//redux
import {connect} from 'react-redux';
import {
  updatePlaying,
  updateIndex,
  updateList,
  updateShowPlayer,
  updatePlaylistUpdateCounter,
  updateTrackListUID,
  updatePlayerData,
  updateRepeat,
  updateCommand,
  updateIds,
} from '../../redux/actions/player';
import {
  updateUserPlaylist,
  removeFromDownloadList,
  addToDownloadList,
  addToDownloadListInformation,
  removedFromSavedList,
  updateDownloadedSongIds,
  updateDownloadingSongIds,
  updateDownloadedData,
} from '../../redux/actions/app';
import FastImage from 'react-native-fast-image';

//api
import {POST} from '../../api/service/service';
import {URL} from '../../constants/apirUrls';
import {ScrollView} from 'react-native-gesture-handler';
import Modal, {ModalContent} from 'react-native-modal';

import {favorite, unfavorite} from '../../api/service/actions';
import {back} from 'react-native/Libraries/Animated/src/Easing';
import NetInfo from '@react-native-community/netinfo';
let unsubscribe = null;
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
class AlbumInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      trigger: false,
      isLoading: true,
      id: props.route.params.id,
      isDownloaded: props.route.params.isDownloaded,
      image: null,
      background: '#000000',
      artist_image: null,
      album: null,
      favorites: null,
      isFollowed: null,
      showOptionModal: false,
      selected: null,
      year: null,
      description: null,
      plays: null,
      albumDescription: null,
      screenData: [
        {
          m_data: [],
          m_page: 0,
          m_status: 1,
          m_records: 3,
        },
        {
          m_data: [],
          m_page: 0,
          m_status: 1,
          m_records: 5,
        },
      ],
      offlineMode: false,
      showDeleteModal: false,
    };
  }

  componentDidMount() {
    if (this.props.offline === false) {
      this.initData();
    } else {
      this.initDownloadedData();
    }
  }

  componentWillUnmount() {
    if (unsubscribe != null) {
      unsubscribe();
    }
  }

  componentDidUpdate(newProps) {
    const {pop} = this.props.navigation;
    if (newProps.tabIndex !== this.props.tabIndex) {
      pop();
    }
    if (this.props.command === true) {
      this.initData();
      this.props.updateCommand(false);
    }
  }

  initDownloadedData = async () => {
    this.setState(this.props.route.params);
  };

  initData = async () => {
    let {user_id, authToken} = this.props.account;
    let {screenData, id, background} = this.state;
    let data = {id, user_id};
    let url = URL.ALBUM_INFO;

    const receiver = async (response) => {
      const {
        songs,
        album,
        favorites,
        artist,
        year,
        description,
        is_favorite,
        artist_image,
        dominant_color,
        artist_id,
        streams,
        album_image,
        album_description,
      } = response.data;
      let useBackGround = background;
      if (dominant_color.length < 6) {
        const zeros = (6 - dominant_color.length) * '0';
        useBackGround = '#' + zeros + dominant_color;
      } else if (dominant_color !== null) {
        useBackGround = '#' + dominant_color;
      }

      screenData[0].m_data = songs;

      this.setState({
        image: album_image,
        album,
        favorites: favorites,
        isFollowed: is_favorite,
        artist,
        artist_image,
        year,
        albumDescription: album_description,
        description,
        isLoading: false,
        background: useBackGround,
        artist_id,
        plays: streams === null ? 0 : streams,
        trackListUID: 'album' + id,
        type: 'album',
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

  onPressTile = async (data) => {
    this.props.updateRepeat(null);
    const {index} = data;
    const {screenData} = this.state;
    const trackList = screenData[0].m_data;
    const trackListUID = screenData[0].m_data[index].uid;

    this.props.updateIds({index, trackListUID, trackList});
  };

  onPressShuffle = async () => {
    this.props.updateRepeat(null);

    const {screenData} = this.state;
    var trackList = JSON.parse(JSON.stringify(screenData[0].m_data));

    const trackListUID = screenData[0].m_data[0].uid;
    const copy = [...trackList];
    const shuffleData = this.shuffle(copy);
    shuffleData.map((item, key) => {
      shuffleData[key].index = key;
    });

    this.props.updateIds({index: 0, trackListUID, trackList: shuffleData});
  };

  shuffle(array) {
    var currentIndex = array.length,
      temporaryValue,
      randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex !== 0) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }

  onPressFavorite = async (id, key) => {
    const configJson = {
      fave_id: id,
      type: 3,
    };
    favorite(this.props, configJson);
    this.state.screenData[0].m_data[key].is_favorite = 1;
    this.setState({
      isFave: true,
    });
  };

  onPressUnfavorite = async (id, key) => {
    const configJson = {
      fave_id: id,
      type: 3,
    };
    unfavorite(this.props, configJson);
    this.state.screenData[0].m_data[key].is_favorite = 0;
    this.setState({
      isFave: false,
    });
  };

  renderIsFave = (state, id, key) => {
    if (this.props.account.type === 'guest') {
      return null;
    }
    const isFave =
      state === 1 ? (
        <TouchableOpacity
          disabled={this.props.offline}
          onPress={() => this.onPressUnfavorite(id, key)}
          style={styles.ActionButton}>
          <Like width={DEVICE_WIDTH * 0.03} height={DEVICE_HEIGHT * 0.03} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          disabled={this.props.offline}
          onPress={() => this.onPressFavorite(id, key)}
          style={styles.ActionButton}>
          <LikeInactive
            width={DEVICE_WIDTH * 0.03}
            height={DEVICE_HEIGHT * 0.03}
          />
        </TouchableOpacity>
      );

    return isFave;
  };

  renderIsDownloaded = (item) => {
    if (this.props.downloadingSongIds.includes(item.id)) {
      return (
        <FastImage
          style={styles.loading}
          source={require('../../assets/images/downloading.gif')}
          resizeMode={FastImage.resizeMode.contain}
        />
      );
    } else if (this.props.downloadedSongIds.includes(item.id)) {
      return (
        <Downloaded width={DEVICE_WIDTH * 0.04} height={DEVICE_HEIGHT * 0.04} />
      );
    } else {
      console.log('?');
      return <View />;
    }
  };

  renderIsListDownloaded = () => {
    let isCompleted = true;
    for (let x = 0; x < this.state.screenData[0].m_data.length; x++) {
      let songId = this.state.screenData[0].m_data[x].id;
      if (!this.props.downloadedSongIds.includes(songId)) {
        isCompleted = false;
      }
      if (this.props.downloadingSongIds.includes(songId)) {
        return (
          <FastImage
            style={styles.loading}
            source={require('../../assets/images/downloading.gif')}
            resizeMode={FastImage.resizeMode.contain}
          />
        );
      }
    }

    if (isCompleted === true) {
      return (
        <TouchableOpacity onPress={() => this.onPressRemove()}>
          <Downloaded
            width={DEVICE_WIDTH * 0.04}
            height={DEVICE_WIDTH * 0.04}
          />
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity onPress={() => this.onPressDownloadAll()}>
          <Download width={DEVICE_WIDTH * 0.04} height={DEVICE_WIDTH * 0.04} />
        </TouchableOpacity>
      );
    }
  };

  onPressDownloadAll = async () => {
    this.props.updateDownloadedData({data: this.state, type: 'add'});

    this.state.screenData[0].m_data.map((item, key) => {
      this.props.updateDownloadingSongIds({songId: item.id, type: 'add'});
      console.log(`${FileSystem.documentDirectory}${item.id}.mp3`);

      let task = RNBackgroundDownloader.download({
        id: item.id.toString(),
        url: item.link,
        destination:
          Platform.OS === 'ios'
            ? `${RNBackgroundDownloader.directories.documents}/${item.id}.${item.extension}`
            : `${FileSystem.documentDirectory}${item.id}.${item.extension}`,
        //
      })
        .begin((expectedBytes) => {
          console.log(`Going to download ${expectedBytes} bytes!`);
        })
        .progress((percent) => {
          console.log(`Downloaded: ${percent * 100}%`);
        })
        .done(async () => {
          console.log('Download is done!');
          this.props.updateDownloadingSongIds({
            songId: item.id,
            type: 'remove',
          });
          this.props.updateDownloadedSongIds({
            songId: item.id,
            type: 'add',
          });
        })
        .error((error) => {
          console.log('Download canceled due to error: ', error);
        });
    });
  };

  remove = async () => {
    this.state.screenData[0].m_data.map(async (item, key) => {
      let destination = `${FileSystem.documentDirectory}${item.id}.${item.extension}`;

      await FileSystem.deleteAsync(destination);
      this.props.updateDownloadedSongIds({
        songId: item.id,
        type: 'remove',
      });
      const downloaded = await RNFetchBlob.fs.exists(destination);
      console.log(item.id, 'exists?: ', downloaded);
      console.log('removed: ', item.id);
    });
    this.setState({showDeleteModal: false});
  };

  onPressRemove = () => {
    this.setState({showDeleteModal: true});
  };

  onPressFollow = () => {
    const {id} = this.state;
    const configJson = {
      fave_id: id,
      type: 2,
    };
    favorite(this.props, configJson);
    this.setState({
      isFollowed: 1,
    });
  };

  onPressUnfollow = () => {
    const {id} = this.state;
    const configJson = {
      fave_id: id,
      type: 2,
    };
    unfavorite(this.props, configJson);
    this.setState({
      isFollowed: 0,
    });
  };

  onPressMore = (item) => {
    this.setState({
      showOptionModal: true,
      selected: item,
    });
  };

  toggleOptionModal = () => {
    const {showOptionModal} = this.state;
    this.setState({showOptionModal: !showOptionModal});
  };

  renderIsFollowed = (state) => {
    if (this.props.account.type === 'guest') {
      return null;
    }
    const isFollowed =
      state === 1 ? (
        <TouchableOpacity
          disabled={this.props.offline}
          onPress={() => this.onPressUnfollow()}
          style={styles.follow}>
          <Like width={DEVICE_WIDTH * 0.03} height={DEVICE_HEIGHT * 0.03} />
          <Text style={styles.followText}>FOLLOWING</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          disabled={this.props.offline}
          onPress={() => this.onPressFollow()}
          style={styles.follow}>
          <LikeInactive
            width={DEVICE_WIDTH * 0.03}
            height={DEVICE_HEIGHT * 0.03}
          />
          <Text style={styles.followText}>FOLLOW</Text>
        </TouchableOpacity>
      );

    return isFollowed;
  };

  getExtension(str) {
    let r = str.match(/\.([^.]+?)(\?.*)?$/);
    return r && r[1] ? r[1] : '';
  }

  renderSongs = (songs) => {
    const list = songs.map((item, key) => {
      const {is_favorite, id, extracted_mp3, artist_id, image, aws_mp3} = item;
      const {artist, artist_image} = this.state;
      item.artist = artist;
      let song = item.title;
      if (artist_image !== null) {
        item.artist_image = artist_id + '/' + artist_image.split(',')[0];
      }
      item.type = 'album';
      item.index = key;
      if (image !== null) {
        item.image = image.split(',')[0];
        item.artwork = URL.IMAGE + image.split(',')[0];
      }

      //for player
      item.artist = artist;
      item.album = null;
      item.playlist = null;
      item.song = null;

      item.song_id = id;
      item.playlist_id = null;
      item.uid = 'album' + this.state.id;

      item.is_Active = true;
      item.index = key;
      item.url = extracted_mp3;
      item.rating = is_favorite;

      item.url = aws_mp3 || extracted_mp3;
      item.link = aws_mp3 || extracted_mp3;

      item.extension = this.getExtension(item.link);

      return (
        <View style={styles.section} key={key}>
          <TouchableOpacity
            style={styles.sectionRow}
            onPress={() => this.onPressTile(item)}>
            {/* <Tile data={item} /> */}
            <View style={styles.infoSection}>
              <Text style={styles.song}>{song}</Text>
              <Text style={styles.artist}>{artist}</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.songOptionsContainer}>
            {this.renderIsFave(is_favorite, id, key)}
            {this.props.premium && this.renderIsDownloaded(item)}

            <TouchableOpacity
              disabled={this.props.offline}
              onPress={() => this.onPressMore(item)}
              style={styles.ActionButton}>
              <More
                width={DEVICE_WIDTH * 0.03}
                height={DEVICE_HEIGHT * 0.03}
                style={styles.more}
              />
            </TouchableOpacity>
          </View>
        </View>
      );
    });

    return list;
  };

  goToArtist = () => {
    const {artist_image, artist_id} = this.state;

    const item = {
      id: artist_id,
      image: artist_id + '/' + artist_image.split(',')[0],
    };

    let {push} = this.props.navigation;
    push('ArtistInfo', item);
  };

  getPlayCount = (plays) => {
    return plays < 1000 ? '<1000' : plays;
  };

  render() {
    const {
      screenData,
      album,
      artist,
      showOptionModal,
      selected,
      year,
      description,
      isLoading,
      isFollowed,
      image,
      background,
      plays,
    } = this.state;
    const songs = screenData[0].m_data;
    const tileImage =
      image === null
        ? require('../../assets/images/cmh_logo_play.png')
        : {uri: URL.IMAGE + image};

    if (isLoading) {
      return <Loading />;
    }
    return (
      <LinearGradient
        colors={[background, '#909FA4']}
        locations={[0, 1]}
        style={styles.gradient}>
        <CMH_ALERT
          isShow={this.state.showDeleteModal}
          yes={this.remove}
          no={() => this.setState({showDeleteModal: false})}
          msg={'Do you want to delete downloads?'}
        />
        {this.props.premium === false && (
          <BannerAd
            unitId={adUnitId}
            size={BannerAdSize.ADAPTIVE_BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly: false,
            }}
            onAdFailedToLoad={(res) => console.log(res)}
          />
        )}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => this.props.navigation.pop()}
            style={styles.back}>
            <Back width={DEVICE_WIDTH * 0.05} height={DEVICE_WIDTH * 0.05} />
          </TouchableOpacity>
          <View style={styles.rightHeader}>
            <TouchableOpacity onPress={() => share('album', this.state.id)}>
              <ShareIcon
                width={DEVICE_WIDTH * 0.05}
                height={DEVICE_WIDTH * 0.05}
              />
            </TouchableOpacity>
            {/*<More width={DEVICE_WIDTH * 0.03} height={DEVICE_HEIGHT * 0.03} /> */}
          </View>
        </View>
        <ScrollView>
          <View style={styles.mainContainer}>
            <View style={styles.tile}>
              <Image
                source={tileImage}
                style={styles.image}
                resizeMode={'cover'}
              />
            </View>
            <Text style={styles.label}>{album}</Text>
            <TouchableOpacity onPress={this.goToArtist}>
              <Text style={styles.label2}>
                {artist} - {year}
              </Text>
            </TouchableOpacity>
            <View style={styles.playsContainer}>
              <PlayCount
                width={DEVICE_WIDTH * 0.02}
                height={DEVICE_HEIGHT * 0.02}
                style={styles.plays}
              />
              <Text style={styles.playsText}>{this.getPlayCount(plays)}</Text>
              {this.props.premium && this.renderIsListDownloaded()}
            </View>
            <View style={styles.buttonsContainer}>
              {this.renderIsFollowed(isFollowed)}
              <TouchableOpacity
                style={styles.shuffle}
                onPress={this.onPressShuffle}>
                <ShuffleInactive
                  width={DEVICE_WIDTH * 0.03}
                  height={DEVICE_HEIGHT * 0.03}
                />
                <Text style={styles.shuffleText}>SHUFFLE</Text>
              </TouchableOpacity>
            </View>
            {/* <Text style={styles.description}>insert description</Text> */}

            {/* <Text style={styles.pop}>Album Songs</Text> */}
            {this.renderSongs(songs)}
            {this.state.albumDescription && (
              <Text style={styles.releaseBio}>Release Bio</Text>
            )}

            <Text style={styles.albumDescription}>
              {this.state.albumDescription}
            </Text>
          </View>
        </ScrollView>
        <Modal
          isVisible={showOptionModal}
          onBackdropPress={() => this.setState({showOptionModal: false})}
          hideModalContentWhileAnimating={true}>
          <SongOption
            data={selected}
            onPressFavorite={this.onPressFavorite}
            cancel={() => this.setState({showOptionModal: false})}
            props={this.props}
            from={'album'}
          />
        </Modal>
      </LinearGradient>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    paddingTop: DEVICE_HEIGHT * 0.03,
    alignItems: 'center',
    paddingBottom: DEVICE_HEIGHT * 0.1,
  },
  gradient: {
    paddingTop: DEVICE_HEIGHT * 0.04,
    backgroundColor: 'transparent',
    flex: 1,
  },
  image: {
    height: '100%',
    width: '100%',
  },

  tile: {
    height: DEVICE_WIDTH * 0.3,
    width: DEVICE_WIDTH * 0.3,
    backgroundColor: 'white',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },

  albums: {
    alignSelf: 'flex-start',
    fontSize: DEVICE_HEIGHT * 0.025,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    marginLeft: DEVICE_WIDTH * 0.04,
  },

  label: {
    fontSize: DEVICE_HEIGHT * 0.035,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    marginTop: DEVICE_HEIGHT * 0.01,
    textAlign: 'center',
    width: DEVICE_WIDTH * 0.8,
  },
  label2: {
    fontSize: DEVICE_HEIGHT * 0.02,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    marginTop: DEVICE_HEIGHT * 0.01,
    width: DEVICE_WIDTH * 0.8,
    textAlign: 'center',
  },
  artistTitle: {
    fontSize: DEVICE_HEIGHT * 0.02,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: DEVICE_WIDTH * 0.04,
    marginTop:
      Platform.OS === 'ios' ? DEVICE_HEIGHT * 0.05 : DEVICE_HEIGHT * 0.03,
  },
  ActionButton: {
    width: DEVICE_WIDTH * 0.07,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    width: DEVICE_WIDTH * 0.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  like: {
    marginTop: DEVICE_HEIGHT * 0.01,
  },

  share: {},

  pop: {
    alignSelf: 'flex-start',
    fontSize: DEVICE_HEIGHT * 0.02,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    marginTop: DEVICE_HEIGHT * 0.03,
    marginBottom: DEVICE_HEIGHT * 0.03,
    marginLeft: DEVICE_WIDTH * 0.04,
  },
  follow: {
    width: DEVICE_WIDTH * 0.4,
    height: DEVICE_HEIGHT * 0.05,
    borderColor: '#FFFFFF',
    borderWidth: 1,
    borderRadius: DEVICE_HEIGHT * 0.1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  followText: {
    fontSize: DEVICE_HEIGHT * 0.02,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    marginLeft: DEVICE_WIDTH * 0.02,
  },
  description: {
    fontSize: DEVICE_HEIGHT * 0.02,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    marginTop: DEVICE_HEIGHT * 0.01,
  },

  shuffle: {
    width: DEVICE_WIDTH * 0.4,
    height: DEVICE_HEIGHT * 0.05,
    backgroundColor: '#000000',
    borderRadius: DEVICE_HEIGHT * 0.1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  shuffleText: {
    fontSize: DEVICE_HEIGHT * 0.02,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    marginLeft: DEVICE_WIDTH * 0.02,
  },

  buttonsContainer: {
    flexDirection: 'row',
    width: DEVICE_WIDTH * 0.92,
    justifyContent: 'space-around',
    marginTop: DEVICE_HEIGHT * 0.02,
    marginBottom: DEVICE_HEIGHT * 0.07,
  },

  flatList: {
    marginTop: DEVICE_HEIGHT * 0.02,
    flex: 1,
  },
  infoSection: {
    marginLeft: DEVICE_WIDTH * 0.03,
    justifyContent: 'center',
  },
  sectionRow: {
    flexDirection: 'row',
    width: DEVICE_WIDTH * 0.75,
  },
  rightHeader: {},
  back: {
    width: DEVICE_WIDTH * 0.1,
    height: DEVICE_HEIGHT * 0.04,
  },
  plays: {
    marginRight: DEVICE_WIDTH * 0.01,
    marginBottom: DEVICE_HEIGHT * 0.003,
  },
  playsText: {
    fontSize: DEVICE_HEIGHT * 0.02,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    marginRight: DEVICE_WIDTH * 0.02,
  },
  playsContainer: {
    marginTop: DEVICE_HEIGHT * 0.01,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },

  section: {
    flexDirection: 'row',
    marginBottom: DEVICE_HEIGHT * 0.04,
    width: DEVICE_WIDTH * 1,
    paddingHorizontal: DEVICE_WIDTH * 0.04,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  songOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  song: {
    fontSize: DEVICE_HEIGHT * 0.021,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
  },
  artist: {
    fontSize: DEVICE_HEIGHT * 0.018,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Regular',
  },
  albumDescription: {
    fontSize: DEVICE_HEIGHT * 0.02,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Regular',
    width: DEVICE_WIDTH * 0.9,
    textAlign: 'left',
    marginTop: DEVICE_HEIGHT * 0.01,
    marginBottom: DEVICE_HEIGHT * 0.02,
  },
  releaseBio: {
    alignSelf: 'flex-start',
    fontSize: DEVICE_HEIGHT * 0.025,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    marginLeft: DEVICE_WIDTH * 0.04,
  },
  loading: {
    width: DEVICE_WIDTH * 0.04,
    height: DEVICE_WIDTH * 0.04,
  },
});

const mapStateToProps = (state) => {
  return {
    playing: state.playerReducer.playing,
    account: state.accountReducer.account,
    premium: state.accountReducer.premium,
    playlist: state.appReducer.playlist,
    playList: state.playerReducer.playList,
    playListUID: state.playerReducer.playListUID,
    isPlaying: state.playerReducer.isPlaying,
    offline: state.appReducer.offline,
    tabIndex: state.appReducer.tabIndex,
    downloadList: state.appReducer.downloadList,
    savedList: state.appReducer.savedList,
    playlistUpdateCounter: state.playerReducer.playlistUpdateCounter,
    command: state.playerReducer.command,
    trackListUID: state.playerReducer.trackListUID,
    downloadListInformation: state.appReducer.downloadListInformation,

    downloadingSongIds: state.appReducer.downloadingSongIds,
    downloadedSongIds: state.appReducer.downloadedSongIds,
    downloadedData: state.appReducer.downloadedData,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    updatePlaying: (payload) => dispatch(updatePlaying(payload)),
    updateList: (payload) => dispatch(updateList(payload)),
    updateIndex: (payload) => dispatch(updateIndex(payload)),
    updateShowPlayer: (payload) => dispatch(updateShowPlayer(payload)),
    updateUserPlaylist: (payload) => dispatch(updateUserPlaylist(payload)),
    updatePlaylistUpdateCounter: (payload) =>
      dispatch(updatePlaylistUpdateCounter(payload)),
    updateTrackListUID: (payload) => dispatch(updateTrackListUID(payload)),
    updatePlayerData: (payload) => dispatch(updatePlayerData(payload)),
    updateRepeat: (payload) => dispatch(updateRepeat(payload)),
    updateCommand: (payload) => dispatch(updateCommand(payload)),
    updateIds: (payload) => dispatch(updateIds(payload)),
    addToDownloadList: (payload) => dispatch(addToDownloadList(payload)),
    removeFromDownloadList: (payload) =>
      dispatch(removeFromDownloadList(payload)),
    addToDownloadListInformation: (payload) =>
      dispatch(addToDownloadListInformation(payload)),
    removedFromSavedList: (payload) => dispatch(removedFromSavedList(payload)),
    updateDownloadedSongIds: (payload) =>
      dispatch(updateDownloadedSongIds(payload)),
    updateDownloadingSongIds: (payload) =>
      dispatch(updateDownloadingSongIds(payload)),
    updateDownloadedData: (payload) => dispatch(updateDownloadedData(payload)),
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(AlbumInfo);
