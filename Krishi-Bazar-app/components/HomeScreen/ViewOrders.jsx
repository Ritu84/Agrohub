import React, { useState, useEffect } from "react";
import "./../../global.css";
import { GluestackUIProvider } from "./../UI/gluestack-ui-provider";
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { LinearGradient } from "expo-linear-gradient";
import { ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Get device dimensions
const { width, height } = Dimensions.get("window");
const scale = width / 375; // Base width of 375 for scaling

// Normalize sizes based on screen width
const normalize = (size) => {
  return Math.round(scale * size);
};

const ViewOrders = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
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
          `https://krishi-bazar.onrender.com/api/v1/user/${userId}/orders`,
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
          console.log("Fetched orders data:", data); // Debug log

          // Handle different response formats
          let ordersData = [];
          if (Array.isArray(data)) {
            ordersData = data;
          } else if (data && typeof data === "object") {
            // If data is an object, try to find an array property
            const arrayProperty = Object.values(data).find((value) =>
              Array.isArray(value)
            );
            if (arrayProperty) {
              ordersData = arrayProperty;
            } else {
              // If no array found, wrap single object in array if it has required properties
              ordersData = data.order_details ? [data] : [];
            }
          }

          setOrders(ordersData);
          setError(null);
        } else {
          const errorDetails = await response.json();
          setError(errorDetails.message || "Failed to fetch orders");
          console.error("Failed to fetch orders:", response.status);
          console.error("Error details:", errorDetails);
        }
      } catch (error) {
        setError("Error fetching orders");
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [navigation]);

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() =>
        navigation.navigate("SpecificOrder", {
          orderId: item.order_details?.order_id,
        })
      }
      activeOpacity={0.7}
    >
      <View>
        <View style={styles.orderRow}>
          <View style={styles.productImage}>
            <Image
              source={{ uri: item.order_details?.product_img }}
              style={styles.circleImage}
              resizeMode="cover"
            />
          </View>
          <View style={styles.orderDetails}>
            <Text style={styles.productName}>
              {item.order_details?.product_name || "Unknown Product"}
            </Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Quantity:</Text>
              <Text style={styles.detailValue}>
                {item.order_details?.quantity_in_kg || 0} kg
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Price:</Text>
              <Text style={styles.priceValue}>
                ₹{(item.order_details?.total_price || 0).toFixed(2)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Seller:</Text>
              <Text style={styles.detailValue}>
                {item.seller_details?.farmer_first_name || ""}{" "}
                {item.seller_details?.farmer_last_name || ""}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Buyer:</Text>
              <Text style={styles.detailValue}>
                {item.buyer_details?.buyer_first_name || ""}{" "}
                {item.buyer_details?.buyer_last_name || ""}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <LinearGradient colors={["#f8f9fa", "#e9ecef"]} style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient colors={["#f8f9fa", "#e9ecef"]} style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#f8f9fa", "#e9ecef"]} style={styles.container}>
      <GluestackUIProvider mode="light">
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Icon name="chevrons-left" size={normalize(24)} color="#2E7D32" />
          </TouchableOpacity>
          <Text style={styles.headerText}>My Orders</Text>
        </View>
        <FlatList
          data={orders}
          keyExtractor={(item, index) =>
            item.order_details?.order_id?.toString() || index.toString()
          }
          renderItem={renderProduct}
          contentContainerStyle={[
            styles.listContainer,
            orders.length === 0 && styles.emptyListContainer,
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No orders found</Text>
            </View>
          }
        />
      </GluestackUIProvider>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: "white",
    padding: normalize(15),
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: normalize(5),
  },
  headerText: {
    color: "#333",
    fontSize: normalize(20),
    fontWeight: "600",
    marginLeft: normalize(10),
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  listContainer: {
    padding: normalize(8),
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  orderCard: {
    marginVertical: normalize(8),
    backgroundColor: "white",
    borderRadius: normalize(12),
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderRow: {
    flexDirection: "row",
    padding: normalize(16),
  },
  productImage: {
    marginRight: normalize(16),
  },
  circleImage: {
    width: normalize(100),
    height: normalize(100),
    borderRadius: normalize(8),
    backgroundColor: "#f0f0f0",
  },
  orderDetails: {
    flex: 1,
    justifyContent: "center",
  },
  productName: {
    fontSize: normalize(18),
    fontWeight: "600",
    color: "#1B5E20",
    marginBottom: normalize(8),
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: normalize(4),
  },
  detailLabel: {
    fontSize: normalize(14),
    color: "#666",
    fontWeight: "500",
    width: normalize(70),
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  detailValue: {
    fontSize: normalize(14),
    color: "#333",
    flex: 1,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  priceValue: {
    fontSize: normalize(14),
    color: "#2E7D32",
    fontWeight: "600",
    flex: 1,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: normalize(40),
  },
  emptyText: {
    fontSize: normalize(16),
    color: "#666",
    fontWeight: "500",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: normalize(16),
    color: "#d32f2f",
    textAlign: "center",
    padding: normalize(20),
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
});

export default ViewOrders;
