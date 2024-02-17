import React, { useState } from 'react'; // Import useState
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import {TextInput} from "react-native-paper"

export default function App() {
    const [showInit, setShowInit] = useState(true); // Use useState for showInit
    const buildnumber = "+1 (408)-621-7775"; // This could also be part of state if it changes

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
