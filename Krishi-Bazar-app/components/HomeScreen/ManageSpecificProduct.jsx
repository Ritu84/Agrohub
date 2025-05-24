import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Dimensions,
  Platform,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { loadFonts, FONTS } from "../../config/fonts";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Font from "expo-font";

const { width, height } = Dimensions.get("window");

// Responsive size functions
const wp = (percentage) => {
  return (width * percentage) / 100;
};

const hp = (percentage) => {
  return (height * percentage) / 100;
};

// Color palette
const COLORS = {
  primary: "#1A5D1A", // Forest Green
  secondary: "#F4CE14", // Accent Yellow
  text: "#333333", // Dark text
  textLight: "#666666", // Light text
  background: "#F5F7FA", // Light gray background
  white: "#FFFFFF", // White
  border: "#E0E0E0", // Border color
  success: "#4CAF50", // Success green
  error: "#FF4D4D", // Error red
  warning: "#FFA726", // Warning orange
};

const ManageSpecificProduct = ({ route, navigation }) => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [product, setProduct] = useState({
    image: "https://example.com/product-image.jpg",
    name: "Organic Tomatoes",
    type: "Vegetable",
    quantity: "50 kg",
    price: "$25",
    isAvailable: true,
    farmerName: "John Doe",
    deliveryDate: "2024-06-15",
  });
  const Id = route?.params?.Id;

  // Load fonts
  useEffect(() => {
    const loadAppFonts = async () => {
      try {
        await Font.loadAsync({
          "SpaceMono-Regular": require("./../../assets/fonts/SpaceMono-Regular.ttf"),
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error("Error loading fonts:", error);
        setFontsLoaded(true); // Set to true anyway to prevent infinite loading
      }
    };

    loadAppFonts();

    const fetchUserData = async () => {
      const userData = await AsyncStorage.getItem("userData");
      if (userData) {
        setUserData(JSON.parse(userData));
        setIsVerified(
          userData.is_farmer ? userData.is_verified_by_admin : true
        );
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
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

        // Fetch product from API with token in the header
        const response = await fetch(
          `https://krishi-bazar.onrender.com/api/v1/product/${Id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userToken}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log("Product:", data);
          setOrders(data);
          setError(null);
        } else {
          const errorDetails = await response.json();
          setError(errorDetails.message || "Failed to fetch product");
          console.error("Failed to fetch product:", response.status);
          console.error("Error details:", errorDetails);
        }
      } catch (error) {
        setError("Error fetching the product details");
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (Id) {
      fetchProduct();
    }
  }, [Id, navigation]);

  const handleUpdateAvailability = async () => {
    try {
      const userToken = await AsyncStorage.getItem("userToken");
      if (!userToken) {
        navigation.replace("Login");
        return;
      }

      const response = await fetch(
        `https://krishi-bazar.onrender.com/api/v1/product/${Id}/mark-unavailable`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`, // Use userToken instead of token
          },
        }
      );

      console.log("Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Product availability updated successfully:", data);
        setOrders(data);

        // Update product state before showing alert
        setProduct((prevProduct) => ({
          ...prevProduct,
          isAvailable: !prevProduct.isAvailable,
        }));

        Alert.alert(
          "Availability Updated",
          `Product is now ${data.isAvailable ? "Available" : "Unavailable"}`
        );
      } else {
        const errorDetails = await response.json();
        console.error(
          "Failed to update availability:",
          response.status,
          response.statusText
        );
        console.error("Error details:", errorDetails);

        Alert.alert(
          "Error",
          errorDetails.message || `Couldn't update the availability`
        );
      }
    } catch (error) {
      console.error("Error updating product availability:", error);
      Alert.alert(
        "Error",
        "Failed to update product availability. Please try again."
      );
    }
  };

  const handleDeleteProduct = () => {
    Alert.alert(
      "Delete Product",
      "Are you sure you want to delete this product?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const userToken = await AsyncStorage.getItem("userToken");
              if (!userToken) {
                navigation.replace("Login");
                return;
              }

              const response = await fetch(
                `https://krishi-bazar.onrender.com/api/v1/product/${Id}`,
                {
                  method: "DELETE",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${userToken}`, // Use userToken instead of token
                  },
                }
              );

              console.log("Response status:", response.status);

              if (response.ok) {
                const data = await response.json();
                console.log("Product deleted successfully:", data);
                Alert.alert("Success", "Product deleted successfully");
                navigation.goBack();
              } else {
                const errorDetails = await response.json();
                console.error(
                  "Failed to delete product:",
                  response.status,
                  response.statusText
                );
                console.error("Error details:", errorDetails);

                Alert.alert(
                  "Error",
                  errorDetails.message || "Failed to delete product"
                );
              }
            } catch (error) {
              console.error("Error in deleting product:", error);
              Alert.alert(
                "Error",
                "Failed to delete product. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  if (!fontsLoaded || isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const showDeleteConfirmation = () => {
    Alert.alert(
      "Delete Product",
      "Are you sure you want to delete this product?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: handleDeleteProduct,
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={wp(6)} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Product Details</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: orders.img }} // Changed from image_url to img to match API response
            style={styles.productImage}
            resizeMode="cover"
          />
        </View>

        {/* Product Details Card */}
        <View style={styles.card}>
          <Text style={styles.productName}>{orders.name}</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Type:</Text>
            <Text style={styles.detailValue}>{orders.type}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Price:</Text>
            <Text style={styles.priceValue}>₹{orders.rate_per_kg}/kg</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <Text
              style={[
                styles.statusValue,
                { color: orders.is_available ? COLORS.success : COLORS.error },
              ]}
            >
              {orders.is_available ? "Available" : "Unavailable"}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Verified:</Text>
            <Text
              style={[
                styles.statusValue,
                {
                  color: userData.is_verified_by_admin
                    ? COLORS.success
                    : COLORS.error,
                },
              ]}
            >
              {isVerified
                ? "Verified by Admin"
                : "Verification Pending by Admin"}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Farmer:</Text>
            <Text style={styles.detailValue}>
              {orders.farmers_first_name} {orders.farmers_last_name}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.updateButton]}
              onPress={handleUpdateAvailability}
            >
              <Icon
                name={orders.is_available ? "x-circle" : "check-circle"}
                size={wp(5)}
                color={COLORS.white}
              />
              <Text style={styles.buttonText}>
                {orders.is_available ? "Mark Unavailable" : "Mark Available"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={showDeleteConfirmation}
            >
              <Icon name="trash-2" size={wp(5)} color={COLORS.white} />
              <Text style={styles.buttonText}>Delete Product</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: COLORS.white,
    flexDirection: "row",
    alignItems: "center",
    padding: wp(4),
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  backButton: {
    padding: wp(2),
  },
  headerText: {
    fontFamily: FONTS.regular,
    fontSize: wp(4.5),
    color: COLORS.text,
    marginLeft: wp(3),
  },
  imageContainer: {
    height: hp(30),
    backgroundColor: COLORS.white,
    marginVertical: hp(2),
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: wp(4),
    padding: wp(5),
    margin: wp(4),
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productName: {
    fontFamily: FONTS.bold,
    fontSize: wp(6),
    color: COLORS.text,
    marginBottom: hp(3),
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(2),
  },
  detailLabel: {
    fontFamily: FONTS.regular,
    fontSize: wp(4),
    color: COLORS.textLight,
    width: wp(25),
  },
  detailValue: {
    fontFamily: FONTS.regular,
    fontSize: wp(4),
    color: COLORS.text,
  },
  priceValue: {
    fontFamily: FONTS.bold,
    fontSize: wp(4.5),
    color: COLORS.primary,
  },
  statusValue: {
    fontFamily: FONTS.regular,
    fontSize: wp(4),
  },
  buttonContainer: {
    marginTop: hp(4),
    gap: hp(2),
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: wp(4),
    borderRadius: wp(2),
    gap: wp(2),
  },
  updateButton: {
    backgroundColor: COLORS.primary,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
  },
  buttonText: {
    fontFamily: FONTS.bold,
    color: COLORS.white,
    fontSize: wp(4),
  },
});

export default ManageSpecificProduct;
