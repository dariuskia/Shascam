/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState, useEffect } from 'react';
import type {PropsWithChildren} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Button,
  Image,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import firebase from '@react-native-firebase/app'
import messaging from '@react-native-firebase/messaging'

type SectionProps = PropsWithChildren<{
  title: string;
}>;

const serverURL = 'https://superb-mighty-tortoise.ngrok-free.app';

const RNfirebaseConfig = {
  // apiKey: "AAAAQzwz1Ns:APA91bElRlZYgYMVD7uysJVuH0szueLgH3BJBuw8DIjJiD0FQJIVtclj-b033EcgiEcKedmxaJttVwbs8lm5Vi4hsrUXNHx_l3jWH7fgU0Rwom7bU2-0xTzBFQKX67v0RcaE5-ISeJ83",
  apiKey: 'AIzaSyDSWrWBdEubboZ-TqcY6K1SsymMPkZCxMY',
  //authDomain: "note-app-rn.firebaseapp.com",
  projectId: 'shascam-92eb8',
  databaseURL: '',
  storagBucket: 'shascam-92eb8.appspot.com',
  messagingSenderId: '505242653887',
  appId: '1:505242653887:ios:cf3e4c12bc34eba727220a'
}
type ScamResponse = { category: string; justify: string; action: string; };

/** For 400 */
type BadRequest = { code: "bad_request"; message: string };

type UserResponse =
| (Omit<Response, "json"> & {
    status: 201;
    json: () => ScamResponse | PromiseLike<ScamResponse>;
  })
| (Omit<Response, "json"> & {
    status: 400;
    json: () => BadRequest | PromiseLike<BadRequest>;
  });

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

const Stack = createNativeStackNavigator();

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

function Boilerplate(): React.JSX.Element {
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

function MainScreen(): React.JSX.Element {
  const [category, setCategory] = useState("Likely Scam");
  const [justify, setJustify] = useState("This is most likely a scam because blah blah blah blah...");
  const [action, setAction] = useState("You should respond with, \"Why do you need my credit card information?\"");

  interface ScamResponse {
    category: string,
    justify: string,
    action: string
  }
  const ws = new WebSocket('wss://superb-mighty-tortoise.ngrok-free.app/model-output');

  ws.onopen = () => {
    // connection opened
    ws.send('something'); // send a message
  };

  ws.onmessage = e => {
    // a message was received
    console.log(e.data);
    const data = JSON.parse(e.data);
    setCategory(data.category);
    setJustify(data.justify);
    setAction(data.action);
  };

  ws.onerror = e => {
    // an error occurred
    console.log(e.message);
  };

  ws.onclose = e => {
    // connection closed
    console.log(e.code, e.reason);
  };



  async function fetchScam() {
    console.log("Fetching scams...")
    try {
      const response = await fetch(serverURL + '/scam_detect', {
        method: "GET",
        headers: {
          'Content-Type': 'application/json'
        },
        redirect: 'manual'
      });
      const res = response as UserResponse;

      if (res.status === 201) {
        const data: ScamResponse = await res.json();
        // Update state with the response data
        setCategory(data.category);
        setJustify(data.justify);
        setAction(data.action);
      } else if (res.status === 400) {
        const errorData: BadRequest = await res.json();
        console.error(errorData.message);
        // Handle bad request (e.g., update state to show error message)
      } else {
        throw new Error("Unhandled response code");
      }
    } catch (error) {
      console.error("Fetching scam detection failed:", error);
      // Handle fetch error (e.g., update state to show error message)
    }
  }


  return (
    <View style={styles.mainContainer}>
      <Text style={styles.category}>{category}</Text>
      { category.includes("Unlikely") ? 
      <Image
        source={require('./assets/purple-check.png')}
        style={styles.categoryImage}
      />
      :
      <Image
        source={require('./assets/purple-warning.png')}
        style={styles.categoryImage}
      />
      }
      <View style={{
        gap: 10
      }}>
        <View style={styles.infoBox}>
          <Text style={{fontWeight: 'bold'}}>Why?</Text>
          <Text>{justify}</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={{fontWeight: 'bold'}}>What to do?</Text>
          <Text>{action}</Text>
        </View>
      </View>
    </View>
  );
}

function HomeScreen({ navigation }): React.JSX.Element {
  return (
    <View style={styles.sectionContainer}>
      <View style={styles.main}>
        <Text style={styles.sectionTitle}>ShaScam</Text>
        <Image 
          style={{
            width: 250,
            height: 250,
          }}
          source={require('./assets/shascam_logo.png')}
        />
        <View style={{
          padding: 10,
          backgroundColor: '#8247BC',
          borderRadius: 10,
          width: 200,
        }}>
          <Button 
            title="Continue"
            color="white"
            onPress={() => navigation.navigate("Main")}
          />
        </View>
      </View>
    </View>
  );
}

function MyStack(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Main" component={MainScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  infoBox: {
    backgroundColor: "#CBC3E3",
    shadowOpacity: 0.5,
    opacity: 0.75, 
    borderRadius: 16,
    padding: 15,
  },
  categoryImage: {
    width: 230,
    height: 230,
    marginVertical: 30
  },
  category: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 54,
  },
  sectionContainer: {
    paddingVertical: 24,
    paddingHorizontal: 24,
    backgroundColor: 'black',
    display: 'flex',
    alignItems: 'center',
    flex: 1
  },
  mainContainer: {
    justifyContent: 'center',
    backgroundColor: 'black',
    flex: 1,
    alignItems: 'center',
    paddingBottom: 50
  },
  main: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 50,
    flex: 1
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 64,
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

export default MyStack;
