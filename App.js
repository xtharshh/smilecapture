import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AppUI from './components/AppUI'; // Make sure this path is correct
import StatsScreen from './screens/StatsScreen'; // Make sure this path is correct
import CameraScreen from './components/CameraScreen'; // Assuming you have this

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={AppUI} />
        <Stack.Screen name="Stats" component={StatsScreen} />
        <Stack.Screen name="Camera" component={CameraScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}