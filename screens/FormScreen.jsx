import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  Image,
  TextInput
} from 'react-native';
import { Picker } from 'react-native-web';
import axiosInstance from '../utils/axios-config';
import { APP_STYLES, APP_COLORS, ENDPOINTS } from '../config';
import { AntDesign, Camera } from '@expo/vector-icons';

const CustomSelect = ({ value, onValueChange, items = [], placeholder }) => {
  return (
    <select 
      value={value || ''} 
      onChange={(e) => onValueChange(e.target.value)}
      style={styles.webSelect}
    >
      <option value="">{placeholder}</option>
      {Array.isArray(items) && items.map(item => (
        <option key={item.id} value={item.id}>
          {item.nama || item.label || item.toString()}
        </option>
      ))}
    </select>
  );
};

const compressImage = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const image = document.createElement('img');
        image.onload = () => {
          const canvas = document.createElement('canvas');
          let width = image.width;
          let height = image.height;
  
          // Maksimum dimensi
          const MAX_WIDTH = 1024;
          const MAX_HEIGHT = 1024;
  
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
  
          canvas.width = width;
          canvas.height = height;
  
          const ctx = canvas.getContext('2d');
          ctx.drawImage(image, 0, 0, width, height);
  
          // Kompres dengan kualitas 0.7 (70%)
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          resolve(compressedBase64.split(',')[1]);
        };
        image.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };
  
  const PhotoUploader = ({ status, photos, setPhotos }) => {
    const [key, setKey] = useState(Date.now()); // Add key untuk force re-render input
    
    const handleFileUpload = async (e) => {
      const files = Array.from(e.target.files);
      
      for (const file of files) {
        try {
          const compressedBase64 = await compressImage(file);
          setPhotos(prev => [...prev, {
            foto: compressedBase64,
            status: status,
            filename: file.name
          }]);
        } catch (error) {
          console.error('Error compressing image:', error);
          Alert.alert('Error', 'Gagal memproses foto');
        }
      }
    };
  
    // useEffect untuk reset input file ketika photos berubah menjadi kosong
    useEffect(() => {
      if (photos.length === 0) {
        setKey(Date.now()); // Generate key baru untuk force re-render input
      }
    }, [photos]);
  
    return (
      <View style={styles.photoUploaderContainer}>
        <View style={styles.photoInputContainer}>
          <input
            key={key} // Gunakan key untuk force re-render input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            style={styles.fileInput}
          />
        </View>
        
        <View style={styles.photoPreviewContainer}>
          {photos
            .filter(p => p.status === status)
            .map((photo, index) => (
              <View key={index} style={styles.photoPreviewItem}>
                <Image
                  source={{ uri: `data:image/jpeg;base64,${photo.foto}` }}
                  style={styles.photoThumbnail}
                />
                <TouchableOpacity
                  style={styles.deletePhotoButton}
                  onPress={() => {
                    setPhotos(prev => prev.filter((p, i) => 
                      !(p.status === status && i === index)
                    ));
                  }}
                >
                  <Text style={styles.deleteButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
        </View>
      </View>
    );
  };

export default function FormScreen({ navigation }) {
  // State untuk form bertingkat
  const [proyek, setProyek] = useState(null);
  const [proyekList, setProyekList] = useState([]);
  const [gedung, setGedung] = useState(null);
  const [gedungList, setGedungList] = useState([]);
  const [ruangan, setRuangan] = useState(null);
  const [ruanganList, setRuanganList] = useState([]);
  const [unit, setUnit] = useState(null);
  const [unitList, setUnitList] = useState([]);
  
  // State untuk pemeriksaan dan pembersihan
  const [variabelPemeriksaan, setVariabelPemeriksaan] = useState([]);
  const [hasilPemeriksaan, setHasilPemeriksaan] = useState([]);
  const [variabelPembersihan, setVariabelPembersihan] = useState([]);
  const [hasilPembersihan, setHasilPembersihan] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State untuk foto
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    loadProyek();
  }, []);

  // Load data untuk dropdowns
  const loadProyek = async () => {
    console.log('Attempting to load proyek...');
    try {
      const response = await axiosInstance.get('/proyek');
      console.log('Proyek response:', response.data);
      setProyekList(response.data);
    } catch (error) {
      console.error('Error loading proyek:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        navigation.replace('Login');
      } else {
        Alert.alert('Error', `Gagal memuat data proyek: ${error.message}`);
      }
    }
  };

  const loadRuangan = async (proyekId, gedungId) => {
    try {
      const response = await axiosInstance.get(
        `${ENDPOINTS.PROYEK}/${proyekId}/gedung/${gedungId}/ruangan`
      );
      console.log('Ruangan response:', response.data);
      setRuanganList(response.data);
    } catch (error) {
      console.error('Error loading ruangan:', error);
      Alert.alert('Error', 'Gagal memuat data ruangan');
    }
  };

  const loadUnit = async (ruanganId) => {
    try {
      const response = await axiosInstance.get(`${ENDPOINTS.UNIT}/ruangan/${ruanganId}`);
      console.log('Unit response:', response.data);
      setUnitList(response.data);
    } catch (error) {
      console.error('Error loading unit:', error);
      Alert.alert('Error', 'Gagal memuat data unit');
    }
  };

  const loadVariabelPemeriksaan = async (kategori) => {
    try {
      setLoading(true);
      console.log('Loading variables for kategori:', kategori);
      
      // Load variabel pemeriksaan
      const responsePemeriksaan = await axiosInstance.get(
        `${ENDPOINTS.VARIABLE_PEMERIKSAAN}/kategori/${kategori}`
      );
      console.log('Pemeriksaan response:', responsePemeriksaan.data);
      setVariabelPemeriksaan(responsePemeriksaan.data);
      // Set default nilai 'Normal' untuk semua hasil pemeriksaan
      setHasilPemeriksaan(
        responsePemeriksaan.data.map(v => ({
          id_variable_pemeriksaan: v.id,
          nilai: 'Normal' // Default value
        }))
      );

      // Load variabel pembersihan
      const responsePembersihan = await axiosInstance.get(
        `${ENDPOINTS.VARIABLE_PEMBERSIHAN}/kategori/${kategori}`
      );
      console.log('Pembersihan response:', responsePembersihan.data);
      setVariabelPembersihan(responsePembersihan.data);
      setHasilPembersihan(
        responsePembersihan.data.map(v => ({
          id_variable_pembersihan: v.id,
          sebelum: '',
          sesudah: ''
        }))
      );
    } catch (error) {
      console.error('Error loading variables:', error);
      Alert.alert('Error', 'Gagal memuat variabel pemeriksaan dan pembersihan');
    } finally {
      setLoading(false);
    }
  };

  const validatePembersihan = (nilai) => {
    const num = parseFloat(nilai);
    return !isNaN(num);  // Hanya validasi bahwa input adalah angka desimal
  };

  const resetForm = () => {
    // Reset unit AC
    setUnit(null);
    setUnitList([]);
    
    // Reset pemeriksaan
    setVariabelPemeriksaan([]);
    setHasilPemeriksaan([]);
    
    // Reset pembersihan
    setVariabelPembersihan([]);
    setHasilPembersihan([]);
    
    // Reset foto
    setPhotos([]);
    
    // Reset loading state
    setLoading(false);
  };
  
  const handleSubmit = async () => {
    try {
      // Validasi dasar
      if (!unit || hasilPemeriksaan.length === 0 || photos.length < 2) {
        Alert.alert('Error', 'Semua data harus diisi lengkap');
        return;
      }
  
      // Validasi hasil pemeriksaan
      const emptyPemeriksaan = hasilPemeriksaan.some(hp => !hp.nilai);
      if (emptyPemeriksaan) {
        Alert.alert('Error', 'Semua hasil pemeriksaan harus diisi');
        return;
      }
  
      // Validasi hasil pembersihan
      for (const hp of hasilPembersihan) {
        if (!validatePembersihan(hp.sebelum) || !validatePembersihan(hp.sesudah)) {
          Alert.alert('Error', 'Nilai pembersihan harus berupa angka');
          return;
        }
      }
  
      // Format hasil pembersihan untuk memastikan nilai adalah float
      const formattedHasilPembersihan = hasilPembersihan.map(hp => ({
        id_variable_pembersihan: hp.id_variable_pembersihan,
        sebelum: parseFloat(hp.sebelum),
        sesudah: parseFloat(hp.sesudah)
      }));
  
      // Format foto sesuai yang diharapkan
      const formattedPhotos = photos.map(p => ({
        foto: p.foto,
        status: p.status
      }));
  
      const selectedUnit = unitList.find(u => u.id === parseInt(unit));
  
      const payload = {
        id_unit: parseInt(unit),
        tanggal: new Date().toISOString().split('T')[0],
        nama_pemeriksaan: 'Pemeriksaan Rutin',
        kategori: selectedUnit?.kategori || 'indoor',
        hasil_pemeriksaan: hasilPemeriksaan,
        hasil_pembersihan: formattedHasilPembersihan,
        foto: formattedPhotos
      };
  
      const response = await axiosInstance.post(ENDPOINTS.MAINTENANCE, payload);
      console.log('Response:', response.data);
  
      // Reset form setelah berhasil submit
      resetForm();
      
      Alert.alert('Sukses', 'Data berhasil disimpan', [
        { 
          text: 'OK',
          onPress: () => {
            // Load ulang data unit untuk form baru
            if (ruangan) {
              loadUnit(proyek);
            }
          }
        }
      ]);
    } catch (error) {
      console.error('Submit error:', error.response?.data || error.message);
      Alert.alert('Error', 'Gagal menyimpan data: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Form selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pilih Lokasi</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Proyek</Text>
            <CustomSelect 
              value={proyek}
              onValueChange={(value) => {
                console.log('Selected proyek:', value);
                const selectedProyek = proyekList.find(p => p.id === parseInt(value));
                setProyek(value);
                if (selectedProyek) {
                  setGedungList(selectedProyek.gedung || []);
                }
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
                  console.log('Selected gedung:', value);
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
          console.log('Selected ruangan:', value);
          setRuangan(value);
          if (value) {
            loadUnit(value); // Pass ruanganId directly
          }
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
                  console.log('Selected unit:', value);
                  setUnit(value);
                  const selectedUnit = unitList.find(u => u.id === parseInt(value));
                  console.log('Selected unit data:', selectedUnit);
                  if (selectedUnit?.kategori) {
                    loadVariabelPemeriksaan(selectedUnit.kategori);
                  }
                }}
                items={unitList.map(unit => ({
                  id: unit.id,
                  nama: `${unit.nama} - ${unit.detailModel?.nama_model || 'N/A'} - ${unit.nomor_seri} (${unit.kategori})`
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
                      {variabelPembersihan[index]?.nama_variabel}
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

        {/* Photo Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Foto Dokumentasi</Text>
          
          <View style={styles.photoSection}>
            <View style={styles.photoContainer}>
              <Text style={styles.photoLabel}>Foto Sebelum</Text>
              <PhotoUploader 
                status="sebelum"
                photos={photos}
                setPhotos={setPhotos}
              />
            </View>

            <View style={styles.photoContainer}>
              <Text style={styles.photoLabel}>Foto Sesudah</Text>
              <PhotoUploader 
                status="sesudah"
                photos={photos}
                setPhotos={setPhotos}
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
}
const photoUploaderStyles = {
    photoUploaderContainer: {
      marginTop: 10,
    },
    photoInputContainer: {
      marginBottom: 10,
    },
    fileInput: {
      width: '100%',
      padding: 10,
      backgroundColor: '#f8f9fa',
      borderRadius: 4,
      borderWidth: 1,
      borderColor: '#ddd',
    },
    photoPreviewContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 10,
    },
    photoPreviewItem: {
      width: '48%',
      marginRight: '2%',
      marginBottom: 10,
      position: 'relative',
    },
    photoThumbnail: {
      width: '100%',
      height: 150,
      borderRadius: 8,
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
    }
  };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_COLORS.background,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    ...APP_STYLES.card,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    color: '#666',
  },
  webSelect: {
    width: '100%',
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    backgroundColor: 'white',
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
  },
  photoUploaderContainer: {
    marginTop: 10,
  },
  photoInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  fileInput: {
    flex: 1,
    marginRight: 10,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cameraButtonText: {
    marginLeft: 5,
    color: APP_COLORS.primary,
  },
  photoPreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  photoPreviewItem: {
    width: '48%',
    marginRight: '2%',
    marginBottom: 10,
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
  footer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  submitButton: {
    ...APP_STYLES.button,
    backgroundColor: APP_COLORS.success,
  },
  submitButtonText: {
    ...APP_STYLES.buttonText,
  },
  errorText: {
    color: APP_COLORS.error,
    fontSize: 12,
    marginTop: 5,
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    padding: 10,
  },
});