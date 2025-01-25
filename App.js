// App.js
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import FormScreen from './screens/FormScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Login');

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (accessToken) {
        setInitialRoute('Home');
      }
    } catch (error) {
      console.log('Error checking login status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Form" component={FormScreen} />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});