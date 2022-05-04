import React, {Component} from 'react';

import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  TextInput,
  FlatList,
  Keyboard,
  TouchableWithoutFeedback,
  Linking,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  GRADIENT_COLOR_SET_1,
  DEVICE_HEIGHT,
  DEVICE_WIDTH,
} from '../../constants/constants';
import Back from '../../assets/svg/back.svg';
import Tile from '../../components/Tile@4';
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
import {login} from '../../redux/actions/account';

//api
import {POST} from '../../api/service/service';
import {URL} from '../../constants/apirUrls';
import {ScrollView} from 'react-native-gesture-handler';

class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      searchInput: '',
      songs: [],
      artists: [],
      playlists: [],
      albums: [],
      recentSongs: [],
      recentArtists: [],
      recentPlaylists: [],
      recentAlbums: [],
      screenData: [
        {
          m_data: [],
          m_page: 0,
          m_status: 1,
          m_records: 5,
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
    this.initData();
    Linking.addEventListener('url', (data) => {
      console.log('Listener on search');
      this.navigate(data.url);
    });
  }

  componentWillUnmount = () => {
    // Linking.removeEventListener('url', (data) => {
    //   console.log('removed on search');
    // });
  };

  renderSearchItems = () => {};

  onPressLogin = () => {
    this.props.navigation.navigate('Login');
  };

  clear = () => {
    //recentsearch placeholder call only
    let {user_id, authToken} = this.props.account;
    let data = {user_id};
    let url = URL.CLEAR_SEARCH;

    const receiver = (response) => {
      console.log(response);
      this.initData();
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
    //recentsearch placeholder call only
    let {user_id, authToken} = this.props.account;
    let data = {user_id};
    let url = URL.RECENT_SEARCH;

    const receiver = (response) => {
      const {tracks, albums, artists, playlists} = response.data;
      this.setState({
        isLoading: false,
        recentSongs: tracks,
        recentArtists: artists,
        recentAlbums: albums,
        recentPlaylists: playlists,
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

  searchData = (searchWord) => {
    this.setState({
      searchInput: searchWord,
    });
    let {user_id, authToken} = this.props.account;
    let {screenData} = this.state;
    let search = searchWord;
    let data = {search, user_id};
    let url = URL.SEARCH;
    const receiver = (response) => {
      const {tracks, albums, artists, playlists} = response.data;
      this.setState({
        isLoading: false,
        songs: tracks,
        artists,
        albums,
        playlists,
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

  addSearch = (config) => {
    let {user_id, authToken} = this.props.account;
    let {id, type} = config;
    let data = {search_id: id, user_id, type};
    let url = URL.ADD_SEARCH;
    const receiver = (response) => {
      const {success} = response;
      if (success) {
        this.initData();
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

  onPressTile = (item) => {
    let {type, id} = item;
    console.log(item);
    let {push} = this.props.navigation;
    let config = {
      id,
    };
    if (type === 'artist') {
      config.type = 1;
      this.addSearch(config);
      push('ArtistInfo', item);
    } else if (type === 'album') {
      config.type = 2;
      this.addSearch(config);
      push('AlbumInfo', item);
    } else if (type === 'song') {
      config.type = 3;
      config.id = item.song_id;
      this.addSearch(config);
      push('SongInfo', item);
    } else if (type === 'playlist') {
      config.type = 4;
      this.addSearch(config);
      push('PlaylistInfo', item);
    }
  };

  onPressBack = () => {
    this.setState({
      searchInput: '',
    });
    this.textInput.clear();
  };

  renderItem = ({item, index}) => {
    let label = item.album;
    let name = item.artist;
    return (
      <TouchableOpacity
        style={styles.resultItem}
        onPressTile={this.onPressTile(item)}>
        <Tile data={item} onPressTile={this.onPressTile} />
        <View style={styles.infoContainer}>
          <Text style={styles.album}>{label}</Text>
          <Text style={styles.artist}>{name}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  renderSongs = (songs) => {
    const list = songs.map((item, key) => {
      const {
        is_favorite,
        id,
        extracted_mp3,
        artist,
        image,
        song_image,
        album_image,
      } = item;
      console.log(item);
      let song = item.name;
      // item.artist_image = artist_id + '/' + artist_image.split(',')[0];
      item.type = 'song';
      item.index = key;
      item.link = extracted_mp3;
      item.image = album_image;
      item.lyrics = '';

      return (
        <TouchableOpacity
          style={styles.section}
          key={key}
          onPress={() => this.onPressTile(item)}>
          <View style={{flexDirection: 'row'}}>
            <Tile data={item} onPressTile={this.onPressTile} />
            <View style={styles.infoSection}>
              <Text style={styles.song}>{song}</Text>
              <Text style={styles.artist}>{artist}</Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    });

    return list;
  };

  renderArtists = (artists) => {
    const list = artists.map((item, key) => {
      const {is_favorite, id, extracted_mp3, artist, image, gallery} = item;
      // item.artist_image = artist_id + '/' + artist_image.split(',')[0];
      item.index = key;
      item.link = extracted_mp3;
      item.labelType = 1;
      if (gallery !== null) {
        item.image = id + '/' + gallery.split(',')[0];
      }

      return (
        <TouchableOpacity
          style={styles.section}
          key={key}
          onPress={() => this.onPressTile(item)}>
          <View style={{flexDirection: 'row'}}>
            <Tile data={item} onPressTile={this.onPressTile} />
            <View style={styles.infoSection}>
              <Text style={styles.song}>{item.name}</Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    });

    return list;
  };

  renderAlbums = (albums) => {
    const list = albums.map((item, key) => {
      const {artist, name} = item;

      return (
        <TouchableOpacity
          style={styles.section}
          key={key}
          onPress={() => this.onPressTile(item)}>
          <View style={{flexDirection: 'row'}}>
            <Tile data={item} onPressTile={this.onPressTile} />
            <View style={styles.infoSection}>
              <Text style={styles.album}>{name}</Text>
              <Text style={styles.song}>{artist}</Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    });

    return list;
  };

  renderPlaylists = (playlists) => {
    const list = playlists.map((item, key) => {
      const {artist, name} = item;
      console.log(item);

      return (
        <TouchableOpacity
          style={styles.section}
          key={key}
          onPress={() => this.onPressTile(item)}>
          <View style={{flexDirection: 'row'}}>
            <Tile data={item} onPressTile={this.onPressTile} />
            <View style={styles.infoSection}>
              <Text style={styles.album}>{name}</Text>
              <Text style={styles.song}>{artist}</Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    });

    return list;
  };

  isHistoryEmpty = () => {
    let {
      recentAlbums,
      recentPlaylists,
      recentArtists,
      recentSongs,
    } = this.state;

    if (
      recentAlbums.length === 0 &&
      recentPlaylists.length === 0 &&
      recentArtists.length === 0 &&
      recentSongs.length === 0
    ) {
      return true;
    } else {
      return false;
    }
  };
  render() {
    let {
      screenData,
      searchInput,
      songs,
      artists,
      albums,
      playlists,
      recentAlbums,
      recentPlaylists,
      recentArtists,
      recentSongs,
    } = this.state;
    const isHistoryEmpty = this.isHistoryEmpty();
    let showResults = searchInput.length > 0 ? true : false;

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
        <Text style={styles.header}>Search</Text>

        <View style={styles.searchContainer}>
          <TouchableOpacity onPress={() => this.onPressBack()}>
            <Back
              width={DEVICE_WIDTH * 0.03}
              height={DEVICE_HEIGHT * 0.03}
              style={styles.back}
            />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder={'Search Entry Here'}
            placeholderTextColor="gray"
            onChangeText={(text) => this.searchData(text)}
            ref={(input) => {
              this.textInput = input;
            }}
          />
        </View>

        {!showResults && !isHistoryEmpty ? (
          <View style={styles.optionsContainer}>
            <Text style={styles.recent}>Recent Searches</Text>
            <TouchableOpacity onPress={() => this.clear()}>
              <Text style={styles.clear}>CLEAR</Text>
            </TouchableOpacity>
          </View>
        ) : null}
        {isHistoryEmpty && !showResults && (
          <Text style={styles.discover}>Search and discover today.</Text>
        )}
        {showResults ? (
          <View style={styles.resultsContainer}>
            <ScrollView
              keyboardShouldPersistTaps="always"
              keyboardDismissMode="on-drag">
              {artists.length !== 0 && <Text style={styles.type}>Artists</Text>}
              {this.renderArtists(artists)}
              {songs.length !== 0 && <Text style={styles.type}>Songs</Text>}
              {this.renderSongs(songs)}
              {albums.length !== 0 && <Text style={styles.type}>Albums</Text>}
              {this.renderAlbums(albums)}
              {playlists.length !== 0 && (
                <Text style={styles.type}>Playlists</Text>
              )}
              {this.renderPlaylists(playlists)}
              <View style={{height: DEVICE_HEIGHT * 0.3}}></View>
            </ScrollView>
          </View>
        ) : (
          // <FlatList
          //   data={results}
          //   extraData={this.state}
          //   style={styles.list}
          //   renderItem={this.renderItem}
          //   keyExtractor={(item, index) => `${index}-${item.id}`}
          //   // onEndReached={() => this.addData(0)}
          //   // onEndReachedThreshold={0.1}
          //   // ListFooterComponent={this.renderFooter.bind(this)}
          //   decelerationRate={0.5}
          // />
          // <FlatList
          //   data={recent}
          //   extraData={this.state}
          //   style={styles.list}
          //   renderItem={this.renderItem}
          //   keyExtractor={(item, index) => `${index}-${item.id}`}
          //   // onEndReached={() => this.addData(0)}
          //   // onEndReachedThreshold={0.1}
          //   // ListFooterComponent={this.renderFooter.bind(this)}
          //   ListFooterComponent={
          //     <View style={{margin: DEVICE_HEIGHT * 0.05}} />
          //   }
          //   decelerationRate={0.5}
          // />
          <View style={styles.resultsContainer}>
            <ScrollView
              keyboardShouldPersistTaps="always"
              keyboardDismissMode="on-drag">
              {recentArtists.length !== 0 && (
                <Text style={styles.type}>Artists</Text>
              )}
              {this.renderArtists(recentArtists)}
              {recentSongs.length !== 0 && (
                <Text style={styles.type}>Songs</Text>
              )}
              {this.renderSongs(recentSongs)}
              {recentAlbums.length !== 0 && (
                <Text style={styles.type}>Albums</Text>
              )}
              {this.renderAlbums(recentAlbums)}
              {recentPlaylists.length !== 0 && (
                <Text style={styles.type}>Playlists</Text>
              )}
              {this.renderPlaylists(recentPlaylists)}
              <View style={{height: DEVICE_HEIGHT * 0.3}}></View>
            </ScrollView>
          </View>
        )}
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
    alignSelf: 'center',
    fontSize: DEVICE_HEIGHT * 0.03,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    marginBottom: DEVICE_HEIGHT * 0.03,
  },
  type: {
    fontSize: DEVICE_HEIGHT * 0.022,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    marginLeft: DEVICE_WIDTH * 0.04,
    marginBottom: DEVICE_HEIGHT * 0.02,
  },
  resultItem: {
    flexDirection: 'row',
    height: DEVICE_HEIGHT * 0.1,
    marginBottom: DEVICE_HEIGHT * 0.02,
    marginLeft: DEVICE_WIDTH * 0.05,
    alignItems: 'center',
  },

  infoContainer: {
    marginLeft: DEVICE_WIDTH * 0.03,
    justifyContent: 'space-around',
  },

  album: {
    fontSize: DEVICE_HEIGHT * 0.022,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
  },
  infoSection: {
    marginLeft: DEVICE_WIDTH * 0.03,
    justifyContent: 'center',
  },
  artist: {
    fontSize: DEVICE_HEIGHT * 0.022,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Regular',
  },
  section: {
    width: DEVICE_WIDTH * 0.9,
    marginLeft: DEVICE_WIDTH * 0.05,
    marginBottom: DEVICE_HEIGHT * 0.02,
  },

  searchContainer: {
    width: DEVICE_WIDTH * 1,
    height: DEVICE_HEIGHT * 0.07,
    backgroundColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
  },
  song: {
    fontSize: DEVICE_HEIGHT * 0.021,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
  },

  back: {
    marginLeft: DEVICE_WIDTH * 0.05,
    marginRight: DEVICE_WIDTH * 0.03,
  },

  input: {
    height: DEVICE_HEIGHT * 0.06,
    fontSize: DEVICE_HEIGHT * 0.025,
    color: 'white',
  },

  optionsContainer: {
    width: DEVICE_WIDTH * 1,
    height: DEVICE_HEIGHT * 0.07,
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingHorizontal: DEVICE_WIDTH * 0.05,
    marginTop: DEVICE_HEIGHT * 0.02,
    alignItems: 'center',
    marginBottom: DEVICE_HEIGHT * 0.02,
  },

  recent: {
    fontSize: DEVICE_HEIGHT * 0.025,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
  },
  clear: {
    fontSize: DEVICE_HEIGHT * 0.022,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
  },
  playlist: {
    height: DEVICE_HEIGHT * 0.12,
    width: DEVICE_WIDTH * 1,
  },
  discover: {
    fontSize: DEVICE_HEIGHT * 0.03,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Regular',
    width: DEVICE_WIDTH * 1,
    textAlign: 'center',
    marginTop: DEVICE_HEIGHT * 0.1,
  },
  list: {
    flex: 1,
  },

  resultsContainer: {
    width: DEVICE_WIDTH * 1,
    height: DEVICE_HEIGHT * 0.65,
    marginTop: DEVICE_HEIGHT * 0.02,
  },
});

const mapStateToProps = (state) => {
  return {
    account: state.accountReducer.account,
    isLogin: state.accountReducer.isLogin,
    premium: state.accountReducer.premium,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    login: (payload) => dispatch(login(payload)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Search);
