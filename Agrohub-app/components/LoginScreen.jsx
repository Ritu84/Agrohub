import React, { useState } from 'react';
import "./../global.css";
import { GluestackUIProvider } from "./UI/gluestack-ui-provider";
import { View, Text, TextInput,Platform, StatusBar, TouchableOpacity,ActivityIndicator, StyleSheet, Alert, ImageBackground, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setToken } from '../utils/authUtils';

const COLORS = {
  primary: '#1A5D1A',    // Forest Green
  secondary: '#F4CE14',  // Accent Yellow
  text: '#333333',       // Dark text
  textLight: '#666666',  // Light text
  background: '#FFFFFF', // White background
  border: '#E0E0E0',    // Border color
};

const { width, height } = Dimensions.get('window');
const wp = (percentage) => (width * percentage) / 100;
const hp = (percentage) => (height * percentage) / 100;

const LoginScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aadhar, setAadhar]= useState('');
  const flow = 'login';

  const validateEmail = (email) => {
    return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const validateAadhar = (aadhar) => {
    return /^\d{12}$/.test(aadhar);
  };

  const handlesendOTP = async() => {
    if (!email || !aadhar) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (!validateAadhar(aadhar)) {
      Alert.alert('Error', 'Please enter a valid 12-digit Aadhar number');
      return;
    }

    setLoading(true);
    try {
      const requestBody = {
        email: email,
        aadhar_number: aadhar,
      };
      
      const response = await fetch('https://krishi-bazar.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log('Login Response:', data);

      if (response.ok) {
        Alert.alert('Success', 'OTP sent to your email');
        await AsyncStorage.setItem('logindata', JSON.stringify(requestBody));
        navigation.navigate('OTPVerification', { email, aadhar, flow });
      } else {
        console.log('Error response:', data);
        Alert.alert('Error', data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.log("Network error:", error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = async (responseData) => {
    if (responseData.token) {
      await setToken(responseData.token);
      await AsyncStorage.setItem('userData', JSON.stringify(responseData.user));
      navigation.replace('MainScreen');
    }
  };

  return (
    <GluestackUIProvider mode="light">
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Your trusted agricultural marketplace{'\n'}
            Login to continue
          </Text>
          <TextInput 
            style={styles.input} 
            placeholder='Email'
            value={email} 
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput 
            style={styles.input} 
            placeholder='Aadhar no.' 
            value={aadhar} 
            onChangeText={setAadhar}
            keyboardType="numeric"
            maxLength={12}
          />
         
         <TouchableOpacity
                   style={[
                     styles.button, 
                     (loading) && styles.buttonDisabled
                   ]}
                   onPress={handlesendOTP}
                   disabled={loading}
                 >
                   {loading ? (
                     <ActivityIndicator 
                       color="#ffffff" 
                       size="small" 
                     />
                   ) : (
                     <Text style={styles.buttonText}>Get OTP</Text>
                   )}
                 </TouchableOpacity>
           </View>
          <View style={styles.subcontainer}>
           <Text style={styles.subtext}>
             New to Krishi Bazar?{' '}
             <Text 
               onPress={() => navigation.navigate('SignUp')} 
               style={styles.signuptext}
             >
               Create Account
             </Text>
           </Text>
          </View>
        
      </View>
    </GluestackUIProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  content: {
    backgroundColor: COLORS.background,
    borderRadius: wp(4),
    marginTop: hp(25),
    marginHorizontal: wp(5),
    marginBottom: hp(2),
    padding: wp(5),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
    alignItems: 'center',
  },
  title: {
    fontSize: wp(8),
    color: COLORS.primary,
    fontWeight: 'bold',
    marginBottom: hp(1),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: wp(4),
    color: COLORS.textLight,
    marginBottom: hp(4),
    textAlign: 'center',
    lineHeight: wp(5.5),
  },
  input: {
    height: hp(7),
    width: '90%',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    borderRadius: wp(3),
    paddingHorizontal: wp(5),
    marginTop: hp(1.5),
    fontSize: wp(4),
    color: COLORS.text,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: hp(2),
    paddingHorizontal: wp(8),
    borderRadius: wp(3),
    alignSelf: 'center',
    marginVertical: hp(3),
    width: '90%',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonDisabled: {
    backgroundColor: COLORS.textLight,
    elevation: 0,
  },
  buttonText: {
    color: COLORS.background,
    fontSize: wp(4.5),
    fontWeight: '600',
    textAlign: 'center',
  },
  subcontainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: hp(2),
  },
  subtext: {
    fontSize: wp(4),
    color: COLORS.textLight,
  },
  signuptext: {
    color: COLORS.primary,
    fontSize: wp(4),
    fontWeight: 'bold',
  }
});

export default LoginScreen;

