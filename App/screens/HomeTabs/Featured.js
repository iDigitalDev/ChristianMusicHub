import React, {Component} from 'react';
import {URL} from '../../api/service/urls';
import {POST, DELETE, PUT} from '../../api/service/service';
import NetInfo from '@react-native-community/netinfo';

import {
  StyleSheet,
  Text,
  ScrollView,
  FlatList,
  ActivityIndicator,
  View,
  Linking,
  Platform,
} from 'react-native';

import {
  GRADIENT_COLOR_SET_1,
  DEVICE_HEIGHT,
  DEVICE_WIDTH,
  LOGIN_BG,
} from '../../constants/constants';

import Tile from '../../components/Tile';

import LinearGradient from 'react-native-linear-gradient';

//redux
import {connect} from 'react-redux';
import {update, updateIsFinished} from '../../redux/actions/app';

//api
import {
  initializeAppData,
  updateSpecificAppData,
} from '../../api/service/actions';

import {Loading} from '../../components/Loading';
let unsubscribe = null;
class Featured extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      refreshing: false,
      recentlyPlayed: [],
      showDownloaded: false,
    };
  }

  componentDidMount() {
    const {props} = this;
    if (this.props.offline === false) {
      initializeAppData(props);
    } else {
      this.props.updateIsFinished(true);
    }

    Linking.addEventListener('url', (data) => {
      console.log('listened on main');
      this.navigate(data.url);
    });
    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      this.getRecentlyPlayed();
    });

    if (Platform.OS === 'android') {
      Linking.getInitialURL().then((linkUrl) => {
        this.navigate(linkUrl);
      });
    } else {
      // alert('ios');
      // Linking.addEventListener('url', this.handleOpenURL);
    }
    // unsubscribe = NetInfo.addEventListener((state) => {
    //   // alert('Connection type', state.type);
    //   if (state.isConnected === true) {

    //   } else {
    //     this.setState({
    //       showDownloaded: true,
    //     });
    //     this.props.update({});
    //   }
    // });
  }
  componentWillUnmount() {
    this._unsubscribe();
    Linking.removeEventListener('url', (data) => {
      console.log('removed listener on main');
    });
    // // Unsubscribe
    if (unsubscribe != null) {
      unsubscribe();
    }
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

  addData = (id) => {
    updateSpecificAppData(this.props, id);
  };

  onPressTile = (item) => {
    let {type} = item;
    let {push} = this.props.navigation;
    if (type === 'artist') {
      push('ArtistInfo', item);
    } else if (type === 'album') {
      push('AlbumInfo', item);
    } else if (type === 'song') {
      push('SongInfo', item);
    } else if (type === 'playlist') {
      push('PlaylistInfo', item);
    }
  };

  onPressTileSavedList = (item) => {
    let {type} = item;
    let {push} = this.props.navigation;
    console.log(type);
    if (type === 'artist') {
      push('ArtistInfo', item);
    } else if (type === 'album') {
      push('AlbumInfo', item);
    } else if (type === 'song') {
      push('SongInfo', item);
    } else if (type === 'playlist') {
      push('PlaylistInfo', item);
    } else if (type === 'userPlaylist') {
      push('UserPlaylistInfo', item);
    }
  };

  renderItem = ({item, index}) => {
    if (item.plays !== undefined) {
      item.type = 'song';
    }
    if (item.type === 'artist') {
      const {gallery, id} = item;
      item.labelType = 1;
      if (gallery !== null) {
        item.image = id + '/' + gallery.split(',')[0];
      }
    }
    // if (item.type === 'playlist') {
    //   console.log(item);
    // }
    item.labelType = 0;
    return <Tile data={item} onPressTile={this.onPressTile} />;
  };

  renderSavedList = ({item, index}) => {
    item.labelType = 0;
    item.image = item.image;
    if (item.type === 'artist') {
      item.name = item.artist;
    } else if (item.type === 'album') {
      item.name = item.album;
    } else if (item.type === 'playlist') {
      item.name = item.playlist;
    } else if (item.type === 'userPlaylist') {
      item.name = item.playlist;
    }
    item.isDownloaded = true;
    return <Tile data={item} onPressTile={this.onPressTileSavedList} />;
  };

  renderFooter = () => {
    if (!this.state.isLoading) {
      return null;
    }
    return <ActivityIndicator style={{color: '#000'}} />;
  };

  onRefresh = () => {
    const {props} = this;
    this.setState({
      refreshing: true,
    });
    initializeAppData(props);
  };

  componentDidUpdate(newProps) {
    if (newProps.appData !== this.props.appData) {
      this.setState({
        refreshing: false,
      });
    }
  }

  render() {
    const {appData, initFinished} = this.props;
    const {refreshing, recentlyPlayed} = this.state;
    // const recentlyPlayed = appData[0].data;
    const featuredArtists = appData[1] && appData[1].data;
    const featuredAlbums = appData[2] && appData[2].data;
    const featuredPlaylists = appData[3] && appData[3].data;
    const featuredSongs = appData[9] && appData[9].data;
    const hotPicks = appData[10] && appData[10].data;
    const newReleases = appData[6] && appData[6].data;

    let downloadedData = [];
    for (var key in this.props.downloadedData) {
      if (this.props.downloadedData.hasOwnProperty(key)) {
        downloadedData.push(this.props.downloadedData[key]);
      }
    }

    if (this.props.offline) {
      return (
        <LinearGradient
          colors={GRADIENT_COLOR_SET_1.COLORS}
          locations={GRADIENT_COLOR_SET_1.LOCATIONS}
          style={styles.mainContainer}>
          <ScrollView
          // refreshControl={
          //   <RefreshControl
          //     refreshing={refreshing}
          //     onRefresh={this.onRefresh}
          //   />
          // }
          >
            <Text style={styles.sectionText}>Downloads</Text>
            <FlatList
              data={downloadedData}
              extraData={this.state}
              style={styles.flatList}
              horizontal={true}
              renderItem={this.renderSavedList}
              keyExtractor={(item, index) => `${index}-${item.id}`}
              // onEndReached={() => this.addData(10)}
              onEndReachedThreshold={0.1}
              // ListFooterComponent={this.renderFooter.bind(this)}
              decelerationRate={0.96}
            />
          </ScrollView>
        </LinearGradient>
      );
    }

    return !initFinished ? (
      <Loading />
    ) : (
      <LinearGradient
        colors={GRADIENT_COLOR_SET_1.COLORS}
        locations={GRADIENT_COLOR_SET_1.LOCATIONS}
        style={styles.mainContainer}>
        <ScrollView
        // refreshControl={
        //   <RefreshControl
        //     refreshing={refreshing}
        //     onRefresh={this.onRefresh}
        //   />
        // }
        >
          {recentlyPlayed.length !== 0 &&
            this.props.account.type !== 'guest' && (
              <Text style={styles.sectionText}>Recently Played</Text>
            )}
          {this.props.account.type !== 'guest' && (
            <FlatList
              data={recentlyPlayed}
              extraData={this.state}
              style={styles.flatList}
              horizontal={true}
              renderItem={this.renderItem}
              keyExtractor={(item, index) => `${index}-${item.id}`}
              // onEndReached={() => this.addData(0)}
              onEndReachedThreshold={0.1}
              // ListFooterComponent={this.renderFooter.bind(this)}
              decelerationRate={0.96}
            />
          )}

          <Text style={styles.sectionText}>Hot Picks</Text>
          <FlatList
            data={hotPicks}
            extraData={this.state}
            style={styles.flatList}
            horizontal={true}
            renderItem={this.renderItem}
            keyExtractor={(item, index) => `${index}-${item.id}`}
            // onEndReached={() => this.addData(10)}
            onEndReachedThreshold={0.1}
            // ListFooterComponent={this.renderFooter.bind(this)}
            decelerationRate={0.96}
          />
          <Text style={styles.sectionText}>New Releases</Text>
          <FlatList
            data={newReleases}
            extraData={this.state}
            style={styles.flatList}
            horizontal={true}
            renderItem={this.renderItem}
            keyExtractor={(item, index) => `${index}-${item.id}`}
            // onEndReached={() => this.addData(6)}
            onEndReachedThreshold={0.1}
            // ListFooterComponent={this.renderFooter.bind(this)}
            decelerationRate={0.96}
          />
          <Text style={styles.sectionText}>Featured Artists</Text>
          <FlatList
            data={featuredArtists}
            extraData={this.state}
            style={styles.flatList}
            horizontal={true}
            renderItem={this.renderItem}
            keyExtractor={(item, index) => `${index}-${item.id}`}
            // onEndReached={() => this.addData(1)}
            onEndReachedThreshold={0.1}
            // ListFooterComponent={this.renderFooter.bind(this)}
            decelerationRate={0.96}
          />
          <Text style={styles.sectionText}>Featured Albums</Text>
          <FlatList
            data={featuredAlbums}
            extraData={this.state}
            style={styles.flatList}
            horizontal={true}
            renderItem={this.renderItem}
            keyExtractor={(item, index) => `${index}-${item.id}`}
            // onEndReached={() => this.addData(2)}
            onEndReachedThreshold={0.1}
            // ListFooterComponent={this.renderFooter.bind(this)}
            decelerationRate={0.96}
          />
          <Text style={styles.sectionText}>Featured Songs</Text>
          <FlatList
            data={featuredSongs}
            extraData={this.state}
            style={styles.flatList}
            horizontal={true}
            renderItem={this.renderItem}
            keyExtractor={(item, index) => `${index}-${item.id}`}
            // onEndReached={() => this.addData(9)}
            onEndReachedThreshold={0.1}
            // ListFooterComponent={this.renderFooter.bind(this)}
            decelerationRate={0.96}
          />

          <Text style={styles.sectionText}>Featured Playlists</Text>
          <FlatList
            data={featuredPlaylists}
            extraData={this.state}
            style={styles.flatList}
            horizontal={true}
            renderItem={this.renderItem}
            keyExtractor={(item, index) => `${index}-${item.id}`}
            onEndReached={() => this.addData(3)}
            onEndReachedThreshold={0.1}
            // ListFooterComponent={this.renderFooter.bind(this)}
            decelerationRate={0.96}
          />
          <View style={{height: DEVICE_HEIGHT * 0.08}} />
        </ScrollView>
      </LinearGradient>
    );
    // );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    paddingLeft: DEVICE_WIDTH * 0.01,
    paddingTop: DEVICE_HEIGHT * 0.01,
    backgroundColor: 'transparent',

    flex: 1,
  },
  sectionText: {
    fontSize: DEVICE_HEIGHT * 0.03,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    marginLeft: DEVICE_WIDTH * 0.03,
    marginBottom: DEVICE_HEIGHT * 0.02,
  },

  flatList: {},
});

const mapStateToProps = (state) => {
  return {
    account: state.accountReducer.account,
    premium: state.accountReducer.premium,
    isLogin: state.accountReducer.isLogin,
    appData: state.appReducer.appData,
    initFinished: state.appReducer.initFinished,
    savedList: state.appReducer.savedList,
    offline: state.appReducer.offline,
    downloadedData: state.appReducer.downloadedData,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    update: (payload) => dispatch(update(payload)),
    updateIsFinished: (payload) => dispatch(updateIsFinished(payload)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Featured);
