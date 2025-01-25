// StackNavigator.js
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import FormScreen from '../screens/FormScreen';

const Stack = createStackNavigator();

export default function StackNavigator({ initialRouteName = 'Login' }) {
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Form" component={FormScreen} />
    </Stack.Navigator>
  );
}