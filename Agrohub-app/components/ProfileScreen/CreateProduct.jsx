import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  Dimensions,
  Platform,
  SafeAreaView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { uploadImage } from "./../../Store/SupabaseAPI";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");
const scale = width / 375; // Base width of 375 for scaling

const normalize = (size) => {
  return Math.round(scale * size);
};

const CreateProductScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    img: "",
    farmer_id: "",
    name: "",
    type: "",
    quantity_in_kg: "",
    rate_per_kg: "",
    jari_size: "small",
    expected_delivery: null,
    farmer_phone_number: "",
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const checkUserData = async () => {
      const userData = await AsyncStorage.getItem("userData");
      const user = JSON.parse(userData);

      if (user.is_farmer && !user.is_verified_by_admin) {
        Alert.alert("Alert", "Only verified farmers can create products");

        navigation.goBack();
      }
    };
    checkUserData();
  }, []);

  React.useEffect(() => {
    // Get farmer_id from token when component mounts
    const getFarmerId = async () => {
      try {
        const userToken = await AsyncStorage.getItem("userToken");
        if (userToken) {
          const tokenParts = userToken.split(".");
          const tokenPayload = JSON.parse(atob(tokenParts[1]));
          const userId = tokenPayload.user_id;

          setFormData((prev) => ({
            ...prev,
            farmer_id: userId,
          }));
        } else {
          navigation.replace("Login");
        }
      } catch (error) {
        console.error("Error getting farmer ID:", error);
        navigation.replace("Login");
      }
    };

    getFarmerId();

    // Request image picker permissions
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Sorry, we need camera roll permissions to make this work!"
        );
      }
    })();
  }, []);

  const selectImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        type: "image",
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        const fileName = `product_${Date.now()}.jpg`;
        const folder = "products";
        const imageUrl = await uploadImage(
          result.assets[0].base64,
          folder,
          fileName
        );
        console.log("Uploaded image URL:", imageUrl);
        const base64 = await fetch(imageUrl)
          .then((response) => response.blob())
          .then((blob) => {
            return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
          });

        setSelectedImage(imageUrl);
        setFormData({ ...formData, img: imageUrl });
      }
    } catch (error) {
      console.error("Error selecting image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleSubmit = async () => {
    try {
      // Basic validation
      if (
        !formData.name ||
        !formData.quantity_in_kg ||
        !formData.rate_per_kg ||
        !formData.farmer_phone_number
      ) {
        Alert.alert("Error", "Please fill all required fields");
        return;
      }

      if (!formData.img) {
        Alert.alert("Error", "Please select a product image");
        return;
      }

      if (!["Jari", "Mushroom"].includes(formData.type)) {
        Alert.alert("Error", "Invalid product type");
        return;
      }

      // Create base payload
      const payload = {
        ...formData,
        quantity_in_kg: parseFloat(formData.quantity_in_kg),
        rate_per_kg: parseFloat(formData.rate_per_kg),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Handle product type specific fields
      if (formData.type === "Jari") {
        if (!formData.jari_size) {
          Alert.alert("Error", "Please select a jari size");
          return;
        }
      } else {
        // For Mushroom products, remove jari_size
        delete payload.jari_size;
      }

      const userToken = await AsyncStorage.getItem("userToken");
      if (!userToken) {
        navigation.replace("Login");
        return;
      }

      // Get user_id from JWT token
      const tokenParts = userToken.split(".");
      const tokenPayload = JSON.parse(atob(tokenParts[1]));
      const userId = tokenPayload.user_id;

      console.log("Creating product with payload:", payload); // Debug log

      const response = await fetch(
        `https://krishi-bazar.onrender.com/api/v1/user/${userId}/newproduct`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create product");
      }

      Alert.alert("Success", "Product created successfully");

      // Reset form with correct initial state based on type
      setFormData({
        img: "",
        farmer_id: userId,
        name: "",
        type: "Jari", // Keep default as Jari
        quantity_in_kg: "",
        rate_per_kg: "",
        jari_size: "small", // Only relevant for Jari
        expected_delivery: null,
        farmer_phone_number: "",
      });
      setSelectedImage(null);

      // Navigate back or to product list
      navigation.goBack();
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      Alert.alert("Error", error.message || "An unexpected error occurred");
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData({
        ...formData,
        expected_delivery: selectedDate.toISOString(),
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={normalize(24)} color="#333" />
        </TouchableOpacity>

        <Text style={styles.title}>Create New Product</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Product Image *</Text>
          <TouchableOpacity
            style={styles.imagePickerButton}
            onPress={selectImage}
          >
            <Text style={styles.imagePickerButtonText}>
              {selectedImage ? "Change Image" : "Select Image"}
            </Text>
          </TouchableOpacity>
          {selectedImage && (
            <View style={styles.imagePreviewContainer}>
              <Image
                source={{ uri: selectedImage }}
                style={styles.imagePreview}
                resizeMode="cover"
              />
            </View>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Product Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="Enter product name"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Product Type *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.type}
              onValueChange={(value) =>
                setFormData({ ...formData, type: value })
              }
              style={styles.picker}
            >
              <Picker.Item label="Jari" value="Jari" />
              <Picker.Item label="Mushroom" value="Mushroom" />
            </Picker>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Quantity (kg) *</Text>
          <TextInput
            style={styles.input}
            value={formData.quantity_in_kg}
            onChangeText={(text) =>
              setFormData({ ...formData, quantity_in_kg: text })
            }
            keyboardType="decimal-pad"
            placeholder="Enter quantity in kg"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Rate per kg *</Text>
          <TextInput
            style={styles.input}
            value={formData.rate_per_kg}
            onChangeText={(text) =>
              setFormData({ ...formData, rate_per_kg: text })
            }
            keyboardType="decimal-pad"
            placeholder="Enter rate per kg"
            placeholderTextColor="#666"
          />
        </View>

        {formData.type === "Jari" && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Jari Size</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.jari_size}
                onValueChange={(value) =>
                  setFormData({ ...formData, jari_size: value })
                }
                style={styles.picker}
              >
                <Picker.Item label="Small" value="small" />
                <Picker.Item label="Medium" value="medium" />
                <Picker.Item label="Large" value="large" />
              </Picker>
            </View>
          </View>
        )}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Expected Delivery</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>
              {formData.expected_delivery
                ? new Date(formData.expected_delivery).toLocaleDateString()
                : "Select Date"}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={new Date()}
              mode="date"
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Phone Number *</Text>
          <TextInput
            style={styles.input}
            value={formData.farmer_phone_number}
            onChangeText={(text) =>
              setFormData({ ...formData, farmer_phone_number: text })
            }
            keyboardType="phone-pad"
            placeholder="Enter phone number"
            placeholderTextColor="#666"
          />
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Create Product</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    padding: normalize(20),
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    marginBottom: normalize(15),
  },
  title: {
    fontSize: normalize(28),
    fontWeight: "bold",
    marginBottom: normalize(25),
    color: "#1a1a1a",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  formGroup: {
    marginBottom: normalize(20),
  },
  label: {
    fontSize: normalize(16),
    marginBottom: normalize(8),
    fontWeight: "600",
    color: "#333",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    borderRadius: normalize(12),
    padding: normalize(15),
    fontSize: normalize(16),
    backgroundColor: "#F8F9FA",
    color: "#333",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  pickerContainer: {
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    borderRadius: normalize(12),
    backgroundColor: "#F8F9FA",
    overflow: "hidden",
  },
  picker: {
    height: normalize(50),
  },
  dateButton: {
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    borderRadius: normalize(12),
    padding: normalize(15),
    backgroundColor: "#F8F9FA",
  },
  dateButtonText: {
    fontSize: normalize(16),
    color: "#333",
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  submitButton: {
    backgroundColor: "#2E7D32",
    padding: normalize(18),
    borderRadius: normalize(12),
    alignItems: "center",
    marginVertical: normalize(20),
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: normalize(18),
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  imagePickerButton: {
    backgroundColor: "#1976D2",
    padding: normalize(15),
    borderRadius: normalize(12),
    alignItems: "center",
    marginBottom: normalize(10),
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  imagePickerButtonText: {
    fontSize: normalize(16),
    color: "#FFFFFF",
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
  },
  imagePreviewContainer: {
    alignItems: "center",
    marginTop: normalize(15),
  },
  imagePreview: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: normalize(15),
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
});

export default CreateProductScreen;
