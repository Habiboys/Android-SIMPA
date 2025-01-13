import { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  Keyboard,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { ENDPOINTS, APP_STYLES, APP_COLORS } from '../config';
import { AntDesign, Ionicons } from '@expo/vector-icons'; 

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Listen to keyboard events
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

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
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[
          styles.logoContainer,
          keyboardVisible && styles.logoContainerKeyboardVisible
        ]}>
          {/* <AntDesign name="API" size={80} color={APP_COLORS.primary} /> */}
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
              returnKeyType="next"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <AntDesign name="lock" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              returnKeyType="done"
            />
            <TouchableOpacity 
              style={styles.passwordToggle}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons 
                name={showPassword ? "eye-off" : "eye"} 
                size={20} 
                color="#666"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.loginButton}
            onPress={handleLogin}
          >
            <Text style={styles.loginButtonText}>Masuk</Text>
          </TouchableOpacity>
        </View>

        {!keyboardVisible && (
          <Text style={styles.footer}>CV. Suralaya Teknik © 2025</Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    ...APP_STYLES.container,
    justifyContent: 'space-between',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  logoContainerKeyboardVisible: {
    marginTop: -40, // Ubah ini menjadi nilai negatif untuk menggeser logo lebih ke atas
    transform: [{ scale: 0.8 }], // Mengecilkan ukuran logo saat keyboard muncul
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
    marginTop: -20, // Tambahkan margin negatif untuk menggeser form ke atas
    paddingBottom: 40, // Tambah padding bottom agar input tidak tertutup keyboard
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
  passwordToggle: {
    padding: 15,
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