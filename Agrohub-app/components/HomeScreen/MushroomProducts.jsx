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
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MushroomProducts = ({ navigation }) => {
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [products, setProducts] = useState([]);
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

        // Get user_id from JWT token
        const tokenParts = userToken.split(".");
        const tokenPayload = JSON.parse(atob(tokenParts[1]));
        const userId = tokenPayload.user_id;

        const response = await fetch(
          "https://krishi-bazar.onrender.com/api/v1/product/mushroom",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userToken}`,
            },
          }
        );
        console.log("Response status:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("Products fetched successfully:", data);
          setProducts(data);
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
      }
    };

    fetchProducts();
  }, [navigation]);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name &&
      product.name.toLowerCase().includes(searchText.toLowerCase());

    return matchesSearch;
  });

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate("ProductDetails", { Id: item.id })}
    >
      <Image source={{ uri: item.img }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productType}>{item.type}</Text>
        <Text style={styles.productPrice}>₹{item.rate_per_kg.toFixed(2)}</Text>
        <Text style={styles.farmerName}>
          Farmer: {item.farmers_first_name} {item.farmers_last_name}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <GluestackUIProvider mode="light">
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.searchContainer}>
            <Icon name="search" size={24} color="#4A5568" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products"
              placeholderTextColor="#718096"
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
            columnWrapperStyle={styles.productRow}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </SafeAreaView>
    </GluestackUIProvider>
  );
};

const { width, height } = Dimensions.get("window");
const isSmallDevice = width < 375;
const productCardWidth = (width - 24 * 2 - 16) / 2;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7FAFC",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginVertical: 16,
    height: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: isSmallDevice ? 14 : 16,
    color: "#2D3748",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  productList: {
    paddingBottom: 24,
  },
  productRow: {
    justifyContent: "space-between",
  },
  productCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    width: productCardWidth,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: "100%",
    height: productCardWidth * 0.8,
    resizeMode: "cover",
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: "700",
    color: "#2D3748",
    marginBottom: 4,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  productType: {
    fontSize: isSmallDevice ? 12 : 14,
    color: "#718096",
    marginBottom: 4,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  productPrice: {
    fontSize: isSmallDevice ? 14 : 16,
    color: "#48BB78",
    fontWeight: "700",
    marginBottom: 4,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  farmerName: {
    fontSize: isSmallDevice ? 11 : 13,
    color: "#718096",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
});

export default MushroomProducts;
