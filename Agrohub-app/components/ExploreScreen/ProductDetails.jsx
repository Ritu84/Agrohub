import React, { useState, useEffect } from "react";
import "./../../global.css";
import { GluestackUIProvider } from "./../UI/gluestack-ui-provider";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Feather";
import { useFonts } from "expo-font";

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
  accent: "#3B82F6", // Accent blue
};

const ProductImage = ({ imageUrl }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <View style={styles.imageContainer}>
      <Image
        source={{
          uri: imageUrl,
          cache: "reload",
        }}
        style={styles.image}
        resizeMode="cover"
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onError={(e) => {
          console.log("Image loading error:", e.nativeEvent.error);
          setHasError(true);
          setIsLoading(false);
        }}
      />
      {isLoading && (
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
          style={styles.imageLoadingIndicator}
        />
      )}
      {hasError && (
        <View style={styles.errorImageContainer}>
          <Icon name="image" size={wp(12)} color={COLORS.textLight} />
          <Text style={styles.errorImageText}>Image not available</Text>
        </View>
      )}
    </View>
  );
};

const ProductDetails = ({ navigation, route }) => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFarmer, setIsFarmer] = useState("");
  const Id = route?.params?.Id;

  // Load custom fonts
  const [fontsLoaded] = useFonts({
    "SpaceMono-Regular": require("./../../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const userToken = await AsyncStorage.getItem("userToken");
        if (!userToken) {
          console.log("User token not found");
          navigation.replace("Login");
          return;
        }

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
          setOrders(data);
          setError(null);
        } else {
          const errorDetails = await response.json();
          console.error("Error details:", errorDetails);
          setError(errorDetails.message || "Failed to fetch product details");
        }
      } catch (error) {
        console.error("Error fetching the product details:", error);
        setError(
          error.message || "An error occurred while fetching product details"
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (Id) {
      fetchProducts();
    }
  }, [Id, navigation]);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userDataJSON = await AsyncStorage.getItem("userData");
        if (userDataJSON) {
          const userData = JSON.parse(userDataJSON);
          setIsFarmer(userData.is_farmer ? "Farmer" : "Buyer");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  if (!fontsLoaded || isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <GluestackUIProvider mode="light">
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={wp(6)} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <ProductImage imageUrl={orders.img} />

          <View style={styles.infoContainer}>
            <Text style={styles.productName}>{orders.name}</Text>

            <View style={styles.basicInfo}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{orders.type}</Text>
              </View>
              <View style={styles.ratingContainer}>
                <Feather name="star" size={wp(4)} color="#FFB800" />
                <Text style={styles.ratingText}>{orders.rating}</Text>
              </View>
            </View>

            <View style={styles.priceSection}>
              <Text style={styles.price}>₹{orders.rate_per_kg}</Text>
              <Text style={styles.quantity}>
                Quantity: {orders.quantity_in_kg} kg
              </Text>
            </View>

            <View style={[styles.farmerSection, styles.card]}>
              <Text style={styles.sectionTitle}>Farmer Details</Text>
              <View style={styles.farmerInfo}>
                <View style={styles.farmerIconContainer}>
                  <Feather name="user" size={wp(6)} color={COLORS.white} />
                </View>
                <View style={styles.farmerDetails}>
                  <Text style={styles.farmerName}>
                    {orders.farmers_first_name} {orders.farmers_last_name}
                  </Text>
                  <View style={styles.phoneItem}>
                    <Feather
                      name="phone"
                      size={wp(4.5)}
                      color={COLORS.textLight}
                    />
                    <Text style={styles.phoneText}>
                      {orders.farmer_phone_number}
                    </Text>
                  </View>
                  <View style={styles.farmerBadge}>
                    <Icon name="award" size={wp(4)} color={COLORS.primary} />
                    <Text style={styles.farmerText}>Verified Farmer</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.buyButton}
            onPress={() => {
              if (isFarmer === "Farmer") {
                Alert.alert(
                  "Access Denied",
                  "You are a farmer. You cannot buy products. \nIf you want to buy products, please login as a buyer.",

                  [{ text: "OK", onPress: () => {} }]
                );
                return;
              }

              navigation.navigate("BuyOrder", {
                Id: orders.id,
                image: orders.img,
                productName: orders.name,
                productRate: orders.rate_per_kg,
              });
            }}
          >
            <LinearGradient
              colors={[COLORS.primary, "#2E7D32"]}
              style={styles.gradientButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buyButtonText}>Buy Now</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </GluestackUIProvider>
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
    backgroundColor: COLORS.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: wp(5),
  },
  header: {
    height: hp(7),
    justifyContent: "center",
    paddingHorizontal: wp(4),
    backgroundColor: COLORS.white,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  backButton: {
    padding: wp(2),
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: "100%",
    height: hp(35),
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageLoadingIndicator: {
    position: "absolute",
  },
  errorImageContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  errorImageText: {
    marginTop: hp(1),
    color: COLORS.textLight,
    fontFamily: "Poppins-Regular",
    fontSize: wp(4),
  },
  infoContainer: {
    padding: wp(5),
  },
  productName: {
    fontFamily: "Poppins-Bold",
    fontSize: wp(6),
    color: COLORS.text,
    marginBottom: hp(1),
  },
  basicInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(2),
  },
  badge: {
    backgroundColor: "#E3F2E9",
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.8),
    borderRadius: wp(4),
    marginRight: wp(4),
  },
  badgeText: {
    fontFamily: "Poppins-Medium",
    color: COLORS.primary,
    fontSize: wp(3.5),
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    marginLeft: wp(1),
    fontFamily: "Poppins-Regular",
    fontSize: wp(4),
    color: COLORS.text,
  },
  priceSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: hp(2.5),
  },
  price: {
    fontFamily: "Poppins-Bold",
    fontSize: wp(6),
    color: COLORS.primary,
  },
  quantity: {
    fontFamily: "Poppins-Regular",
    fontSize: wp(4),
    color: COLORS.textLight,
  },
  farmerSection: {
    backgroundColor: COLORS.white,
    borderRadius: wp(4),
    padding: wp(4),
    marginBottom: hp(2.5),
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  sectionTitle: {
    fontFamily: "Poppins-Medium",
    fontSize: wp(4.5),
    color: COLORS.text,
    marginBottom: hp(1.5),
  },
  farmerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  farmerIconContainer: {
    width: wp(12),
    height: wp(12),
    backgroundColor: COLORS.primary,
    borderRadius: wp(6),
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp(4),
  },
  farmerDetails: {
    flex: 1,
  },
  farmerName: {
    fontFamily: "Poppins-Medium",
    fontSize: wp(4),
    color: COLORS.text,
    marginBottom: hp(0.5),
  },
  phoneItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(0.5),
  },
  phoneText: {
    fontFamily: "Poppins-Regular",
    fontSize: wp(3.8),
    color: COLORS.textLight,
    marginLeft: wp(2),
  },
  farmerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingVertical: hp(0.5),
    paddingHorizontal: wp(2),
    borderRadius: wp(4),
    alignSelf: "flex-start",
  },
  farmerText: {
    marginLeft: wp(2),
    fontFamily: "Poppins-Medium",
    color: COLORS.primary,
    fontSize: wp(3.5),
  },
  bottomContainer: {
    padding: wp(5),
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  buyButton: {
    width: "100%",
    height: hp(6.5),
    overflow: "hidden",
    borderRadius: wp(3),
  },
  gradientButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buyButtonText: {
    fontFamily: "Poppins-Medium",
    color: COLORS.white,
    fontSize: wp(4.5),
  },
});

export default ProductDetails;
