import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ScrollView,
  SafeAreaView,
  Dimensions,
  StatusBar,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_STYLES, APP_COLORS } from '../config';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';

const windowWidth = Dimensions.get('window').width;
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight;

export default function HomeScreen({ navigation }) {
  const handleLogout = () => {
    Alert.alert(
      "Konfirmasi Logout",
      "Apakah Anda yakin ingin keluar?",
      [
        { text: "Batal", style: "cancel" },
        { text: "Ya, Keluar", onPress: logoutProcess }
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
    <View style={styles.container}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={APP_COLORS.background}
        translucent={true}
      />
      
      {/* Header Fixed */}
      <View style={styles.headerFixed}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>SIMPA</Text>
          {/*<Text style={styles.headerSubtitle}>CV. Suralaya Teknik</Text>*/}
        </View>
      </View>

      {/* Main Content Scrollable */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Selamat Datang</Text>
          <Text style={styles.subText}>Sistem Informasi Manajemen Pemeliharaan AC</Text>
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
      </ScrollView>
      
      {/* Footer Fixed */}
      <View style={styles.footerContainer}>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <MaterialIcons name="logout" size={20} color={APP_COLORS.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_COLORS.background,
    paddingTop: STATUSBAR_HEIGHT, // Add padding for status bar
  },
  headerFixed: {
    backgroundColor: APP_COLORS.white,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: APP_COLORS.primary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  welcomeSection: {
    padding: 20,
    paddingTop: 30,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: APP_COLORS.text,
    textAlign: 'center',
  },
  subText: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  menuItem: {
    width: windowWidth < 380 ? '90%' : '43%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    margin: '3%',
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
    backgroundColor: APP_COLORS.background,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
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
    width: '100%',
  },
  logoutText: {
    marginLeft: 10,
    color: APP_COLORS.error,
    fontSize: 16,
    fontWeight: '500',
  },
});