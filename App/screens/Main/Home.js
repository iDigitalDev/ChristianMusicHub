
import React, {Component} from 'react';

import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Button,
} from 'react-native';

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password:''
    };
  }

  onPressLogin = () =>{
      this.props.navigation.navigate("Login")
  }
 
  render() {
    return (
      <View style={styles.mainContainer}>
          <Text>HOME SCREEN</Text>
          <Button title="Login" onPress={this.onPressLogin}></Button>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    justifyContent:'center',
    alignItems:'center',
    flex:1,
  }
});
