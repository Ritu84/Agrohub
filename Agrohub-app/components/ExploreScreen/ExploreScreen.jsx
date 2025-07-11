import React, { useState, useEffect } from "react";
import "./../../global.css";
import { GluestackUIProvider } from "./../UI/gluestack-ui-provider";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Dimensions,
  Platform,
  StatusBar,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { useRoute } from "@react-navigation/native";
import { useAuth } from "../../Store/AuthContext";
import { FONTS } from "../../config/fonts";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

// Create responsive size functions
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
};

const ExploreScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const { token, user_id } = useAuth();
  const route = useRoute();
  const { category } = route.params || {};

  useEffect(() => {
    if (category) {
      setSelectedCategory(category);
    }
  }, [category]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const userToken = await AsyncStorage.getItem("userToken");
        if (!userToken) {
          navigation.replace("Login");
          return;
        }
        const tokenParts = userToken.split(".");
        const tokenPayload = JSON.parse(atob(tokenParts[1]));
        const userId = tokenPayload.user_id;

        const response = await fetch(
          `https://krishi-bazar.onrender.com/api/v1/product`,
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
          setProducts(data);
          console.log("Products:", data);
        } else {
          console.error(
            "Failed to fetch products:",
            response.status,
            response.statusText
          );
          const errorDetails = await response.json();
          console.error("Error details:", errorDetails);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [token]);

  const filteredProducts = products.filter((product) => {
    // Search filter
    // console.log("Product:", product);
    const matchesSearch =
      product.name &&
      product.name.toLowerCase().includes(searchText.toLowerCase());

    return matchesSearch;
  });

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate("ProductDetails", { Id: item.id })}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.img }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productType}>{item.type}</Text>
        <Text style={styles.productPrice}>
          ₹{item.rate_per_kg.toFixed(2)}/kg
        </Text>
        <Text style={styles.farmerName}>
          By {item.farmers_first_name} {item.farmers_last_name}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <GluestackUIProvider mode="light">
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <Icon name="search" size={wp(6)} color={COLORS.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Products"
            placeholderTextColor={COLORS.textLight}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.productList}
          renderItem={renderProduct}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {isLoading ? "Loading..." : "No products found"}
              </Text>
            </View>
          }
          columnWrapperStyle={styles.productRow}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </GluestackUIProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: wp(4),
    paddingTop: Platform.OS === "ios" ? hp(6) : hp(2),
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: wp(3),
    paddingHorizontal: wp(4),
    marginBottom: hp(2),
    height: hp(6.5),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: wp(2),
    fontFamily: FONTS.regular,
    fontSize: wp(4),
    color: COLORS.text,
  },
  productList: {
    paddingBottom: hp(2),
  },
  productRow: {
    justifyContent: "space-between",
  },
  productCard: {
    backgroundColor: COLORS.white,
    borderRadius: wp(4),
    width: wp(44),
    marginBottom: hp(2),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: hp(15),
    resizeMode: "cover",
  },
  productInfo: {
    padding: wp(3),
  },
  productName: {
    fontSize: wp(4),
    fontFamily: "Poppins-Bold",
    color: COLORS.text,
    marginBottom: hp(0.5),
  },
  productType: {
    fontSize: wp(3.5),
    fontFamily: "Poppins-Regular",
    color: COLORS.textLight,
    marginBottom: hp(0.5),
  },
  productPrice: {
    fontSize: wp(4),
    fontFamily: "Poppins-Medium",
    color: COLORS.primary,
    marginBottom: hp(0.5),
  },
  farmerName: {
    fontSize: wp(3.5),
    fontFamily: "Poppins-Regular",
    color: COLORS.textLight,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: hp(30),
  },
  emptyText: {
    fontSize: wp(4.5),
    fontFamily: "Poppins-Medium",
    color: COLORS.textLight,
  },
});

export default ExploreScreen;
