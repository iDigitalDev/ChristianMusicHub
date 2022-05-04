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
  RefreshControl,
} from 'react-native';

import {
  GRADIENT_COLOR_SET_1,
  DEVICE_HEIGHT,
  DEVICE_WIDTH,
} from '../../constants/constants';

import Tile from '../../components/Tile';
import NetInfo from '@react-native-community/netinfo';
let unsubscribe = null;

import LinearGradient from 'react-native-linear-gradient';

//redux
import {connect} from 'react-redux';
import {update} from '../../redux/actions/app';

//api
import {
  initializeAppData,
  updateSpecificAppData,
} from '../../api/service/actions';

class Artists extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      showDownloaded: false,
      refreshing: false,
    };
  }

  componentDidMount() {
    if (this.props.offline === false) {
      this.setState({
        showDownloaded: false,
      });
    } else {
      this.setState({
        showDownloaded: true,
      });
    }
  }
  componentWillUnmount() {
    // // Unsubscribe
    if (unsubscribe != null) {
      unsubscribe();
    }
  }
  componentDidUpdate(newProps) {
    if (newProps.appData !== this.props.appData) {
      this.setState({
        refreshing: false,
      });
    }
  }

  addData = (id) => {
    updateSpecificAppData(this.props, id);
  };

  onPressTileSavedList = (item) => {
    let {push} = this.props.navigation;
    push('ArtistInfo', item);
  };

  renderSavedList = ({item, index}) => {
    item.labelType = 1;
    item.type = 'artist';
    item.image = item.image;
    item.name = item.artist;
    item.isDownloaded = true;
    return <Tile data={item} onPressTile={this.onPressTileSavedList} />;
  };

  onPressTile = (item) => {
    let {push} = this.props.navigation;
    push('ArtistInfo', item);
  };

  onRefresh = () => {
    const {props} = this;
    this.setState({
      refreshing: true,
    });
    initializeAppData(props);
  };

  renderItem = ({item, index}) => {
    const {gallery, id} = item;
    item.labelType = 1;
    if (gallery !== null) {
      if (gallery.split(',')[0] !== '') {
        item.image = id + '/' + gallery.split(',')[0];
      }
    }
    return <Tile data={item} onPressTile={this.onPressTile} />;
  };

  renderFooter = () => {
    if (!this.state.isLoading) {
      return null;
    }
    return <ActivityIndicator style={{color: '#000'}} />;
  };

  render() {
    const {appData} = this.props;
    const {refreshing} = this.state;
    const featuredArtists = appData[1] && appData[1].data;
    const suggestedArtists = appData[4] && appData[4].data;
    const trendingArtists = appData[5] && appData[5].data;
    let downloadedData = [];
    for (var key in this.props.downloadedData) {
      if (this.props.downloadedData.hasOwnProperty(key)) {
        if (key.includes('artist')) {
          downloadedData.push(this.props.downloadedData[key]);
        }
      }
    }
    return (
      <LinearGradient
        colors={GRADIENT_COLOR_SET_1.COLORS}
        locations={GRADIENT_COLOR_SET_1.LOCATIONS}
        style={styles.mainContainer}>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={this.onRefresh}
            />
          }>
          {this.props.offline && (
            <Text style={styles.categoryText}>Downloads</Text>
          )}
          {this.props.offline && (
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
          )}

          {!this.props.offline && (
            <Text style={styles.categoryText}>Trending Artists</Text>
          )}
          {!this.props.offline && (
            <FlatList
              data={trendingArtists}
              extraData={this.state}
              style={styles.flatList}
              horizontal={true}
              renderItem={this.renderItem}
              keyExtractor={(item, index) => `${index}-${item.id}`}
              onEndReached={() => this.addData(5)}
              onEndReachedThreshold={0.1}
              ListFooterComponent={this.renderFooter.bind(this)}
              decelerationRate={0.96}
            />
          )}
          {!this.props.offline && (
            <Text style={styles.categoryText}>Suggested Artists</Text>
          )}
          {!this.props.offline && (
            <FlatList
              data={suggestedArtists}
              extraData={this.state}
              style={styles.flatList}
              horizontal={true}
              renderItem={this.renderItem}
              keyExtractor={(item, index) => `${index}-${item.id}`}
              onEndReached={() => this.addData(4)}
              onEndReachedThreshold={0.1}
              ListFooterComponent={this.renderFooter.bind(this)}
              decelerationRate={0.96}
            />
          )}
          <View style={{height: DEVICE_HEIGHT * 0.08}} />
        </ScrollView>
      </LinearGradient>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    paddingLeft: DEVICE_WIDTH * 0.01,
    paddingTop: DEVICE_HEIGHT * 0.01,
    backgroundColor: 'transparent',
    flex: 1,
  },
  categoryText: {
    fontSize: DEVICE_HEIGHT * 0.03,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    marginLeft: DEVICE_WIDTH * 0.03,
    marginBottom: DEVICE_HEIGHT * 0.01,
  },
  flatList: {
    marginBottom: DEVICE_HEIGHT * 0.05,
  },
});

const mapStateToProps = (state) => {
  return {
    account: state.accountReducer.account,
    isLogin: state.accountReducer.isLogin,
    savedList: state.appReducer.savedList,
    appData: state.appReducer.appData,
    offline: state.appReducer.offline,
    downloadedData: state.appReducer.downloadedData,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    update: (payload) => dispatch(update(payload)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Artists);
