import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  TextInput,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Linking } from 'react-native';
import { APP_COLORS} from '../config';
const PhotoUploader = ({ mode = 'multiple', photo, setPhoto, photos, setPhotos, status }) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [photoName, setPhotoName] = useState('');

  useEffect(() => {
    (async () => {
      try {
        let cameraStatus = await ImagePicker.getCameraPermissionsAsync();
        let mediaStatus = await ImagePicker.getMediaLibraryPermissionsAsync();

        if (!cameraStatus.granted) {
          cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
        }

        if (!mediaStatus.granted) {
          mediaStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
        }

        setHasPermission(cameraStatus.granted && mediaStatus.granted);

        if (!cameraStatus.granted || !mediaStatus.granted) {
          Alert.alert(
            'Izin Diperlukan',
            'Aplikasi membutuhkan izin untuk mengakses kamera dan galeri',
            [
              { text: 'Buka Pengaturan', onPress: () => Linking.openSettings() },
              { text: 'Batal', style: 'cancel' },
            ]
          );
        }
      } catch (error) {
        console.error('Error checking permissions:', error);
        Alert.alert('Error', 'Gagal memeriksa izin aplikasi');
      }
    })();
  }, []);

  const compressImage = async (base64Image) => {
    try {
      const MAX_IMAGE_SIZE = 1024 * 1024; // 1MB
      if (base64Image.length > MAX_IMAGE_SIZE) {
        const result = await ImageManipulator.manipulateAsync(
          `data:image/jpeg;base64,${base64Image}`,
          [],
          {
            compress: 0.5,
            format: ImageManipulator.SaveFormat.JPEG,
            base64: true,
          }
        );
        return result.base64;
      }
      return base64Image;
    } catch (error) {
      console.error('Error compressing image:', error);
      return base64Image;
    }
  };

  const handleAddPhoto = async (base64Photo) => {
    if (mode === 'multiple' && !photoName.trim()) {
      Alert.alert('Error', 'Nama foto harus diisi');
      return;
    }

    const compressedBase64 = await compressImage(base64Photo);

    if (mode === 'single') {
      setPhoto(compressedBase64);
    } else {
      setPhotos((prev) => [
        ...prev,
        {
          foto: compressedBase64,
          status: status,
          nama: photoName.trim(), // Sertakan nama foto
        },
      ]);
      setPhotoName(''); // Reset input nama foto setelah foto ditambahkan
    }
  };

  const takePhoto = async () => {
    try {
      if (!hasPermission) {
        Alert.alert('Error', 'Izin kamera diperlukan');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        base64: true,
        exif: false,
      });

      if (!result.canceled && result.assets?.[0]?.base64) {
        await handleAddPhoto(result.assets[0].base64);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert(
        'Error Kamera',
        'Gagal mengambil foto. Pastikan izin kamera sudah diberikan.',
        [
          { text: 'Buka Pengaturan', onPress: () => Linking.openSettings() },
          { text: 'OK', style: 'cancel' },
        ]
      );
    }
  };

  const pickFromGallery = async () => {
    try {
      if (!hasPermission) {
        Alert.alert('Error', 'Izin galeri diperlukan');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        base64: true,
        exif: false,
      });

      if (!result.canceled && result.assets?.[0]?.base64) {
        await handleAddPhoto(result.assets[0].base64);
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert(
        'Error Galeri',
        'Gagal memilih foto. Pastikan izin galeri sudah diberikan.',
        [
          { text: 'Buka Pengaturan', onPress: () => Linking.openSettings() },
          { text: 'OK', style: 'cancel' },
        ]
      );
    }
  };

  const showImageSourceOptions = () => {
    Alert.alert(
      'Pilih Sumber Foto',
      'Pilih foto dari:',
      [
        { text: 'Kamera', onPress: takePhoto },
        { text: 'Galeri', onPress: pickFromGallery },
        { text: 'Batal', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const renderSinglePhotoPreview = () => {
    if (!photo) return null;

    return (
      <View style={styles.singlePhotoPreviewItem}>
        <Image
          source={{ uri: `data:image/jpeg;base64,${photo}` }}
          style={styles.photoThumbnail}
        />
        <TouchableOpacity
          style={styles.deletePhotoButton}
          onPress={() => setPhoto(null)}
        >
          <Text style={styles.deleteButtonText}>×</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderMultiplePhotoPreview = () => {
    return (
      <View style={styles.photoPreviewContainer}>
        {photos
          .filter((p) => p.status === status)
          .map((photo, index) => (
            <View key={index} style={styles.photoPreviewItem}>
              <Image
                source={{ uri: `data:image/jpeg;base64,${photo.foto}` }}
                style={styles.photoThumbnail}
              />
              <Text style={styles.photoName}>{photo.nama}</Text>
              <TouchableOpacity
                style={styles.deletePhotoButton}
                onPress={() =>
                  setPhotos((prev) =>
                    prev.filter((p, i) => !(p.status === status && i === index))
                  )
                }
              >
                <Text style={styles.deleteButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
      </View>
    );
  };

  return (
    <View style={styles.photoUploaderContainer}>
      {mode === 'multiple' && (
        <TextInput
          style={styles.photoNameInput}
          placeholder="Masukkan nama foto"
          value={photoName}
          onChangeText={setPhotoName}
        />
      )}

      <TouchableOpacity onPress={showImageSourceOptions} style={styles.pickImageButton}>
        <Text style={styles.pickImageButtonText}>
          {mode === 'single'
            ? photo
              ? 'Ganti Foto'
              : 'Tambah Foto'
            : 'Tambah Foto'}
        </Text>
      </TouchableOpacity>

      {mode === 'single' ? renderSinglePhotoPreview() : renderMultiplePhotoPreview()}
    </View>
  );
};

const styles = StyleSheet.create({
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
  singlePhotoPreviewItem: {
    width: '100%',
    position: 'relative',
    marginTop: 10,
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
  photoNameInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    marginBottom: 10,
  },
  photoName: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
});

export default PhotoUploader;