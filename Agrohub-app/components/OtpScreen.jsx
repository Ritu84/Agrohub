import {
  StyleSheet,
  ActivityIndicator,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
  SafeAreaView,
} from "react-native";
import "./../global.css";
import { GluestackUIProvider } from "./UI/gluestack-ui-provider";
import React, { useEffect, useState, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../Store/AuthContext";

const { width, height } = Dimensions.get("window");

const wp = (percentage) => {
  return (width * percentage) / 100;
};

const hp = (percentage) => {
  return (height * percentage) / 100;
};

const COLORS = {
  primary: "#1A5D1A",
  secondary: "#F4CE14",
  text: "#333333",
  textLight: "#666666",
  background: "#FFFFFF",
  border: "#E0E0E0",
  error: "#FF4D4D",
};

const OTP_LENGTH = 6;

const OTPInput = ({ value, onChange }) => {
  const inputRefs = useRef([]);

  const handleChange = (text, index) => {
    const newValue = (typeof value === "string" ? value : "").split("");
    newValue[index] = text;
    onChange(newValue.join(""));

    if (text.length === 1 && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  return (
    <View style={styles.otpInputContainer}>
      {[...Array(OTP_LENGTH)].map((_, index) => (
        <TextInput
          key={index}
          ref={(ref) => (inputRefs.current[index] = ref)}
          style={styles.otpInput}
          maxLength={1}
          keyboardType="number-pad"
          onChangeText={(text) => handleChange(text, index)}
          value={value[index] || ""}
        />
      ))}
    </View>
  );
};

export default function OtpScreen({ route, navigation }) {
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(1.5 * 60);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const requestBody = route?.params.requestBody;
  const flow = route?.params?.flow;
  const email = route?.params?.email;
  const aadhar = route?.params?.aadhar;

  const context = useAuth();
  const { setIsAuthenticated } = context;

  const [userData, setUserData] = useState(null);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    const getData = async () => {
      try {
        const storedData = await AsyncStorage.getItem("userData");
        console.log("retrieved data:", storedData);
        if (storedData !== null) {
          // Parse the stored data

          setUserData(JSON.parse(storedData));
        }
      } catch (e) {
        console.error("Failed to fetch data from AsyncStorage", e);
      }
    };
    getData();
  }, []);

  const handleResendOTP = async () => {
    setCanResend(false);
    setTimer(30);

    try {
      // Get stored login data
      const storedLoginData = await AsyncStorage.getItem("logindata");
      if (!storedLoginData) {
        Alert.alert("Error", "Login data not found. Please try again.");
        return;
      }

      const loginData = JSON.parse(storedLoginData);

      const response = await fetch(
        "https://krishi-bazar.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: loginData.email,
            aadhar_number: loginData.aadhar_number,
          }),
        }
      );

      const data = await response.json();
      console.log("Resend OTP Response:", data);

      if (!response.ok) {
        console.log("Error response:", data);
        Alert.alert("Error", data.message || "Failed to resend OTP");
      } else {
        Alert.alert("Success", "OTP resent to your email");
      }
    } catch (error) {
      console.error("Resend error:", error);
      Alert.alert("Error", "Network error. Please try again.");
    }
  };

  const checkHandler = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "RootTabs" }], // Make sure this name matches your tab navigator name
    });
  };
  const handleVerifyOTP = async () => {
    // Enhanced input validation
    if (!otp || otp.length !== 6 || !/^\d+$/.test(otp)) {
      Alert.alert("Invalid OTP", "Please enter a valid 6-digit numeric OTP");
      return;
    }
    console.log("userData in handleVerifyOTP:", userData);
    // Additional pre-verification checks
    if (flow === "signup" && !userData) {
      console.log(userData);

      Alert.alert(
        "Error",
        "Missing user data. Please restart the signup process."
      );
      return;
    }

    if (flow === "login" && (!email || !aadhar)) {
      Alert.alert(
        "Error",
        "Missing required information for login verification."
      );
      return;
    }

    setLoading(true);

    try {
      const endpoint =
        flow === "signup"
          ? "https://krishi-bazar.onrender.com/api/auth/complete-signup"
          : "https://krishi-bazar.onrender.com/api/auth/complete-login";

      const RequestBody =
        flow === "signup"
          ? { user: requestBody, verification_code: otp }
          : { email: email, aadhar_number: aadhar, verification_code: otp };

      console.log("Endpoint:", endpoint); // Debug log

      console.log("Request Body:", RequestBody); // Debug log

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(RequestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Verification failed");
      }

      const responseData = await response.json();
      console.log("Response Data:", responseData); // Debug log

      if (responseData.token) {
        try {
          // Decode the JWT to get user_id
          const tokenParts = responseData.token.split(".");
          const tokenPayload = JSON.parse(atob(tokenParts[1]));

          // Store token
          await AsyncStorage.setItem("userToken", responseData.token);

          // Store user data with ID from token
          const userDataToStore = {
            ...responseData.user,
            user_id: tokenPayload.user_id, // Get user_id from JWT payload
          };

          console.log("Storing user data:", userDataToStore); // Debug log
          await AsyncStorage.setItem(
            "userData",
            JSON.stringify(userDataToStore)
          );

          console.log("Token and user data stored successfully");
          setIsAuthenticated(true);
          // Clear sensitive data
          resetSensitiveState();

          // Navigate to main screen
          // navigation.reset({
          //   index: 0,
          //   routes: [{ name: "RootTabs" }],
          // });
        } catch (storageError) {
          console.error("Storage error:", storageError);
          Alert.alert("Error", "Failed to save session data");
        }
      } else {
        throw new Error("No token received from server");
      }
    } catch (error) {
      console.error("Verification error:", error);
      Alert.alert("Verification Failed", error.message || "Please try again");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to reset sensitive state (suggested addition)
  const resetSensitiveState = () => {
    setOtp("");
    // setPhoneNumber('');
    // setAadhar('');
    setUserData(null);
  };

  return (
    <GluestackUIProvider mode="light">
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Verify Your Account</Text>
            <Text style={styles.subtitle}>
              Enter the 6-digit code sent to your email
            </Text>
          </View>

          <View style={styles.otpContainer}>
            <OTPInput value={otp} onChange={setOtp} />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              (loading || otp.length !== 6) && styles.buttonDisabled,
            ]}
            onPress={handleVerifyOTP}
            disabled={loading || otp.length !== 6}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.buttonText}>Verify OTP</Text>
            )}
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            {!canResend ? (
              <Text style={styles.timerText}>
                Resend OTP in {Math.floor(timer / 30)}:
                {(timer % 30).toString().padStart(2, "0")}
              </Text>
            ) : (
              <TouchableOpacity
                onPress={handleResendOTP}
                style={styles.resendButton}
              >
                <Text style={styles.resendText}>Resend OTP</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
    </GluestackUIProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  container: {
    flex: 1,
    paddingHorizontal: wp(5),
    justifyContent: "center",
  },
  headerContainer: {
    marginBottom: hp(5),
    alignItems: "center",
    paddingHorizontal: wp(5),
  },
  title: {
    fontSize: wp(7),
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: hp(2),
    textAlign: "center",
  },
  subtitle: {
    fontSize: wp(4),
    color: COLORS.textLight,
    textAlign: "center",
    lineHeight: wp(5.5),
  },
  otpContainer: {
    alignItems: "center",
    marginBottom: hp(4),
  },
  otpInputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: wp(5),
  },
  otpInput: {
    width: wp(12),
    height: wp(12),
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: wp(3),
    fontSize: wp(5),
    textAlign: "center",
    backgroundColor: COLORS.background,
    color: COLORS.text,
    fontWeight: "bold",
    marginHorizontal: wp(1),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: hp(2),
    borderRadius: wp(3),
    alignItems: "center",
    marginHorizontal: wp(5),
    marginTop: hp(2),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: COLORS.textLight,
    elevation: 0,
  },
  buttonText: {
    color: COLORS.background,
    fontSize: wp(4.5),
    fontWeight: "bold",
  },
  resendContainer: {
    alignItems: "center",
    marginTop: hp(4),
  },
  timerText: {
    color: COLORS.textLight,
    fontSize: wp(4),
  },
  resendButton: {
    padding: wp(3),
  },
  resendText: {
    color: COLORS.primary,
    fontSize: wp(4),
    fontWeight: "bold",
  },
  errorText: {
    color: "#FF4D4D",
    fontSize: wp(3.5),
    textAlign: "center",
    marginTop: hp(2),
  },
});
