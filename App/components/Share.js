import Share from 'react-native-share';
import { Buffer } from "buffer";
import base64 from "react-native-base64";
const socialMediaOptions = [
  {
    packageName: 'com.facebook.orca',
    shareOptions: {
      title: 'Share via',
      message: 'share test',
      url: 'https://www.youtube.com/watch?v=ADh_O-F8xo8',
      social: Share.Social.MESSENGER,
      // whatsAppNumber: "9199999999",  // country code + phone number
      // filename: 'test' , // only for base64 file in Android
    },
  },
  {
    packageName: 'com.whatsapp',
    shareOptions: {
      title: 'Share via',
      message: 'share test',
      url: 'https://www.youtube.com/watch?v=ADh_O-F8xo8',
      social: Share.Social.WHATSAPP,
      whatsAppNumber: '', // country code + phone number
      // filename: 'test' , // only for base64 file in Android
    },
  },
  {
    packageName: 'com.facebook.katana',
    shareOptions: {
      title: 'Share via',
      message: 'share test',
      url: 'https://www.youtube.com/watch?v=ADh_O-F8xo8',
      social: Share.Social.FACEBOOK,
      //  whatsAppNumber: "",  // country code + phone number
      // filename: 'test' , // only for base64 file in Android
    },
  },
  {
    packageName: 'com.instagram.android',
    shareOptions: {
      title: 'Share via',
      message: 'share test',
      url: 'https://www.youtube.com/watch?v=ADh_O-F8xo8',
      social: Share.Social.INSTAGRAM,
      //  whatsAppNumber: "",  // country code + phone number
      // filename: 'test' , // only for base64 file in Android
    },
  },
];

export const share = async (type, id, id2) => {
  console.log('sharing');
  console.log(type);
  console.log(id);
  let shareUrl = '';
  if (id2 !== undefined) {
    shareUrl = "https://app.christianmusichub.net/app/open?type=" + type + "&id=" + base64.encode(id.toString()) + "&id2=" + base64.encode(id2.toString());
  } else {
    shareUrl = "https://app.christianmusichub.net/app/open?type=" + type + "&id=" + base64.encode(id.toString());
  }

  console.log(shareUrl);
  //   // Share.shareSingle(shareOptions);
  //   // Share.isPackageInstalled('com.facebook.orca')
  //   Share.isPackageInstalled(socialMediaOptions[index].packageName).then(
  //     ({isInstalled}) => {
  //       if (isInstalled) {
  //         Share.shareSingle(socialMediaOptions[index].shareOptions);
  //         // alert("installed")
  //       } else {
  //         console.log('not installed');
  //       }
  //     },
  //   );
  const options = {
    message: '',
    title: '',
    url: shareUrl,
  };

  try {
    await Share.open(options);
  } catch (error) {}
};
