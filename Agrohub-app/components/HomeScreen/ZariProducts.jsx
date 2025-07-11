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
  ActivityIndicator,
  BackHandler,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { useRoute } from "@react-navigation/native";
import FilterDialog from "./../ExploreScreen/FilterDialog";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

const ZariProducts = ({ navigation }) => {
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    productType: "",
    priceRange: "",
    farmerName: "",
    deliveryDate: "",
  });

  // Load custom fonts with error handling
  const [fontsLoaded, fontError] = useFonts({
    "SpaceMono-Regular": require("./../../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const route = useRoute();
  const { category } = route.params || {};

  // Handle back button press
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        navigation.goBack();
        return true;
      }
    );

    return () => backHandler.remove();
  }, [navigation]);

  useEffect(() => {
    if (category) {
      setSelectedCategory(category);
    }
  }, [category]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const userToken = await AsyncStorage.getItem("userToken");
      if (!userToken) {
        navigation.replace("Login");
        return;
      }

      console.log("Fetching Jari products...");

      const response = await fetch(
        "https://krishi-bazar.onrender.com/api/v1/product/jari",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      const data = await response.json();
      console.log("Products response:", data);

      if (response.ok) {
        setProducts(Array.isArray(data) ? data : []);
      } else {
        setError(data.message || "Failed to fetch products");
        console.error("Failed to fetch products:", response.status);
      }
    } catch (error) {
      setError(error.message || "An error occurred");
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    if (!product) return false;

    const matchesSearch =
      product.name &&
      product.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesFarmer =
      !filters.farmerName ||
      (
        (product.farmers_first_name || "") +
        " " +
        (product.farmers_last_name || "")
      )
        .toLowerCase()
        .includes(filters.farmerName.toLowerCase());
    const matchesPriceRange =
      !filters.priceRange ||
      (() => {
        const range = filters.priceRange.split(" - ");
        const min = parseInt(range[0].replace("₹", ""));
        const max = range[1] ? parseInt(range[1].replace("₹", "")) : Infinity;
        return (
          product.rate_per_kg &&
          product.rate_per_kg <= max &&
          product.rate_per_kg >= min
        );
      })();
    return matchesSearch && matchesFarmer && matchesPriceRange;
  });

  const toggleModal = () => setModalVisible(!modalVisible);

  const renderProduct = ({ item }) => {
    if (!item) return null;

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => navigation.navigate("ProductDetails", { Id: item.id })}
      >
        <Image source={{ uri: item.img }} style={styles.productImage} />
        <View style={styles.productInfo}>
          <Text style={styles.productName}>
            {item.name || "Unnamed Product"}
          </Text>
          <Text style={styles.productType}>
            {item.type || "No type specified"}
          </Text>
          <Text style={styles.productPrice}>
            ₹{(item.rate_per_kg || 0).toFixed(2)}
          </Text>
          <Text style={styles.farmerName}>
            {item.farmers_first_name || ""} {item.farmers_last_name || ""}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (fontError) {
    console.error("Font loading error:", fontError);
  }

  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchProducts}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <GluestackUIProvider mode="light">
      <View style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.searchContainer}>
            <Icon name="search" size={wp(6)} color={COLORS.textLight} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products"
              placeholderTextColor={COLORS.textLight}
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          {/* <View style={styles.filterContainer}>
            <TouchableOpacity onPress={toggleModal} style={styles.filterButton}>
              <Icon name="sliders" size={wp(4.5)} color={COLORS.primary} />
              <Text style={styles.filterButtonText}>FILTER</Text>
            </TouchableOpacity>
          </View>

          {modalVisible && (
            <FilterDialog
              activeFilters={filters}
              onFilterChange={setFilters}
              onClose={toggleModal}
              visible={modalVisible}
              setVisible={setModalVisible}
              ProductData={setProducts}
            />
          )} */}

          <FlatList
            data={filteredProducts}
            keyExtractor={(item) =>
              item?.id?.toString() || Math.random().toString()
            }
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
      </View>
    </GluestackUIProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
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
    fontSize: wp(4),
    color: COLORS.text,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: hp(2),
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    paddingVertical: hp(1),
    paddingHorizontal: wp(4),
    borderRadius: wp(2),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterButtonText: {
    marginLeft: wp(2),
    color: COLORS.primary,
    fontSize: wp(3.5),
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
    height: wp(44),
    resizeMode: "cover",
  },
  productInfo: {
    padding: wp(3),
  },
  productName: {
    fontSize: wp(4),
    color: COLORS.text,
    marginBottom: hp(0.5),
  },
  productType: {
    fontSize: wp(3.5),
    color: COLORS.textLight,
    marginBottom: hp(0.5),
  },
  productPrice: {
    fontSize: wp(4),
    color: COLORS.success,
    marginBottom: hp(0.5),
  },
  farmerName: {
    fontSize: wp(3.5),
    color: COLORS.textLight,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp(10),
  },
  emptyText: {
    fontSize: wp(4.5),
    color: COLORS.textLight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: 20,
  },
  errorText: {
    fontSize: wp(4),
    color: "red",
    textAlign: "center",
    marginBottom: hp(2),
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    padding: wp(3),
    borderRadius: wp(2),
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: wp(4),
  },
});

export default ZariProducts;
