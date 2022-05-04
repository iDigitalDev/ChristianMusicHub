/* eslint-disable react-native/no-inline-styles */
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
  TextInput,
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
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview';
import ImgToBase64 from 'react-native-image-base64';
import ImagePicker from 'react-native-image-picker';
import DropDownPicker from 'react-native-dropdown-picker';
import {ScrollView} from 'react-native-gesture-handler';
import {GET, POST} from '../../api/service/service';
import {URL} from '../../api/service/urls';
import {CMH_ALERT_3} from '../../components/CMH';

export default class Questions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: props.route.params.data,
      photo: props.route.params.photo,
      enableButton: false,
      answer1: '',
      answer2: '',
      answer3: '',
      question1: '',
      question2: '',
      question3: '',
      showPromptModal: false,
      promptMessage: null,
      q1: [],
      q2: [],
      q3: [],
      questions: [
        [
          {
            id: 1,
            label: 'What was your childhood nickname?',
          },
          {
            id: 2,
            label: 'What is the name of your favorite childhood friend?',
          },
          {
            id: 3,
            label: 'What school did you attend for sixth grade?',
          },
        ],
        [
          {
            label: 'M',
            value: 'M',
          },
          {
            label: 'F',
            value: 'F',
          },
        ],
        [
          {
            label: 'M',
            value: 'M',
          },
          {
            label: 'F',
            value: 'F',
          },
        ],
      ],
    };
  }
  componentDidMount() {
    // this.props.navigation.push('Login');
    this.initData();
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

  initData = () => {
    // this.setState({
    //   genre: test_genre,
    //   moods: test_genre,
    //   isLoading: false,
    // });
    let url = URL.QUESTIONS;
    let data = {};
    let authToken = 'test';
    const receiver = (response) => {
      const {success} = response;
      if (success) {
        const {secret_questions} = response;
        secret_questions.forEach((element) => {
          element.label = element.question;
        });

        const q1 = [
          secret_questions[9],
          // secret_questions[1],
          // secret_questions[2],
        ];
        // const q2 = [
        //   secret_questions[3],
        //   secret_questions[4],
        //   secret_questions[5],
        // ];
        // const q3 = [
        //   secret_questions[6],
        //   secret_questions[7],
        //   secret_questions[8],
        // ];
        this.setState({
          q1,
          // q2,
          // q3,
        });
      } else {
        console.log(response);
        // alert('Failed to fetch questions for retrieval');
        this.setState({
          showPromptModal: true,
          promptMessage: 'Something went wrong.',
          enableButton: true,
        });
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

  onPressNext = () => {
    const {data, photo} = this.state;
    data.photo = photo;
    console.log(this.createFormData(this.state.photo, {userId: '123'}));
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
        onPress={() => this.onPressDone()}>
        <Text style={styles.buttonText}>Done</Text>
      </TouchableOpacity>
    );
  };

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

  onPressDone = () => {
    this.setState({
      enableButton: false,
    });
    const {
      answer1,
      answer2,
      answer3,
      question1,
      question2,
      question3,
      data,
      photo,
      q1,
    } = this.state;
    data.a1 = answer1;
    // data.a2 = answer2;
    // data.a3 = answer3;
    data.q1 = q1[0].id;
    // data.q2 = question2;
    // data.q3 = question3;

    // const body = this.createFormData(photo, data);
    // console.log('body');
    // console.log(body);

    var extension = photo.type.replace('image/', '');
    data.extension = extension;
    ImgToBase64.getBase64String(photo.uri)
      .then((base64String) => {
        let url = URL.REGISTER;
        data.photo = base64String;
        const receiver = (response) => {
          const {success} = response;
          if (success === true) {
            // alert('Registered Sucessfully');
            this.setState({
              showPromptModal: true,
              promptMessage: 'Registered Successfully',
            });
          } else {
            console.log(response);
            // alert('Failed to register');
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
        };
        POST(payload);
      })
      .catch((err) => console.log(err));
  };
  inputUpdate = (text, identifier) => {
    switch (identifier) {
      case 0:
        this.setState(
          {
            answer1: text,
          },
          this.enableButton,
        );
        break;
      case 1:
        this.setState(
          {
            answer2: text,
          },
          this.enableButton,
        );
        break;
      case 2:
        this.setState(
          {
            answer3: text,
          },
          this.enableButton,
        );
        break;
      default:
        break;
    }
  };

  enableButton = () => {
    const {
      answer1,
      answer2,
      answer3,
      question1,
      question2,
      question3,
    } = this.state;

    if (answer1 !== '') {
      this.setState({
        enableButton: true,
      });
    } else {
      this.setState({
        enableButton: false,
      });
    }
  };
  render() {
    const {questions, q1, q2, q3} = this.state;
    return (
      // <KeyboardAwareScrollView style={{flex: 1}}>
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
          <Text style={styles.headerText}>Security Questions</Text>
          <View />
        </View>
        {/* <ScrollView> */}
        <Text style={styles.questionLabel}>Question</Text>
        {/* <DropDownPicker
          items={q1}
          placeholder=""
          containerStyle={{height: DEVICE_HEIGHT * 0.07}}
          style={styles.dropDown}
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
                question1: item.id,
              },
              this.enableButton,
            )
          }
        /> */}
        <TextInput
          style={styles.answer}
          editable={false}
          value={this.state.q1.length !== 0 ? this.state.q1[0].label : null}
          onChangeText={(text) => this.inputUpdate(text, 0)}
        />
        <Text style={styles.answerLabel}>Answer</Text>
        <TextInput
          style={styles.answer}
          onChangeText={(text) => this.inputUpdate(text, 0)}
        />

        {this.renderButton()}
        {/* </ScrollView> */}
        <CMH_ALERT_3
          isShow={this.state.showPromptModal}
          close={() =>
            this.setState(
              {showPromptModal: false},
              this.props.navigation.navigate('Login'),
            )
          }
          yes={() => this.onSendEmail()}
          msg={this.state.promptMessage}
        />
      </ImageBackground>
      // </KeyboardAwareScrollView>
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
  backContainer: {
    height: DEVICE_WIDTH * 0.1,
    width: DEVICE_WIDTH * 0.1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropDown: {
    height: DEVICE_HEIGHT * 0.07,
    width: DEVICE_WIDTH * 0.85,
    borderRadius: DEVICE_WIDTH * 0.02,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    // marginTop: DEVICE_HEIGHT * 0.05,
    borderColor: '#4b4b4b',
    backgroundColor: 'transparent',
  },
  answer: {
    height: DEVICE_HEIGHT * 0.07,
    width: DEVICE_WIDTH * 0.85,
    borderRadius: DEVICE_WIDTH * 0.02,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: DEVICE_HEIGHT * 0.02,
    borderColor: '#4b4b4b',
    backgroundColor: 'transparent',
    padding: 0,
    paddingLeft: DEVICE_WIDTH * 0.03,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Regular',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  questionLabel: {
    fontSize: DEVICE_HEIGHT * 0.025,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Regular',
    width: DEVICE_WIDTH * 0.85,
    marginBottom: DEVICE_HEIGHT * 0.02,
  },
  answerLabel: {
    fontSize: DEVICE_HEIGHT * 0.025,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Regular',
    width: DEVICE_WIDTH * 0.85,
    marginBottom: DEVICE_HEIGHT * 0.02,
    marginTop: DEVICE_HEIGHT * 0.02,
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
    marginBottom: DEVICE_HEIGHT * 0.1,
    marginTop:
      Platform.OS === 'ios' ? DEVICE_HEIGHT * 0.07 : DEVICE_HEIGHT * 0.035,
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
    marginTop: DEVICE_HEIGHT * 0.05,
    marginBottom: DEVICE_HEIGHT * 0.03,
  },
});
