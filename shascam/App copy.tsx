/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import type {PropsWithChildren} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import {NavigationContainer} from '@react-navigation/native';
import firebase from '@react-native-firebase/app'
import messaging from '@react-native-firebase/messaging'

type SectionProps = PropsWithChildren<{
  title: string;
}>;

const RNfirebaseConfig = {
  // apiKey: "AAAAQzwz1Ns:APA91bElRlZYgYMVD7uysJVuH0szueLgH3BJBuw8DIjJiD0FQJIVtclj-b033EcgiEcKedmxaJttVwbs8lm5Vi4hsrUXNHx_l3jWH7fgU0Rwom7bU2-0xTzBFQKX67v0RcaE5-ISeJ83",
  apiKey: 'AIzaSyDSWrWBdEubboZ-TqcY6K1SsymMPkZCxMY',
  //authDomain: "note-app-rn.firebaseapp.com",
  projectId: 'shascam-92eb8',
  databaseURL: '',
  storageBucket: 'shascam-92eb8.appspot.com',
  messagingSenderId: '505242653887',
  appId: '1:505242653887:ios:cf3e4c12bc34eba727220a'
}

// firebase.initializeApp(RNfirebaseConfig);
async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
  }
}
function Section({children, title}: SectionProps): React.JSX.Element {

  // useEffect(() => {
  //   async function getAuth() {
  //     const auth = await requestUserPermission();
  //     // await messaging().registerDeviceForRemoteMessages();
  //     const token = await messaging().getToken();
  //     console.log('Token: ', token);
  //   }
  //   getAuth();
  // });

  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
}

function App2(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Header />
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Section title="Step One">
            Edit <Text style={styles.highlight}>App.tsx</Text> to change this
            screen and then come back to see your edits.
          </Section>
          <Section title="See Your Changes">
            <ReloadInstructions />
          </Section>
          <Section title="Debug">
            <DebugInstructions />
          </Section>
          <Section title="Learn More">
            Read the docs to discover what to do next:
          </Section>
          <LearnMoreLinks />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function App(): React.JSX.Element {
  return (
    <View style={styles.sectionContainer}>
      <View style={styles.main}>
        <View style={{
          padding: 30, 
          backgroundColor: '#4D5DFA',
          borderRadius: 20,
          width: 200
        }}>
          <Text style={styles.sectionTitle}>Shascam</Text>
        </View>
        <View style={{
          padding: 10,
          backgroundColor: '#4751AF',
          borderRadius: 10,
          width: 200,
        }}>
          <Text style={{
            fontSize: 20,
            color: 'white',
            textAlign: 'center'
          }}>Continue</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    paddingVertical: 24,
    paddingHorizontal: 24,
    backgroundColor: '#181A20',
    flex: 1
  },
  main: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    flex: 1
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: '600',
    color: 'white',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
