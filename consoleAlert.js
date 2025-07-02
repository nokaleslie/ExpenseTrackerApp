// src/utils/consoleAlert.js
import { Alert } from 'react-native';

// Add console.alert polyfill
if (!console.alert) {
  console.alert = (message, title = 'Notification') => {
    Alert.alert(title, message);
  };
}