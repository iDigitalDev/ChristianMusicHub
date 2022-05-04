import React, {Component} from 'react';

import {
  StyleSheet,
  Text,
  ScrollView,
  FlatList,
  View,
  ActivityIndicator,
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

class Albums extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showDownloaded: false,
      isLoading: false,
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

  addData = (id) => {
    updateSpecificAppData(this.props, id);
  };

  onPressTile = (item) => {
    let {push} = this.props.navigation;
    push('AlbumInfo', item);
  };
  onPressTileSavedList = (item) => {
    let {push} = this.props.navigation;
    push('AlbumInfo', item);
  };

  renderSavedList = ({item, index}) => {
    item.labelType = 2;
    item.type = 'album';
    item.image = item.image;
    item.name = item.album;
    item.isDownloaded = true;
    return <Tile data={item} onPressTile={this.onPressTileSavedList} />;
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
  renderItem = ({item, index}) => {
    item.labelType = 2;
    return (
      <Tile
        data={item}
        onPressTile={this.onPressTile}
        customStyle={{
          marginBottom: DEVICE_HEIGHT * 0.05,
          paddingLeft: DEVICE_WIDTH * 0.02,
        }}
      />
    );
  };

  renderFooter = () => {
    return <View style={styles.spacer} />;
  };

  render() {
    const {appData} = this.props;
    const {refreshing} = this.state;
    const newReleases = appData[6] && appData[6].data;
    const yourRegulars = appData[7] && appData[7].data;
    let downloadedData = [];
    for (var key in this.props.downloadedData) {
      if (this.props.downloadedData.hasOwnProperty(key)) {
        if (key.includes('album')) {
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
            // extraData={this.state}
            style={styles.flatList}
            // horizontal={true}
            // onRefresh={() => this.onRefresh()}
            refreshing={refreshing}
            numColumns={3}
            renderItem={this.renderSavedList}
            keyExtractor={(item, index) => `${index}-${item.id}`}
            // onEndReached={() => this.addData(7)}
            onEndReachedThreshold={0.1}
            ListFooterComponent={this.renderFooter.bind(this)}
            decelerationRate={0.96}
          />
        ) : (
          <FlatList
            data={yourRegulars}
            extraData={this.state}
            style={styles.flatList}
            // horizontal={true}
            onRefresh={() => this.onRefresh()}
            refreshing={refreshing}
            numColumns={3}
            renderItem={this.renderItem}
            keyExtractor={(item, index) => `${index}-${item.id}`}
            // onEndReached={() => this.addData(7)}
            onEndReachedThreshold={0.1}
            ListFooterComponent={this.renderFooter.bind(this)}
            decelerationRate={0.96}
          />
        )}
      </LinearGradient>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: DEVICE_HEIGHT * 0.04,
  },
  scrollContainer: {
    paddingLeft: DEVICE_WIDTH * 0.01,
    flex: 1,
    paddingBottom: DEVICE_HEIGHT * 0.06,
  },
  categoryText: {
    fontSize: DEVICE_HEIGHT * 0.03,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    marginLeft: DEVICE_WIDTH * 0.03,
    marginBottom: DEVICE_HEIGHT * 0.02,
  },
  flatList: {
    marginBottom: DEVICE_HEIGHT * 0.03,
  },
  spacer: {
    height: DEVICE_HEIGHT * 0.1,
  },
});

const mapStateToProps = (state) => {
  return {
    account: state.accountReducer.account,
    savedList: state.appReducer.savedList,
    isLogin: state.accountReducer.isLogin,
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

export default connect(mapStateToProps, mapDispatchToProps)(Albums);
