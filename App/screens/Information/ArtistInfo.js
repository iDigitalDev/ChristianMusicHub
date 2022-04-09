import React, {Component} from 'react';

import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Platform,
  FlatList,
  Image,
} from 'react-native';
import {CMH_ALERT} from '../../components/CMH';
import LinearGradient from 'react-native-linear-gradient';
import FastImage from 'react-native-fast-image';
import NetInfo from '@react-native-community/netinfo';
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
import {
  GRADIENT_COLOR_SET_1,
  DEVICE_HEIGHT,
  DEVICE_WIDTH,
} from '../../constants/constants';
import Back from '../../assets/svg/back.svg';
import Share from '../../assets/svg/Share.svg';
import More from '../../assets/svg/more.svg';
import Like from '../../assets/svg/LikeActive.svg';
import PlayCount from '../../assets/svg/playCount.svg';
import LikeInactive from '../../assets/svg/LikeInActive.svg';
import Shuffle from '../../assets/svg/Shuffle.svg';
import ShuffleInactive from '../../assets/svg/Shuffle - Inactive.svg';

import Tile from '../../components/Tile@5';
import AlbumTile from '../../components/Tile';
import * as FileSystem from 'expo-file-system';

//redux
import {connect} from 'react-redux';
import {
  updatePlaying,
  updateIndex,
  updateList,
  updateShowPlayer,
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
import {share} from '../../components/Share';

import RNFetchBlob from 'react-native-fetch-blob';
import RNBackgroundDownloader from 'react-native-background-downloader';
import Download from '../../assets/svg/download.svg';
import Downloaded from '../../assets/svg/downloaded.svg';
//api
import {POST} from '../../api/service/service';
import {URL} from '../../constants/apirUrls';
import {ScrollView} from 'react-native-gesture-handler';

import SongOption from '../../components/SongOption';
import Modal, {ModalContent} from 'react-native-modal';
import {favorite, unfavorite} from '../../api/service/actions';
import {Loading} from '../../components/Loading';

let unsubscribe = null;

class ArtistInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isListDownloaded: true,
      isLoading: true,
      background: '#000000',
      artist: null,
      favorites: null,
      id: props.route.params.id,
      isDownloaded: props.route.params.isDownloaded,
      image: null,
      showOptionModal: false,
      isFollowed: null,
      isFave: null,
      selected: null,
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
    this.props.navigation.setOptions({
      headerShown: false,
    });
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
  initData = () => {
    let {user_id, authToken} = this.props.account;
    let {screenData, id, background} = this.state;
    let data = {id, user_id};
    let url = URL.ARTIST_INFO;

    const receiver = async (response) => {
      const {
        songs,
        albums,
        artist,
        favorites,
        is_favorite,
        dominant_color,
        plays,
        description,
        genre,
        image,
      } = response.data;
      if (image !== null) {
        if (image.split(',')[0] !== '') {
          this.setState({
            image: this.state.id + '/' + image.split(',')[0],
          });
        }
      }
      let useBackGround = background;
      if (dominant_color.length < 6) {
        const zeros = (6 - dominant_color.length) * '0';
        useBackGround = '#' + zeros + dominant_color;
      } else if (dominant_color !== null) {
        useBackGround = '#' + dominant_color;
      }

      screenData[0].m_data = songs;
      if (albums !== null) {
        screenData[1].m_data = albums;
      }
      this.setState({
        artist,
        favorites,
        isFollowed: is_favorite,
        isLoading: false,
        background: useBackGround,
        plays: plays === null ? 0 : plays,
        description,
        genre,
        trackListUID: 'artist' + id,
        type: 'artist',
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
    this.setState({
      isLoading: true,
    });
    let {m_data, m_page, m_status, m_records} = this.state.screenData[id];
    let user_id = this.props.account.user_id;
    let authToken = this.props.account.authToken;
    let status = m_status;
    let records = m_records;
    let page = m_page + 1;
    let data = {user_id, records, page, status};
    let url = URL.ARTISTS_SPECIFIC;

    const receiver = (response) => {
      let currentData = m_data;
      let incomingData = response.data.data;
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

  renderIsDownloaded = (item) => {
    console.log(item.id);
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
  onPressDownloadAll = async () => {
    this.props.updateDownloadedData({data: this.state, type: 'add'});
    this.state.screenData[0].m_data.map((item, key) => {
      this.props.updateDownloadingSongIds({songId: item.id, type: 'add'});

      let task = RNBackgroundDownloader.download({
        id: item.id.toString(),
        url: item.link,
        destination:
          Platform.OS === 'ios'
            ? `${RNBackgroundDownloader.directories.documents}/${item.id}.${item.extension}`
            : `${FileSystem.documentDirectory}${item.id}.${item.extension}`,
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
    while (0 !== currentIndex) {
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

  onPressAlbumTile = (item) => {
    let {push} = this.props.navigation;
    push('AlbumInfo', item);
  };

  onPressMore = async (item) => {
    this.setState({
      showOptionModal: true,
      selected: item,
    });
  };

  toggleOptionModal = () => {
    const {showOptionModal} = this.state;
    this.setState({showOptionModal: !showOptionModal});
  };

  onPressFollow = () => {
    const {id, favorites} = this.state;
    const configJson = {
      fave_id: id,
      type: 1,
    };
    favorite(this.props, configJson);
    this.setState({
      isFollowed: 1,
      favorites: favorites + 1,
    });
  };

  onPressUnfollow = () => {
    const {id, favorites} = this.state;
    const configJson = {
      fave_id: id,
      type: 1,
    };
    unfavorite(this.props, configJson);
    this.setState({
      isFollowed: 0,
      favorites: favorites - 1,
    });
  };

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

  renderIsFollowed = (state) => {
    if (this.props.account.type === 'guest') {
      return null;
    }
    const isFollowed =
      state === 1 ? (
        <TouchableOpacity
          onPress={() => this.onPressUnfollow()}
          style={styles.follow}
          disabled={this.props.offline}>
          <Like width={DEVICE_WIDTH * 0.03} height={DEVICE_HEIGHT * 0.03} />
          <Text style={styles.followText}>FOLLOWING</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={() => this.onPressFollow()}
          style={styles.follow}
          disabled={this.props.offline}>
          <LikeInactive
            width={DEVICE_WIDTH * 0.03}
            height={DEVICE_HEIGHT * 0.03}
          />
          <Text style={styles.followText}>FOLLOW</Text>
        </TouchableOpacity>
      );

    return isFollowed;
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

  getExtension(str) {
    let r = str.match(/\.([^.]+?)(\?.*)?$/);
    return r && r[1] ? r[1] : '';
  }

  renderSongs = (songs) => {
    const list = songs.map((item, key) => {
      const {
        is_favorite,
        id,
        title,
        extracted_mp3,
        album_image,
        image,
        aws_mp3,
      } = item;
      // let aws_mp3 =
      //   'https://www2.cs.uic.edu/~i101/SoundFiles/PinkPanther30.wav';
      // let aws_mp3 =
      //   'https://christianhubmusic.s3.amazonaws.com/music/02bxZPtkSI6n8QfrMos6ubgkcBvcrVtgQaAocGgC.oga?fbclid=IwAR2I51G1M4f4-Yyvze5xm7OcxdE_eA5EgfJvcDebOx2ZN1L3cgtd4fuh56k';
      // let aws_mp3 =
      //   'https://file-examples-com.github.io/uploads/2017/10/file_example_TIFF_1MB.tiff';
      // let aws_mp3 = undefined;
      const {artist} = this.state;
      item.type = 'artist';
      item.album_image = album_image;
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
      item.uid = 'artist' + this.state.id;

      item.is_Active = true;
      item.index = key;
      // item.url = extracted_mp3 || aws;
      item.url = aws_mp3 || extracted_mp3;
      item.link = aws_mp3 || extracted_mp3;

      item.extension = this.getExtension(item.link);

      item.rating = is_favorite;

      if (key > 4) {
        return null;
      }

      return (
        <View style={styles.section} key={key}>
          <TouchableOpacity
            style={styles.sectionRow}
            onPress={() => this.onPressTile(item)}>
            <Tile data={item} onPressTile={this.onPressTile} />
            <View style={styles.infoSection}>
              <Text style={styles.song}>{title}</Text>
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

  renderAlbums = ({item, index}) => {
    const {artist} = this.state;
    item.labelType = 2;
    item.name = item.label;
    item.artist = artist;
    return <AlbumTile data={item} onPressTile={this.onPressAlbumTile} />;
  };

  getPlayCount = (plays) => {
    return plays < 1000 ? '<1000' : plays;
  };

  render() {
    let {
      screenData,
      artist,
      favorites,
      showOptionModal,
      selected,
      isFollowed,
      image,
      background,
      isLoading,
      plays,
      description,
      genre,
    } = this.state;
    let songs = screenData[0].m_data;
    let albums = screenData[1].m_data;
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
              requestNonPersonalizedAdsOnly: true,
            }}
          />
        )}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => this.props.navigation.pop()}
            style={styles.back}>
            <Back width={DEVICE_WIDTH * 0.05} height={DEVICE_WIDTH * 0.05} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => share('artist', this.state.id)}>
            <View style={styles.rightHeader}>
              <Share width={DEVICE_WIDTH * 0.05} height={DEVICE_WIDTH * 0.05} />
            </View>
          </TouchableOpacity>
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
            <Text style={styles.label}>{artist}</Text>
            <View style={styles.row}>
              <Like
                width={DEVICE_WIDTH * 0.02}
                height={DEVICE_HEIGHT * 0.02}
                style={styles.like}
              />
              <Text
                style={[styles.favourites, {marginRight: DEVICE_WIDTH * 0.03}]}>
                {favorites ? favorites : 0}
              </Text>
              <PlayCount
                width={DEVICE_WIDTH * 0.02}
                height={DEVICE_HEIGHT * 0.02}
                style={styles.like}
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
            <Text style={styles.pop}>Popular Songs</Text>
            {this.renderSongs(songs)}
            <Text style={styles.albums}>Albums</Text>
            <FlatList
              data={albums}
              extraData={this.state}
              style={styles.flatList}
              horizontal={true}
              renderItem={this.renderAlbums}
              keyExtractor={(item, index) => `${index}-${item.id}`}
              // onEndReached={() => this.addData(2)}
              onEndReachedThreshold={0.1}
              //   ListFooterComponent={this.renderFooter.bind(this)}
              decelerationRate={0.5}
            />
            <Text style={styles.albums}>About</Text>
            <View style={styles.aboutContainerImage}>
              <Image
                // source={require('../../assets/images/cmh_logo.png')}
                // source={{
                //   uri:
                //     'https://services.tineye.com/developers/img/meloncat.20c77523.jpg',
                // }}
                source={tileImage}
                style={styles.image}
                resizeMode={'cover'}
              />
            </View>
            <Text style={styles.aboutText}>{description}</Text>
            <Text style={styles.genreText}>Genre</Text>
            <Text style={styles.genreSubText}>{genre}</Text>
          </View>
        </ScrollView>
        <Modal
          isVisible={showOptionModal}
          onBackdropPress={() => this.setState({showOptionModal: false})}
          hideModalContentWhileAnimating={false}>
          <SongOption
            data={selected}
            cancel={() => this.setState({showOptionModal: false})}
            props={this.props}
            from={'artist'}
            onPressFavorite={this.onPressFavorite}
          />
        </Modal>
      </LinearGradient>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingTop: DEVICE_HEIGHT * 0.03,
    paddingBottom: DEVICE_HEIGHT * 0.15,
    alignItems: 'center',
  },
  gradient: {
    paddingTop: DEVICE_HEIGHT * 0.04,
    backgroundColor: 'transparent',
    flex: 1,
  },

  tile: {
    height: DEVICE_WIDTH * 0.3,
    width: DEVICE_WIDTH * 0.3,
    backgroundColor: 'white',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
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
  favourites: {
    fontSize: DEVICE_HEIGHT * 0.02,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
  },
  playsText: {
    fontSize: DEVICE_HEIGHT * 0.02,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    marginRight: DEVICE_WIDTH * 0.02,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: DEVICE_WIDTH * 0.04,
    marginTop:
      Platform.OS === 'ios' ? DEVICE_HEIGHT * 0.05 : DEVICE_HEIGHT * 0.03,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  sectionRow: {
    flexDirection: 'row',
    width: DEVICE_WIDTH * 0.75,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  rightHeader: {
    // flexDirection: 'row',
    // alignItems: 'center',
  },
  like: {
    marginRight: DEVICE_WIDTH * 0.01,
    marginBottom: DEVICE_HEIGHT * 0.003,
  },

  share: {
    marginRight: DEVICE_WIDTH * 0.04,
  },

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
  },

  flatList: {
    marginTop: DEVICE_HEIGHT * 0.02,
    flex: 1,
    width: DEVICE_WIDTH * 1,
    marginBottom: DEVICE_HEIGHT * 0.03,
  },
  infoSection: {
    marginLeft: DEVICE_WIDTH * 0.03,
    justifyContent: 'center',
  },

  section: {
    flexDirection: 'row',
    marginBottom: DEVICE_HEIGHT * 0.04,
    width: DEVICE_WIDTH * 1,
    paddingHorizontal: DEVICE_WIDTH * 0.04,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ActionButton: {
    width: DEVICE_WIDTH * 0.07,
    justifyContent: 'center',
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
    width: DEVICE_WIDTH * 0.6,
  },
  artist: {
    fontSize: DEVICE_HEIGHT * 0.018,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Regular',
    width: DEVICE_WIDTH * 0.6,
  },
  back: {
    // width: DEVICE_WIDTH * 0.1,
    // height: DEVICE_HEIGHT * 0.04,
  },
  aboutContainerImage: {
    marginTop: DEVICE_HEIGHT * 0.02,
    width: DEVICE_WIDTH * 0.9,
    height: DEVICE_HEIGHT * 0.3,
    backgroundColor: 'white',
    borderTopRightRadius: DEVICE_WIDTH * 0.07,
    borderBottomLeftRadius: DEVICE_WIDTH * 0.07,
    borderTopLeftRadius: DEVICE_WIDTH * 0.01,
    borderBottomRightRadius: DEVICE_WIDTH * 0.01,
    overflow: 'hidden',
  },
  aboutText: {
    fontSize: DEVICE_HEIGHT * 0.02,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Regular',
    width: DEVICE_WIDTH * 0.9,
    textAlign: 'left',
    marginTop: DEVICE_HEIGHT * 0.02,
  },
  genreSubText: {
    fontSize: DEVICE_HEIGHT * 0.02,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Regular',
    width: DEVICE_WIDTH * 0.9,
    textAlign: 'left',
  },

  genreText: {
    fontSize: DEVICE_HEIGHT * 0.02,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    width: DEVICE_WIDTH * 0.9,
    textAlign: 'left',
    marginTop: DEVICE_HEIGHT * 0.02,
  },

  loading: {
    width: DEVICE_WIDTH * 0.04,
    height: DEVICE_WIDTH * 0.04,
  },
});

const mapStateToProps = (state) => {
  return {
    account: state.accountReducer.account,
    premium: state.accountReducer.premium,
    playlist: state.appReducer.playlist,
    tabIndex: state.appReducer.tabIndex,
    savedList: state.appReducer.savedList,
    downloadList: state.appReducer.downloadList,
    offline: state.appReducer.offline,
    downloadListInformation: state.appReducer.downloadListInformation,
    playList: state.playerReducer.playList,
    uid: state.playerReducer.uid,
    command: state.playerReducer.command,
    trackListUID: state.playerReducer.trackListUID,
    index: state.playerReducer.index,
    ids: state.playerReducer.ids,
    downloadingSongIds: state.appReducer.downloadingSongIds,
    downloadedSongIds: state.appReducer.downloadedSongIds,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    updatePlaying: (payload) => dispatch(updatePlaying(payload)),
    updateList: (payload) => dispatch(updateList(payload)),
    updateIndex: (payload) => dispatch(updateIndex(payload)),
    updateShowPlayer: (payload) => dispatch(updateShowPlayer(payload)),
    updateUserPlaylist: (payload) => dispatch(updateUserPlaylist(payload)),
    updateTrackListUID: (payload) => dispatch(updateTrackListUID(payload)),
    updatePlayerData: (payload) => dispatch(updatePlayerData(payload)),
    updateRepeat: (payload) => dispatch(updateRepeat(payload)),
    updateCommand: (payload) => dispatch(updateCommand(payload)),
    updateIds: (payload) => dispatch(updateIds(payload)),
    addToSavedList: (payload) => dispatch(addToSavedList(payload)),
    removeFromDownloadList: (payload) =>
      dispatch(removeFromDownloadList(payload)),
    addToDownloadList: (payload) => dispatch(addToDownloadList(payload)),
    removedFromSavedList: (payload) => dispatch(removedFromSavedList(payload)),
    addToDownloadListInformation: (payload) =>
      dispatch(addToDownloadListInformation(payload)),
    updateDownloadedSongIds: (payload) =>
      dispatch(updateDownloadedSongIds(payload)),
    updateDownloadingSongIds: (payload) =>
      dispatch(updateDownloadingSongIds(payload)),
    updateDownloadedData: (payload) => dispatch(updateDownloadedData(payload)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ArtistInfo);
