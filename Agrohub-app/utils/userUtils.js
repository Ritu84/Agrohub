import AsyncStorage from '@react-native-async-storage/async-storage';

export const getUserType = async () => {
  try {
    const userData = await AsyncStorage.getItem('userData');
    if (!userData) return null;

    const parsedUserData = JSON.parse(userData);
    return parsedUserData.is_farmer ? 'farmer' : 'buyer';
  } catch (error) {
    console.error('Error getting user type:', error);
    return null;
  }
}; 