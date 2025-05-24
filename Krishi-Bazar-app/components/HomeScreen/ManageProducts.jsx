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
  SafeAreaView,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { useRoute } from "@react-navigation/native";
import FilterDialog from "./../ExploreScreen/FilterDialog";
import { useAuth } from "../../Store/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserType } from "../../utils/userUtils";

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
  danger: "#DC2626", // Delete red
};

const ManageProducts = ({ navigation }) => {
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    productType: "",
    priceRange: "",
    farmerName: "",
    deliveryDate: "",
  });
  const [userType, setUserType] = useState(null);

  const route = useRoute();
  const { token } = useAuth();
  const { category } = route.params || {};

  useEffect(() => {
    if (category) {
      setSelectedCategory(category);
    }
  }, [category]);

  const deleteProduct = async (productId) => {
    try {
      const userToken = await AsyncStorage.getItem("userToken");
      const response = await fetch(
        `https://krishi-bazar.onrender.com/api/v1/product/${productId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      if (response.ok) {
        Alert.alert("Success", "Product removed successfully", [
          { text: "OK" },
        ]);
        setProducts(products.filter((product) => product.id !== productId));
      } else {
        Alert.alert("Error", "Failed to delete product", [{ text: "OK" }]);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      Alert.alert("Error", "Something went wrong while deleting the product", [
        { text: "OK" },
      ]);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const userToken = await AsyncStorage.getItem("userToken");
        const userData = await AsyncStorage.getItem("userData");

        if (!userToken || !userData) {
          navigation.replace("Login");
          return;
        }

        const parsedUserData = JSON.parse(userData);
        if (!parsedUserData || !parsedUserData.user_id) {
          console.error("Invalid user data");
          navigation.replace("Login");
          return;
        }

        const userId = parsedUserData.user_id;
        console.log("Fetching products for user:", userId);

        const response = await fetch(
          `https://krishi-bazar.onrender.com/api/v1/product/farmer/${userId}`,
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
          console.log("Products:", data);
          setProducts(Array.isArray(data) ? data : []);
        } else {
          console.error("Failed to fetch products:", response.status);
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [navigation]);

  useEffect(() => {
    const checkUserType = async () => {
      const type = await getUserType();
      setUserType(type);
    };
    checkUserType();
  }, []);

  const filteredProducts = products.filter((product) => {
    if (!product) return false;

    const matchesSearch =
      product.name &&
      product.name.toLowerCase().includes((searchText || "").toLowerCase());

    const matchesFarmer =
      !filters.farmerName ||
      (
        (product.farmers_first_name || "") +
        " " +
        (product.farmers_last_name || "")
      )
        .toLowerCase()
        .includes((filters.farmerName || "").toLowerCase());

    return matchesSearch && matchesFarmer;
  });

  const toggleModal = () => setModalVisible(!modalVisible);

  const renderProduct = ({ item }) => {
    if (!item) return null;

    return (
      <View style={styles.productCard}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("ManageSpecificProduct", { Id: item.id })
          }
        >
          <Image source={{ uri: item.img }} style={styles.productImage} />
          <View style={styles.productInfo}>
            <Text style={styles.productName}>
              {item.name || "Unnamed Product"}
            </Text>
            <Text style={styles.productType}>{item.type || "No Type"}</Text>
            <Text style={styles.productPrice}>
              ₹{(item.rate_per_kg || 0).toFixed(2)}
            </Text>
            <Text style={styles.farmerName}>
              {item.farmers_first_name || ""} {item.farmers_last_name || ""}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            Alert.alert(
              "Delete Product",
              "Are you sure you want to delete this product?",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete",
                  onPress: () => deleteProduct(item.id),
                  style: "destructive",
                },
              ]
            );
          }}
        >
          <Icon name="trash-2" size={wp(5)} color={COLORS.white} />
        </TouchableOpacity>
        {userType === "buyer" && (
          <TouchableOpacity
            style={styles.buyButton}
            onPress={() =>
              navigation.navigate("CreateOrder", {
                Id: item.id,
                image: item.img,
                productName: item.name,
                productRate: item.rate_per_kg,
              })
            }
          >
            <Text style={styles.buyButtonText}>Buy Now</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
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
            visible={modalVisible}
            setVisible={setModalVisible}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    position: "relative",
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
    fontWeight: "bold",
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
    fontWeight: "500",
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
    fontWeight: "500",
  },
  deleteButton: {
    position: "absolute",
    top: wp(2),
    right: wp(2),
    backgroundColor: COLORS.danger,
    padding: wp(2),
    borderRadius: wp(6),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  buyButton: {
    position: "absolute",
    bottom: wp(2),
    right: wp(2),
    backgroundColor: COLORS.accent,
    padding: wp(2),
    borderRadius: wp(6),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  buyButtonText: {
    color: COLORS.white,
    fontSize: wp(3.5),
    fontWeight: "bold",
  },
});

export default ManageProducts;
