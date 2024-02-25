import React, { useState, useEffect } from 'react' // Import useState
import { StatusBar } from 'expo-status-bar'
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native'
import { TextInput } from 'react-native-paper'
import firebase from '@react-native-firebase/app'
import messaging from '@react-native-firebase/messaging'
import styles from './styles/RedesignStyles'

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