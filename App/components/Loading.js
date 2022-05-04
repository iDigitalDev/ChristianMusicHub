import React, {memo} from 'react';
import {View, StyleSheet, Platform, Image, ImageBackground} from 'react-native';
import FastImage from 'react-native-fast-image';
import {DEVICE_HEIGHT, LOGIN_BG} from '../constants/constants';

export const Loading = memo(({containerStyle}) => {
  return (
    <View style={styles.ImageBackground}>
      {Platform.OS === 'ios' ? (
        <FastImage
          style={styles.loading}
          source={require('../assets/images/loading.gif')}
          resizeMode={FastImage.resizeMode.contain}
        />
      ) : (
        <Image
          style={styles.loading}
          source={require('../assets/images/loading.gif')}
          resizeMode="contain"
        />
      )}
    </View>
  );
  // return (
  //   <ImageBackground source={LOGIN_BG} style={styles.ImageBackground}>
  //     {Platform.OS === 'ios' ? (
  //       <FastImage
  //         style={styles.loading}
  //         source={require('../assets/images/loading.gif')}
  //         resizeMode={FastImage.resizeMode.contain}
  //       />
  //     ) : (
  //       <Image
  //         style={styles.loading}
  //         source={require('../assets/images/loading.gif')}
  //         resizeMode="contain"
  //       />
  //     )}
  //   </ImageBackground>
  // );
});

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // alignItems: 'center',
    // justifyContent: 'center',
    // backgroundColor: 'black',
  },
  loading: {
    height: DEVICE_HEIGHT * 0.2,
    width: DEVICE_HEIGHT * 0.2,
  },
  ImageBackground: {
    height: DEVICE_HEIGHT * 1,
    resizeMode: 'cover',
    backgroundColor: '#015C7B',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
