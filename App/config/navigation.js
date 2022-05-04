import React from 'react';

import Player from '../components/player';

import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';

import Register from '../screens/Auth/Register';
import Login from '../screens/Auth/Login';
import Initial from '../screens/Auth/Initial';
import Upload from '../screens/Auth/Upload';
import Questions from '../screens/Auth/Questions';
import Forgot from '../screens/Auth/Forgot';
import Change from '../screens/Auth/Change';

import Trial from '../screens/Trial/Trial';
import Get from '../screens/Trial/Get';

import Library from '../screens/Main/Library';
import Search from '../screens/Main/Search';
import Category from '../screens/Main/Category';

import Featured from '../screens/HomeTabs/Featured';
import Artists from '../screens/HomeTabs/Artists';
import Playlist from '../screens/HomeTabs/Playlist';
import Albums from '../screens/HomeTabs/Albums';

import BottomTab from '../components/BottomTab';
import HomeTabs from '../components/HomeTabs';

import SubCategory from '../screens/Main/Category/subCategory';

import LibraryPlaylists from '../screens/Main/Library/playlists';
import LibraryAlbums from '../screens/Main/Library/albums';
import LibraryArtists from '../screens/Main/Library/artists';
import LibrarySongs from '../screens/Main/Library/songs';

import ArtistInfo from '../screens/Information/ArtistInfo';
import AlbumInfo from '../screens/Information/AlbumInfo';
import PlaylistInfo from '../screens/Information/PlaylistInfo';
import SongInfo from '../screens/Information/SongInfo';
import UserPlaylistInfo from '../screens/Information/UserPlaylistInfo';

import Profile from '../screens/Side/Profile';
import Settings from '../screens/Side/Settings';
import Edit from '../screens/Side/Edit';
import Feedback from '../screens/Side/Feedback';
import WebViewScreen from '../screens/Side/WebView';

const authStack = createStackNavigator();
const trialStack = createStackNavigator();
const appStack = createStackNavigator();
const mainTabStack = createBottomTabNavigator();
const homeTabStack = createMaterialTopTabNavigator();
const categoryStack = createStackNavigator();
const libraryStack = createStackNavigator();
const mainAppStack = createStackNavigator();
const searchStack = createStackNavigator();
const homeMainStack = createStackNavigator();

const MainTabStackScreen = () => (
  <mainTabStack.Navigator
    tabBar={(props) => <BottomTab {...props} />}
    tabBarOptions={{
      keyboardHidesTabBar: true,
    }}>
    <mainTabStack.Screen name="Home" component={HomeMainStack} />
    <mainTabStack.Screen name="Search" component={SearchStack} />
    <mainTabStack.Screen name="Category" component={CategoryStackScreen} />
    <mainTabStack.Screen name="Library" component={LibraryStackScreen} />
  </mainTabStack.Navigator>
);

const SearchStack = () => (
  <searchStack.Navigator screenOptions={{headerShown: false}}>
    <searchStack.Screen name="Search" component={Search} />
    <searchStack.Screen
      name="ArtistInfo"
      component={ArtistInfo}
      options={{headerShown: true}}
    />
    <searchStack.Screen
      name="AlbumInfo"
      component={AlbumInfo}
      options={{headerShown: false}}
    />
    <searchStack.Screen
      name="SongInfo"
      component={SongInfo}
      options={{headerShown: false}}
    />
    <searchStack.Screen
      name="PlaylistInfo"
      component={PlaylistInfo}
      options={{headerShown: false}}
    />
  </searchStack.Navigator>
);

const HomeTabStack = () => (
  <homeTabStack.Navigator
    swipeEnabled={false}
    tabBar={(props) => <HomeTabs {...props} />}>
    <homeTabStack.Screen name="Featured" component={Featured} />
    <homeTabStack.Screen name="Artists" component={Artists} />
    <homeTabStack.Screen name="Albums" component={Albums} />
    <homeTabStack.Screen name="Playlist" component={Playlist} />
  </homeTabStack.Navigator>
);

const HomeMainStack = () => (
  <homeMainStack.Navigator>
    <homeMainStack.Screen
      name="HomeTabs"
      component={HomeTabStack}
      options={{headerShown: false}}
    />
    <homeMainStack.Screen
      name="ArtistInfo"
      component={ArtistInfo}
      options={{headerShown: true}}
    />
    <homeMainStack.Screen
      name="AlbumInfo"
      component={AlbumInfo}
      options={{headerShown: false}}
    />
    <homeMainStack.Screen
      name="PlaylistInfo"
      component={PlaylistInfo}
      options={{headerShown: false}}
    />
    <homeMainStack.Screen
      name="UserPlaylistInfo"
      component={UserPlaylistInfo}
      options={{headerShown: false}}
    />
    <homeMainStack.Screen
      name="SongInfo"
      component={SongInfo}
      options={{headerShown: false}}
    />
    <homeMainStack.Screen
      name="Profile"
      component={Profile}
      options={{headerShown: false}}
    />
    <homeMainStack.Screen
      name="Get"
      component={Get}
      options={{headerShown: false}}
    />
    <homeMainStack.Screen
      name="Settings"
      component={Settings}
      options={{headerShown: false}}
    />
    <homeMainStack.Screen
      name="Feedback"
      component={Feedback}
      options={{headerShown: false}}
    />
    <homeMainStack.Screen
      name="WebView"
      component={WebViewScreen}
      options={{headerShown: false}}
    />
    <homeMainStack.Screen
      name="Edit"
      component={Edit}
      options={{headerShown: false}}
    />
  </homeMainStack.Navigator>
);

const CategoryStackScreen = () => (
  <categoryStack.Navigator screenOptions={{headerShown: false}}>
    <categoryStack.Screen name="CategoryIndex" component={Category} />
    <categoryStack.Screen name="SubCategory" component={SubCategory} />
    <categoryStack.Screen
      name="SongInfo"
      component={SongInfo}
      options={{headerShown: false}}
    />
    <categoryStack.Screen
      name="PlaylistInfo"
      component={PlaylistInfo}
      options={{headerShown: false}}
    />
    <categoryStack.Screen
      name="UserPlaylistInfo"
      component={UserPlaylistInfo}
      options={{headerShown: false}}
    />
    <categoryStack.Screen
      name="AlbumInfo"
      component={AlbumInfo}
      options={{headerShown: false}}
    />
    <categoryStack.Screen
      name="ArtistInfo"
      component={ArtistInfo}
      options={{headerShown: false}}
    />
  </categoryStack.Navigator>
);

const LibraryStackScreen = () => (
  <libraryStack.Navigator screenOptions={{headerShown: false}}>
    <libraryStack.Screen name="LibraryIndex" component={Library} />
    <libraryStack.Screen name="LibraryPlaylists" component={LibraryPlaylists} />
    <libraryStack.Screen name="LibraryAlbums" component={LibraryAlbums} />
    <libraryStack.Screen name="LibraryArtists" component={LibraryArtists} />
    <libraryStack.Screen name="LibrarySongs" component={LibrarySongs} />
    <libraryStack.Screen
      name="ArtistInfo"
      component={ArtistInfo}
      options={{headerShown: true}}
    />
    <libraryStack.Screen
      name="AlbumInfo"
      component={AlbumInfo}
      options={{headerShown: false}}
    />
    <libraryStack.Screen
      name="PlaylistInfo"
      component={PlaylistInfo}
      options={{headerShown: false}}
    />
    <libraryStack.Screen
      name="SongInfo"
      component={SongInfo}
      options={{headerShown: false}}
    />

    <libraryStack.Screen
      name="UserPlaylistInfo"
      component={UserPlaylistInfo}
      options={{headerShown: false}}
    />
    <libraryStack.Screen
      name="Profile"
      component={Profile}
      options={{headerShown: false}}
    />
    <libraryStack.Screen
      name="Get"
      component={Get}
      options={{headerShown: false}}
    />
    <libraryStack.Screen
      name="Settings"
      component={Settings}
      options={{headerShown: false}}
    />
    <libraryStack.Screen
      name="Feedback"
      component={Feedback}
      options={{headerShown: false}}
    />
    <libraryStack.Screen
      name="WebView"
      component={WebViewScreen}
      options={{headerShown: false}}
    />
    <libraryStack.Screen
      name="Edit"
      component={Edit}
      options={{headerShown: false}}
    />
  </libraryStack.Navigator>
);

const AuthStackScreen = () => (
  <authStack.Navigator screenOptions={{headerShown: false}}>
    <authStack.Screen name="Initial" component={Initial} />
    <authStack.Screen
      name="AlbumInfo"
      component={AlbumInfo}
      options={{headerShown: false}}
    />
    <authStack.Screen name="Login" component={Login} />
    <authStack.Screen name="Register" component={Register} />
    <authStack.Screen name="Upload" component={Upload} />
    <authStack.Screen name="Questions" component={Questions} />
    <authStack.Screen name="Forgot" component={Forgot} />
    <authStack.Screen name="Change" component={Change} />
    <authStack.Screen name="WebView" component={WebViewScreen} />
  </authStack.Navigator>
);

const TrialStackScreen = () => (
  <NavigationContainer independent={true}>
    <trialStack.Navigator screenOptions={{headerShown: false}}>
      <trialStack.Screen name="Trial" component={Trial} />
      <trialStack.Screen name="Get" component={Get} />
    </trialStack.Navigator>
    <Player />
  </NavigationContainer>
);

const MainStackScreen = () => (
  <NavigationContainer independent={true}>
    <mainAppStack.Navigator screenOptions={{headerShown: false}}>
      <mainAppStack.Screen name="Main" component={MainTabStackScreen} />
      <mainAppStack.Screen
        name="Auth"
        component={AuthStackScreen}
        options={{headerShown: false}}
      />
    </mainAppStack.Navigator>
    <Player />
  </NavigationContainer>
);

const AppStackScreen = () => (
  <appStack.Navigator>
    <appStack.Screen
      name="Auth"
      component={AuthStackScreen}
      options={{headerShown: false, gestureEnabled: false}}
    />
    <appStack.Screen
      options={{headerShown: false, gestureEnabled: false}}
      name="Main"
      component={MainStackScreen}
    />
    <appStack.Screen
      name="Trial"
      component={TrialStackScreen}
      options={{headerShown: false, gestureEnabled: false}}
    />
  </appStack.Navigator>
);

export default () => (
  <NavigationContainer>
    <AppStackScreen />
  </NavigationContainer>
);
