import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import axiosInstance from '../utils/axios-config';
import { APP_COLORS, ENDPOINTS } from '../config';
import { Picker } from '@react-native-picker/picker';

const HistoryScreen = ({ navigation }) => {
  const [proyekList, setProyekList] = useState([]);
  const [selectedProyek, setSelectedProyek] = useState(null);
  const [loading, setLoading] = useState(false);
  const [maintenanceData, setMaintenanceData] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1); // Halaman saat ini
  const itemsPerPage = 10; // Jumlah item per halaman

  // Load proyek list on component mount
  useEffect(() => {
    loadProyek();
  }, []);

  const loadProyek = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/proyek');
      setProyekList(response.data || []);
    } catch (error) {
      console.error('Error loading proyek:', error);
      Alert.alert('Error', 'Gagal memuat data proyek');
    } finally {
      setLoading(false);
    }
  };

  const fetchMaintenanceData = async () => {
    if (!selectedProyek) {
      Alert.alert('Error', 'Silakan pilih proyek terlebih dahulu');
      return;
    }

    try {
      setLoading(true);
      const params = {};
      if (startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }

      const response = await axiosInstance.get(
        `${ENDPOINTS.MAINTENANCE}/project/${selectedProyek}`,
        { params }
      );
      setMaintenanceData(response.data || []);
    } catch (error) {
      console.error('Error fetching maintenance data:', error);
      Alert.alert('Error', 'Gagal memuat data maintenance');
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk mendapatkan data untuk halaman saat ini
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return maintenanceData.slice(startIndex, endIndex);
  };

  // Fungsi untuk mengubah halaman
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(maintenanceData.length / itemsPerPage)) {
      setCurrentPage(newPage);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Riwayat Pemeriksaan</Text>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Proyek Picker */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Pilih Proyek</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedProyek}
              onValueChange={(value) => setSelectedProyek(value)}
              style={styles.picker}
            >
              <Picker.Item label="Pilih Proyek" value={null} />
              {proyekList.map((proyek) => (
                <Picker.Item key={proyek.id} label={proyek.nama} value={proyek.id} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Date Filter */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Rentang Tanggal (Opsional)</Text>
          <View style={styles.dateInputContainer}>
            <TextInput
              style={styles.dateInput}
              placeholder="Tanggal Mulai (YYYY-MM-DD)"
              value={startDate}
              onChangeText={setStartDate}
              keyboardType="default"
            />
            <TextInput
              style={styles.dateInput}
              placeholder="Tanggal Akhir (YYYY-MM-DD)"
              value={endDate}
              onChangeText={setEndDate}
              keyboardType="default"
            />
          </View>
        </View>

        {/* Fetch Button */}
        <TouchableOpacity style={styles.fetchButton} onPress={fetchMaintenanceData}>
          <Text style={styles.fetchButtonText}>Tampilkan Data</Text>
        </TouchableOpacity>

        {/* Maintenance List */}
        {loading ? (
          <ActivityIndicator size="large" color={APP_COLORS.primary} />
        ) : (
          <View style={styles.listContainer}>
            {maintenanceData.length === 0 ? (
              <Text style={styles.noDataText}>Tidak ada data maintenance.</Text>
            ) : (
              getCurrentPageData().map((item) => (
                <View key={item.id} style={styles.listItem}>
                  <Text style={styles.listItemTitle}>
                    {new Date(item.tanggal).toLocaleDateString('id-ID')}
                  </Text>
                  <Text style={styles.listItemSubtitle}>
                    Unit: {item.unit?.detailModel?.nama_model || 'N/A'} -{' '}
                    {item.unit?.nomor_seri || 'N/A'}
                  </Text>
                </View>
              ))
            )}
          </View>
        )}

        {/* Pagination Controls */}
        {maintenanceData.length > 0 && (
          <View style={styles.paginationContainer}>
            <TouchableOpacity
              style={[styles.paginationButton, currentPage === 1 && styles.disabledButton]}
              onPress={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <Text style={styles.paginationButtonText}>Previous</Text>
            </TouchableOpacity>
            <Text style={styles.pageInfo}>
              Halaman {currentPage} dari {Math.ceil(maintenanceData.length / itemsPerPage)}
            </Text>
            <TouchableOpacity
              style={[
                styles.paginationButton,
                currentPage === Math.ceil(maintenanceData.length / itemsPerPage) &&
                  styles.disabledButton,
              ]}
              onPress={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === Math.ceil(maintenanceData.length / itemsPerPage)}
            >
              <Text style={styles.paginationButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingTop: 30,
    height: 100,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    elevation: 2,
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    fontSize: 32,
    color: APP_COLORS.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: APP_COLORS.text,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    color: '#666',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  picker: {
    height: 55,
    backgroundColor: 'transparent',
  },
  dateInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    marginRight: 5,
  },
  fetchButton: {
    backgroundColor: APP_COLORS.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  fetchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    marginTop: 20,
  },
  listItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: APP_COLORS.text,
  },
  listItemSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  noDataText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  paginationButton: {
    backgroundColor: APP_COLORS.primary,
    padding: 10,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  paginationButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  pageInfo: {
    fontSize: 14,
    color: '#666',
  },
});

export default HistoryScreen;