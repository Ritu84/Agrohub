import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Dimensions,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserType } from "../../utils/userUtils";
import * as Notifications from "expo-notifications";
import {
  registerForPushNotificationsAsync,
  sendOrderNotification,
} from "../../utils/notificationUtils";

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
  background: "#FFFFFF", // White background
  error: "#FF4D4D", // Error red
  border: "#E0E0E0", // Border color
  success: "#4CAF50", // Success green
  cardBg: "#F5F5F5", // Card background
};

const StatusModal = ({ visible, onClose, success, message }) => (
  <Modal
    transparent
    visible={visible}
    animationType="fade"
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View
          style={[
            styles.modalIcon,
            {
              backgroundColor: success
                ? "rgba(76, 175, 80, 0.1)"
                : "rgba(244, 67, 54, 0.1)",
            },
          ]}
        >
          <Feather
            name={success ? "check-circle" : "x-circle"}
            size={24}
            color={success ? COLORS.success : COLORS.error}
          />
        </View>
        <Text style={styles.modalTitle}>
          {success ? "Order Created Successfully!" : "Order Failed"}
        </Text>
        <Text style={styles.modalMessage}>{message}</Text>
        <TouchableOpacity
          style={[
            styles.modalButton,
            {
              backgroundColor: success ? COLORS.success : COLORS.error,
            },
          ]}
          onPress={() => {
            onClose();
            if (success) {
              navigation.navigate("ViewOrders");
            }
          }}
        >
          <Text style={styles.modalButtonText}>
            {success ? "View Orders" : "Try Again"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

export default CreateOrder = ({ navigation, route }) => {
  const Id = route?.params?.Id;
  const image = route?.params?.image;
  const productName = route?.params?.productName;
  const productRate = route?.params?.productRate;

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    quantity_in_kg: "",
    delivery_address: "",
    delivery_city: "",
    delivery_address_zip: "",
    mode_of_delivery: "standard",
    expected_delivery_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    buyers_phone_number: "",
  });

  useEffect(() => {
    const getBuyerId = async () => {
      try {
        const userToken = await AsyncStorage.getItem("userToken");
        if (userToken) {
          const tokenParts = userToken.split(".");
          const tokenPayload = JSON.parse(atob(tokenParts[1]));
          const userId = tokenPayload.user_id;
        }
      } catch (error) {
        console.error("Error getting buyer ID:", error);
      }
    };
    getBuyerId();
  }, []);

  useEffect(() => {
    registerForPushNotificationsAsync();

    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received:", notification);
      }
    );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        navigation.navigate("ViewOrders");
      });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  const [fontsLoaded] = useFonts({
    "SpaceMono-Regular": require("./../../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleCreateOrder = async () => {
    setLoading(true);
    try {
      // Validate required fields
      if (
        !formData.quantity_in_kg ||
        !formData.delivery_address ||
        !formData.delivery_city ||
        !formData.delivery_address_zip ||
        !formData.buyers_phone_number
      ) {
        Alert.alert("Error", "Please fill all required fields");
        setLoading(false);
        return;
      }

      // Validate quantity is greater than 0
      const quantity = parseInt(formData.quantity_in_kg);
      if (quantity <= 0) {
        Alert.alert("Error", "Quantity must be greater than 0");
        setLoading(false);
        return;
      }

      // Validate phone number length
      if (formData.buyers_phone_number.length !== 10) {
        Alert.alert("Error", "Phone number must be 10 digits");
        setLoading(false);
        return;
      }

      // Validate PIN code length
      if (formData.delivery_address_zip.length !== 6) {
        Alert.alert("Error", "PIN code must be 6 digits");
        setLoading(false);
        return;
      }

      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        throw new Error("User not authenticated");
      }

      // Format the date to match Go's time.Time format (RFC3339)
      const date = formData.expected_delivery_date;
      const formattedDate = date.toISOString(); // This will output in RFC3339 format

      // Create payload matching backend expectations
      const payload = {
        quantity_in_kg: parseInt(formData.quantity_in_kg),
        delivery_address: formData.delivery_address.trim(),
        delivery_city: formData.delivery_city.trim(),
        delivery_address_zip: parseInt(formData.delivery_address_zip),
        mode_of_delivery: formData.mode_of_delivery,
        expected_delivery_date: formattedDate,
        buyers_phone_number: parseInt(formData.buyers_phone_number),
      };

      console.log("Sending order payload:", payload);

      const response = await fetch(
        `https://krishi-bazar.onrender.com/api/v1/product/${Id}/order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create order");
      }

      // Send notification to buyer
      await sendOrderNotification(
        "Order Created Successfully",
        `Your order for ${productName} has been placed successfully!`,
        { screen: "ViewOrders" }
      );

      // Send notification to farmer (you'll need to implement this on the backend)
      // The backend should handle sending a notification to the farmer

      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 2000);

      // Reset form
      setFormData({
        quantity_in_kg: "",
        delivery_address: "",
        delivery_city: "",
        delivery_address_zip: "",
        mode_of_delivery: "standard",
        expected_delivery_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        buyers_phone_number: "",
      });
    } catch (error) {
      console.error("Order creation error:", error);
      setErrorMessage(error.message);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={wp(6)} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Order</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Product Summary Card */}
        <View style={styles.productCard}>
          <Image source={{ uri: image }} style={styles.productImage} />
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{productName}</Text>
            <Text style={styles.productPrice}>₹{productRate}</Text>
          </View>
        </View>

        {/* Order Form */}
        <View style={styles.formContainer}>
          {/* Quantity Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Quantity (kg) *</Text>
            <TextInput
              style={styles.input}
              value={formData.quantity_in_kg}
              onChangeText={(text) => {
                // Only allow numbers
                const numericValue = text.replace(/[^0-9]/g, "");
                setFormData({ ...formData, quantity_in_kg: numericValue });
              }}
              keyboardType="number-pad"
              placeholder="Enter quantity in kg"
              placeholderTextColor={COLORS.textLight}
            />
          </View>

          {/* Delivery Address */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Delivery Address *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.delivery_address}
              onChangeText={(text) =>
                setFormData({ ...formData, delivery_address: text })
              }
              placeholder="Enter complete delivery address"
              multiline
              numberOfLines={3}
              placeholderTextColor={COLORS.textLight}
            />
          </View>

          {/* City and ZIP */}
          <View style={styles.rowContainer}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>City *</Text>
              <TextInput
                style={styles.input}
                value={formData.delivery_city}
                onChangeText={(text) =>
                  setFormData({ ...formData, delivery_city: text })
                }
                placeholder="Enter city"
                placeholderTextColor={COLORS.textLight}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>PIN Code *</Text>
              <TextInput
                style={styles.input}
                value={formData.delivery_address_zip}
                onChangeText={(text) => {
                  // Only allow numbers
                  const numericValue = text.replace(/[^0-9]/g, "");
                  setFormData({
                    ...formData,
                    delivery_address_zip: numericValue,
                  });
                }}
                keyboardType="number-pad"
                maxLength={6}
                placeholder="Enter PIN code"
                placeholderTextColor={COLORS.textLight}
              />
            </View>
          </View>

          {/* Phone Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number *</Text>
            <View style={styles.phoneInputContainer}>
              <TextInput
                style={[styles.input, styles.phoneInput]}
                value={formData.buyers_phone_number}
                onChangeText={(text) => {
                  // Only allow numbers, max 10 digits
                  const numericValue = text.replace(/[^0-9]/g, "").slice(0, 10);
                  setFormData({
                    ...formData,
                    buyers_phone_number: numericValue,
                  });
                }}
                keyboardType="number-pad"
                maxLength={10}
                placeholder="Enter phone number"
                placeholderTextColor={COLORS.textLight}
              />
            </View>
          </View>

          {/* Expected Delivery Date */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Expected Delivery Date *</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>
                {formData.expected_delivery_date.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            {showDatePicker && Platform.OS === "android" ? (
              <DateTimePicker
                value={formData.expected_delivery_date}
                mode="date"
                minimumDate={new Date(Date.now() + 24 * 60 * 60 * 1000)}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (event.type !== "dismissed" && selectedDate) {
                    setFormData({
                      ...formData,
                      expected_delivery_date: selectedDate,
                    });
                  }
                }}
              />
            ) : Platform.OS === "ios" && showDatePicker ? (
              <DateTimePicker
                value={formData.expected_delivery_date}
                mode="date"
                minimumDate={new Date(Date.now() + 24 * 60 * 60 * 1000)}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setFormData({
                      ...formData,
                      expected_delivery_date: selectedDate,
                    });
                  }
                }}
                display="spinner"
              />
            ) : null}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Total and Create Order Button */}
      <View style={styles.bottomContainer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalAmount}>
            ₹
            {(productRate * parseFloat(formData.quantity_in_kg || 0)).toFixed(
              2
            )}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.createButton, loading && styles.buttonDisabled]}
          onPress={handleCreateOrder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.background} />
          ) : (
            <Text style={styles.createButtonText}>Place Order</Text>
          )}
        </TouchableOpacity>
      </View>

      <StatusModal
        visible={showSuccessModal}
        success={true}
        message="Your order has been created successfully!"
        onClose={() => {
          setShowSuccessModal(false);
          navigation.navigate("ViewOrders");
        }}
      />
      <StatusModal
        visible={showErrorModal}
        success={false}
        message={errorMessage || "Something went wrong. Please try again."}
        onClose={() => setShowErrorModal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    height: hp(7),
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(4),
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: wp(2),
  },
  headerTitle: {
    fontFamily: "Poppins-Medium",
    fontSize: wp(4.5),
    color: COLORS.text,
    marginLeft: wp(4),
  },
  scrollView: {
    flex: 1,
  },
  productCard: {
    flexDirection: "row",
    padding: wp(4),
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    alignItems: "center",
  },
  productImage: {
    width: wp(20),
    height: wp(20),
    borderRadius: wp(2),
    backgroundColor: COLORS.cardBg,
  },
  productInfo: {
    marginLeft: wp(4),
    flex: 1,
  },
  productName: {
    fontFamily: "Poppins-Medium",
    fontSize: wp(4),
    color: COLORS.text,
    marginBottom: hp(0.5),
  },
  productPrice: {
    fontFamily: "Poppins-Bold",
    fontSize: wp(5),
    color: COLORS.primary,
  },
  formContainer: {
    padding: wp(4),
  },
  inputGroup: {
    marginBottom: hp(3),
  },
  sectionTitle: {
    fontFamily: "Poppins-Medium",
    fontSize: wp(4.5),
    color: COLORS.text,
    marginBottom: hp(2),
  },
  label: {
    fontFamily: "Poppins-Regular",
    fontSize: wp(4),
    color: COLORS.text,
    marginBottom: hp(1),
  },
  input: {
    fontFamily: "Poppins-Regular",
    height: hp(7),
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: wp(2),
    paddingHorizontal: wp(4),
    fontSize: wp(4),
    color: COLORS.text,
  },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  phonePrefix: {
    fontFamily: "Poppins-Regular",
    fontSize: wp(4),
    color: COLORS.text,
    marginRight: wp(2),
    paddingVertical: hp(2),
  },
  phoneInput: {
    flex: 1,
  },
  dateInput: {
    height: hp(7),
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: wp(2),
    paddingHorizontal: wp(4),
    justifyContent: "center",
  },
  dateText: {
    fontFamily: "Poppins-Regular",
    fontSize: wp(4),
    color: COLORS.text,
  },
  textArea: {
    height: hp(15),
    textAlignVertical: "top",
    paddingTop: hp(2),
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: hp(2),
  },
  halfInput: {
    width: "48%",
  },
  deliveryModeContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: wp(2),
    overflow: "hidden",
  },
  deliveryModeButton: {
    flex: 1,
    paddingVertical: hp(2),
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  deliveryModeActive: {
    backgroundColor: COLORS.primary,
  },
  deliveryModeText: {
    fontFamily: "Poppins-Medium",
    fontSize: wp(4),
    color: COLORS.text,
  },
  deliveryModeTextActive: {
    color: COLORS.background,
  },
  bottomContainer: {
    padding: wp(4),
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(2),
  },
  totalLabel: {
    fontFamily: "Poppins-Regular",
    fontSize: wp(4),
    color: COLORS.textLight,
  },
  totalAmount: {
    fontFamily: "Poppins-Bold",
    fontSize: wp(6),
    color: COLORS.primary,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: hp(2),
    borderRadius: wp(2),
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: COLORS.border,
  },
  createButtonText: {
    fontFamily: "Poppins-Medium",
    color: COLORS.background,
    fontSize: wp(4.5),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderRadius: wp(4),
    padding: wp(6),
    width: wp(80),
    alignItems: "center",
  },
  modalIcon: {
    width: wp(20),
    height: wp(20),
    borderRadius: wp(10),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp(2),
  },
  modalTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: wp(5),
    color: COLORS.text,
    marginBottom: hp(1),
    textAlign: "center",
  },
  modalMessage: {
    fontFamily: "Poppins-Regular",
    fontSize: wp(4),
    color: COLORS.textLight,
    textAlign: "center",
    marginBottom: hp(3),
    lineHeight: wp(5.5),
  },
  modalButton: {
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(6),
    borderRadius: wp(2),
    minWidth: wp(30),
    alignItems: "center",
  },
  modalButtonText: {
    fontFamily: "Poppins-Medium",
    color: COLORS.background,
    fontSize: wp(4),
  },
});
