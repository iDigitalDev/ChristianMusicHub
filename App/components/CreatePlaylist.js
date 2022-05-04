import React, {Component} from 'react';

import {StyleSheet, View, FlatList, TouchableOpacity, Text} from 'react-native';
import {DEVICE_HEIGHT, DEVICE_WIDTH} from '../constants/constants';
import Tile from '../components/Tile@5';
import Like from '../assets/svg/FireBlue.svg';
import Album from '../assets/svg/Album.svg';
import Playlist from '../assets/svg/Playlist.svg';
import Artist from '../assets/svg/Artists.svg';
import Share from '../assets/svg/ShareBlue.svg';
import Check from '../assets/svg/check.svg';
import {Switch, TextInput} from 'react-native-gesture-handler';
import PopUp from '../components/PopUp';
import {createPlaylist, getUserPlaylist, addSong} from '../api/service/actions';
import {URL} from '../api/service/urls';
import FastImage from 'react-native-fast-image';

export default class CreatePlaylist extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mainOption: true,
      addToPlaylist: false,
      createPlaylist: false,
      popUp: false,
      userPlaylist: [],
      playlistName: null,
      description: null,
      popUpText: null,
    };
  }

  componentDidMount() {}

  onPressCancel = () => {
    const {cancel} = this.props;
    cancel();
  };

  onPressConfirmCreate = () => {
    const {playlistName, description} = this.state;
    const {props, create} = this.props;
    let song_id = null;
    if (create === undefined) {
      song_id = this.props.data.id;
    }

    createPlaylist(
      props,
      playlistName,
      description,
      song_id,
      this.onAddSuccess,
    );
  };

  onAddSuccess = () => {
    const {cancel} = this.props;
    this.setState(
      {
        addToPlaylist: false,
        createPlaylist: false,
        popUp: true,
        popUpText: 'Created playlist',
      },
      this.autoClose,
    );
  };

  autoClose = () => {
    const {update} = this.props;
    setTimeout(() => {
      update();
    }, 1000);
  };

  componentDidUpdate(newProps) {
    if (newProps.props.playlist !== this.props.props.playlist) {
    }
  }

  render() {
    const {popUp, popUpText} = this.state;
    if (popUp === true) {
      return (
        <View style={styles.popUpContainer}>
          <Check width={DEVICE_WIDTH * 0.2} height={DEVICE_WIDTH * 0.2} />
          <Text style={styles.popUpText}>{popUpText}</Text>
        </View>
      );
    }

    return (
      <View style={styles.optionModal}>
        <Text style={styles.createHeader}>Create new playlist</Text>
        <Text style={styles.subCreateHeader}>Playlist Name</Text>
        <TextInput
          style={styles.createInput}
          onChangeText={(text) => this.setState({playlistName: text})}
        />
        <Text style={styles.subCreateHeader}>Description</Text>
        <TextInput
          style={styles.createInput}
          onChangeText={(text) => this.setState({description: text})}
        />
        <View style={styles.buttonRowContainer}>
          <TouchableOpacity onPress={() => this.onPressCancel()}>
            <Text style={styles.cancel}>CANCEL</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.onPressConfirmCreate()}>
            <Text style={styles.create}>CREATE</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: DEVICE_WIDTH * 0.04,
    alignItems: 'center',
    marginBottom: DEVICE_HEIGHT * 0.075,
  },

  section: {
    width: DEVICE_WIDTH * 0.3,
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: DEVICE_HEIGHT * 0.025,
    paddingHorizontal: DEVICE_WIDTH * 0.04,
  },
  sectionText: {
    fontSize: DEVICE_WIDTH * 0.04,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    marginLeft: DEVICE_WIDTH * 0.03,
  },

  song: {
    fontSize: DEVICE_HEIGHT * 0.021,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
  },
  artist: {
    fontSize: DEVICE_HEIGHT * 0.02,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
  },

  infoSection: {
    marginLeft: DEVICE_WIDTH * 0.03,
  },
  optionModal: {
    // minHeight: DEVICE_HEIGHT * 0.4,
    width: '100%',
    maxHeight: DEVICE_HEIGHT * 0.8,
    paddingVertical: DEVICE_HEIGHT * 0.03,
    paddingHorizontal: DEVICE_WIDTH * 0.04,
    backgroundColor: '#151d27',
    borderRadius: DEVICE_HEIGHT * 0.02,
  },
  optionSection: {
    flexDirection: 'row',
    width: DEVICE_WIDTH * 0.7,
    marginBottom: DEVICE_HEIGHT * 0.025,
    alignItems: 'center',
  },

  playlistRowContainer: {
    width: DEVICE_WIDTH * 0.7,
    height: DEVICE_HEIGHT * 0.1,
    marginBottom: DEVICE_HEIGHT * 0.03,
    flexDirection: 'row',
  },
  playlistName: {
    fontSize: DEVICE_HEIGHT * 0.025,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
  },
  playlistSongCount: {
    fontSize: DEVICE_HEIGHT * 0.025,
    color: 'gray',
    fontFamily: 'Montserrat-Bold',
  },
  playlistTile: {
    width: DEVICE_HEIGHT * 0.1,
    height: DEVICE_HEIGHT * 0.1,
    borderTopLeftRadius: DEVICE_HEIGHT * 0.005,
    borderBottomRightRadius: DEVICE_HEIGHT * 0.005,
    borderTopRightRadius: DEVICE_HEIGHT * 0.03,
    borderBottomLeftRadius: DEVICE_HEIGHT * 0.03,
    borderColor: '#FFFFFF',
    borderWidth: DEVICE_HEIGHT * 0.001,
    overflow: 'hidden',
  },
  songInfo: {
    marginLeft: DEVICE_WIDTH * 0.025,
  },
  playlistHeader: {
    fontSize: DEVICE_HEIGHT * 0.03,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
    marginBottom: DEVICE_HEIGHT * 0.03,
  },
  image: {
    height: '100%',
    width: '100%',
  },
  flatList: {
    maxHeight: DEVICE_HEIGHT * 0.5,
  },
  buttonRowContainer: {
    marginTop: DEVICE_HEIGHT * 0.05,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  popUpContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: DEVICE_WIDTH * 0.5,
    height: DEVICE_WIDTH * 0.5,
    backgroundColor: '#151d27',
    borderRadius: DEVICE_HEIGHT * 0.02,
    marginLeft: DEVICE_WIDTH * 0.2,
  },
  popUpText: {
    fontSize: DEVICE_WIDTH * 0.04,
    color: '#66D5F7',
    fontFamily: 'Montserrat-Bold',
    marginTop: DEVICE_HEIGHT * 0.02,
  },
  cancel: {
    fontSize: DEVICE_WIDTH * 0.04,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
  },
  create: {
    fontSize: DEVICE_WIDTH * 0.04,
    color: 'skyblue',
    fontFamily: 'Montserrat-Bold',
  },

  createHeader: {
    fontSize: DEVICE_WIDTH * 0.05,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
    marginBottom: DEVICE_HEIGHT * 0.05,
  },
  subCreateHeader: {
    fontSize: DEVICE_WIDTH * 0.04,
    color: '#929292',
    fontFamily: 'Montserrat-Regular',
    textAlign: 'left',
  },
  createInput: {
    width: '100%',
    borderBottomColor: 'skyblue',
    borderBottomWidth: DEVICE_HEIGHT * 0.001,
    color: '#FFFFFF',
    fontSize: DEVICE_WIDTH * 0.04,
    marginBottom: DEVICE_HEIGHT * 0.03,
    paddingBottom: 0,
  },
});
