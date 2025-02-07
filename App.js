import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';

import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import FormScreen from './screens/FormScreen';
import HistoryScreen from './screens/HistoryScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState('Login');
  const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  (async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (accessToken) {
        // Coba validasi accessToken menggunakan endpoint /auth/validate
        try {
          await axiosInstance.get('/auth/validate', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          // AccessToken valid, arahkan ke Home
          setInitialRoute('Home');
        } catch (error) {
          // AccessToken tidak valid, arahkan ke Login
          console.error('AccessToken tidak valid:', error);
          setInitialRoute('Login');
        }
      } else {
        // Tidak ada accessToken, arahkan ke Login
        setInitialRoute('Login');
      }
    } catch (error) {
      console.error('Error checking login status:', error);
      setInitialRoute('Login');
    } finally {
      setIsLoading(false);
    }
  })();
}, []);

  if (isLoading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Form" component={FormScreen} />
        <Stack.Screen
  name="History"
  component={HistoryScreen}
  options={{ title: 'Riwayat Pemeriksaan' }}
/>
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
