import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Dimensions
} from 'react-native';
import { APP_COLORS, APP_STYLES } from '../config';
import { AntDesign } from '@expo/vector-icons';

const LoadingScreen = () => {
  // Membuat animasi untuk logo
  const fadeAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Membuat animasi berulang untuk efek pulsing
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <AntDesign name="API" size={80} color={APP_COLORS.primary} />
        </Animated.View>
        
        <Text style={styles.title}>SIMPA</Text>
        <Text style={styles.subtitle}>
          Sistem Informasi Manajemen{'\n'}Pemeliharaan AC
        </Text>
        
        <ActivityIndicator 
          size="large" 
          color={APP_COLORS.primary} 
          style={styles.loader}
        />
      </View>
      
      <Text style={styles.footer}>CV. Suralaya Teknik © 2025</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_COLORS.background,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: APP_COLORS.primary,
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  loader: {
    marginTop: 20,
  },
  footer: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
});

export default LoadingScreen;