import { Dimensions, Platform } from 'react-native';
import { FONTS } from '../config/fonts';

const { width, height } = Dimensions.get('window');

export const wp = (percentage) => (width * percentage) / 100;
export const hp = (percentage) => (height * percentage) / 100;

export const COLORS = {
  primary: '#1A5D1A',    // Forest Green
  secondary: '#F4CE14',  // Accent Yellow
  text: '#333333',       // Dark text
  textLight: '#666666',  // Light text
  background: '#FFFFFF', // White background
  border: '#E0E0E0',    // Border color
  error: '#FF4D4D',     // Error red
  success: '#4CAF50'    // Success green
};

export { FONTS }; 