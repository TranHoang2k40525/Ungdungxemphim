import React from "react";  
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { UserProvider } from "./contexts/UserContext"; // Import UserProvider
import Home from "./screens/Home/Home";
import Login from "./screens/Auth/Login";
import Register from "./screens/Auth/Register";
import Profile from "./screens/User/Profile";
import ThongTin from "./screens/User/ThongTin";
import MovieDetailScreen from "./screens/Movies/MovieDetailScreen";
import WatchHistoryScreen from "./screens/User/WatchHistoryScreen";
import ForgotPassword from "./screens/User/ForgotPassword";


const Stack = createStackNavigator();

export default function App() {
  return (
    <UserProvider> 
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
          <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={Register} options={{ headerShown: false }} />
          <Stack.Screen name="Profile" component={Profile} options={{ headerShown: false }} />
          <Stack.Screen name="MovieDetailScreen" component={MovieDetailScreen} options={{ headerShown: false }} />
          <Stack.Screen name="WatchHistoryScreen" component={WatchHistoryScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ThongTin" component={ThongTin} options={{ headerShown: false }} />
          <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </UserProvider>
  );
}
