import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyA-wUualbNgssWZo7Yx0hgExBaTnM41ozo",
  authDomain: "expensetrackerapp-2d000.firebaseapp.com",
  projectId: "expensetrackerapp-2d000",
  storageBucket: "expensetrackerapp-2d000.appspot.com",
  messagingSenderId: "693566515866",
  appId: "1:693566515866:web:1c2ebfe5e81b41b07d4d23",
  measurementId: "G-9ZBP54P2DP"
};

const app = initializeApp(firebaseConfig);

// Initialize auth with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export { auth };