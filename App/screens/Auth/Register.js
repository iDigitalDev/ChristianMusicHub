/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Image,
  ImageBackground,
  Platform,
  KeyboardAvoidingView,
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
import Check from '../../assets/svg/radiocheck.svg';
import Uncheck from '../../assets/svg/radiouncheck.svg';
import {CMH_ALERT_3} from '../../components/CMH';

import GradientButton from '../../components/GradientButton';
import Input from '../../components/Input';
import Terms from '../../components/Terms';

//redux
import {connect} from 'react-redux';
import {login} from '../../redux/actions/account';

//api
import {POST} from '../../api/service/service';
import {URL} from '../../constants/apirUrls';

import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import DropDownPicker from 'react-native-dropdown-picker';
import {ScrollView} from 'react-native-gesture-handler';
import Modal, {ModalContent} from 'react-native-modal';

class Register extends Component {
  constructor(props) {
    super(props);
    this.state = this._getState();
  }

  _getState = () => ({
    enableButton: false,
    email: '',
    username: '',
    password: '',
    retypePassword: '',
    emailInputState: 'default',
    usernameInputState: 'default',
    passwordInputState: 'default',
    retypePasswordInputState: 'default',
    numberInputState: 'default',
    enableRetype: false,
    date: 'Select',
    gender: null,
    number: null,
    policy: false,
    newsletter: false,
    showTerms: false,
    showPrivacy: false,

    userNameErrorText: null,
    emailErrorText: null,
    numberErrorText: null,
    passwordErrorText: null,
    confirmPasswordErrorText: null,

    showPromptModal: false,
    promptMessage: null,
  });

  // onPressRegister = () => {
  //   // alert('enabled');
  //   // if (!this.isPasswordMatch()) {
  //   //   alert('Password Mismatch');
  //   //   return;
  //   // }

  //   let {email, password, username, gender, date} = this.state;
  //   let data = {email, password, username, gender, birthdate: date};
  //   let url = URL.REGISTER;

  //   const receiver = (response) => {
  //     const {success} = response;
  //     if (success) {
  //       alert('Successfully registered!');
  //       this.props.navigation.push('Login');
  //     } else {
  //       alert('not registered');
  //     }
  //   };

  //   let payload = {
  //     data,
  //     url,
  //     receiver,
  //   };
  //   POST(payload);
  // };

  onPressNext = () => {
    let {
      email,
      password,
      username,
      gender,
      date,
      number,
      policy,
      newsletter,
    } = this.state;

    let data = {email};
    let url = URL.CHECK_EMAIL;

    const receiver = (response) => {
      const {success} = response;
      if (success) {
        const {push} = this.props.navigation;
        let passData = {
          email,
          password,
          username,
          gender,
          birthdate: date,
          number,
          policy,
          newsletter,
        };
        push('Upload', passData);
      } else {
        console.log(response);
        // alert('email is already in use');
        this.setState({
          showPromptModal: true,
          promptMessage: 'Email is already in use',
        });
        return;
      }
    };

    let payload = {
      data,
      url,
      receiver,
    };
    POST(payload);
  };
  isPasswordMatch = () => {
    let {password, retypePassword} = this.state;
    let match = password === retypePassword ? true : false;
    return match;
  };

  email = (input) => {
    const valid = this.validateEmail(input);

    if (valid) {
      this.setState(
        {
          email: input,
          emailInputState: 'valid',
          emailErrorText: null,
        },
        this.enableButton,
      );
    } else {
      this.setState(
        {
          email: input,
          emailInputState: 'invalid',
          emailErrorText: 'Invalid email format',
        },
        this.enableButton,
      );
    }
  };

  username = (input) => {
    const len = input.length;
    if (len >= 7) {
      this.setState(
        {
          username: input,
          usernameInputState: 'valid',
          userNameErrorText: null,
        },
        this.enableButton,
      );
    } else {
      this.setState(
        {
          username: input,
          usernameInputState: 'invalid',
          userNameErrorText: 'Username must be at least 7 characters',
        },
        this.enableButton,
      );
    }
  };

  password = (input) => {
    const valid = this.validatePassword(input);
    if (valid) {
      this.setState(
        {
          password: input,
          passwordInputState: 'valid',
          enableRetype: true,
          passwordErrorText: null,
        },
        this.enableButton,
      );
    } else {
      this.setState(
        {
          password: input,
          passwordInputState: 'invalid',
          enableRetype: false,
        },
        this.enableButton,
      );
    }
  };

  number = (input) => {
    const len = input.length;
    if (len > 11) {
      return;
    }
    if (len > 10) {
      this.setState(
        {
          number: input,
          numberInputState: 'valid',
          numberErrorText: null,
        },
        this.enableButton,
      );
    } else {
      this.setState(
        {
          number: input,
          numberInputState: 'invalid',
          numberErrorText: 'Mobile number must be at least 11 digits',
        },
        this.enableButton,
      );
    }
  };

  retypePassword = (input) => {
    const valid = this.validateMatch(input);
    if (valid) {
      this.setState(
        {
          retypePassword: input,
          retypePasswordInputState: 'valid',
          confirmPasswordErrorText: null,
        },
        this.enableButton,
      );
    } else {
      this.setState(
        {
          retypePassword: input,
          retypePasswordInputState: 'invalid',
          confirmPasswordErrorText: 'Password does not match',
        },
        this.enableButton,
      );
    }
  };

  validateMatch = (input) => {
    const {password} = this.state;
    if (password === input) {
      return true;
    } else {
      return false;
    }
  };

  validateEmail = (mail) => {
    if (
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
        mail,
      )
    ) {
      return true;
    }
    return false;
  };

  validatePassword = (password) => {
    // var passw = /^[A-Za-z]\w{7,14}$/;

    if (password.length < 7) {
      this.setState({
        passwordErrorText: 'Password must be at least 7 characters',
      });
      return false;
    }

    if (!password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)) {
      this.setState({
        passwordErrorText:
          'Password should contain both lower and uppercase characters',
      });
      return false;
    }

    if (!password.match(/([a-zA-Z])/) && password.match(/([0-9])/)) {
      this.setState({
        passwordErrorText: 'Password should contain a number',
      });
      return false;
    }
    return true;

    // if (password.match(passw)) {
    //   return true;
    // } else {
    //   return false;
    // }
  };

  enableButton = () => {
    const {
      emailInputState,
      passwordInputState,
      usernameInputState,
      retypePasswordInputState,
      date,
      gender,
      policy,
    } = this.state;
    if (
      emailInputState === 'valid' &&
      passwordInputState === 'valid' &&
      usernameInputState === 'valid' &&
      retypePasswordInputState === 'valid' &&
      // date !== 'Select' &&
      // gender !== null &&
      policy === true
    ) {
      this.setState({
        enableButton: true,
      });
    } else {
      this.setState({
        enableButton: false,
      });
    }
  };

  componentDidMount() {}

  renderButton = () => {
    const {enableButton} = this.state;

    const style = enableButton
      ? [styles.button, {backgroundColor: '#66D5F7'}]
      : [styles.button, {backgroundColor: '#d5d5d5'}];

    return (
      <TouchableOpacity
        style={style}
        disabled={!enableButton}
        onPress={() => this.onPressNext()}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    );
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

  handleConfirm = (date) => {
    var base = new Date(date);
    var m = base.getMonth();
    var d = base.getDate();
    var y = base.getFullYear();
    const formatDate = y + '-' + m + '-' + d;
    this.setState(
      {
        date: formatDate,
        showDatePicker: false,
      },
      this.enableButton,
    );
    // this.hideDatePicker();
  };
  onPressTerms = () => {
    this.props.navigation.push('WebView', {
      header: 'Terms and Conditions',
      link: 'https://christianmusichub.net/terms-and-conditions/',
    });
  };

  onPressPrivacy = () => {
    this.props.navigation.push('WebView', {
      header: 'Privacy Policy',
      link: 'https://www.christianmusichub.net/privacy-policy/',
    });
  };
  renderPolicy = () => {
    const {policy} = this.state;
    const radio = policy ? (
      <TouchableOpacity
        onPress={() => this.setState({policy: false}, this.enableButton)}>
        <Check
          width={DEVICE_WIDTH * 0.05}
          height={DEVICE_HEIGHT * 0.05}
          style={styles.radio}
        />
      </TouchableOpacity>
    ) : (
      <TouchableOpacity
        onPress={() => this.setState({policy: true}, this.enableButton)}>
        <Uncheck
          width={DEVICE_WIDTH * 0.05}
          height={DEVICE_HEIGHT * 0.05}
          style={styles.radio}
        />
      </TouchableOpacity>
    );

    const row = (
      <View style={styles.tickContainer}>
        {radio}
        <View style={styles.subTickContainer}>
          <Text style={styles.white}>I Agree to the</Text>
          <TouchableOpacity onPress={() => this.onPressPrivacy()}>
            <Text style={styles.blue}> Privacy Policy </Text>
          </TouchableOpacity>

          <Text style={styles.white}>&</Text>
          <TouchableOpacity
            style={{flexDirection: 'row'}}
            onPress={() => this.onPressTerms()}>
            <Text style={styles.blue}> Terms & </Text>
            <Text style={styles.blue}>Conditions </Text>
          </TouchableOpacity>
        </View>
      </View>
    );

    return row;
  };

  renderNewsletter = () => {
    const {newsletter} = this.state;
    const radio = newsletter ? (
      <TouchableOpacity onPress={() => this.setState({newsletter: false})}>
        <Check
          width={DEVICE_WIDTH * 0.05}
          height={DEVICE_HEIGHT * 0.05}
          style={styles.radio}
        />
      </TouchableOpacity>
    ) : (
      <TouchableOpacity onPress={() => this.setState({newsletter: true})}>
        <Uncheck
          width={DEVICE_WIDTH * 0.05}
          height={DEVICE_HEIGHT * 0.05}
          style={styles.radio}
        />
      </TouchableOpacity>
    );

    const row = (
      <View style={styles.tickContainer}>
        {radio}
        <View style={styles.subTickContainer}>
          <Text style={styles.white}>Subscribe to our Newsletter</Text>
        </View>
      </View>
    );

    return row;
  };

  render() {
    const {
      email,
      emailInputState,
      password,
      passwordInputState,
      username,
      usernameInputState,
      retypePassword,
      retypePasswordInputState,
      enableRetype,
      numberInputState,
      showDatePicker,
      date,
      gender,
      number,
      showTerms,
      showPrivacy,
    } = this.state;
    const datePickerButton =
      date !== 'Select'
        ? [styles.halfButton, {borderColor: '#82DD55'}]
        : [styles.halfButton, {borderColor: '#4b4b4b'}];

    const genderPickerButton =
      gender !== null
        ? [styles.gender, {borderColor: '#82DD55'}]
        : [styles.gender, {borderColor: '#4b4b4b'}];
    return (
      // <KeyboardAwareScrollView style={{borderColor: 'yellow', borderWidth: 2}}>
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
          <Text style={styles.headerText}>Sign Up</Text>
          <View />
        </View>
        <View style={{height: DEVICE_HEIGHT * 0.8, backgroundColor: ''}}>
          <ScrollView>
            <Text style={styles.labelText}>Your email</Text>
            <Input
              borderColor={'#FFFFFF'}
              placeHolder={'Email address'}
              inputUpdate={this.email}
              marginBottom={DEVICE_HEIGHT * 0.01}
              inputState={emailInputState}
              value={email}
            />
            <Text style={styles.errorText}>{this.state.emailErrorText}</Text>

            <Text style={styles.labelText}>Mobile No.</Text>
            <Input
              borderColor={'#FFFFFF'}
              placeHolder={'Mobile number'}
              inputUpdate={this.number}
              marginBottom={DEVICE_HEIGHT * 0.01}
              inputState={numberInputState}
              value={number}
              type={'numeric'}
            />
            <Text style={styles.errorText}>{this.state.numberErrorText}</Text>

            <Text style={styles.labelText}>Username</Text>

            <Input
              borderColor={'#FFFFFF'}
              placeHolder={'Password'}
              inputUpdate={this.username}
              maxLength={12}
              security={false}
              marginBottom={DEVICE_HEIGHT * 0.01}
              inputState={usernameInputState}
              value={username}
            />
            <Text style={styles.errorText}>{this.state.userNameErrorText}</Text>

            <Text style={styles.labelText}>Create password</Text>

            <Input
              borderColor={'#FFFFFF'}
              placeHolder={'Verify Password'}
              inputUpdate={this.password}
              security={true}
              marginBottom={DEVICE_HEIGHT * 0.01}
              inputState={passwordInputState}
              value={password}
            />
            <Text style={styles.errorText}>{this.state.passwordErrorText}</Text>

            <Text style={styles.labelText}>Confirm password</Text>

            <Input
              borderColor={'#FFFFFF'}
              placeHolder={'Verify Password'}
              inputUpdate={this.retypePassword}
              security={true}
              marginBottom={DEVICE_HEIGHT * 0.01}
              inputState={retypePasswordInputState}
              value={retypePassword}
              enable={enableRetype}
            />
            <Text style={styles.errorText}>
              {this.state.confirmPasswordErrorText}
            </Text>

            <View style={styles.rowContainer}>
              <View>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text style={styles.halfLabelText}>Date Of Birth</Text>
                  <Text style={styles.optional}>(Optional)</Text>
                </View>

                <TouchableOpacity
                  style={datePickerButton}
                  onPress={() => this.showDatePicker()}>
                  <Text style={styles.date}>{date}</Text>
                </TouchableOpacity>
              </View>
              <View>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text style={styles.halfLabelText}>Gender</Text>
                  <Text style={styles.optional}>(Optional)</Text>
                </View>

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
                  defaultValue={gender}
                  containerStyle={{height: DEVICE_HEIGHT * 0.12}}
                  style={genderPickerButton}
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
            {this.renderPolicy()}
            {this.renderNewsletter()}
            {this.renderButton()}
          </ScrollView>
        </View>

        <DateTimePickerModal
          isVisible={showDatePicker}
          mode="date"
          onConfirm={this.handleConfirm}
          onCancel={this.hideDatePicker}
        />
        <Modal
          isVisible={showTerms}
          onBackdropPress={() => this.setState({showTerms: false})}
          hideModalContentWhileAnimating={true}>
          <Terms cancel={() => this.setState({showTerms: false})} />
        </Modal>
        <CMH_ALERT_3
          isShow={this.state.showPromptModal}
          close={() => this.setState({showPromptModal: false})}
          yes={() => this.onSendEmail()}
          msg={this.state.promptMessage}
        />
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  rowContainer: {
    flexDirection: 'row',
    width: DEVICE_WIDTH * 0.85,
    justifyContent: 'space-between',
    marginBottom: DEVICE_HEIGHT * 0.03,
  },
  halfButton: {
    height: DEVICE_HEIGHT * 0.07,
    width: DEVICE_WIDTH * 0.4,
    borderRadius: DEVICE_WIDTH * 0.02,
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: DEVICE_HEIGHT * 0.05,
    borderColor: '#4b4b4b',
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
    borderColor: '#4b4b4b',
    backgroundColor: 'transparent',
  },
  genderButton: {},

  container: {
    justifyContent: 'flex-end',
    height: DEVICE_HEIGHT * 0.7,
  },
  ImageBackground: {
    resizeMode: 'cover',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    height: DEVICE_WIDTH * 0.25,

    marginTop: DEVICE_HEIGHT * 0.1,
    marginBottom: DEVICE_HEIGHT * 0.1,
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
  },
  date: {
    fontSize: DEVICE_HEIGHT * 0.025,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
  },
  labelText: {
    fontSize: DEVICE_HEIGHT * 0.02,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    width: DEVICE_WIDTH * 0.85,
    marginBottom: DEVICE_HEIGHT * 0.01,
  },
  errorText: {
    fontSize: DEVICE_HEIGHT * 0.015,
    color: 'red',
    fontFamily: 'Montserrat-Regular',
    width: DEVICE_WIDTH * 0.85,
    marginBottom: DEVICE_HEIGHT * 0.01,
  },
  halfLabelText: {
    fontSize: DEVICE_HEIGHT * 0.02,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    marginBottom: DEVICE_HEIGHT * 0.01,
  },
  optional: {
    marginLeft: DEVICE_WIDTH * 0.02,
    fontSize: DEVICE_WIDTH * 0.02,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Regular',
    marginBottom: DEVICE_HEIGHT * 0.01,
  },
  button: {
    height: DEVICE_HEIGHT * 0.08,
    width: DEVICE_WIDTH * 0.85,
    borderRadius: DEVICE_WIDTH * 10,
    justifyContent: 'center',
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
  tickContainer: {
    flexDirection: 'row',
    width: DEVICE_WIDTH * 0.85,
    marginBottom: DEVICE_HEIGHT * 0.04,
    alignItems: 'center',
  },
  subTickContainer: {
    flexDirection: 'row',
    width: DEVICE_WIDTH * 0.75,
    // height: DEVICE_HEIGHT * 0.1,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  white: {
    fontSize: DEVICE_WIDTH * 0.035,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
  },
  blue: {
    fontSize: DEVICE_WIDTH * 0.035,
    color: '#66D5F7',
    fontFamily: 'Montserrat-Bold',
  },
  radio: {
    marginRight: DEVICE_WIDTH * 0.04,
    // backgroundColor: 'red',
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
    login: (data) => dispatch(login(data)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Register);
