import React, {Component} from 'react';
import FastImage from 'react-native-fast-image';

import {StyleSheet, View, FlatList, TouchableOpacity, Text} from 'react-native';
import {DEVICE_HEIGHT, DEVICE_WIDTH} from '../constants/constants';
import {TextInput} from 'react-native-gesture-handler';
import {
  removePlaylist,
  renamePlaylist,
  getUserPlaylist,
} from '../api/service/actions';
import Check from '../assets/svg/check.svg';
import {URL} from '../api/service/urls';

export default class SongOption extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mainOption: true,
      removeOption: false,
      renameOption: false,
      popUp: false,
      popUpText: null,
      playlistName: null,
    };
  }

  componentDidMount() {
    // this.onPressAddToPlaylist();
  }

  onPressCancel = () => {
    const {cancel} = this.props;
    cancel();
  };

  onPressRename = () => {
    this.setState({
      mainOption: false,
      renameOption: true,
      removeOption: false,
    });
  };

  onPressRemove = () => {
    this.setState({
      mainOption: false,
      renameOption: false,
      removeOption: true,
    });
  };

  onPressConfirmRemove = () => {
    const {data, props} = this.props;
    removePlaylist(props, data, this.onSuccess);
  };

  onPressSave = () => {
    const {data, props} = this.props;
    const {playlist_id} = data;
    const {playlistName} = this.state;
    const configJson = {
      playlist_id,
      playlist_name: playlistName,
    };

    renamePlaylist(props, configJson, this.onSuccess);
  };

  onSuccess = (text) => {
    const {cancel, rename, back} = this.props;
    const {playlistName} = this.state;
    this.setState({
      mainOption: false,
      renameOption: false,
      removeOption: false,
      popUp: true,
      popUpText: text,
    });

    if (text === 'Renamed Playlist') {
      rename(playlistName);
    }

    setTimeout(() => {
      cancel();
      if (text === 'Removed Playlist') {
        getUserPlaylist(this.props.props);
        back();
      }
    }, 1000);
  };

  render() {
    const {
      mainOption,
      renameOption,
      removeOption,
      popUp,
      popUpText,
    } = this.state;
    const {data} = this.props;
    const {playlist, playlist_id, image} = data;
    let uri = URL.IMAGE + image;
    return (
      <View style={{alignItems: 'center', justifyContent: 'center'}}>
        {mainOption && (
          <View style={styles.optionModal}>
            {/* <View style={styles.tile} /> */}
            <Text style={styles.playlistName}>{playlist}</Text>
            {/* <Text style={styles.artistName}>username</Text> */}
            <TouchableOpacity
              onPress={() => this.onPressRename()}
              style={styles.button}>
              <Text style={styles.buttonText}>Rename</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => this.onPressRemove()}
              style={styles.button}>
              <Text style={styles.buttonText}>Remove Playlist</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => this.onPressCancel()}
              style={styles.cancelButton}>
              <Text style={styles.cancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
        {renameOption && (
          <View style={styles.optionModal}>
            <Text style={styles.artistName}>Rename Playlist</Text>

            <View style={styles.tile}>
              {image === null || image === undefined ? (
                <FastImage
                  source={require('../assets/images/cmh_logo_play.png')}
                  // source={{
                  //   uri:
                  //     'https://services.tineye.com/developers/img/meloncat.20c77523.jpg',
                  // }}
                  // source={{
                  //   uri,
                  // }}
                  style={styles.image}
                  // resizeMode={'cover'}
                  resizeMode={FastImage.resizeMode.cover}
                />
              ) : (
                <FastImage
                  // source={require('../../assets/images/cmh_logo.png')}
                  // source={{
                  //   uri:
                  //     'https://services.tineye.com/developers/img/meloncat.20c77523.jpg',
                  // }}
                  source={{
                    uri,
                  }}
                  style={styles.image}
                  // resizeMode={'cover'}
                  resizeMode={FastImage.resizeMode.cover}
                />
              )}
            </View>
            <TextInput
              style={styles.input}
              textAlign={'center'}
              onChangeText={(text) => this.setState({playlistName: text})}
            />
            <View style={styles.row}>
              <TouchableOpacity
                onPress={() => this.onPressCancel()}
                style={styles.renameButton}>
                <Text style={styles.cancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => this.onPressSave()}
                style={styles.renameButton}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        {removeOption && (
          <View style={styles.optionModal}>
            <View style={styles.tile}>
              {image === null || image === undefined ? (
                <FastImage
                  source={require('../assets/images/cmh_logo_play.png')}
                  // source={{
                  //   uri:
                  //     'https://services.tineye.com/developers/img/meloncat.20c77523.jpg',
                  // }}
                  // source={{
                  //   uri,
                  // }}
                  style={styles.image}
                  // resizeMode={'cover'}
                  resizeMode={FastImage.resizeMode.cover}
                />
              ) : (
                <FastImage
                  // source={require('../../assets/images/cmh_logo.png')}
                  // source={{
                  //   uri:
                  //     'https://services.tineye.com/developers/img/meloncat.20c77523.jpg',
                  // }}
                  source={{
                    uri,
                  }}
                  style={styles.image}
                  // resizeMode={'cover'}
                  resizeMode={FastImage.resizeMode.cover}
                />
              )}
            </View>
            <Text style={styles.playlistName}>{playlist}</Text>
            {/* <Text style={styles.artistName}>username</Text> */}
            <Text style={styles.confirmText}>Confirm Removal of Playlist</Text>

            <TouchableOpacity
              onPress={() => this.onPressConfirmRemove()}
              style={styles.removeButton}>
              <Text style={styles.buttonText}>Remove</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => this.onPressCancel()}
              style={styles.button}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
        {popUp && (
          <View style={styles.popUpContainer}>
            <Check width={DEVICE_WIDTH * 0.2} height={DEVICE_WIDTH * 0.2} />
            <Text style={styles.popUpText}>{popUpText}</Text>
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  optionModal: {
    // minHeight: DEVICE_HEIGHT * 0.4,
    width: '100%',
    maxHeight: DEVICE_HEIGHT * 0.8,
    paddingTop: DEVICE_HEIGHT * 0.06,
    paddingBottom: DEVICE_HEIGHT * 0.03,
    paddingHorizontal: DEVICE_WIDTH * 0.04,
    backgroundColor: '#151d27',
    borderRadius: DEVICE_HEIGHT * 0.02,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tile: {
    height: DEVICE_WIDTH * 0.3,
    width: DEVICE_WIDTH * 0.3,
    backgroundColor: 'white',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 5,
    marginBottom: DEVICE_HEIGHT * 0.015,
    overflow: 'hidden',
  },
  playlistName: {
    fontSize: DEVICE_HEIGHT * 0.035,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    marginBottom: DEVICE_HEIGHT * 0.03,
  },
  row: {
    flexDirection: 'row',
    width: DEVICE_WIDTH * 0.8,
    justifyContent: 'space-between',
  },
  saveText: {
    fontSize: DEVICE_HEIGHT * 0.03,
    color: '#66D5F7',
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
    textAlign: 'left',
  },
  renameButton: {},
  rename: {
    fontSize: DEVICE_HEIGHT * 0.025,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    marginBottom: DEVICE_HEIGHT * 0.1,
  },
  artistName: {
    fontSize: DEVICE_HEIGHT * 0.025,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    marginBottom: DEVICE_HEIGHT * 0.04,
  },
  button: {
    height: DEVICE_HEIGHT * 0.07,
    width: DEVICE_WIDTH * 0.8,
    borderRadius: DEVICE_WIDTH * 10,
    borderWidth: DEVICE_WIDTH * 0.002,
    borderColor: 'white',
    marginBottom: DEVICE_HEIGHT * 0.02,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButton: {
    height: DEVICE_HEIGHT * 0.07,
    width: DEVICE_WIDTH * 0.8,
    borderRadius: DEVICE_WIDTH * 10,
    marginBottom: DEVICE_HEIGHT * 0.02,
    backgroundColor: '#66D5F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  buttonText: {
    fontSize: DEVICE_HEIGHT * 0.03,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
  },
  confirmText: {
    fontSize: DEVICE_HEIGHT * 0.03,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
    marginBottom: DEVICE_HEIGHT * 0.02,
  },
  cancel: {
    fontSize: DEVICE_HEIGHT * 0.03,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Regular',
    textAlign: 'left',
  },
  cancelButton: {
    marginTop: DEVICE_HEIGHT * 0.04,
    width: DEVICE_WIDTH * 0.75,
  },
  input: {
    width: '100%',
    borderBottomColor: 'skyblue',
    borderBottomWidth: DEVICE_HEIGHT * 0.001,
    color: '#FFFFFF',
    fontSize: DEVICE_HEIGHT * 0.03,
    marginBottom: DEVICE_HEIGHT * 0.07,
  },
  popUpContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: DEVICE_WIDTH * 0.5,
    height: DEVICE_WIDTH * 0.5,
    backgroundColor: '#151d27',
    borderRadius: DEVICE_HEIGHT * 0.02,
  },
  popUpText: {
    fontSize: DEVICE_HEIGHT * 0.03,
    color: '#66D5F7',
    fontFamily: 'Montserrat-Bold',
    marginTop: DEVICE_HEIGHT * 0.02,
    textAlign: 'center',
  },
  //   header: {
  //     flexDirection: 'row',
  //     justifyContent: 'space-between',
  //     paddingHorizontal: DEVICE_WIDTH * 0.04,
  //     alignItems: 'center',
  //     marginBottom: DEVICE_HEIGHT * 0.075,
  //   },

  //   section: {
  //     width: DEVICE_WIDTH * 0.3,
  //     alignItems: 'center',
  //     flexDirection: 'row',
  //     marginBottom: DEVICE_HEIGHT * 0.025,
  //     paddingHorizontal: DEVICE_WIDTH * 0.04,
  //   },
  //   sectionText: {
  //     fontSize: DEVICE_HEIGHT * 0.025,
  //     color: '#FFFFFF',
  //     fontFamily: 'Montserrat-Bold',
  //     marginLeft: DEVICE_WIDTH * 0.03,
  //   },

  //   song: {
  //     fontSize: DEVICE_HEIGHT * 0.021,
  //     color: '#FFFFFF',
  //     fontFamily: 'Montserrat-Bold',
  //     fontWeight: 'bold',
  //   },
  //   artist: {
  //     fontSize: DEVICE_HEIGHT * 0.02,
  //     color: '#FFFFFF',
  //     fontFamily: 'Montserrat-Bold',
  //   },

  //   infoSection: {
  //     marginLeft: DEVICE_WIDTH * 0.03,
  //   },
  //   optionModal: {
  //     // minHeight: DEVICE_HEIGHT * 0.4,
  //     width: '100%',
  //     maxHeight: DEVICE_HEIGHT * 0.8,
  //     paddingVertical: DEVICE_HEIGHT * 0.03,
  //     paddingHorizontal: DEVICE_WIDTH * 0.04,
  //     backgroundColor: '#151d27',
  //     borderRadius: DEVICE_HEIGHT * 0.02,
  //   },
  //   optionSection: {
  //     flexDirection: 'row',
  //     width: DEVICE_WIDTH * 0.7,
  //     marginBottom: DEVICE_HEIGHT * 0.025,
  //     alignItems: 'center',
  //   },

  //   playlistRowContainer: {
  //     width: DEVICE_WIDTH * 0.7,
  //     height: DEVICE_HEIGHT * 0.1,
  //     marginBottom: DEVICE_HEIGHT * 0.03,
  //     flexDirection: 'row',
  //   },
  //   playlistName: {
  //     fontSize: DEVICE_HEIGHT * 0.025,
  //     color: '#FFFFFF',
  //     fontFamily: 'Montserrat-Bold',
  //   },
  //   playlistSongCount: {
  //     fontSize: DEVICE_HEIGHT * 0.025,
  //     color: 'gray',
  //     fontFamily: 'Montserrat-Bold',
  //   },
  //   playlistTile: {
  //     width: DEVICE_HEIGHT * 0.1,
  //     height: DEVICE_HEIGHT * 0.1,
  //     borderTopLeftRadius: DEVICE_HEIGHT * 0.005,
  //     borderBottomRightRadius: DEVICE_HEIGHT * 0.005,
  //     borderTopRightRadius: DEVICE_HEIGHT * 0.03,
  //     borderBottomLeftRadius: DEVICE_HEIGHT * 0.03,
  //     borderColor: '#FFFFFF',
  //     borderWidth: DEVICE_HEIGHT * 0.001,
  //   },
  //   songInfo: {
  //     marginLeft: DEVICE_WIDTH * 0.025,
  //   },
  //   playlistHeader: {
  //     fontSize: DEVICE_HEIGHT * 0.03,
  //     color: '#FFFFFF',
  //     fontFamily: 'Montserrat-Bold',
  //     textAlign: 'center',
  //     marginBottom: DEVICE_HEIGHT * 0.03,
  //   },
  //   flatList: {
  //     maxHeight: DEVICE_HEIGHT * 0.5,
  //   },
  //   buttonRowContainer: {
  //     marginTop: DEVICE_HEIGHT * 0.05,
  //     flexDirection: 'row',
  //     justifyContent: 'space-between',
  //   },
  //   popUpContainer: {
  //     alignItems: 'center',
  //     justifyContent: 'center',
  //     width: DEVICE_WIDTH * 0.5,
  //     height: DEVICE_WIDTH * 0.5,
  //     backgroundColor: '#151d27',
  //     borderRadius: DEVICE_HEIGHT * 0.02,
  //   },
  //   popUpText: {
  //     fontSize: DEVICE_HEIGHT * 0.03,
  //     color: '#66D5F7',
  //     fontFamily: 'Montserrat-Bold',
  //     marginTop: DEVICE_HEIGHT * 0.02,
  //   },
  //   cancel: {
  //     fontSize: DEVICE_HEIGHT * 0.025,
  //     color: '#FFFFFF',
  //     fontFamily: 'Montserrat-Bold',
  //   },
  //   create: {
  //     fontSize: DEVICE_HEIGHT * 0.025,
  //     color: 'skyblue',
  //     fontFamily: 'Montserrat-Bold',
  //   },

  //   createHeader: {
  //     fontSize: DEVICE_HEIGHT * 0.03,
  //     color: '#FFFFFF',
  //     fontFamily: 'Montserrat-Bold',
  //     textAlign: 'center',
  //     marginBottom: DEVICE_HEIGHT * 0.05,
  //   },
  //   input: {
  //     width: '100%',
  //     borderBottomColor: 'skyblue',
  //     borderBottomWidth: DEVICE_HEIGHT * 0.001,
  //     color: '#FFFFFF',
  //     fontSize: DEVICE_HEIGHT * 0.03,
  //     marginBottom: DEVICE_HEIGHT * 0.05,
  //   },
});
