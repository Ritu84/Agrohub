import React, { useState } from 'react';
import "./../global.css";
import { GluestackUIProvider } from "./UI/gluestack-ui-provider";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, StatusBar, Platform, ScrollView, Switch, KeyboardAvoidingView, Image, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Feather';
import { uploadImage } from './../Store/SupabaseAPI';
import * as ImagePicker from 'expo-image-picker';
import { ActivityIndicator } from 'react-native';
import { COLORS, FONTS } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function SignUpScreen({ navigation }) {
  const [FirstName, setFirstName] = useState('');
  const [LastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [aadhar, setAadhar] = useState('');
  const [email, setemail] = useState('');
  const [isFarmer, setIsFarmer] = useState(false);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [farmsize, setFarmsize] = useState('');
  const [loading, setLoading] = useState(false);
  const flow = 'signup';
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [aadharFrontImage, setAadharFrontImage] = useState(null);
  const [aadharBackImage, setAadharBackImage] = useState(null);
  const [aadharFrontUrl, setAadharFrontUrl] = useState('');
  const [aadharBackUrl, setAadharBackUrl] = useState('');
  const [showAadharFrontPreview, setShowAadharFrontPreview] = useState(false);
  const [showAadharBackPreview, setShowAadharBackPreview] = useState(false);

  const validatePhoneNumber = (number) => {
    // Remove any spaces, dashes, or other non-numeric characters
    const cleanNumber = number.replace(/[^\d]/g, '');
    // Check if it's a valid 10-digit Indian phone number
    return /^\d{10}$/.test(cleanNumber);
  };

  const formatPhoneNumber = (number) => {
    const cleanNumber = number.replace(/[^\d]/g, '');
    return `+91${cleanNumber}`; // Always prefix with +91
  };

  const storeToken = async (token) => {
    try {
      await AsyncStorage.setItem('userToken', token);
    } catch (error) {
      console.error('Error storing token:', error);
    }
  };

  const handleSendOTP = async () => {
    if (!FirstName || !phoneNumber || !LastName || !aadhar || !email || !address || !city || !state || !pincode || !aadharFrontUrl || !aadharBackUrl) {
      Alert.alert('Error', 'Please fill in all fields including Aadhar card images');
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      Alert.alert(
        'Invalid Phone Number',
        'Please enter a valid 10-digit phone number'
      );
      return;
    }

    const formattedPhoneNumber = formatPhoneNumber(phoneNumber);

    setLoading(true);

    const requestBody = {
      first_name: FirstName,
      last_name: LastName,
      aadhar_number: aadhar,
      email: email,
      phone_number: formattedPhoneNumber,
      is_farmer: isFarmer,
      address: address,
      city: city,
      state: state,
      pin_code: pincode,
      farm_size: farmsize,
      img: imageUrl || null,
      aadhar_front_img: aadharFrontUrl,
      aadhar_back_img: aadharBackUrl
    };

    try {
      const response = await fetch('https://krishi-bazar.onrender.com/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.token) {
          await storeToken(data.token);
        }
        await AsyncStorage.setItem('userData', JSON.stringify(requestBody));
        navigation.navigate('OTPVerification', { requestBody, flow });
      } else {
        console.log(data);
        Alert.alert('Error', data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        type: 'image',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setSelectedImage(result.assets[0].uri);
        const fileName = `user_${Date.now()}.jpg`;
        const folder = 'profile';
        const uploadedImageUrl = await uploadImage(result.assets[0].base64, folder, fileName);
        console.log('Uploaded image URL:', uploadedImageUrl);
        setImageUrl(uploadedImageUrl);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    }
  };

  const handleAadharImageUpload = async (side) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        type: 'image',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        const fileName = `aadhar_${side}_${Date.now()}.jpg`;
        const folder = 'aadhar';
        const uploadedImageUrl = await uploadImage(result.assets[0].base64, folder, fileName);

        if (side === 'front') {
          setAadharFrontImage(result.assets[0].uri);
          setAadharFrontUrl(uploadedImageUrl);
          setShowAadharFrontPreview(true);
        } else {
          setAadharBackImage(result.assets[0].uri);
          setAadharBackUrl(uploadedImageUrl);
          setShowAadharBackPreview(true);
        }
      }
    } catch (error) {
      console.error('Error uploading aadhar image:', error);
      Alert.alert('Error', 'Failed to upload aadhar image. Please try again.');
    }
  };

  const handleSignUp = async () => {
    if (!FirstName || !phoneNumber || !LastName || !aadhar || !email || !address || !city || !state || !pincode || !aadharFrontUrl || !aadharBackUrl) {
      Alert.alert('Error', 'Please fill in all fields including Aadhar card images');
      return;
    }

    if (isFarmer && !farmsize) {
      Alert.alert('Error', 'Please enter your farm size');
      return;
    }
  };

  const handleSignUpAndSendOtp = async () => {
    await handleSignUp();
    await handleSendOTP();
  };

  return (
    <GluestackUIProvider mode="light">
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Welcome to Krishi Bazar</Text>
          <Text style={styles.headerSubtitle}>Create your account to get started</Text>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.inputContainer}>
              {/* Profile Image Upload */}
              <TouchableOpacity onPress={handleImageUpload} style={styles.imageUploadContainer}>
                {selectedImage ? (
                  <Image source={{ uri: selectedImage }} style={styles.profileImage} />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Icon name="camera" size={30} color={COLORS.primary} />
                    <Text style={styles.uploadText}>Upload Profile Photo</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Aadhar Front Image Upload */}
              <TouchableOpacity onPress={() => handleAadharImageUpload('front')} style={styles.aadharImageContainer}>
                {aadharFrontImage ? (
                  <>
                    <Image source={{ uri: aadharFrontImage }} style={styles.aadharImage} />
                    {showAadharFrontPreview && (
                      <TouchableOpacity
                        style={styles.previewButton}
                        onPress={() => setShowAadharFrontPreview(false)}
                      >
                        <Text style={styles.previewButtonText}>Hide Preview</Text>
                      </TouchableOpacity>
                    )}
                  </>
                ) : (
                  <View style={styles.aadharImagePlaceholder}>
                    <Icon name="camera" size={24} color={COLORS.primary} />
                    <Text style={styles.uploadText}>Upload Aadhar Front</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Aadhar Back Image Upload */}
              <TouchableOpacity onPress={() => handleAadharImageUpload('back')} style={styles.aadharImageContainer}>
                {aadharBackImage ? (
                  <>
                    <Image source={{ uri: aadharBackImage }} style={styles.aadharImage} />
                    {showAadharBackPreview && (
                      <TouchableOpacity
                        style={styles.previewButton}
                        onPress={() => setShowAadharBackPreview(false)}
                      >
                        <Text style={styles.previewButtonText}>Hide Preview</Text>
                      </TouchableOpacity>
                    )}
                  </>
                ) : (
                  <View style={styles.aadharImagePlaceholder}>
                    <Icon name="camera" size={24} color={COLORS.primary} />
                    <Text style={styles.uploadText}>Upload Aadhar Back</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TextInput style={styles.input} placeholder='First Name' value={FirstName} onChangeText={setFirstName} />
              <TextInput style={styles.input} placeholder='Last Name' value={LastName} onChangeText={setLastName} />
              <View style={styles.phoneInputWrapper}>
                <Text style={styles.prefixText}>+91</Text>
                <TextInput
                  style={styles.phoneInputSingle}
                  placeholder='Phone Number'
                  value={phoneNumber}
                  onChangeText={(text) => {
                    // Only allow numbers
                    const cleaned = text.replace(/[^\d]/g, '');
                    setPhoneNumber(cleaned);
                  }}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
              <TextInput
                style={styles.input}
                placeholder='Email'
                value={email}
                onChangeText={setemail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                placeholder='Aadhar Number'
                value={aadhar}
                onChangeText={setAadhar}
                keyboardType="numeric"
              />
              <TextInput style={styles.input} placeholder='Address' value={address} onChangeText={setAddress} />
              <TextInput style={styles.input} placeholder='City' value={city} onChangeText={setCity} />
              <TextInput style={styles.input} placeholder='State' value={state} onChangeText={setState} />
              <TextInput
                style={styles.input}
                placeholder='Pincode'
                value={pincode}
                onChangeText={setPincode}
                keyboardType="numeric"
              />

              <View style={styles.toggleContainer}>
                <Text style={styles.farmerText}>Are you a farmer?</Text>
                <Switch
                  trackColor={{ false: '#767577', true: COLORS.primary }}
                  thumbColor={isFarmer ? '#fff' : '#f4f3f4'}
                  value={isFarmer}
                  onValueChange={(value) => {
                    setIsFarmer(value);
                    if (!value) {
                      setFarmsize('');
                    }
                  }}
                />
              </View>

              {isFarmer && (
                <View style={styles.farmSizeContainer}>
                  <TextInput
                    style={[styles.input, { marginTop: 15 }]}
                    placeholder='Farm Size (in acres)'
                    value={farmsize}
                    onChangeText={setFarmsize}
                    keyboardType="numeric"
                  />
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[styles.signupButton, { backgroundColor: loading ? '#cccccc' : COLORS.primary }]}
              onPress={handleSignUpAndSendOtp}
              disabled={loading}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="white" size="small" style={styles.spinner} />
                  <Text style={styles.buttonText}>Processing...</Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>Sign Up</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>
                Already have an account?{' '}
                <Text onPress={() => navigation.navigate('Login')} style={styles.loginLink}>
                  Login
                </Text>
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </GluestackUIProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 60 : 40,
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    ...FONTS.bold,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 22,
    ...FONTS.regular,
  },
  keyboardView: {
    flex: 1,
  },
  inputContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    margin: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    alignItems: 'center',
  },
  imageUploadContainer: {
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  aadharImageContainer: {
    marginBottom: 15,
    width: '100%',
  },
  aadharImage: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    marginBottom: 5,
  },
  aadharImagePlaceholder: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  uploadText: {
    marginTop: 5,
    color: COLORS.primary,
    fontSize: 12,
    ...FONTS.medium,
  },
  previewButton: {
    backgroundColor: COLORS.primary,
    padding: 8,
    borderRadius: 5,
    alignSelf: 'center',
    marginTop: 5,
  },
  previewButtonText: {
    color: 'white',
    fontSize: 14,
    ...FONTS.medium,
  },
  input: {
    height: 50,
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 20,
    marginBottom: 12,
    fontSize: 16,
    ...FONTS.regular,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  farmerText: {
    fontSize: 16,
    ...FONTS.medium,
    color: COLORS.text,
  },
  signupButton: {
    marginHorizontal: 15,
    height: 55,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    ...FONTS.bold,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spinner: {
    marginRight: 10,
  },
  footerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  footerText: {
    fontSize: 16,
    color: COLORS.textLight,
    ...FONTS.regular,
  },
  loginLink: {
    color: COLORS.primary,
    ...FONTS.bold,
  },
  farmSizeContainer: {
    width: '100%',
    opacity: 1,
    transform: [{ scale: 1 }],
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 12,
    overflow: 'hidden',
  },
  prefixText: {
    paddingHorizontal: 12,
    fontSize: 16,
    color: COLORS.textLight,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
    height: '100%',
    textAlignVertical: 'center',
    ...FONTS.regular,
  },
  phoneInputSingle: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 12,
    fontSize: 16,
    ...FONTS.regular,
  },
});
