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
} from 'react-native';

import {
  GRADIENT_COLOR_SET_1,
  DEVICE_HEIGHT,
  DEVICE_WIDTH,
} from '../../constants/constants';
import NetInfo from '@react-native-community/netinfo';
let unsubscribe = null;
import Tile from '../../components/Tile@2';

import LinearGradient from 'react-native-linear-gradient';

//redux
import {connect} from 'react-redux';
import {update} from '../../redux/actions/app';

//api
import {
  initializeAppData,
  updateSpecificAppData,
} from '../../api/service/actions';

class Playlist extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      showDownloaded: false,
      refreshing: false,
    };
  }

  componentDidMount() {}
  componentWillUnmount() {
    // // Unsubscribe
    if (unsubscribe != null) {
      unsubscribe();
    }
  }

  onPressTileSavedList = (item) => {
    let {push} = this.props.navigation;
    push('PlaylistInfo', item);
  };

  renderSavedList = ({item, index}) => {
    item.labelType = 1;
    item.type = 'playlist';
    item.image = item.image;
    item.name = item.playlist;
    item.isDownloaded = true;
    return <Tile data={item} onPressTile={this.onPressTileSavedList} />;
  };
  addData = (id) => {
    updateSpecificAppData(this.props, id);
  };

  onPressTile = (item) => {
    let {push} = this.props.navigation;
    push('PlaylistInfo', item);
  };

  renderItem = ({item, index}) => {
    item.labelType = 1;
    item.type = 'playlist';

    return <Tile data={item} onPressTile={this.onPressTile} />;
  };

  renderFooter = () => {
    return <View style={styles.spacer} />;
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
    const {appData} = this.props;
    const {refreshing} = this.state;

    const playlists = appData[8] && appData[8].data;
    let downloadedData = [];
    for (var key in this.props.downloadedData) {
      if (this.props.downloadedData.hasOwnProperty(key)) {
        if (key.includes('playlist')) {
          downloadedData.push(this.props.downloadedData[key]);
        }
      }
    }
    return (
      <LinearGradient
        colors={GRADIENT_COLOR_SET_1.COLORS}
        locations={GRADIENT_COLOR_SET_1.LOCATIONS}
        style={styles.mainContainer}>
        {this.props.offline ? (
          <FlatList
            data={downloadedData}
            numColumns={2}
            style={styles.flatList}
            renderItem={this.renderSavedList}
            keyExtractor={(item, index) => `${index}-${item.id}`}
            // onEndReached={() => this.addData(8)}
            onEndReachedThreshold={0.1}
            ListFooterComponent={this.renderFooter.bind(this)}
            // refreshing={refreshing}
            // onRefresh={onRefresh}
          />
        ) : (
          <FlatList
            data={playlists}
            extraData={this.state}
            numColumns={2}
            style={styles.flatList}
            onRefresh={() => this.onRefresh()}
            refreshing={refreshing}
            renderItem={this.renderItem}
            keyExtractor={(item, index) => `${index}-${item.id}`}
            // onEndReached={() => this.addData(8)}
            onEndReachedThreshold={0.1}
            ListFooterComponent={this.renderFooter.bind(this)}
            // refreshing={refreshing}
            // onRefresh={onRefresh}
          />
        )}
      </LinearGradient>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    paddingLeft: DEVICE_WIDTH * 0.01,
    paddingTop: DEVICE_HEIGHT * 0.03,
    backgroundColor: 'transparent',

    flex: 1,
  },
  spacer: {
    height: DEVICE_HEIGHT * 0.1,
  },
  categoryText: {
    fontSize: DEVICE_HEIGHT * 0.03,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    marginLeft: DEVICE_WIDTH * 0.03,
    marginBottom: DEVICE_HEIGHT * 0.02,
  },
  flatList: {
    flex: 1,
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

export default connect(mapStateToProps, mapDispatchToProps)(Playlist);
