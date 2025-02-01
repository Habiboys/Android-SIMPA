import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  TextInput,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { Linking } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import axiosInstance from '../utils/axios-config';
import { APP_COLORS, ENDPOINTS } from '../config';
import  PhotoUploader from '../components/PhotoUploader';

const CustomSelect = ({ value, onValueChange, items = [], placeholder }) => {
  return (
    <View style={styles.pickerContainer}>
      <Picker
        selectedValue={value}
        onValueChange={onValueChange}
        style={styles.picker}
      >
        <Picker.Item label={placeholder} value="" />
        {Array.isArray(items) && items.map(item => (
          <Picker.Item
            key={item.id}
            label={item.nama || item.label || item.toString()}
            value={item.id}
          />
        ))}
      </Picker>
    </View>
  );
};


const FormScreen = ({ navigation }) => {
  const [proyek, setProyek] = useState(null);
  const [proyekList, setProyekList] = useState([]);
  const [gedung, setGedung] = useState(null);
  const [gedungList, setGedungList] = useState([]);
  const [ruangan, setRuangan] = useState(null);
  const [ruanganList, setRuanganList] = useState([]);
  const [unit, setUnit] = useState(null);
  const [unitList, setUnitList] = useState([]);
  
  const [variabelPemeriksaan, setVariabelPemeriksaan] = useState([]);
  const [hasilPemeriksaan, setHasilPemeriksaan] = useState([]);
  const [variabelPembersihan, setVariabelPembersihan] = useState([]);
  const [hasilPembersihan, setHasilPembersihan] = useState([]);
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [paletIndoorPhoto, setPaletIndoorPhoto] = useState(null);
  const [paletOutdoorPhoto, setPaletOutdoorPhoto] = useState(null);

  useEffect(() => {
    loadProyek();
  }, []);

  const selectedUnit = unitList.find(u => u.id === parseInt(unit));
const isIndoor = selectedUnit?.detailModel.kategori === 'indoor';
const isOutdoor = selectedUnit?.detailModel.kategori === 'outdoor';

  const loadProyek = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/proyek');
      setProyekList(response.data || []);
    } catch (error) {
      console.error('Error loading proyek:', error);
      if (error.response?.status === 401) {
        navigation.replace('Login');
      } else {
        Alert.alert('Error', 'Gagal memuat data proyek');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadGedung = async (proyekId) => {
    try {
      const selectedProyek = proyekList.find(p => p.id === parseInt(proyekId));
      if (selectedProyek) {
        setGedungList(selectedProyek.gedung || []);
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal memuat data gedung');
    }
  };

  const loadRuangan = async (proyekId, gedungId) => {
    try {
      const response = await axiosInstance.get(
        `${ENDPOINTS.PROYEK}/${proyekId}/gedung/${gedungId}/ruangan`
      );
      setRuanganList(response.data || []);
    } catch (error) {
      Alert.alert('Error', 'Gagal memuat data ruangan');
    }
  };

  const loadUnit = async (ruanganId) => {
    try {
      const response = await axiosInstance.get(`${ENDPOINTS.UNIT}/ruangan/${ruanganId}`);
      setUnitList(response.data || []);
    } catch (error) {
      Alert.alert('Error', 'Gagal memuat data unit');
    }
  };

  const loadVariabelPemeriksaan = async (kategori) => {
    try {
      setLoading(true);
      const [responsePemeriksaan, responsePembersihan] = await Promise.all([
        axiosInstance.get(`${ENDPOINTS.VARIABLE_PEMERIKSAAN}/kategori/${kategori}`),
        axiosInstance.get(`${ENDPOINTS.VARIABLE_PEMBERSIHAN}/kategori/${kategori}`)
      ]);

      setVariabelPemeriksaan(responsePemeriksaan.data || []);
      setHasilPemeriksaan(
        responsePemeriksaan.data.map(v => ({
          id_variable_pemeriksaan: v.id,
          nilai: 'Normal'
        })) || []
      );

      setVariabelPembersihan(responsePembersihan.data || []);
      setHasilPembersihan(
        responsePembersihan.data.map(v => ({
          id_variable_pembersihan: v.id,
          sebelum: '',
          sesudah: ''
        })) || []
      );
    } catch (error) {
      Alert.alert('Error', 'Gagal memuat variabel pemeriksaan dan pembersihan');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setUnit(null);
    setUnitList([]);
    setVariabelPemeriksaan([]);
    setHasilPemeriksaan([]);
    setVariabelPembersihan([]);
    setHasilPembersihan([]);
    setPhotos([]);
    setPaletIndoorPhoto(null);
    setPaletOutdoorPhoto(null);
  };

  const handleSubmit = async () => {
    try {
      if (!unit || hasilPemeriksaan.length === 0 || photos.length < 2) {
        Alert.alert('Error', 'Semua data harus diisi lengkap');
        return;
      }

      if (hasilPemeriksaan.some(hp => !hp.nilai)) {
        Alert.alert('Error', 'Semua hasil pemeriksaan harus diisi');
        return;
      }

      if (hasilPembersihan.some(hp => !hp.sebelum || !hp.sesudah)) {
        Alert.alert('Error', 'Semua hasil pembersihan harus diisi');
        return;
      }
     if (isIndoor && !paletIndoorPhoto) {
  Alert.alert('Error', 'Foto palet indoor harus diisi');
  return;
}

if (isOutdoor && !paletOutdoorPhoto) {
  Alert.alert('Error', 'Foto palet outdoor harus diisi');
  return;
}

      // const selectedUnit = unitList.find(u => u.id === parseInt(unit));
     
      
      const payload = {
  id_unit: parseInt(unit),
  tanggal: new Date().toISOString().split('T')[0],
  nama_pemeriksaan: 'Pemeriksaan Rutin',
  kategori: selectedUnit?.detailModel.kategori,
  hasil_pemeriksaan: hasilPemeriksaan,
  hasil_pembersihan: hasilPembersihan.map(hp => ({
    ...hp,
    sebelum: parseFloat(hp.sebelum),
    sesudah: parseFloat(hp.sesudah)
  })),
  foto: photos.map(p => ({
    foto: p.foto,
    status: p.status,
    nama: p.nama // Pastikan nama foto disertakan
  })),
  palet_indoor: isIndoor ? paletIndoorPhoto : null, // Hanya kirim jika indoor
  palet_outdoor: isOutdoor ? paletOutdoorPhoto : null // Hanya kirim jika outdoor
};

      setLoading(true);
      await axiosInstance.post(ENDPOINTS.MAINTENANCE, payload);
      
      Alert.alert('Sukses', 'Data berhasil disimpan', [
        { 
          text: 'OK',
          onPress: () => {
            resetForm();
            if (ruangan) {
              loadUnit(ruangan);
            }
          }
        }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Gagal menyimpan data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
     <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Form Pemeriksaan AC</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Location Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pilih Lokasi</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Proyek</Text>
            <CustomSelect 
              value={proyek}
              onValueChange={(value) => {
                setProyek(value);
                loadGedung(value);
                setGedung(null);
                setRuangan(null);
              }}
              items={proyekList}
              placeholder="Pilih Proyek"
            />
          </View>

          {proyek && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Gedung</Text>
              <CustomSelect
                value={gedung}
                onValueChange={(value) => {
                  setGedung(value);
                  loadRuangan(proyek, parseInt(value));
                  setRuangan(null);
                }}
                items={gedungList}
                placeholder="Pilih Gedung"
              />
            </View>
          )}

          {gedung && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Ruangan</Text>
              <CustomSelect
                value={ruangan}
                onValueChange={(value) => {
                  setRuangan(value);
                  loadUnit(value);
                }}
                items={ruanganList}
                placeholder="Pilih Ruangan"
              />
            </View>
          )}

          {ruangan && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Unit AC</Text>
              <CustomSelect
                value={unit}
                onValueChange={(value) => {
                  setUnit(value);
                  const selectedUnit = unitList.find(u => u.id === parseInt(value));
                  if (selectedUnit?.detailModel.kategori) {
                    loadVariabelPemeriksaan(selectedUnit.detailModel.kategori);
                  }
                }}
                items={unitList.map(unit => ({
                  id: unit.id,
                  nama: `${unit.detailModel?.nama_model || 'N/A'}/${unit.nomor_seri} (${unit.detailModel.kategori}) - ${unit.detailModel.jenisModel.merek.nama}`
                }))} 
                placeholder="Pilih Unit AC"
              />
            </View>
          )}
        </View>

        {/* Hasil Pemeriksaan dan Pembersihan */}
        {unit && !loading && (
          <>
            {hasilPemeriksaan.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Hasil Pemeriksaan</Text>
                {hasilPemeriksaan.map((hp, index) => (
                  <View key={index} style={styles.pemeriksaanItem}>
                    <Text style={styles.label}>
                      {variabelPemeriksaan[index]?.nama_variable}
                    </Text>
                    <CustomSelect
                      value={hp.nilai}
                      onValueChange={(value) => {
                        const newHasil = [...hasilPemeriksaan];
                        newHasil[index].nilai = value;
                        setHasilPemeriksaan(newHasil);
                      }}
                      items={[
                        { id: 'Normal', nama: 'Normal' },
                        { id: 'Peringatan', nama: 'Peringatan' },
                        { id: 'Tidak Bagus', nama: 'Tidak Bagus' }
                      ]}
                      placeholder="Pilih hasil"
                    />
                  </View>
                ))}
              </View>
            )}

            {hasilPembersihan.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Hasil Pembersihan</Text>
                {hasilPembersihan.map((hp, index) => (
                  <View key={index} style={styles.pembersihanItem}>
                    <Text style={styles.label}>
                      {variabelPembersihan[index]?.nama_variable}
                    </Text>
                    <View style={styles.pembersihanInputContainer}>
                      <View style={styles.pembersihanInputItem}>
                        <Text style={styles.sublabel}>Sebelum</Text>
                        <TextInput
                          style={styles.numericInput}
                          value={hp.sebelum.toString()}
                          onChangeText={(value) => {
                            const newHasil = [...hasilPembersihan];
                            newHasil[index].sebelum = value;
                            setHasilPembersihan(newHasil);
                          }}
                          keyboardType="decimal-pad"
                          placeholder="Masukkan nilai"
                        />
                      </View>
                      
                      <View style={styles.pembersihanInputItem}>
                        <Text style={styles.sublabel}>Sesudah</Text>
                        <TextInput
                          style={styles.numericInput}
                          value={hp.sesudah.toString()}
                          onChangeText={(value) => {
                            const newHasil = [...hasilPembersihan];
                            newHasil[index].sesudah = value;
                            setHasilPembersihan(newHasil);
                          }}
                          keyboardType="decimal-pad"
                          placeholder="Masukkan nilai"
                        />
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
         {/* Updated Palet Photos Section */}
        <View style={styles.section}>
  <Text style={styles.sectionTitle}>Foto Palet Unit</Text>
  
  {/* Indoor Pallet Photo */}
  {isIndoor && (
    <View style={styles.photoContainer}>
      <Text style={styles.photoLabel}>Foto Palet Unit Indoor</Text>
      <Text style={styles.photoDescription}>
        Upload foto palet unit indoor untuk dokumentasi pemeliharaan.
      </Text>
    <PhotoUploader
  mode="single"
  photo={paletIndoorPhoto}
  setPhoto={setPaletIndoorPhoto}
/>
    </View>
  )}

  {/* Outdoor Pallet Photo */}
  {isOutdoor && (
    <View style={styles.photoContainer}>
      <Text style={styles.photoLabel}>Foto Palet Unit Outdoor</Text>
      <Text style={styles.photoDescription}>
        Upload foto palet unit outdoor untuk dokumentasi pemeliharaan.
      </Text>
  <PhotoUploader
  mode="single"
  photo={paletOutdoorPhoto}
  setPhoto={setPaletOutdoorPhoto}
/>
    </View>
  )}
</View>

        {/* Photo Section */}
        <View style={styles.section}>
  <Text style={styles.sectionTitle}>Dokumentasi  </Text>
  <Text style={styles.photoDescription}>
    Unggah foto Filter, Evaporator, Condensor, dan Drain Pan Condition sebagai dokumentasi sebelum/sesudah pemeliharaan.
  </Text>

  <View style={styles.photoSection}>
    {/* Foto Sebelum */}
    <View style={styles.photoContainer}>
      <Text style={styles.photoLabel}>Foto Sebelum Pemeliharaan</Text>
      {/* <Text style={styles.sublabel}>Dokumentasikan kondisi sebelum pembersihan atau perbaikan.</Text> */}
     <PhotoUploader
        mode="multiple" // Mode untuk unggah banyak foto
        photos={photos} // State untuk menyimpan daftar foto
        setPhotos={setPhotos} // Fungsi untuk memperbarui state foto
        status="sebelum" // Status untuk mengelompokkan foto
      />
    </View>

    {/* Divider */}
    <View style={styles.divider} />

    {/* Foto Sesudah */}
    <View style={styles.photoContainer}>
      <Text style={styles.photoLabel}>Foto Sesudah Pemeliharaan</Text>
      {/* <Text style={styles.sublabel}>Unggah foto setelah proses pembersihan atau perbaikan selesai.</Text> */}
      <PhotoUploader
        mode="multiple"
        photos={photos}
        setPhotos={setPhotos}
        status="sesudah"
      />
    </View>
  </View>
</View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>Kirim Hasil Pemeriksaan</Text>
        </TouchableOpacity>
      </View>
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
    paddingTop: 40, // Safe area for notch
    height: 100, // Total header height
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 15, // Reduced top padding since header is separate
    paddingBottom: 100, // Space for footer
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: APP_COLORS.text,
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
  pemeriksaanItem: {
    marginBottom: 15,
  },
  pembersihanItem: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  pembersihanInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  pembersihanInputItem: {
    flex: 1,
    marginHorizontal: 5,
  },
  sublabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  numericInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    textAlign: 'center',
  },
  photoSection: {
    marginTop: 10,
  },
  photoContainer: {
    marginBottom: 20,
  },
  photoLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: APP_COLORS.text,
  },
  photoUploaderContainer: {
    marginTop: 10,
  },
  pickImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  pickImageButtonText: {
    color: APP_COLORS.primary,
    fontSize: 16,
  },
  photoPreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  photoPreviewItem: {
    width: '45%',
    margin: '2%',
    position: 'relative',
  },
  photoThumbnail: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  deletePhotoButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  submitButton: {
    backgroundColor: APP_COLORS.success,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    padding: 10,
  },
  pickImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: APP_COLORS.primary,
    borderRadius: 8,
    marginBottom: 10,
  },
  pickImageButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  photoDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 15,
  },
   photoName: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
   photoNameInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    marginBottom: 10,
  },
});

export default FormScreen;