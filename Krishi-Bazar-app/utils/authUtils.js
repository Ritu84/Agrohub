import AsyncStorage from '@react-native-async-storage/async-storage';

export const getToken = async () => {
  try {
    return await AsyncStorage.getItem('userToken');
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

export const setToken = async (token) => {
  try {
    await AsyncStorage.setItem('userToken', token);
  } catch (error) {
    console.error('Error setting token:', error);
  }
};

export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

export const isAuthenticated = async () => {
  const token = await getToken();
  return !!token;
};

export const authenticatedFetch = async (url, options = {}) => {
  const token = await getToken();
  if (!token) {
    throw new Error('No authentication token');
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    await removeToken();
    throw new Error('Authentication expired');
  }

  return response;
};

export const checkTokenValidity = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) return false;

    const response = await fetch('https://krishi-bazar.onrender.com/api/user/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};

export const refreshToken = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) return null;

    const response = await fetch('https://krishi-bazar.onrender.com/api/auth/refresh-token', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const { newToken } = await response.json();
      await AsyncStorage.setItem('userToken', newToken);
      return newToken;
    }
    return null;
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
}; 