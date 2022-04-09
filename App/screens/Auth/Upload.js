import React, {Component} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Image,
  ImageBackground,
  Button,
  Platform,
} from 'react-native';
import {
  LOGIN_BG,
  CHM_LOGO_HEIGHT,
  CHM_LOGO_WIDTH,
  GRADIENT_COLOR_SET_2,
  DEVICE_HEIGHT,
  DEVICE_WIDTH,
} from '../../constants/constants';
import Back from '../../assets/svg/back.svg';

import ImagePicker from 'react-native-image-picker';

export default class Upload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: props.route.params,
      enableButton: false,
      photo: null,
    };
  }
  componentDidMount() {
    // this.props.navigation.push('Login');
  }

  createFormData = (photo, body) => {
    const data = new FormData();

    data.append('photo', {
      name: photo.fileName,
      type: photo.type,
      uri:
        Platform.OS === 'android'
          ? photo.uri
          : photo.uri.replace('file://', ''),
    });

    Object.keys(body).forEach((key) => {
      data.append(key, body[key]);
    });

    return data;
  };

  onPressNext = () => {
    const {data, photo} = this.state;
    const {push} = this.props.navigation;
    push('Questions', {data, photo});
  };

  onPressUpload = () => {
    const options = {
      noData: true,
    };
    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.uri) {
        this.setState({photo: response, enableButton: true});
      }
    });
  };
  renderButton = () => {
    const {enableButton} = this.state;

    const style = enableButton
      ? [styles.button, {backgroundColor: '#66D5F7'}]
      : [styles.button, {backgroundColor: '#d5d5d5'}];

    return (
      <TouchableOpacity
        style={style}
        disabled={!enableButton}
        // disabled={false}
        onPress={() => this.onPressNext()}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    );
  };

  render() {
    const {photo} = this.state;
    return (
      <View style={styles.mainContainer}>
        <ImageBackground source={LOGIN_BG} style={styles.ImageBackground}>
          <View style={styles.headerContainer}>
            <TouchableOpacity
              style={styles.backContainer}
              onPress={() => this.props.navigation.pop()}>
              <Back
                width={DEVICE_WIDTH * 0.05}
                height={DEVICE_WIDTH * 0.05}
                style={styles.back}
              />
            </TouchableOpacity>
            <Text style={styles.headerText}>Upload Photo</Text>
            <View />
          </View>

          <TouchableOpacity
            style={styles.noImage}
            onPress={() => this.onPressUpload()}>
            {photo ? (
              <Image source={{uri: photo.uri}} style={styles.image} />
            ) : (
              <Text style={styles.noImageText}>Upload Profile Image</Text>
            )}
          </TouchableOpacity>
          {this.renderButton()}
        </ImageBackground>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  ImageBackground: {
    flex: 1,
    resizeMode: 'cover',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: DEVICE_HEIGHT * 0.03,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
  },
  noImage: {
    marginTop: DEVICE_HEIGHT * 0.1,
    marginBottom: DEVICE_HEIGHT * 0.2,
    height: DEVICE_WIDTH * 0.7,
    width: DEVICE_WIDTH * 0.7,
    borderColor: '#FFFFFF',
    borderWidth: DEVICE_WIDTH * 0.01,
    borderTopRightRadius: DEVICE_WIDTH * 0.2,
    borderBottomLeftRadius: DEVICE_WIDTH * 0.2,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(255,255,255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  noImageText: {
    fontSize: DEVICE_HEIGHT * 0.033,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  logo: {
    // width: DEVICE_WIDTH * 0.8,
    height: DEVICE_WIDTH * 0.25,
    marginBottom: DEVICE_HEIGHT * 0.3,
    marginTop: DEVICE_HEIGHT * 0.25,
  },
  headerContainer: {
    flexDirection: 'row',
    width: DEVICE_WIDTH * 1,
    alignItems: 'center',
    paddingHorizontal: DEVICE_WIDTH * 0.03,
    marginBottom: DEVICE_HEIGHT * 0.035,
    marginTop:
      Platform.OS === 'ios' ? DEVICE_HEIGHT * 0.07 : DEVICE_HEIGHT * 0.035,
  },
  headerText: {
    fontSize: DEVICE_HEIGHT * 0.033,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
    marginLeft: DEVICE_WIDTH * 0.03,
  },
  button: {
    height: DEVICE_HEIGHT * 0.08,
    width: DEVICE_WIDTH * 0.85,
    borderRadius: DEVICE_WIDTH * 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
