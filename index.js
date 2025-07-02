import { registerRootComponent } from 'expo';

// ======================= IMPORTANT FIREBASE HERMES FIX =======================
// Firebase Auth registration for React Native (Hermes) - MUST BE FIRST
import { registerAuth } from 'firebase/auth/react-native';
registerAuth();
// =============================================================================

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);