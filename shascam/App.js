import React, { useState, useEffect } from 'react' // Import useState
import { StatusBar } from 'expo-status-bar'
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native'
import { TextInput } from 'react-native-paper'
import firebase from '@react-native-firebase/app'
import messaging from '@react-native-firebase/messaging'
import styles from './styles/AppStyles'

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
const apiURL = 'https://rare-previously-coyote.ngrok-free.app'
// const app = firebase.initializeApp(RNfirebaseConfig)
export default function App () {
  const [showInit, setShowInit] = useState(true) // Use useState for showInit
  const buildnumber = '+1 (833) 681-4644' // This could also be part of state if it changes
  const [category, setCategory] = useState(null)
  const [justify, setJustify] = useState(null)
  const [action, setAction] = useState(null)
  const [enableDash, setEnableDash] = useState(false)
  const [counter, setCounter] = useState(0)
  const [inCall, setInCall] = useState(false)
  useEffect(() => {
    if (counter == 0) {
      requestPermission()
      const interval = setInterval(() => {
        fetchScamOutput()
      }, 10000)
      setCounter(counter + 1)
    }
  }, [counter])

  requestPermission()
  async function requestPermission () {
    try {
      await messaging().requestPermission()
      getToken()
    } catch (error) {
      console.log(error)
      alert('Permission rejected')
    }
  }

  async function getToken () {
    const fcmToken = await messaging().getToken()
    if (fcmToken) {
      console.log('FCM Token', fcmToken)
    }
  }

  async function getScamDetection () {
    const url = apiURL + '/scam_detect'
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        redirect: 'manual'
      })
      const data = await response.json()
      console.log(data)
      return data
    } catch (error) {
      console.error('Error fetching scam detection:', error)
      throw error
    }
  }

  async function fetchScamOutput () {
    try {
      const currResp = await getScamDetection()
      console.log(currResp)
      if (currResp && currResp.category != null) {
        console.log(currResp)
        setCategory(currResp.category)
        setJustify(currResp.justify)
        if (currResp.action) setAction(currResp.action)
        setEnableDash(true)
        setInCall(true)
      } else {
        if (inCall) {
          Alert.alert(
            'How was our feedback?',
            "We hope we helped keep you safe from any existing scams out there! Let us know how we're doing.",
            [
              {
                text: 'Amazing!',
                onPress: () =>
                  setTimeout(() => {
                    setEnableDash(false)
                  }, 1000)
              },
              {
                text: 'Terrible :(',
                onPress: () =>
                  setTimeout(() => {
                    setEnableDash(false)
                  }, 1000),
                style: 'cancel'
              },
              { text: 'OK', onPress: () => console.log('OK Pressed') }
            ]
          )
          setInCall(false)
        }
      }
    } catch (error) {
      console.error('Error fetching scam output:', error)
    }
  }

  const ScamDetectionComponent = ({
    category,
    justify,
    action
  }) => {
    return (
        <View style={{display: 'flex'}}>
          <View style={{display: 'flex', alignItems: 'center'}}>
              <View><Text style={{fontWeight: "bold", color: "#E1DDF7", fontSize: 55,marginBottom: 10}}>{category}</Text></View>
              { category.includes("Unlikely") ? 
              <Image
                source={require('./assets/purple-check.png')}
                style={{ width: 250, height: 250, marginBottom: 10, marginTop: 30}}
              />
              :
              <Image
                source={require('./assets/purple-warning.png')}
                style={{ width: 250, height: 250, marginBottom: 10, marginTop: 30}}
              />
              }
          </View>
          { justify && <View style={styles.viewBox}> 
             <View><Text style={{...styles.viewBoxLabel}}>Why?</Text></View>
            <View><Text style={{...styles.viewBoxText}}>{justify}</Text></View>
          </View> }

          {action && <View style={styles.viewBox}>
            <View><Text style={styles.viewBoxLabel}>What now?</Text></View>
            <View><Text style={styles.viewBoxText}>{action}</Text></View>
          </View> }
        </View>
    )
  }

  if (showInit) {
    return (
      <View style={styles.container}>
            <Text
              style={{
                display: 'flex',
                alignSelf: 'center',
                marginLeft: 10,
                justifyContent: 'flex-start',
                fontWeight: 'bold',
                fontSize: 60,
                color: '#b86ffc',
                marginBottom: 80
              }}
            >
              ShaScam
            </Text>
            <Image
              source={require('./assets/shascam_logo.png')}
              style={{ width: 250, height: 250, marginBottom: 50, marginTop: 30}}
            />
            <TouchableOpacity
              onPress={() => setShowInit(false)} // Update showInit state to false
              style={{
                backgroundColor: 'white',
                width: '80%',
                alignItems: 'center',
                padding: 10,
                borderRadius: 16
              }}
            >
              <Text style={{ color: '#20004A', fontSize: 18 }}>
                Create your Proxy Number!
              </Text>
            </TouchableOpacity>
          </View>
    )
  } else if (!enableDash) {
    return (
      <View
        style={styles.container}
      >
            <Text
              style={{
                display: 'flex',
                alignSelf: 'center',
                marginLeft: 10,
                justifyContent: 'flex-start',
                fontWeight: 'bold',
                fontSize: 60,
                color: '#b86ffc',
                marginBottom: 80
              }}
            >
              ShaScam
            </Text>
            <Image
              source={require('./assets/shascam_logo.png')}
              style={{ width: 250, height: 250, marginBottom: 50, marginTop: 30}}
            />
        <TextInput
          style={styles.input}
          editable={false}
          value={buildnumber}
          label='Your Number'
        />
        <Text style={{ width: '80%', marginTop: 30, color: 'white' }}>
          Use the number above to forward to any external sources for
          AI-powered scam detection.
        </Text>
      </View>
    )
  } else {
    return (
      <View style={{display: 'flex', flex: 1, backgroundColor: 'black', paddingLeft: 20, paddingRight: 20, paddingTop: 50, paddingBottom: 50}}>
        <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30}}>
          <Text style={{fontWeight: 'bold', color: "#E1DDF7", fontSize: 20}}>Welcome back, <Text style={{color: '#9C82EA'}}>Nitya</Text></Text>
          <View style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: 50, borderRadius: 20, width: 150, backgroundColor: "#31257B"}}><Text style={{color: '#E1DDF7', fontWeight: 'bold'}}><Text style={{fontSize: 20}}>29</Text> scams averted</Text></View>
        </View>
        <ScamDetectionComponent
          category={category}
          justify={justify}
          action={action}
        />
      </View>
    )
  }
  // return (
  //   <View style={styles.container}>
  //     <View style={{marginTop: 100, alignItems: "center"}}>
  //       {
  //         // showInit ?
  //         // (

  //         //   <View style={{marginTop: 0, alignItems: "center"}}>
  //         //     <Text style={{display: "flex", alignSelf: "center", marginLeft: 10, justifyContent: "flex-start", fontWeight: "bold", fontSize: 30, color: "white", marginBottom: 70}}>Shascam</Text>
  //         //     <Image source={require('./assets/shascam_logo.png')} style={{width: 250, height: 250, marginBottom: 30 }}/>
  //         //     <TouchableOpacity
  //         //       onPress={() => setShowInit(false)} // Update showInit state to false
  //         //       style={{backgroundColor: "white", width: "80%", alignItems: "center", padding: 10, borderRadius: 16}}
  //         //     >
  //         //       <Text style={{color: "#20004A", fontSize: 18}}>Create your Proxy Number!</Text>
  //         //     </TouchableOpacity>
  //         //   </View>
  //         // ) :
  //         // !enableDash  ?
  //         // (
  //         //   <View style={{display: "flex", width: "100%", alignItems: "center", justifyContent: "flex-start"}}>
  //         //     <Text style={{color: "white", fontSize: 48, fontWeight: "bold"}}>Shascam</Text>
  //         //     <Image source={require('./assets/shascam_logo.png')} style={{width: 250, height: 250, marginBottom: 30 }}/>
  //         //     <TextInput
  //         //       style={styles.input}
  //         //       editable={false}
  //         //       value={buildnumber}
  //         //       label="Your Number"
  //         //     />
  //         //     <Text style={{width: "80%", marginTop: 30, color: "white"}}>Use the number above to forward to any external sources for AI-powered scam detection.</Text>
  //         //   </View>
  //         // ) :
  //         // <ScamDetectionComponent actionQues={actionQues} actionBool={actionBool} category={category} justify={justify} />
  //       }
  //       <StatusBar style="auto" />
  //     </View>
  //   </View>
  // );
}