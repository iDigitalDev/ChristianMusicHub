import React, {Component} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Image,
  ImageBackground,
  Button,
  TextInput,
  Platform,
} from 'react-native';
import ImgToBase64 from 'react-native-image-base64';
import {CMH_ALERT_3} from '../../components/CMH';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import DropDownPicker from 'react-native-dropdown-picker';
import LinearGradient from 'react-native-linear-gradient';
import {GRADIENT_COLOR_SET_1} from '../../constants/constants';
import {
  LOGIN_BG,
  CHM_LOGO_HEIGHT,
  CHM_LOGO_WIDTH,
  GRADIENT_COLOR_SET_2,
  DEVICE_HEIGHT,
  DEVICE_WIDTH,
} from '../../constants/constants';
import Back from '../../assets/svg/back.svg';
//redux
import {connect} from 'react-redux';
import {login} from '../../redux/actions/account';

//api
import {POST} from '../../api/service/service';
import {URL} from '../../constants/apirUrls';
import ImagePicker from 'react-native-image-picker';
import {ScrollView} from 'react-native-gesture-handler';

class Edit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      photoUri: props.route.params.photo,
      username: props.route.params.username,
      email: props.route.params.email,
      photo: null,
      enableButton: true,
      isSocial: props.route.params.fid,
      showPromptModal: false,
      promptMessage: null,
      showDatePicker: false,
      date: props.route.params.birthdate,
      gender: props.route.params.gender,
    };
  }
  componentDidMount() {}

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

  onPressSubmit = () => {
    const {username, photo, email, gender, date} = this.state;
    let {user_id, authToken} = this.props.account;
    let data = {user_id, username, email, gender, birthdate: date};

    console.log(data);

    if (photo !== null) {
      ImgToBase64.getBase64String(photo.uri)
        .then((base64String) => {
          let url = URL.EDIT_PROFILE;
          var extension = photo.type.replace('image/', '');
          data.extension = extension;
          data.photo = base64String;
          const receiver = (response) => {
            const {success} = response;
            if (success) {
              // alert('Edited Sucessfully');
              this.setState({
                showPromptModal: true,
                promptMessage: 'Edited Successfully',
              });
              this.props.navigation.pop();
            } else {
              // alert('Failed to edit profile');
              this.setState({
                showPromptModal: true,
                promptMessage: 'Something went wrong.',
              });
            }
          };

          let payload = {
            data,
            url,
            receiver,
            authToken,
          };
          POST(payload);
        })
        .catch((err) => console.log(err));
    } else {
      let url = URL.EDIT_PROFILE;
      data.photo = null;
      data.extension = null;
      const receiver = (response) => {
        const {success} = response;
        if (success) {
          // alert('Edited Sucessfully');
          // this.setState({
          //   showPromptModal: true,
          //   promptMessage: 'Edited Successfully',
          // });
          this.props.navigation.pop();
        } else {
          console.log(response);
          // alert('Failed to edit profile');
          this.setState({
            showPromptModal: true,
            promptMessage: 'Something went wrong.',
          });
        }
      };

      let payload = {
        data,
        url,
        receiver,
        authToken,
      };
      POST(payload);
    }
    // POST(payload);
  };

  onPressUpload = () => {
    const options = {
      noData: true,
    };
    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.uri) {
        this.setState({
          photo: response,
          photoUri: response.uri,
          enableButton: true,
        });
      }
    });
  };

  onNameChange = (text) => {
    this.setState({
      username: text,
    });
  };

  handleConfirm = (date) => {
    var base = new Date(date);
    var m = base.getMonth();
    var d = base.getDate();
    var y = base.getFullYear();
    const formatDate = y + '-' + m + '-' + d;
    this.setState({
      date: formatDate,
      showDatePicker: false,
    });
    // this.hideDatePicker();
  };

  showDatePicker = () => {
    this.setState({
      showDatePicker: true,
    });
  };

  hideDatePicker = () => {
    this.setState({
      showDatePicker: false,
    });
  };

  onEmailChange = (text) => {
    this.setState({
      email: text,
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
        // disabled={!enableButton}
        disabled={false}
        onPress={() => this.onPressSubmit()}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
    );
  };

  onPressEdit = () => {};

  render() {
    const {photoUri, username, email, isSocial} = this.state;
    return (
      <ScrollView>
        <LinearGradient
          colors={GRADIENT_COLOR_SET_1.COLORS}
          locations={GRADIENT_COLOR_SET_1.LOCATIONS}
          style={styles.mainContainer}>
          <View style={styles.ImageBackground}>
            <View style={styles.headerContainer}>
              <TouchableOpacity
                style={styles.backContainer}
                onPress={() => this.props.navigation.pop()}>
                <Back
                  width={DEVICE_WIDTH * 0.025}
                  height={DEVICE_HEIGHT * 0.025}
                  style={styles.back}
                />
              </TouchableOpacity>
              <Text style={styles.headerText}>Edit Profile</Text>
              <View />
            </View>

            <TouchableOpacity
              style={styles.noImage}
              onPress={() => this.onPressUpload()}>
              <ImageBackground source={{uri: photoUri}} style={styles.image}>
                <View style={styles.overlay}>
                  <Text style={styles.noImageText}>Edit Profile Image</Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={(text) => this.onNameChange(text)}
              maxLength={12}
            />
            {isSocial === null && (
              <Text style={[styles.label, {marginTop: DEVICE_HEIGHT * 0.03}]}>
                Email
              </Text>
            )}
            {isSocial === null && (
              <TextInput
                style={styles.input2}
                value={email}
                onChangeText={(text) => this.onEmailChange(text)}
              />
            )}

            <View style={styles.rowContainer}>
              <View>
                <Text style={styles.label2}>Date Of Birth</Text>
                <TouchableOpacity
                  style={styles.halfButton}
                  onPress={() => this.showDatePicker()}>
                  <Text style={styles.date}>{this.state.date}</Text>
                </TouchableOpacity>
              </View>
              <View>
                <Text style={styles.label2}>Gender</Text>
                {/* <TouchableOpacity style={styles.halfButton}></TouchableOpacity> */}
                <DropDownPicker
                  items={[
                    {
                      label: 'M',
                      value: 'M',
                    },
                    {
                      label: 'F',
                      value: 'F',
                    },
                  ]}
                  placeholder="Select"
                  placeholderStyle={styles.date}
                  defaultValue={this.state.gender}
                  containerStyle={{height: DEVICE_HEIGHT * 0.12}}
                  style={styles.gender}
                  itemStyle={{
                    justifyContent: 'flex-start',
                  }}
                  labelStyle={{
                    fontSize: 14,
                    textAlign: 'left',
                    color: 'white',
                  }}
                  dropDownStyle={{
                    backgroundColor: '#181818',
                    borderColor: '#4b4b4b',
                  }}
                  arrowColor="transparent"
                  onChangeItem={(item) =>
                    this.setState(
                      {
                        gender: item.value,
                      },
                      this.enableButton,
                    )
                  }
                />
              </View>
            </View>

            {this.renderButton()}
            <CMH_ALERT_3
              isShow={this.state.showPromptModal}
              close={() => this.setState({showPromptModal: false})}
              yes={() => this.onSendEmail()}
              msg={this.state.promptMessage}
            />
            <DateTimePickerModal
              isVisible={this.state.showDatePicker}
              mode="date"
              onConfirm={this.handleConfirm}
              onCancel={this.hideDatePicker}
            />
          </View>
        </LinearGradient>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: 'transparent',
    flex: 1,
    paddingTop: DEVICE_HEIGHT * 0.02,
  },
  input: {
    width: DEVICE_WIDTH * 0.8,
    borderColor: '#2DCEEF',
    borderBottomWidth: 2,
    borderBottomColor: DEVICE_HEIGHT * 0.05,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 0,
    fontSize: DEVICE_WIDTH * 0.04,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Regular',
    padding: 0,
  },
  label: {
    color: '#D5D5D5',
    fontFamily: 'Montserrat-Regular',
    fontSize: DEVICE_WIDTH * 0.03,
    width: DEVICE_WIDTH * 0.8,
  },
  label2: {
    color: '#D5D5D5',
    fontFamily: 'Montserrat-Regular',
    fontSize: DEVICE_WIDTH * 0.03,
    marginBottom: DEVICE_HEIGHT * 0.01,
  },
  input2: {
    width: DEVICE_WIDTH * 0.8,
    borderColor: '#2DCEEF',
    borderBottomWidth: 2,
    borderBottomColor: DEVICE_HEIGHT * 0.05,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 0,
    fontSize: DEVICE_WIDTH * 0.04,
    color: '#FFFFFF',
    padding: 0,
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
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
  halfLabelText: {
    fontSize: DEVICE_HEIGHT * 0.02,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    marginBottom: DEVICE_HEIGHT * 0.01,
  },
  noImage: {
    marginTop: DEVICE_HEIGHT * 0.03,
    marginBottom: DEVICE_HEIGHT * 0.02,
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
  date: {
    fontSize: DEVICE_HEIGHT * 0.025,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Regular',
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: DEVICE_WIDTH * 0.03,
    marginBottom: DEVICE_HEIGHT * 0.035,
    marginTop: DEVICE_HEIGHT * 0.035,
  },
  headerText: {
    fontSize: DEVICE_HEIGHT * 0.033,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
  },
  button: {
    height: DEVICE_HEIGHT * 0.08,
    width: DEVICE_WIDTH * 0.85,
    borderRadius: DEVICE_WIDTH * 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: DEVICE_HEIGHT * 0.02,
  },
  rowContainer: {
    flexDirection: 'row',
    width: DEVICE_WIDTH * 0.85,
    justifyContent: 'space-between',
    marginBottom: DEVICE_HEIGHT * 0.03,
    marginTop: DEVICE_HEIGHT * 0.03,
    marginLeft: DEVICE_WIDTH * 0.05,
  },
  halfButton: {
    height: DEVICE_HEIGHT * 0.07,
    width: DEVICE_WIDTH * 0.4,
    borderRadius: DEVICE_WIDTH * 0.02,
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: DEVICE_HEIGHT * 0.05,
    borderColor: '#2DCEEF',
    paddingLeft: DEVICE_WIDTH * 0.04,
  },
  gender: {
    height: DEVICE_HEIGHT * 0.07,
    width: DEVICE_WIDTH * 0.4,
    borderRadius: DEVICE_WIDTH * 0.02,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: DEVICE_HEIGHT * 0.05,
    borderColor: '#2DCEEF',
    backgroundColor: 'transparent',
  },
});

const mapStateToProps = (state) => {
  return {
    account: state.accountReducer.account,
    isLogin: state.accountReducer.isLogin,
    tabIndex: state.appReducer.tabIndex,
    appData: state.appReducer.appData,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    login: (payload) => dispatch(login(payload)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Edit);
