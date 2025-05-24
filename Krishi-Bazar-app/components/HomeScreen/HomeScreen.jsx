import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ScrollView,
  SafeAreaView,
  Image,
  Animated,
  RefreshControl,
  Platform,
  Easing,
  Alert,
} from "react-native";
import "./../../global.css";
import { GluestackUIProvider } from "./../UI/gluestack-ui-provider";
import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator } from "react-native";
import Icon from "react-native-vector-icons/Feather";

const { width, height } = Dimensions.get("window");

// Define theme colors
const theme = {
  primary: "#1A5D1A", // Main green
  secondary: "#F4CE14", // Accent yellow
  background: "#F8F9FA", // Light background
  surface: "#FFFFFF", // White
  text: {
    primary: "#333333",
    secondary: "#666666",
    light: "#FFFFFF",
  },
};

export default function HomeScreen({ navigation }) {
  const [firstName, setfirstName] = useState("");
  const [lastName, setlastName] = useState("");
  const [isFarmer, setIsFarmer] = useState("");
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [token, setToken] = useState(null);

  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = new Animated.Value(-50);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const commonMenuItems = [
    {
      title: "My Orders",
      icon: "shopping-bag",
      screen: "ViewOrders",
      description: "View your order history",
      color: theme.primary,
    },
    {
      title: "Browse Products",
      icon: "grid",
      screen: "ExploreTab",
      description: "Shop from farmers",
      color: theme.primary,
    },
    {
      title: "Zari Products",
      icon: "shopping-cart",
      screen: "ZariProducts",
      description: "Explore zari items",
      color: theme.primary,
    },
    {
      title: "Mushroom Products",
      icon: "box",
      screen: "MushroomProducts",
      description: "Explore mushrooms",
      color: theme.primary,
    },
  ];

  const farmerMenuItems = [
    {
      title: "Create Product",
      icon: "plus-circle",
      screen: "CreateProduct",
      description: "List your products for sale",
      color: theme.primary,
    },
    {
      title: "My Products",
      icon: "package",
      screen: "ManageProducts",
      description: "Manage your listings",
      color: theme.primary,
    },
  ];

  const loadUserData = async () => {
    try {
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

      // Use the correct API endpoint
      const response = await fetch(
        `https://krishi-bazar.onrender.com/api/v1/user/${userId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Profile API Response Status:", response.status);

      if (response.ok) {
        const userData = await response.json();
        console.log("User Data:", userData);

        setfirstName(userData.first_name);
        setlastName(userData.last_name);
        setIsFarmer(userData.is_farmer ? "Farmer" : "Buyer");
        setIsVerified(
          userData.is_farmer ? userData.is_verified_by_admin : true
        );

        // Store the complete user data
        const updatedUserData = {
          ...userData,
          user_id: userId,
        };
        await AsyncStorage.setItem("userData", JSON.stringify(updatedUserData));
      } else if (response.status === 401) {
        console.log("Token expired or invalid, clearing session");
        await AsyncStorage.multiRemove(["userToken", "userData"]);
        navigation.replace("Login");
        Alert.alert("Session Expired", "Please login again");
      } else {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        throw new Error(errorData.message || "Failed to fetch user data");
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      Alert.alert("Error", "Failed to load user data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <GluestackUIProvider mode="light">
      <SafeAreaView style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={loadUserData} />
          }
        >
          <View style={styles.header}>
            <Text style={styles.welcomeText}>Welcome to Krishi Bazar</Text>
            <Text style={styles.subtitle}>Your Agricultural Marketplace</Text>
          </View>

          <View style={styles.userCard}>
            <View style={styles.userInfo}>
              <Text style={styles.greeting}>{greeting}</Text>
              <Text style={styles.name}>
                {firstName} {lastName}
              </Text>
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: isVerified ? "#E8F5E9" : "#FFF3E0",
                  },
                ]}
              >
                <Icon
                  name={
                    isFarmer === "Farmer"
                      ? isVerified
                        ? "check-circle"
                        : "alert-circle"
                      : "user"
                  }
                  size={16}
                  color={isVerified ? theme.primary : "#FFA000"}
                />
                <Text
                  style={[
                    styles.badgeText,
                    {
                      color: isVerified ? theme.primary : "#FFA000",
                    },
                  ]}
                >
                  {isFarmer}{" "}
                  {isFarmer === "Farmer"
                    ? isVerified
                      ? "(Verified)"
                      : "(Verification Pending)"
                    : ""}
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <View style={styles.menuGrid}>
            {isFarmer === "Farmer" &&
              farmerMenuItems.map((item, index) => (
                <TouchableOpacity
                  key={`farmer-${index}`}
                  style={styles.menuItem}
                  onPress={() => navigation.navigate(item.screen)}
                >
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: item.color },
                    ]}
                  >
                    <Icon name={item.icon} size={24} color={theme.text.light} />
                  </View>
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                  <Text style={styles.menuItemDesc}>{item.description}</Text>
                </TouchableOpacity>
              ))}

            {commonMenuItems.map((item, index) => (
              <TouchableOpacity
                key={`common-${index}`}
                style={styles.menuItem}
                onPress={() => navigation.navigate(item.screen)}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: item.color },
                  ]}
                >
                  <Icon name={item.icon} size={24} color={theme.text.light} />
                </View>
                <Text style={styles.menuItemTitle}>{item.title}</Text>
                <Text style={styles.menuItemDesc}>{item.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </GluestackUIProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContent: {
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: theme.primary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: theme.text.secondary,
    marginTop: 5,
  },
  userCard: {
    backgroundColor: theme.surface,
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: theme.text.secondary,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.text.primary,
    marginTop: 5,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginTop: 10,
  },
  badgeText: {
    marginLeft: 5,
    color: theme.primary,
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.text.primary,
    marginBottom: 15,
  },
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: 20,
  },
  menuItem: {
    width: "48%",
    backgroundColor: theme.surface,
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 120,
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  menuItemTitle: {
    color: theme.text.primary,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  menuItemDesc: {
    color: theme.text.secondary,
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
