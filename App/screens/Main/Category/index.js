import React, {Component} from 'react';

import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Button,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Linking,
} from 'react-native';

import {
  GRADIENT_COLOR_SET_1,
  DEVICE_HEIGHT,
  DEVICE_WIDTH,
} from '../../../constants/constants';
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
import Tile3 from '../../../components/Tile@3';
import AlbumTile from '../../../components/AlbumTile';

import LinearGradient from 'react-native-linear-gradient';

//redux
import {connect} from 'react-redux';
import {login} from '../../../redux/actions/account';

import {GET} from '../../../api/service/service';
import {URL} from '../../../constants/apirUrls';

import {test_genre} from '../../../constants/test';

class Category extends Component {
  constructor(props) {
    super(props);
    this.state = {
      genre: [],
      moods: [],
      isLoading: false,
    };
  }

  componentDidMount() {
    this.initData();
    Linking.addEventListener('url', (data) => {
      console.log('Listener on categories');
      this.navigate(data.url);
    });
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

  initData = () => {
    // this.setState({
    //   genre: test_genre,
    //   moods: test_genre,
    //   isLoading: false,
    // });
    let {user_id, authToken} = this.props.account;
    let data = {user_id};
    let url = URL.GET_GENRES;

    const receiver = (response) => {
      const {success} = response;
      if (success) {
        const {genres} = response;
        this.setState({
          genre: genres,
        });
      } else {
        alert('Failed to fetch genres');
      }
    };

    let payload = {
      data,
      url,
      receiver,
      authToken,
    };
    GET(payload);
  };

  onPressTile = (data) => {
    let {push} = this.props.navigation;
    push('SubCategory', data);
  };

  renderList = (data, type) => {
    const genreList = data.map((item, key) => {
      return (
        <Tile3 data={item} onPressTile={this.onPressTile} i={key} key={key} />
      );
    });

    return genreList;
  };

  render() {
    let {genre, moods} = this.state;
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
        <Text style={styles.headerText}>Genres</Text>
        <ScrollView>
          {/* <Text style={styles.subHeaderText}>Genres</Text> */}
          <View style={styles.list}>{this.renderList(genre, 'Genre')}</View>
          {/* <Text style={styles.subHeaderText}>Moods</Text>
          <View style={styles.list}>{this.renderList(moods, 'Moods')}</View> */}
          <View style={styles.spacer} />
        </ScrollView>
      </LinearGradient>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    paddingLeft: DEVICE_WIDTH * 0.01,
    paddingTop: DEVICE_HEIGHT * 0.05,
    alignItems: 'center',
    backgroundColor: 'transparent',
    justifyContent: 'center',

    flex: 1,
  },
  spacer: {
    height: DEVICE_HEIGHT * 0.1,
  },
  headerText: {
    fontSize: DEVICE_HEIGHT * 0.03,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    marginBottom: DEVICE_HEIGHT * 0.05,
  },
  subHeaderText: {
    fontSize: DEVICE_HEIGHT * 0.025,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    alignSelf: 'center',
    marginTop: DEVICE_HEIGHT * 0.05,
    marginBottom: DEVICE_HEIGHT * 0.03,
  },
  list: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  flatList: {
    marginBottom: DEVICE_HEIGHT * 0.05,
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

export default connect(mapStateToProps, mapDispatchToProps)(Category);
