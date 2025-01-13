import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ScrollView,
  SafeAreaView,
  Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_STYLES, APP_COLORS } from '../config';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';

const windowWidth = Dimensions.get('window').width;

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
          onPress: logoutProcess
        }
      ]
    );
  };

  const logoutProcess = async () => {
    try {
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.welcomeText}>Selamat Datang</Text>
            <Text style={styles.subText}>SIMPA - CV. Suralaya Teknik</Text>
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
        </View>
      </ScrollView>
      
      <View style={styles.footerContainer}>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <MaterialIcons name="logout" size={20} color={APP_COLORS.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: APP_COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 16, // Mengurangi padding agar lebih seimbang
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: 'center', // Menengahkan header
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: APP_COLORS.text,
    textAlign: 'center', // Menengahkan text
  },
  subText: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
    textAlign: 'center', // Menengahkan text
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8, // Menambah padding horizontal untuk spacing
    justifyContent: 'center', // Menengahkan grid
  },
  menuItem: {
    width: windowWidth < 380 ? '90%' : '43%', // Menyesuaikan lebar
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    margin: '3%', // Menggunakan margin persentase yang sama
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
    paddingHorizontal: 5,
  },
  footerContainer: {
    padding: 20,
    paddingBottom: 25, // Menambah padding bottom
    backgroundColor: APP_COLORS.background,
    alignItems: 'center', // Menengahkan footer
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
    width: '90%', // Menyesuaikan lebar button
    maxWidth: 400, // Maksimum lebar
  },
  logoutText: {
    marginLeft: 10,
    color: APP_COLORS.error,
    fontSize: 16,
    fontWeight: '500',
  },
});