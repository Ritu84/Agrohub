import "./../global.css";
import { GluestackUIProvider } from "../components/UI/gluestack-ui-provider";
import React, { useState, useEffect } from "react";
import {
  NavigationIndependentTree,
  KeyboardAvoidingView,
  Platform,
  NavigationContainer,
} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Text, View, SafeAreaView, StyleSheet } from "react-native";
import RootTabs from "../components/Navigator/RootTabs";
import AuthStack from "../components/Navigator/AuthStack";
import { AuthProvider, useAuth } from "./../Store/AuthContext";
import OtpScreen from "../components/OtpScreen";

import AppNavigator from "../components/Navigator/AppNavigator";

export default function Index() {
  return (
    <AuthProvider>
      <GluestackUIProvider mode="light">
        <View style={styles.container}>
          <AppNavigator />
        </View>
      </GluestackUIProvider>
    </AuthProvider>
  );
}
//
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
