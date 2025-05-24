import { View, Text } from "react-native";
import "./../../global.css";
import { GluestackUIProvider } from "./../UI/gluestack-ui-provider";
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
//screens
import HomeScreen from "./../HomeScreen/HomeScreen";
import ExploreScreen from "./../ExploreScreen/ExploreScreen";
import ProfileScreen from "./../ProfileScreen/ProfileScreen";
import ProfileStack from "./ProfileStack";
import ViewOrders from "./../HomeScreen/ViewOrders";
import SpecificOrder from "./../HomeScreen/SpecificOrder";
import ProductDetails from "../ExploreScreen/ProductDetails";
import ManageProducts from "./../HomeScreen/ManageProducts";
import ManageSpecificProduct from "./../HomeScreen/ManageSpecificProduct";
import ZariProducts from "./../HomeScreen/ZariProducts";
import MushroomProducts from "./../HomeScreen/MushroomProducts";
import BuyOrder from "./../ExploreScreen/CreateOrder";
import CreateProduct from "./../ProfileScreen/CreateProduct";
import ExploreStack from "./ExploreStack";
const Stack = createStackNavigator();
export default function HomeStack() {
  return (
    <GluestackUIProvider mode="light">
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Explore" component={ExploreScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="ViewOrders" component={ViewOrders} />
        <Stack.Screen name="SpecificOrder" component={SpecificOrder} />
        <Stack.Screen name="ProductDetails" component={ProductDetails} />
        <Stack.Screen name="ManageProducts" component={ManageProducts} />
        <Stack.Screen name="ZariProducts" component={ZariProducts} />
        <Stack.Screen name="MushroomProducts" component={MushroomProducts} />
        <Stack.Screen name="BuyOrder" component={BuyOrder} />
        <Stack.Screen name="ExploreStack" component={ExploreStack} />
        <Stack.Screen
          name="ManageSpecificProduct"
          component={ManageSpecificProduct}
        />
        <Stack.Screen
          name="CreateProduct"
          component={CreateProduct}
          options={{ tabBarStyle: { display: "none" } }}
        />
      </Stack.Navigator>
    </GluestackUIProvider>
  );
}
