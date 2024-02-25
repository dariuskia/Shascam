import React, { useState, useEffect } from 'react'; // Import useState
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import {TextInput} from "react-native-paper"
import firebase from '@react-native-firebase/app'
import messaging from '@react-native-firebase/messaging'

const RNfirebaseConfig = {
  // apiKey: "AAAAQzwz1Ns:APA91bElRlZYgYMVD7uysJVuH0szueLgH3BJBuw8DIjJiD0FQJIVtclj-b033EcgiEcKedmxaJttVwbs8lm5Vi4hsrUXNHx_l3jWH7fgU0Rwom7bU2-0xTzBFQKX67v0RcaE5-ISeJ83",
  apiKey: 'AIzaSyDDwxTxsPQ9X0WUd1mI-Go3HFjJrfHpZoM',
  //authDomain: "note-app-rn.firebaseapp.com",
  projectId: 'identity-wallet-92a26',
  databaseURL: '',
  storageBucket: 'identity-wallet-92a26.appspot.com',
  messagingSenderId: '288772838619',
  appId: '1:288772838619:ios:722745011bebd0e3a9a8fe'
}
const apiURL = "https://superb-mighty-tortoise.ngrok-free.app"
// const app = firebase.initializeApp(RNfirebaseConfig)
export default function App() {
    const [showInit, setShowInit] = useState(true); // Use useState for showInit
    const buildnumber = "+1 (408)-621-7775"; // This could also be part of state if it changes
    const [category, setCategory] = useState(null);
    const [justify, setJustify] = useState(null);
    const [actionBool, setActionBool] = useState(null);
    const [actionQues, setActionQues] = useState(null)
    const [enableDash, setEnableDash] = useState(false);
    useEffect(() => {
      requestPermission();
      const interval = setInterval(() => {
        fetchScamOutput();
      }, 10000);
    }, []);

    requestPermission();
    async function requestPermission () {
      try {
        await messaging().requestPermission()
        getToken()
      } catch (error) {
        console.log(error)
        alert('Permission rejected')
      }
    }
  
    async function getToken() {
      const fcmToken = await messaging().getToken()
      if (fcmToken) {
        console.log('FCM Token', fcmToken)
      }
    }

    async function getScamDetection(){
      const url = apiURL + "/scam_detect";
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          redirect: "manual"
        });
        const data = await response.json();
        console.log(data); 
        return data; 
      } catch (error) {
        console.error('Error fetching scam detection:', error);
        throw error; 
      }
    }
    
    async function fetchScamOutput(){
      try {
        const currResp = await getScamDetection();
        console.log(currResp);
        if(currResp && currResp.category != null){
          setCategory(currResp.category);
          setJustify(currResp.justify);
          setActionBool(currResp.actionBool);
          setActionQues(currResp.actionQues);
          setEnableDash(true);
        } else {
          setEnableDash(false);
        }
      } catch (error) {
        console.error('Error fetching scam output:', error);
      }
    }
    
  
    return (
      <View style={styles.container}>
        <View style={{marginTop: 100, alignItems: "center"}}>
          <Text style={{display: "flex", alignSelf: "center", marginLeft: 10, justifyContent: "flex-start", fontWeight: "bold", fontSize: 30, color: "white", marginBottom: 70}}>Shascam</Text>
          <Image source={require('./assets/shascam_logo.png')} style={{width: 250, height: 250, marginBottom: 30 }}/>
          {
            showInit ? 
            (
              <TouchableOpacity 
                onPress={() => setShowInit(false)} // Update showInit state to false
                style={{backgroundColor: "white", width: "80%", alignItems: "center", padding: 10, borderRadius: 16}}
              >
                <Text style={{color: "#20004A", fontSize: 18}}>Create your Proxy Number!</Text>
              </TouchableOpacity>
            ) : 
            !enableDash  ?
            (
              <View style={{width: "80%"}}>
                <TextInput
                  style={styles.input}
                  editable={false}
                  value={buildnumber}
                  label="Your Number"
                />
                <Text style={{marginTop: 30, color: "white"}}>Use the number above to forward to any external sources for AI-powered scam detection.</Text>
              </View>
            ) : 
            (
              <View style={{width: "80%"}}>
                  <TextInput
                    style={styles.input}
                    editable={false}
                    value={category}
                    label="Category"
                  />
                  actionBool != "None" ? 
                  (actionBool == true ? 
                    (<TextInput
                      style={styles.input}
                      editable={false}
                      value={actionQues}
                      label="Action to take"
                    />) : 
                    (<TextInput
                      style={styles.input}
                      editable={false}
                      value={actionQues}
                      label="Question to ask"
                    />)
                  ) :
                  (<></>)
                  justify != "None" ? 
                 (<TextInput
                    style={styles.input}
                    editable={false}
                    value={justify}
                    label="Justification"
                  />):
                  (<></>)
                  <Text style={{marginTop: 30, color: "white"}}>Use the number above to forward to any external sources for AI-powered scam detection.</Text>
              </View>
            )
          }
          <StatusBar style="auto" />
        </View>
      </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#20004A',
  },
  input:{
    color: "#20004A",
    padding: 5
  }
});
