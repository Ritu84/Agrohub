import React from "react";
import "./../../global.css";
import { GluestackUIProvider } from "./../UI/gluestack-ui-provider"
import { createStackNavigator } from "@react-navigation/stack";
//screens
import WelcomeScreen from '../WelcomeScreen';
import LoginScreen from '../LoginScreen';
import SignupScreen from '../SignupScreen';
import OtpScreen from '../OtpScreen';
import HomeScreen from "../HomeScreen/HomeScreen";

const Stack= createStackNavigator();
export default  function AuthStack() {
    return (
        <GluestackUIProvider mode="light">
            <Stack.Navigator screenOptions={{headerShown: false}}>
                <Stack.Screen name="Welcome" component={WelcomeScreen}/>
                <Stack.Screen name="SignUp" component={SignupScreen}/>
                <Stack.Screen name="Login" component={LoginScreen}/>
                <Stack.Screen name="OTPVerification" component={OtpScreen}/>
                {/* <Stack.Screen name="Home" component={HomeScreen}/> */}
            </Stack.Navigator>
        </GluestackUIProvider>
    );
}