import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Image,
  Platform,
  ActivityIndicator
} from 'react-native';
import { loadFonts, FONTS } from '../config/fonts';


const { width, height } = Dimensions.get('window');

const wp = (percentage) => {
  return (width * percentage) / 100;
};

const hp = (percentage) => {
  return (height * percentage) / 100;
};

const COLORS = {
  primary: '#1A5D1A',    // Forest Green
  secondary: '#F4CE14',  // Accent Yellow
  text: '#333333',       // Dark text
  textLight: '#666666',  // Light text
  background: '#FFFFFF', // White background
  border: '#E0E0E0',    // Border color
};

const WelcomeScreen = ({ navigation }) => {
  const [fontsLoaded] = loadFonts();

  if (!fontsLoaded) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to Krishi Bazar</Text>
        <Text style={styles.subtitle}>Your One-Stop Agricultural Marketplace</Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]}
            onPress={() => navigation.navigate('SignUp')}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.secondaryButtonText}>I already have an account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp(5),
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: wp(8),
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: hp(2),
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: wp(4),
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: hp(6),
  },
  buttonContainer: {
    width: '100%',
    gap: hp(2),
  },
  button: {
    width: '100%',
    paddingVertical: hp(2),
    borderRadius: wp(2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  primaryButtonText: {
    fontFamily: FONTS.bold,
    color: COLORS.background,
    fontSize: wp(4.5),
  },
  secondaryButton: {
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    fontFamily: FONTS.regular,
    color: COLORS.primary,
    fontSize: wp(4),
  },
});

export default WelcomeScreen;