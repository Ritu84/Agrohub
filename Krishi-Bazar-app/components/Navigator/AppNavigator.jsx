import React, { useEffect, useState } from "react";
import "./../../global.css";
import { GluestackUIProvider } from "./../UI/gluestack-ui-provider";
import { createStackNavigator } from "@react-navigation/stack";
//screens
import Authstack from "./AuthStack";
import RootTabs from "./RootTabs";
import { useAuth } from "../../Store/AuthContext";
import { View, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
const Stack = createStackNavigator();
export default function AppNavigator() {
  const context = useAuth();
  const { isAuthenticated, setIsAuthenticated } = context;

  const [isLoading, setIsLoading] = useState(true);
  // const [isAuth, setIsAuth] = useState(false);
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");

        if (!!token) {
          console.log("User is authenticated");
          // redirect to home screen
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [context]);

  if (isLoading) {
    return (
      <GluestackUIProvider mode="light">
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text>Loading...</Text>
        </View>
      </GluestackUIProvider>
    );
  }

  return (
    <GluestackUIProvider mode="light">
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="AuthStack" component={Authstack} />
        ) : (
          <Stack.Screen name="RootTabs" component={RootTabs} />
        )}
        {/* <Stack.Screen name="Home" component={HomeScreen}/> */}
      </Stack.Navigator>
    </GluestackUIProvider>
  );
}
