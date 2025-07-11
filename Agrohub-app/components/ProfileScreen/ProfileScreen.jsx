import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Dimensions,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import "./../../global.css";
import { GluestackUIProvider } from "./../UI/gluestack-ui-provider";
import React, { useState, useEffect } from "react";
import Icon from "react-native-vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";
import UpdatePhoneNumber from "./UpdatePhoneNumber";
import { useAuth } from "../../Store/AuthContext";

const { width, height } = Dimensions.get("window");

// Use the same theme as HomeScreen
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

const ProfileImage = ({ imageUrl }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <View style={styles.avatarContainer}>
      <Image
        source={{
          uri: imageUrl,
          headers: {
            Accept: "*/*", // Add this to ensure image content is accepted
          },
        }}
        style={styles.avatar}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onError={(e) => {
          console.log("Image loading error:", e.nativeEvent.error);
          setHasError(true);
          setIsLoading(false);
        }}
        // defaultSource={require('../../assets/default-avatar.png')}
      />
      {isLoading && (
        <ActivityIndicator
          size="small"
          color={theme.primary}
          style={styles.loadingIndicator}
        />
      )}
    </View>
  );
};

export default function ProfileScreen({ navigation }) {
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [user, setUser] = useState({});
  const [isVerified, setIsVerified] = useState(false);
  const [isFarmer, setIsFarmer] = useState();
  const [error, setError] = useState(null);
  const context = useAuth();
  const { setIsAuthenticated } = context;

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (user.img) {
      // Test image URL
      fetch(user.img)
        .then((response) => {
          console.log("Image response status:", response.status);
          console.log("Image response headers:", response.headers);
        })
        .catch((error) => {
          console.log("Image fetch error:", error);
        });
    }
  }, [user.img]);

  const fetchUserData = async () => {
    try {
      const userToken = await AsyncStorage.getItem("userToken");
      const storedUserId = await AsyncStorage.getItem("userData");

      console.log("User Token:", userToken); // Debug log
      console.log("Stored User ID:", storedUserId); // Debug log

      if (!userToken || !storedUserId) {
        navigation.replace("Login");
        return;
      }

      // Parse the userData to get the user ID
      const userData = JSON.parse(storedUserId);
      const userId = userData._id || userData.id; // depending on your API response structure
      // setUserId(userId);

      // Use the userId in the API endpoint
      const response = await fetch(
        `https://krishi-bazar.onrender.com/api/v1/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Profile Data:", data);
        setIsVerified(
          userData.is_farmer ? userData.is_verified_by_admin : true
        );
        setIsFarmer(data.is_farmer ? "Farmer" : "Buyer");

        // Validate image URL
        if (data.img) {
          console.log("Image URL:", data.img);
          // Test if URL is valid
          const imageResponse = await fetch(data.img);
          console.log("Image response status:", imageResponse.status);
        }

        setUser(data);
      } else {
        const errorData = await response.json();
        console.error("API Error:", errorData); // Debug log
        throw new Error(errorData.message || "Failed to fetch user data");
      }
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
      Alert.alert("Error", "Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    Alert.alert("Confirm Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: async () => {
          try {
            await AsyncStorage.multiRemove(["userToken", "userData"]);
            setIsAuthenticated(false);
            // navigation.reset({
            //   index: 0,
            //   routes: [{ name: "Login" }],
            // });
          } catch (error) {
            Alert.alert("Error", "Failed to logout");
          }
        },
        style: "destructive",
      },
    ]);
  };

  if (isLoading) {
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
        >
          {/* Header Section */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Profile</Text>
          </View>

          {/* Profile Card */}
          <View style={styles.profileCard}>
            {user.img ? (
              <ProfileImage imageUrl={user.img} />
            ) : (
              <ProfileImage
                imageUrl="https://cdn-icons-png.flaticon.com/512/8801/8801434.png"

                // style={styles.avatar}
              />
            )}
            <Text style={styles.name}>
              {user.first_name} {user.last_name}
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
                name="user"
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

          {/* Info Sections */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            <View style={styles.infoCard}>
              <InfoItem icon="phone" label="Phone" value={user.phone_number} />
              <InfoItem icon="mail" label="Email" value={user.email} />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <View style={styles.infoCard}>
              <InfoItem
                icon="credit-card"
                label="Aadhar"
                value={user.aadhar_number}
              />
              <InfoItem icon="map-pin" label="Address" value={user.address} />
              <InfoItem icon="home" label="City" value={user.city} />
              <InfoItem icon="map" label="State" value={user.state} />
              <InfoItem icon="hash" label="Pincode" value={user.pin_code} />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            {/* <TouchableOpacity
              style={[styles.button, styles.updateButton]}
              onPress={() => setModalVisible(true)}
            >
              <Icon name="edit" size={20} color={theme.text.light} />
              <Text style={styles.buttonText}>Update Profile</Text>
            </TouchableOpacity> */}

            {user.is_farmer && (
              <TouchableOpacity
                style={[styles.button, styles.createButton]}
                onPress={() => navigation.navigate("CreateProduct")}
              >
                <Icon name="plus-circle" size={20} color={theme.text.light} />
                <Text style={styles.buttonText}>Create Product</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.button, styles.logoutButton]}
              onPress={logout}
            >
              <Icon name="log-out" size={20} color={theme.text.light} />
              <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* <UpdatePhoneNumber
          visible={modalVisible}
          setVisible={setModalVisible}
          currentPhoneNumber={user.phone_number}
          onUpdate={fetchUserData}
        /> */}
      </SafeAreaView>
    </GluestackUIProvider>
  );
}

// Helper component for info items
const InfoItem = ({ icon, label, value }) => (
  <View style={styles.infoItem}>
    <Icon name={icon} size={20} color={theme.primary} />
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContent: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: theme.text.primary,
  },
  profileCard: {
    backgroundColor: theme.surface,
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarContainer: {
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: width * 0.15,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  avatar: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.text.primary,
    marginBottom: 10,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  badgeText: {
    marginLeft: 5,
    color: theme.primary,
    fontWeight: "500",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.text.primary,
    marginBottom: 10,
  },
  infoCard: {
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoContent: {
    marginLeft: 15,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: theme.text.secondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: theme.text.primary,
    fontWeight: "500",
  },
  buttonContainer: {
    gap: 10,
    marginBottom: 30,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  updateButton: {
    backgroundColor: theme.primary,
  },
  createButton: {
    backgroundColor: "#2196F3",
  },
  logoutButton: {
    backgroundColor: "#FF5252",
  },
  buttonText: {
    color: theme.text.light,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
  loadingIndicator: {
    position: "absolute",
  },
});
