import { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { ENDPOINTS, APP_STYLES, APP_COLORS } from '../config';
import { AntDesign } from '@expo/vector-icons'; 

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post(ENDPOINTS.LOGIN, { username, password });

      if (response.data?.accessToken && response.data?.refreshToken) {
        await AsyncStorage.setItem('accessToken', response.data.accessToken);
        await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
        navigation.replace('Home');
      } else {
        Alert.alert('Login Gagal', 'Token tidak ditemukan');
      }
    } catch (error) {
      Alert.alert('Error', 'Terjadi kesalahan saat login');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.logoContainer}>
        <AntDesign name="API" size={80} color={APP_COLORS.primary} />
        <Text style={styles.title}>SIMPA</Text>
        <Text style={styles.subtitle}>Sistem Informasi Manajemen{'\n'}Pemeliharaan AC</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <AntDesign name="user" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <AntDesign name="lock" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          style={styles.loginButton}
          onPress={handleLogin}
        >
          <Text style={styles.loginButtonText}>Masuk</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>CV Suralaya © 2025</Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    ...APP_STYLES.container,
    justifyContent: 'space-between',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: APP_COLORS.primary,
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
    backgroundColor: APP_COLORS.white,
  },
  inputIcon: {
    padding: 15,
  },
  input: {
    flex: 1,
    height: 50,
    paddingRight: 15,
  },
  loginButton: {
    ...APP_STYLES.button,
    marginTop: 10,
  },
  loginButtonText: {
    ...APP_STYLES.buttonText,
  },
  footer: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
});