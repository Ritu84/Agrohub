import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import "./../../global.css";
import { GluestackUIProvider } from "./../UI/gluestack-ui-provider";
import React from "react";
import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Colors } from "./../../constants/Colors";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeStack from "./HomeStack";
import ProfileStack from "./ProfileStack";
import ExploreStack from "./ExploreStack";

const Tab = createBottomTabNavigator();

export default function RootTabs() {
  return (
    <GluestackUIProvider mode="light">
      <View style={styles.container}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarInactiveTintColor: "#8A8A8A",
            tabBarActiveTintColor: "#0A71EB",
            tabBarHideOnKeyboard: true,
            tabBarStyle: {
              // backgroundColor: "rgba(255, 255, 255, 0.95)",
              // position: "absolute",
              // bottom: 25,
              // marginBottom: 25,
              // marginHorizontal: 20,
              height: 70,
              borderRadius: 20,
              paddingBottom: 10,
              paddingTop: 10,
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 4,
              },
              shadowOpacity: 0.15,
              shadowRadius: 10,
              elevation: 10,
              borderTopWidth: 0,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: "700",
              marginTop: 6,
            },
          })}
        >
          <Tab.Screen
            name="HomeTab"
            component={HomeStack}
            options={{
              tabBarLabel: "Home",
              tabBarIcon: ({ color, focused }) => (
                <View
                  style={[
                    styles.tabIconContainer,
                    focused && styles.tabIconActive,
                  ]}
                >
                  <Ionicons name="home-sharp" size={26} color={color} />
                </View>
              ),
            }}
          />
          <Tab.Screen
            name="ExploreTab"
            component={ExploreStack}
            options={{
              tabBarLabel: "Marketplace",
              tabBarIcon: ({ color, focused }) => (
                <View
                  style={[
                    styles.tabIconContainer,
                    focused && styles.tabIconActive,
                  ]}
                >
                  <AntDesign name="appstore1" size={26} color={color} />
                </View>
              ),
            }}
          />
          <Tab.Screen
            name="ProfileTab"
            component={ProfileStack}
            options={{
              tabBarLabel: "Profile",
              tabBarIcon: ({ color, focused }) => (
                <View
                  style={[
                    styles.tabIconContainer,
                    focused && styles.tabIconActive,
                  ]}
                >
                  <Ionicons name="person-sharp" size={26} color={color} />
                </View>
              ),
            }}
          />
        </Tab.Navigator>
      </View>
    </GluestackUIProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  tabIconContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  tabIconActive: {
    backgroundColor: "rgba(10, 113, 235, 0.1)",
  },
});
