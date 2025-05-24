import React, { useState, useEffect } from "react";
import "./../../global.css";
import { GluestackUIProvider } from "./../UI/gluestack-ui-provider";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  FlatList,
  Dimensions,
  Platform,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loadFonts, FONTS } from "../../config/fonts";

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

const SpecificOrder = ({ navigation, route }) => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showActionsheet, setShowActionsheet] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [userData, setUserData] = useState({});
  const orderId = route?.params?.orderId;

  const [fontsLoaded] = loadFonts();

  const options = [
    { id: "1", label: "Delivered" },
    { id: "2", label: "Pending" },
    { id: "3", label: "Processing" },
    { id: "4", label: "Cancelled" },
    { id: "5", label: "Refunded" },
  ];

  const getStatusColor = (option) => {
    switch (option) {
      case "Delivered":
        return COLORS.success;
      case "Pending":
        return "#FF9800";
      case "Processing":
        return COLORS.accent;
      case "Cancelled":
        return "#F44336";
      case "Refunded":
        return "#9C27B0";
      default:
        return COLORS.textLight;
    }
  };

  const fetchOrders = async () => {
    try {
      const userToken = await AsyncStorage.getItem("userToken");
      const userData = await AsyncStorage.getItem("userData");
      setUserData(JSON.parse(userData));
      if (!userToken) {
        navigation.replace("Login");
        return;
      }

      // Get user_id from JWT token
      const tokenParts = userToken.split(".");
      const tokenPayload = JSON.parse(atob(tokenParts[1]));
      const userId = tokenPayload.user_id;

      const response = await fetch(
        `https://krishi-bazar.onrender.com/api/v1/orders/${orderId}`,
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
        console.log("orders", data);
        setOrders(data);
      } else {
        console.error("Failed to fetch order:", response.status);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [orderId]);

  const handleStatusSelect = async (option) => {
    try {
      setIsLoading(true);
      const userToken = await AsyncStorage.getItem("userToken");

      const response = await fetch(
        `https://krishi-bazar.onrender.com/api/v1/orders/${orderId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({
            status: option.label,
          }),
        }
      );

      if (response.ok) {
        Alert.alert("Success", "Order status updated successfully!");
        setSelectedOption(option.label);
        await fetchOrders(); // Refresh the orders data
      } else {
        Alert.alert("Error", "Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      Alert.alert("Error", "Something went wrong while updating status");
    } finally {
      setIsLoading(false);
      setModalVisible(false);
    }
  };

  const handleViewProduct = () => {
    navigation.navigate("ProductDetails", { Id: orders.product_id });
  };

  if (!fontsLoaded || isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <GluestackUIProvider mode="light">
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Icon name="chevron-left" size={wp(6)} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Order Details</Text>
          </View>

          {/* Order Status Card */}
          <View style={styles.card}>
            <View style={styles.orderIdRow}>
              <Text style={styles.orderId}>Order #{orders.order_id}</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(selectedOption) },
                ]}
              >
                <Text style={styles.statusText}>
                  {selectedOption || "Processing"}
                </Text>
              </View>
            </View>
            <Text style={styles.orderDate}>
              Ordered on: {orders.order_date}
            </Text>
          </View>

          {/* Product Details */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Product Details</Text>
            <View style={styles.productContainer}>
              <Image
                source={{ uri: orders.product_img }}
                style={styles.productImage}
                resizeMode="contain"
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{orders.product_name}</Text>
                <Text style={styles.price}>₹{orders.total_price}</Text>
                <Text style={styles.quantity}>
                  Quantity: {orders.quantity_in_kg} kg
                </Text>
              </View>
            </View>
          </View>

          {/* Customer Details */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Customer Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Name:</Text>
              <Text style={styles.detailText}>
                {orders.user_first_name} {orders.user_last_name}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Phone:</Text>
              <Text style={styles.detailText}>
                {orders.buyers_phone_number}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Address:</Text>
              <Text style={styles.detailText}>
                {`${orders.delivery_address}, ${orders.delivery_city}, - ${orders.delivery_address_pincode}`}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonsContainer}>
            {userData.user_type !== "buyer" && ( // Check user type
              <TouchableOpacity
                style={styles.button}
                onPress={() => setModalVisible(true)}
              >
                <Text style={styles.buttonText}>Update Status</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleViewProduct}
            >
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                View Product
              </Text>
            </TouchableOpacity>
          </View>

          {/* Status Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Update Order Status</Text>
                <FlatList
                  data={options}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.optionItem}
                      onPress={() => handleStatusSelect(item)}
                    >
                      <Text style={styles.optionText}>{item.label}</Text>
                    </TouchableOpacity>
                  )}
                />
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </SafeAreaView>
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
  },
  header: {
    backgroundColor: COLORS.white,
    padding: wp(4),
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: wp(2),
  },
  headerTitle: {
    marginLeft: wp(3),
    fontSize: wp(4.5),
    fontFamily: "Poppins-Medium",
    color: COLORS.text,
  },
  card: {
    backgroundColor: COLORS.white,
    margin: wp(3),
    padding: wp(4),
    borderRadius: wp(3),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderIdRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(1),
  },
  orderId: {
    fontSize: wp(4),
    fontFamily: "Poppins-Bold",
    color: COLORS.text,
  },
  statusBadge: {
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
    borderRadius: wp(4),
  },
  statusText: {
    color: COLORS.white,
    fontSize: wp(3.5),
    fontFamily: "Poppins-Medium",
  },
  orderDate: {
    fontSize: wp(3.5),
    fontFamily: "Poppins-Regular",
    color: COLORS.textLight,
  },
  cardTitle: {
    fontSize: wp(4.5),
    fontFamily: "Poppins-Medium",
    marginBottom: hp(2),
    color: COLORS.text,
  },
  productContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  productImage: {
    width: wp(20),
    height: wp(20),
    borderRadius: wp(2),
    backgroundColor: COLORS.border,
  },
  productInfo: {
    flex: 1,
    marginLeft: wp(4),
  },
  productName: {
    fontSize: wp(4),
    fontFamily: "Poppins-Medium",
    color: COLORS.text,
    marginBottom: hp(0.5),
  },
  price: {
    fontSize: wp(4),
    fontFamily: "Poppins-Medium",
    color: COLORS.success,
    marginBottom: hp(0.5),
  },
  quantity: {
    fontSize: wp(3.5),
    fontFamily: "Poppins-Regular",
    color: COLORS.textLight,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: hp(1),
  },
  detailLabel: {
    width: wp(20),
    fontSize: wp(3.5),
    fontFamily: "Poppins-Medium",
    color: COLORS.textLight,
  },
  detailText: {
    flex: 1,
    fontSize: wp(3.5),
    fontFamily: "Poppins-Regular",
    color: COLORS.text,
  },
  buttonsContainer: {
    padding: wp(4),
    gap: hp(1.5),
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: hp(1.5),
    borderRadius: wp(2),
    alignItems: "center",
    elevation: 2,
  },
  secondaryButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: wp(4),
    fontFamily: "Poppins-Medium",
  },
  secondaryButtonText: {
    color: COLORS.primary,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: wp(80),
    backgroundColor: COLORS.white,
    borderRadius: wp(4),
    padding: wp(5),
    alignItems: "center",
  },
  modalTitle: {
    fontSize: wp(4.5),
    fontFamily: "Poppins-Medium",
    marginBottom: hp(2),
    color: COLORS.text,
  },
  optionItem: {
    padding: wp(4),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    width: "100%",
  },
  optionText: {
    fontSize: wp(4),
    fontFamily: "Poppins-Regular",
    color: COLORS.text,
    textAlign: "center",
  },
  closeButton: {
    marginTop: hp(2),
    backgroundColor: "#e74c3c",
    padding: wp(3),
    borderRadius: wp(2),
    width: "100%",
  },
  closeButtonText: {
    color: COLORS.white,
    fontSize: wp(4),
    fontFamily: "Poppins-Medium",
    textAlign: "center",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SpecificOrder;
