import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_STYLES, APP_COLORS } from '../config';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  const handleLogout = () => {
    Alert.alert(
      "Konfirmasi Logout",
      "Apakah Anda yakin ingin keluar?",
      [
        {
          text: "Batal",
          style: "cancel"
        },
        {
          text: "Ya, Keluar",
          onPress: () => {
            // Langsung jalankan fungsi logoutProcess
            logoutProcess();
          }
        }
      ]
    );
  };

  const logoutProcess = async () => {
    try {
      // Hapus tokens
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      // Langsung navigate ke Login
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.log('Terjadi kesalahan saat logout:', error);
      Alert.alert('Error', 'Gagal melakukan logout');
    }
  };

  const menuItems = [
    {
      title: 'Kirim Hasil Pemeriksaan',
      icon: 'form',
      color: APP_COLORS.primary,
      onPress: () => navigation.navigate('Form')
    },
    {
      title: 'Riwayat Pemeriksaan',
      icon: 'profile',
      color: APP_COLORS.secondary,
      onPress: () => Alert.alert('Info', 'Fitur akan segera hadir')
    },
    {
      title: 'Jadwal Maintenance',
      icon: 'calendar',
      color: '#34C759',
      onPress: () => Alert.alert('Info', 'Fitur akan segera hadir')
    },
    {
      title: 'Pengaturan',
      icon: 'setting',
      color: '#FF9500',
      onPress: () => Alert.alert('Info', 'Fitur akan segera hadir')
    }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Selamat Datang</Text>
        <Text style={styles.subText}>CV Suralaya SIMPA</Text>
      </View>

      <View style={styles.menuGrid}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
              <AntDesign name={item.icon} size={24} color="white" />
            </View>
            <Text style={styles.menuText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <MaterialIcons name="logout" size={20} color={APP_COLORS.error} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...APP_STYLES.container,
    padding: 20,
  },
  header: {
    marginTop: 20,
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: APP_COLORS.text,
  },
  subText: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 10,
  },
  menuItem: {
    width: '45%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
    ...APP_STYLES.card,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    color: APP_COLORS.text,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: APP_COLORS.error,
    marginTop: 'auto',
    marginBottom: 20,
  },
  logoutText: {
    marginLeft: 10,
    color: APP_COLORS.error,
    fontSize: 16,
    fontWeight: '500',
  },
});