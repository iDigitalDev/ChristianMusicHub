import React, {Component} from 'react';
import RNRestart from 'react-native-restart';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  TextInput,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

import qs from 'qs';
import {Linking} from 'react-native';
import {CMH_ALERT_3} from '../../components/CMH';

import {
  GRADIENT_COLOR_SET_1,
  DEVICE_HEIGHT,
  DEVICE_WIDTH,
} from '../../constants/constants';
import Back from '../../assets/svg/back.svg';
import Sort from '../../assets/svg/Sort.svg';
import More from '../../assets/svg/more.svg';
import SortOption from '../../components/SortOption';
import Modal, {ModalContent} from 'react-native-modal';

import Tile from '../../components/Tile@5';

//redux
import {connect} from 'react-redux';
import {updateIsFinished} from '../../redux/actions/app';
import {updateShowPlayer} from '../../redux/actions/player';

//api
import {POST} from '../../api/service/service';
import {URL} from '../../api/service/urls';

import {update} from '../../redux/actions/app';

//api
import {
  initializeAppData,
  updateSpecificAppData,
} from '../../api/service/actions';
import {ScrollView} from 'react-native-gesture-handler';

class Feedback extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      username: '',
      comment: '',
      showPromptModal: false,
      promptMessage: null,
    };
  }

  onNameChange = (text) => {
    this.setState({
      username: text,
    });
  };

  onCommentChange = (text) => {
    this.setState({
      comment: text,
    });
  };

  onEmailChange = (text) => {
    this.setState({
      email: text,
    });
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

  onPressSubmit = () => {
    const {username, email, comment} = this.state;
    const valid = this.validateEmail(email);

    if (username === '') {
      // alert("username can't be empty");
      this.setState({
        showPromptModal: true,
        promptMessage: "Username can't be empty",
      });
      return;
    }

    if (comment === '') {
      // alert('comment section is empty');
      this.setState({
        showPromptModal: true,
        promptMessage: "Comment section can't be empty",
      });
      return;
    }

    this.onSendEmail();

    // let {user_id, authToken} = this.props.account;
    // let data = {user_id, authToken, email, username, comment};
    // let url = URL.FEEDBACK;

    // const receiver = (response) => {
    //   const {success} = response;
    //   if (success) {
    //     alert('Feedback sent!');
    //   } else {
    //     alert('failed to send feedback');
    //   }
    // };

    // let payload = {
    //   data,
    //   url,
    //   receiver,
    //   authToken,
    // };
    // POST(payload);
  };

  onPressEmail = async () => {
    let url = `mailto:${'info@christianmusichub.net'}`;

    const query = qs.stringify({
      subject: 'Christian Music Hub Feedback',
      body: '',
      cc: '',
      bcc: '',
    });

    if (query.length) {
      url += `?${query}`;
    }

    // check if we can use this link
    const canOpen = await Linking.canOpenURL(url);

    if (!canOpen) {
      throw new Error('Provided URL can not be handled');
    }

    Linking.openURL(url);
  };

  onSendEmail = async () => {
    const {username, comment, email} = this.state;
    let url = `mailto:${'info@christianmusichub.net'}`;

    const messageBody = 'from: ' + username + '\n\n' + comment;

    const query = qs.stringify({
      subject: 'Christian Music Hub Feedback',
      body: messageBody,
      // cc: 'Christian Music Hub Feedback',
      // bcc: 'Christian Music Hub Feedback',
    });

    if (query.length) {
      url += `?${query}`;
    }

    // check if we can use this link
    const canOpen = await Linking.canOpenURL(url);

    if (!canOpen) {
      throw new Error('Provided URL can not be handled');
    }

    Linking.openURL(url);
    this.props.navigation.pop();
  };

  render() {
    return (
      <LinearGradient
        colors={GRADIENT_COLOR_SET_1.COLORS}
        locations={GRADIENT_COLOR_SET_1.LOCATIONS}
        style={styles.mainContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => this.props.navigation.pop()}
            style={styles.back}>
            <Back width={DEVICE_WIDTH * 0.03} height={DEVICE_HEIGHT * 0.03} />
          </TouchableOpacity>
          <Text style={styles.headerText}>Contact Us</Text>
          <View style={styles.back}></View>
        </View>
        <ScrollView>
          <Text style={styles.topText}>Let's Hear It From You!</Text>
          <Text style={styles.subTopText}>
            Got a question? Do you have a great idea to suggest? Drop us a line
            for anything! We'd love to hear from the community!
          </Text>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            onChangeText={(text) => this.onNameChange(text)}
          />
          {/* <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            onChangeText={(text) => this.onEmailChange(text)}
          /> */}
          <Text style={styles.label}>Comments/Feedback</Text>
          <TextInput
            style={styles.comments}
            multiline={true}
            // blurOnSubmit={true}
            onChangeText={(text) => this.onCommentChange(text)}
          />
          <Text style={styles.subTopText}> You may email us as well at</Text>
          <TouchableOpacity onPress={() => this.onPressEmail()}>
            <Text style={styles.email}> info@christianmusichub.net</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => this.onPressSubmit()}>
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
          <View style={styles.spacer} />
        </ScrollView>
        <CMH_ALERT_3
          isShow={this.state.showPromptModal}
          close={() => this.setState({showPromptModal: false})}
          yes={() => this.onSendEmail()}
          msg={this.state.promptMessage}
        />
      </LinearGradient>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: DEVICE_HEIGHT * 0.08,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: DEVICE_WIDTH * 0.04,
    alignItems: 'center',
    marginBottom: DEVICE_HEIGHT * 0.02,
  },
  spacer: {
    height: DEVICE_HEIGHT * 0.1,
  },
  headerText: {
    fontSize: DEVICE_HEIGHT * 0.03,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
  },
  back: {
    width: DEVICE_WIDTH * 0.1,
    height: DEVICE_HEIGHT * 0.04,
    justifyContent: 'center',
  },
  topText: {
    fontSize: DEVICE_WIDTH * 0.07,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
  },
  subTopText: {
    fontSize: DEVICE_WIDTH * 0.035,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    width: DEVICE_WIDTH * 0.8,
    marginLeft: DEVICE_WIDTH * 0.1,
    marginTop: DEVICE_HEIGHT * 0.02,
  },
  email: {
    fontSize: DEVICE_WIDTH * 0.035,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
    width: DEVICE_WIDTH * 0.8,
    marginLeft: DEVICE_WIDTH * 0.1,
    textDecorationLine: 'underline',
  },
  input: {
    width: DEVICE_WIDTH * 0.8,
    height: DEVICE_HEIGHT * 0.07,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: DEVICE_WIDTH * 0.03,
    marginLeft: DEVICE_WIDTH * 0.1,
    fontSize: DEVICE_HEIGHT * 0.03,
    paddingLeft: DEVICE_WIDTH * 0.05,
    color: '#FFFFFF',
  },
  label: {
    fontSize: DEVICE_WIDTH * 0.035,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Regular',
    width: DEVICE_WIDTH * 0.8,
    marginLeft: DEVICE_WIDTH * 0.1,
    marginTop: DEVICE_HEIGHT * 0.025,
    textAlign: 'left',
    marginBottom: DEVICE_HEIGHT * 0.01,
  },
  comments: {
    width: DEVICE_WIDTH * 0.8,
    height: DEVICE_HEIGHT * 0.2,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: DEVICE_WIDTH * 0.03,
    marginLeft: DEVICE_WIDTH * 0.1,
    paddingLeft: DEVICE_WIDTH * 0.05,
    paddingRight: DEVICE_WIDTH * 0.05,
    color: '#FFFFFF',
    flexWrap: 'wrap',
    textAlignVertical: 'top',
  },
  button: {
    height: DEVICE_HEIGHT * 0.08,
    width: DEVICE_WIDTH * 0.8,
    borderRadius: DEVICE_WIDTH * 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#66D5F7',
    marginLeft: DEVICE_WIDTH * 0.1,
    marginTop: DEVICE_HEIGHT * 0.02,
    marginBottom: DEVICE_HEIGHT * 0.02,
  },
  buttonText: {
    fontSize: DEVICE_WIDTH * 0.05,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
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
    updateIsFinished: (payload) => dispatch(updateIsFinished(payload)),
    updateShowPlayer: (payload) => dispatch(updateShowPlayer(payload)),
    update: (payload) => dispatch(update(payload)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Feedback);
