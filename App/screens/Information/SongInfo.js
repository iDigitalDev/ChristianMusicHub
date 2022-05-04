import React, {Component} from 'react';

import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Image,
  Platform,
} from 'react-native';
import {CMH_ALERT} from '../../components/CMH';
import LinearGradient from 'react-native-linear-gradient';
import * as FileSystem from 'expo-file-system';
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
import Share from '../../assets/svg/Share.svg';

import SongOption from '../../components/SongOption';
import {Loading} from '../../components/Loading';
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

import PlayCount from '../../assets/svg/playCount.svg';
import {share} from '../../components/Share';

import Back from '../../assets/svg/back.svg';
import More from '../../assets/svg/more.svg';
import Like from '../../assets/svg/LikeActive.svg';
import LikeInactive from '../../assets/svg/LikeInActive.svg';
import ShuffleInactive from '../../assets/svg/Shuffle - Inactive.svg';

import Tile from '../../components/Tile@5';
import {favorite, unfavorite} from '../../api/service/actions';
import NetInfo from '@react-native-community/netinfo';
let unsubscribe = null;
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
  updateTrackListUID,
  updatePlayerData,
  updateRepeat,
  updateCommand,
  updateIds,
} from '../../redux/actions/player';

//api
import {POST} from '../../api/service/service';
import {URL} from '../../constants/apirUrls';
import {ScrollView} from 'react-native-gesture-handler';
import Modal, {ModalContent} from 'react-native-modal';

class SongInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      offlineMode: false,
      isDownloaded: props.route.params.isDownloaded,
      background: '#000000',
      id: props.route.params.song_id,
      albumId: props.route.params.album_id,
      artist_image: null,
      album: null,
      image: null,
      isFollowed: null,
      favorites: null,
      showOptionModal: false,
      showDeleteModal: false,
      selected: null,
      plays: null,
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

  initDownloadedData = async () => {
    if (this.state.isDownloaded) {
      await Promise.all(
        this.props.route.params.screenData[0].m_data.map(async (item, key) => {
          item.downloadState = await this.checkDownload(item.id);
          return item;
        }),
      );
      // console.log('here');
      // console.log(this.props.route.params);
      this.setState(this.props.route.params);
    }
  };

  componentDidUpdate(newProps) {
    const {pop} = this.props.navigation;
    if (newProps.tabIndex !== this.props.tabIndex) {
      pop();
    }
    if (this.props.command === true) {
      this.updateData();
      this.props.updateCommand(false);
    }
  }

  updateData = () => {
    let {user_id, authToken} = this.props.account;
    let {screenData, albumId, id, background} = this.state;
    let data = {id: albumId, user_id};
    let url = URL.ALBUM_INFO;
    const receiver = (response) => {
      const {
        songs,
        album,
        favorites,
        artist,
        year,
        is_favorite,
        description,
        artist_image,
        dominant_color,
        streams,
        album_image,
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
        favorites: response.data.favorites,
        description,
        year,
        artist,
        isFollowed: is_favorite,
        artist_image,
        isLoading: false,
        background: useBackGround,
        plays: streams === null ? 0 : streams,
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

  initData = () => {
    let {user_id, authToken} = this.props.account;
    let {screenData, albumId, id, background} = this.state;
    let data = {id: albumId, user_id};
    let url = URL.ALBUM_INFO;
    const receiver = async (response) => {
      const {
        songs,
        album,
        favorites,
        artist,
        year,
        is_favorite,
        description,
        artist_image,
        dominant_color,
        streams,
        album_image,
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
        favorites: response.data.favorites,
        description,
        year,
        artist,
        isFollowed: is_favorite,
        artist_image,
        isLoading: false,
        background: useBackGround,
        plays: streams === null ? 0 : streams,
        trackListUID: 'album' + albumId,
        type: 'album',
      });
      let playThisIndex = null;

      const found = songs.find((element) => {
        let songId = element.id;
        let songIndex = element.index;
        parseInt(id) === songId ? (playThisIndex = songIndex) : null;
      });
      // this.onAutoPlay(playThisIndex);
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
    const trackID = screenData[0].m_data[index].song_id;
    this.props.updateIds({index, trackListUID, trackList});
  };
  onAutoPlay = async (index) => {
    this.props.updateRepeat(null);
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

  goToArtist = () => {
    const {artist_image, artist_id} = this.state;

    const item = {
      id: artist_id,
      image: artist_id + '/' + artist_image.split(',')[0],
    };

    let {push} = this.props.navigation;
    push('ArtistInfo', item);
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

  onPressMore = (item) => {
    this.setState({
      showOptionModal: true,
      selected: item,
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

  renderIsFave = (state, id, key) => {
    if (this.props.account.type === 'guest') {
      return null;
    }
    const isFave =
      state === 1 ? (
        <TouchableOpacity
          disabled={this.state.offlineMode}
          onPress={() => this.onPressUnfavorite(id, key)}
          style={styles.ActionButton}>
          <Like width={DEVICE_WIDTH * 0.03} height={DEVICE_HEIGHT * 0.03} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          disabled={this.state.offlineMode}
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
  onPressFollow = () => {
    const {albumId} = this.state;
    const configJson = {
      fave_id: albumId,
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
          disabled={this.state.offlineMode}
          onPress={() => this.onPressUnfollow()}
          style={styles.follow}>
          <Like width={DEVICE_WIDTH * 0.03} height={DEVICE_HEIGHT * 0.03} />
          <Text style={styles.followText}>FOLLOWING</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          disabled={this.state.offlineMode}
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

  checkDownload = async (id) => {
    const localDir = `${RNBackgroundDownloader.directories.documents}/${id}.mp3`;
    // console.log(localDir);
    const downloaded = await RNFetchBlob.fs.exists(localDir);
    // return {...item, downloaded, localDir};
    // console.log({...id, downloaded, localDir});

    return downloaded;
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
      item.uid = 'album' + this.state.albumId;

      item.is_Active = true;
      item.index = key;
      item.url = extracted_mp3;
      item.rating = is_favorite;

      // item.url = extracted_mp3 || aws;
      item.url = aws_mp3 || extracted_mp3;
      item.link = aws_mp3 || extracted_mp3;

      item.extension = this.getExtension(item.link);

      console.log(item.extension);

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
              disabled={this.state.offlineMode}
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
      // return (
      //   <View style={styles.section} key={key}>
      //     <TouchableOpacity
      //       style={styles.sectionRow}
      //       onPress={() => this.onPressTile(item)}>
      //       <Tile data={item} onPressTile={this.onPressTile} />
      //       <View style={styles.infoSection}>
      //         <Text style={styles.song}>
      //           {song}qweqweqweqweqweqweqweqweqweqweqweqweqweqweqweqwe
      //         </Text>
      //         <Text style={styles.artist}>
      //           {artist}qweqweqweqweqweqweqweqweqweqweqweqwe
      //         </Text>
      //       </View>
      //     </TouchableOpacity>
      //     <View style={styles.songOptionsContainer}>
      //       {this.renderIsFave(is_favorite, id, key)}

      //       <TouchableOpacity
      //         onPress={() => this.onPressMore(item)}
      //         style={styles.ActionButton}>
      //         <More
      //           width={DEVICE_WIDTH * 0.03}
      //           height={DEVICE_HEIGHT * 0.03}
      //           style={styles.more}
      //         />
      //       </TouchableOpacity>
      //     </View>
      //   </View>
      // );
    });
    return list;
  };
  getPlayCount = (plays) => {
    return plays < 1000 ? '<1000' : plays;
  };
  render() {
    let {
      screenData,
      album,
      description,
      year,
      showOptionModal,
      selected,
      artist,
      isFollowed,
      image,
      background,
      isLoading,
      plays,
    } = this.state;
    let songs = screenData[0].m_data;
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
          <TouchableOpacity onPress={() => share('album', this.state.albumId)}>
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
            <Text style={styles.label}>{album}</Text>
            <Text style={styles.label2}>
              {artist} - {year}
            </Text>
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

            <Text style={styles.pop}></Text>
            {this.renderSongs(songs)}
          </View>
        </ScrollView>
        <Modal
          isVisible={showOptionModal}
          onBackdropPress={() => this.setState({showOptionModal: false})}
          hideModalContentWhileAnimating={true}>
          <SongOption
            data={selected}
            cancel={() => this.setState({showOptionModal: false})}
            props={this.props}
            from={'album'}
            onPressFavorite={this.onPressFavorite}
          />
        </Modal>
      </LinearGradient>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    paddingTop: DEVICE_HEIGHT * 0.03,
    paddingBottom: DEVICE_HEIGHT * 0.1,
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
    width: DEVICE_WIDTH * 0.8,
    textAlign: 'center',
  },
  label2: {
    fontSize: DEVICE_HEIGHT * 0.02,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    marginTop: DEVICE_HEIGHT * 0.01,
    width: DEVICE_WIDTH * 0.8,
    textAlign: 'center',
  },
  favourites: {
    fontSize: DEVICE_HEIGHT * 0.02,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: DEVICE_WIDTH * 0.04,
    marginTop:
      Platform.OS === 'ios' ? DEVICE_HEIGHT * 0.05 : DEVICE_HEIGHT * 0.03,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    width: DEVICE_WIDTH * 0.8,
    height: DEVICE_HEIGHT * 0.1,
    backgroundColor: 'red',
  },

  share: {
    marginRight: DEVICE_WIDTH * 0.04,
  },
  image: {
    width: '100%',
    height: '100%',
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
  sectionRow: {
    flexDirection: 'row',
    width: DEVICE_WIDTH * 0.75,
  },
  followText: {
    fontSize: DEVICE_HEIGHT * 0.02,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    marginLeft: DEVICE_WIDTH * 0.02,
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
  },
  infoSection: {
    marginLeft: DEVICE_WIDTH * 0.03,
    justifyContent: 'center',
  },
  rightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  like: {
    marginRight: DEVICE_WIDTH * 0.01,
    marginBottom: DEVICE_HEIGHT * 0.003,
  },
  description: {
    fontSize: DEVICE_HEIGHT * 0.02,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    marginTop: DEVICE_HEIGHT * 0.01,
  },
  artistTitle: {
    fontSize: DEVICE_HEIGHT * 0.02,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
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

  loading: {
    width: DEVICE_WIDTH * 0.04,
    height: DEVICE_WIDTH * 0.04,
  },

  songOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  song: {
    fontSize: DEVICE_HEIGHT * 0.021,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
  },
  artist: {
    fontSize: DEVICE_HEIGHT * 0.018,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Regular',
  },
  back: {
    width: DEVICE_WIDTH * 0.1,
    height: DEVICE_HEIGHT * 0.04,
  },
});

const mapStateToProps = (state) => {
  return {
    premium: state.accountReducer.premium,
    account: state.accountReducer.account,
    playlist: state.appReducer.playlist,
    tabIndex: state.appReducer.tabIndex,
    playList: state.playerReducer.playList,
    playListUID: state.playerReducer.playListUID,
    command: state.playerReducer.command,
    trackListUID: state.playerReducer.trackListUID,
    savedList: state.appReducer.savedList,
    downloadListInformation: state.appReducer.downloadListInformation,
    offline: state.appReducer.offline,
    downloadList: state.appReducer.downloadList,
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
export default connect(mapStateToProps, mapDispatchToProps)(SongInfo);
