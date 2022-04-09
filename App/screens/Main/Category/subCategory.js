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
  Platform,
} from 'react-native';

import {
  GRADIENT_COLOR_SET_1,
  DEVICE_HEIGHT,
  DEVICE_WIDTH,
} from '../../../constants/constants';
import Back from '../../../assets/svg/back.svg';

import Tile from '../../../components/Tile@7';

import LinearGradient from 'react-native-linear-gradient';

//redux
import {connect} from 'react-redux';
import {login} from '../../../redux/actions/account';

import {POST} from '../../../api/service/service';
import {URL} from '../../../constants/apirUrls';

import {test_artist, test_playlist} from '../../../constants/test';
import Settings from '../../../assets/svg/Settings';

class SubCategory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      screenData: [
        {
          m_data: [],
          m_page: 0,
          m_status: 1,
          m_records: 5,
          name: 'test',
        },
        {
          m_data: [],
          m_page: 1,
          m_status: 1,
          m_records: 5,
          name: 'playlists',
        },
        {
          m_data: [],
          m_page: 1,
          m_status: 2,
          m_records: 5,
          name: 'new_releases',
        },
      ],
      name: props.route.params.name,
      subType: props.route.params.subType,
      genre_id: props.route.params.id,
    };
  }

  componentDidMount() {
    this.initData();
  }

  onPressTile = (item) => {
    let {push} = this.props.navigation;
    const {type} = item;
    if (type === 'song') {
      push('SongInfo', item);
    } else {
      push('PlaylistInfo', item);
    }
  };

  initData = () => {
    let {user_id, authToken} = this.props.account;
    let {screenData, genre_id} = this.state;
    let data = {user_id, genre_id};
    let url = URL.GET_GENRE_SONGS;

    const receiver = (response) => {
      const {success} = response;
      if (success === true) {
        const {new_releases, playlists} = response.data;
        console.log(response);
        screenData[1].m_data = playlists.data;

        screenData[2].m_data = new_releases.data;

        this.setState({
          isLoading: false,
        });
      } else {
        console.log(response);
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
    let {m_data, m_page, m_status, m_records, name} = this.state.screenData[id];
    let user_id = this.props.account.user_id;
    let authToken = this.props.account.authToken;
    let status = m_status;
    let records = m_records;
    let page = m_page + 1;
    let genre_id = this.state.genre_id;
    let data = {user_id, records, page, status, genre_id};
    let url = URL.GET_GENRE_SONGS;

    const receiver = (response) => {
      let currentData = m_data;
      let incomingData = response.data[name].data;
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

  renderItem = ({item, index}) => {
    item.labelType = 0;
    item.type = 'song';
    item.name = item.song;
    item.size = 'big';
    return <Tile data={item} onPressTile={this.onPressTile} />;
  };

  renderPlayListItem = ({item, index}) => {
    item.labelType = 0;
    item.type = 'playlist';
    return <Tile data={item} onPressTile={this.onPressTile} />;
  };

  renderFooter = () => {
    //it will show indicator at the bottom of the list when data is loading otherwise it returns null
    return <View style={styles.filler}></View>;
  };

  render() {
    let {isLoading, screenData, name} = this.state;
    // let popular = screenData[0].m_data;
    let playlist = screenData[1].m_data;
    let releases = screenData[2].m_data;

    return (
      <LinearGradient
        colors={GRADIENT_COLOR_SET_1.COLORS}
        locations={GRADIENT_COLOR_SET_1.LOCATIONS}
        style={styles.mainContainer}>
        <View style={styles.headerView}>
          <TouchableOpacity onPress={() => this.props.navigation.pop()}>
            <Back
              width={DEVICE_WIDTH * 0.05}
              height={DEVICE_WIDTH * 0.05}
              style={styles.back}
            />
          </TouchableOpacity>
          <Text style={styles.headerText}>{name}</Text>
        </View>
        {/* <ScrollView> */}
        {/* <Text style={styles.categoryText}>Popular This Week</Text>
          <FlatList
            data={popular}
            extraData={this.state}
            style={styles.flatList}
            horizontal={true}
            renderItem={this.renderItem}
            keyExtractor={(item, index) => `${index}-${item.id}`}
            // onEndReached={() => this.addData(0)}
            onEndReachedThreshold={0.1}
            decelerationRate={0.5}
            ListFooterComponent={this.renderFooter.bind(this)}
          /> */}
        {/* <Text style={styles.categoryText}>Playlists</Text>
          <FlatList
            data={playlist}
            extraData={this.state}
            style={styles.flatList}
            horizontal={true}
            renderItem={this.renderPlayListItem}
            keyExtractor={(item, index) => `${index}-${item.id}`}
            onEndReached={() => this.addData(1)}
            onEndReachedThreshold={0.1}
            decelerationRate={0.5}
            ListFooterComponent={this.renderFooter.bind(this)}
          /> */}
        {/* <Text style={styles.categoryText}>New Releases</Text> */}

        <FlatList
          data={releases}
          extraData={this.state}
          style={styles.flatList}
          numColumns={3}
          renderItem={this.renderItem}
          keyExtractor={(item, index) => `${index}-${item.id}`}
          onEndReached={() => this.addData(2)}
          onEndReachedThreshold={0.1}
          decelerationRate={0.5}
          ListFooterComponent={this.renderFooter.bind(this)}
        />
        {/* </ScrollView> */}
      </LinearGradient>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    paddingLeft: DEVICE_WIDTH * 0.01,
    paddingTop: DEVICE_HEIGHT * 0.05,
    backgroundColor: 'transparent',
    flex: 1,
  },
  categoryText: {
    fontSize: DEVICE_HEIGHT * 0.03,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    marginLeft: DEVICE_WIDTH * 0.03,
    marginBottom: DEVICE_HEIGHT * 0.02,
  },
  headerText: {
    fontSize: DEVICE_HEIGHT * 0.05,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    alignSelf: 'center',
  },
  headerView: {
    height: DEVICE_HEIGHT * 0.14,
  },
  flatList: {},
  filler: {
    height: DEVICE_HEIGHT * 0.15,
  },
  back: {
    marginLeft: DEVICE_WIDTH * 0.03,
    marginTop: Platform.OS === 'ios' ? DEVICE_HEIGHT * 0.03 : 0,
  },
});

const mapStateToProps = (state) => {
  return {
    account: state.accountReducer.account,
    isLogin: state.accountReducer.isLogin,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    login: (payload) => dispatch(login(payload)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SubCategory);
