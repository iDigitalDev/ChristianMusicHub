import React, {Component} from 'react';

import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  ImageBackground,
  FlatList,
  Image,
} from 'react-native';
import Check from '../assets/svg/check.svg';

import {
  GRADIENT_COLOR_SET_1,
  DEVICE_HEIGHT,
  DEVICE_WIDTH,
} from '../constants/constants';

import Modal, {ModalContent} from 'react-native-modal';

export const CMH_ALERT = ({isShow, msg, yes, no}) => (
  <Modal
    isVisible={isShow}
    // onBackdropPress={() => this.setState({showOptionModal: false})}
    hideModalContentWhileAnimating={false}>
    <View style={styles.alertContainer}>
      <Text style={styles.alertMessage}>{msg}</Text>
      <View style={styles.alertButtonContainer}>
        <TouchableOpacity onPress={yes}>
          <Check width={DEVICE_WIDTH * 0.1} height={DEVICE_WIDTH * 0.1} />
        </TouchableOpacity>
        <TouchableOpacity onPress={no}>
          <Image
            style={styles.cancel}
            source={require('../assets/images/cancel.png')}
          />
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

export const CMH_ALERT_2 = ({isShow, msg, yes, no, btnMsg}) => (
  <Modal
    isVisible={isShow}
    // onBackdropPress={() => this.setState({showOptionModal: false})}
    hideModalContentWhileAnimating={false}>
    <View style={styles.alertContainer}>
      <Text style={styles.alertMessage}>{msg}</Text>
      <View style={[styles.alertButtonContainer, {justifyContent: 'center'}]}>
        <TouchableOpacity style={styles.alertButton} onPress={yes}>
          <Text style={styles.alertMessage_2}>{btnMsg}</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

export const CMH_ALERT_3 = ({isShow, msg, close, yes}) => (
  <Modal
    isVisible={isShow}
    // onBackdropPress={() => this.setState({showOptionModal: false})}
    hideModalContentWhileAnimating={false}>
    <View style={styles.alertContainer_3}>
      <TouchableOpacity onPress={close} style={styles.closeContainer}>
        <Image
          style={styles.closeTop}
          source={require('../assets/images/cancel.png')}
        />
      </TouchableOpacity>
      <Text style={styles.alertMessage_3}>{msg}</Text>
      {msg !== null && msg.includes('exceeded') && (
        <View
          style={[
            styles.alertButtonContainer,
            {justifyContent: 'center', marginTop: DEVICE_HEIGHT * 0.03},
          ]}>
          <TouchableOpacity style={styles.alertButton_3} onPress={yes}>
            <Text style={styles.alertMessage_2}>SEND RESET REQUEST</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  </Modal>
);

export const CMH_ALERT_4 = ({isShow, msg, yes, no, btnMsg}) => (
  <Modal
    isVisible={isShow}
    // onBackdropPress={() => this.setState({showOptionModal: false})}
    hideModalContentWhileAnimating={false}>
    <View style={styles.alertContainer_4}>
      <Text style={styles.alertMessage}>{msg}</Text>
      <View style={[styles.alertButtonContainer, {justifyContent: 'center'}]}>
        <TouchableOpacity style={styles.alertButton} onPress={yes}>
          <Text style={styles.alertMessage_2}>{btnMsg}</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

export const CMH_ALERT_5 = ({isShow, msg, yes, no, option1, option2}) => (
  <Modal
    isVisible={isShow}
    // onBackdropPress={() => this.setState({showOptionModal: false})}
    hideModalContentWhileAnimating={false}>
    <View style={styles.alertContainer_5}>
      <Text style={styles.alertMessage}>{msg}</Text>
      <View
        style={[
          styles.alertButtonContainer,
          {
            justifyContent: 'space-around',
            flexDirection: 'row',
            width: DEVICE_WIDTH * 0.9,
          },
        ]}>
        <TouchableOpacity style={styles.alertButton_4} onPress={no}>
          <Text style={styles.alertMessage_4}>{option2}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.alertButton_4} onPress={yes}>
          <Text style={styles.alertMessage_4}>{option1}</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

export const OFFLINE_ALERT = ({isShow, msg, yes, no, option1}) => (
  <Modal
    isVisible={isShow}
    // onBackdropPress={() => this.setState({showOptionModal: false})}
    hideModalContentWhileAnimating={false}>
    <View style={styles.alertContainer_5}>
      <Text style={styles.alertMessage}>{msg}</Text>
      <View
        style={[
          styles.alertButtonContainer,
          {
            justifyContent: 'space-around',
            flexDirection: 'row',
            width: DEVICE_WIDTH * 0.9,
          },
        ]}>
        <TouchableOpacity style={styles.alertButton_4} onPress={yes}>
          <Text style={styles.alertMessage_4}>{option1}</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  alertContainer: {
    height: DEVICE_HEIGHT * 0.2,
    width: DEVICE_WIDTH * 0.7,
    marginLeft: DEVICE_WIDTH * 0.1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#151d27',
    borderRadius: DEVICE_HEIGHT * 0.02,
  },
  alertContainer_3: {
    // height: DEVICE_HEIGHT * 0.2,
    width: DEVICE_WIDTH * 0.7,
    marginLeft: DEVICE_WIDTH * 0.1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#151d27',
    borderRadius: DEVICE_HEIGHT * 0.02,
    paddingTop: DEVICE_HEIGHT * 0.03,
    paddingBottom: DEVICE_HEIGHT * 0.03,
    paddingLeft: DEVICE_WIDTH * 0.04,
    paddingRight: DEVICE_WIDTH * 0.04,
  },

  alertMessage: {
    fontSize: DEVICE_WIDTH * 0.04,
    color: '#66D5F7',
    fontFamily: 'Montserrat-Bold',
    marginBottom: DEVICE_HEIGHT * 0.04,
    textAlign: 'center',
    width: DEVICE_WIDTH * 0.7,
  },
  alertButtonContainer: {
    flexDirection: 'row',
    width: DEVICE_WIDTH * 0.5,
    justifyContent: 'space-between',
  },

  cancel: {
    height: DEVICE_WIDTH * 0.1,
    width: DEVICE_WIDTH * 0.1,
    tintColor: '#66D5F7',
  },
  closeTop: {
    height: DEVICE_WIDTH * 0.1,
    width: DEVICE_WIDTH * 0.1,
    tintColor: '#66D5F7',
  },
  closeContainer: {
    position: 'absolute',
    right: -10,
    top: -10,
  },
  alertButton: {
    width: DEVICE_WIDTH * 0.5,
    borderRadius: DEVICE_WIDTH * 0.1,
    backgroundColor: '#66D5F7',
    justifyContent: 'center',
    alignItems: 'center',
    height: DEVICE_HEIGHT * 0.06,
  },
  alertButton_3: {
    width: DEVICE_WIDTH * 0.6,
    borderRadius: DEVICE_WIDTH * 0.1,
    backgroundColor: '#66D5F7',
    justifyContent: 'center',
    alignItems: 'center',
    height: DEVICE_HEIGHT * 0.06,
  },
  alertButton_4: {
    width: DEVICE_WIDTH * 0.4,
    borderRadius: DEVICE_WIDTH * 0.1,
    backgroundColor: '#66D5F7',
    justifyContent: 'center',
    alignItems: 'center',
    height: DEVICE_HEIGHT * 0.06,
  },
  alertMessage_2: {
    fontSize: DEVICE_WIDTH * 0.04,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
  },
  alertMessage_3: {
    fontSize: DEVICE_WIDTH * 0.04,
    color: '#66D5F7',
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
  },
  alertMessage_4: {
    fontSize: DEVICE_WIDTH * 0.04,
    color: '#FFFFFF',
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
  },
  alertContainer_4: {
    height: DEVICE_HEIGHT * 0.3,
    width: DEVICE_WIDTH * 0.7,
    marginLeft: DEVICE_WIDTH * 0.1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#151d27',
    borderRadius: DEVICE_HEIGHT * 0.02,
  },
  alertContainer_5: {
    height: DEVICE_HEIGHT * 0.3,
    width: DEVICE_WIDTH * 0.9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#151d27',
    borderRadius: DEVICE_HEIGHT * 0.02,
  },
});
