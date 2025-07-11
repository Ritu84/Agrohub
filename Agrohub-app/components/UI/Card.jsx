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
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { useRoute } from "@react-navigation/native";
import FilterDialog from "./../ExploreScreen/FilterDialog";

// Sample product data
const products = [
  {
    id: "1",
    name: "Product 1",
    price: 500,
    image: "https://via.placeholder.com/150",
    category: "Zari",
    farmer: "Bob Wilson",
  },
  {
    id: "2",
    name: "Product 2",
    price: 1200,
    image: "https://via.placeholder.com/150",
    category: "Mushroom",
    farmer: "Jane Smith",
  },
  {
    id: "3",
    name: "Product 3",
    price: 2500,
    image: "https://via.placeholder.com/150",
    category: "Zari",
    farmer: "Jane Smith",
  },
  {
    id: "4",
    name: "Product 4",
    price: 1500,
    image: "https://via.placeholder.com/150",
    category: "Mushroom",
    farmer: "John Doe",
  },
  {
    id: "5",
    name: "Product 5",
    price: 750,
    image: "https://via.placeholder.com/150",
    category: "Mushroom",
    farmer: "John Doe",
  },
];

const Card = ({ navigation }) => {
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filters, setFilters] = useState({
    productType: "",
    priceRange: "",
    farmerName: "",
    deliveryDate: "",
  });

  const route = useRoute();

  const { category } = route.params || {};
  useEffect(() => {
    if (category) {
      setSelectedCategory(category); // Set selected category based on route params
    }
  }, [category]);

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      !filters.productType || product.category === filters.productType;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesFarmer =
      !filters.farmerName || product.farmer === filters.farmerName;
    const matchesPriceRange =
      !filters.priceRange ||
      (() => {
        const range = filters.priceRange.split(" - ");
        const min = parseInt(range[0].replace("₹", ""));
        const max = range[1] ? parseInt(range[1].replace("₹", "")) : Infinity;
        return product.price <= max && product.price >= min;
      })();
    return (
      matchesCategory && matchesSearch && matchesFarmer && matchesPriceRange
    );
  });
  const [modalVisible, setModalVisible] = useState(false);
  const toggleModal = () => {
    setModalVisible(true); // Toggle the visibility of modal
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() =>
        navigation.navigate("ManageSpecificProduct", { ProductId: products.id })
      }
    >
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productPrice}>₹{item.price.toFixed(2)}</Text>
    </TouchableOpacity>
  );

  return (
    <GluestackUIProvider mode="light">
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <Icon name="search" size={24} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        {/* <View style={styles.filterContainer}>
          <TouchableOpacity onPress={toggleModal} style={styles.filterButton}>
            <Icon name="menu" size={18} color="#102C57" />
            <Text style={styles.filterButtonText}>FILTER</Text>
          </TouchableOpacity>
          {modalVisible && (
            <FilterDialog
              activeFilters={filters}
              onFilterChange={setFilters} 
              onClose={toggleModal}
              visible={modalVisible}
              setVisible={setModalVisible} 
            />
          )}
        </View> */}
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.productList}
          renderItem={renderProduct}
          ItemSeparatorComponent={() => (
            <View style={{ height: 10, width: 10 }} />
          )}
        />
      </View>
    </GluestackUIProvider>
  );
};

const { width } = Dimensions.get("window");
const productCardWidth = (width - 54) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF6E3",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: "#1F2937",
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  filterButton: {
    backgroundColor: "white",
    borderRadius: 8,
    flexDirection: "row",
    paddingVertical: 4,
    paddingHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  filterButtonText: {
    color: "#1A1A1D",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  productList: {
    justifyContent: "space-between",
    // gap:10
    //marginVertical:10
  },
  productCard: {
    backgroundColor: "white",
    borderRadius: 12,
    marginHorizontal: 2,
    //marginRight:,
    padding: 12,
    width: productCardWidth,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  productImage: {
    width: "100%",
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A1A1D",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: "#2E7D32",
    fontWeight: "500",
  },
});

export default Card;
