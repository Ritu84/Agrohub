import React, { useState } from 'react';
import "./../../global.css";
import { GluestackUIProvider } from "./../UI/gluestack-ui-provider";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Alert, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const scale = width / 375; // Base scale using iPhone 8 width

const normalize = (size) => {
  return Math.round(scale * size);
};

const UpdatePhoneNumber = ({ visible, setVisible, navigation, aadhar }) => {
  const flow = 'login';
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCancel = () => {
    setNewPhoneNumber('');
    setVisible(false);
  };

  const validatePhoneNumber = (number) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    const sanitizedNumber = number.trim();
    console.log('Sanitized Phone Number:', sanitizedNumber);
    const isValid = phoneRegex.test(sanitizedNumber);
    console.log('Is Phone Number Valid:', isValid);
    return isValid;
  };

  const handleUpdatePhoneNumber = async () => {
    console.log('Button pressed');
    console.log('New Phone Number:', newPhoneNumber);
    const sanitizedPhoneNumber = newPhoneNumber.trim();
    console.log('Sanitized Phone Number:', sanitizedPhoneNumber);
    if (!validatePhoneNumber(sanitizedPhoneNumber)) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid phone number');
      return;
    }

    setLoading(true);
    console.log('Phone Number Validated');

    try {
      const requestBody = {
        phone_number: `+91${newPhoneNumber}`,
        aadhar_number: aadhar,
      };

      const userToken = await AsyncStorage.getItem("userToken");
      if (!userToken) {
        navigation.replace("Login");
        return;
      }

      // Get user_id from JWT token
      const tokenParts = userToken.split(".");
      const tokenPayload = JSON.parse(atob(tokenParts[1]));
      const userId = tokenPayload.user_id;

      console.log("Using User ID from token:", userId); // Debug log

      const response = await fetch(`https://krishi-bazar.onrender.com/api/v1/user/${userId}/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify(requestBody),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Phone number updated successfully');
        console.log(response);
        navigation.navigate('Profile');
      } else {
        console.log(data)
        Alert.alert('Error', data.message || 'Failed to update phone number');
      }
    } catch (error) {
      console.log("Network error:", error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Phone Number</Text>
            <View style={styles.inputContainer}>
              <Icon name="phone" size={normalize(24)} color="#4B5563" />
              <TextInput
                style={styles.input}
                placeholder="Enter new phone number"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                value={newPhoneNumber}
                onChangeText={setNewPhoneNumber}
              />
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
              >
                <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.updateButton]} 
                onPress={handleUpdatePhoneNumber}
                disabled={loading}
              >
                <Text style={[styles.buttonText, styles.updateButtonText]}>
                  {loading ? 'Updating...' : 'Update'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: normalize(12),
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(20),
    minWidth: normalize(100),
    elevation: 2,
  },
  buttonText: {
    fontSize: normalize(16),
    fontWeight: '600',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: normalize(16),
    padding: normalize(24),
    width: width * 0.85,
    maxWidth: 400,
    elevation: 5,
  },
  modalTitle: {
    fontSize: normalize(22),
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: normalize(20),
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: normalize(12),
    paddingHorizontal: normalize(16),
    marginBottom: normalize(20),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    height: normalize(50),
    fontSize: normalize(16),
    color: '#1F2937',
    marginLeft: normalize(12),
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: normalize(16),
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  updateButton: {
    backgroundColor: '#2563EB',
  },
  cancelButtonText: {
    color: '#4B5563',
  },
  updateButtonText: {
    color: '#FFFFFF',
  },
});

export default UpdatePhoneNumber;