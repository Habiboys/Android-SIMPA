import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Platform, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from '@expo/vector-icons';
import { APP_COLORS } from '../config';

// Photo Preview Component
const PhotoPreview = ({ photos, setPhotos, status }) => {
  if (!photos || !Array.isArray(photos)) return null;

  return (
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
  );
};

// Image Compression Function (for web)
const compressImage = async (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        let width = image.width;
        let height = image.height;

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

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        resolve(compressedBase64.split(',')[1]);
      };
      image.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
};

const PhotoUploader = ({ status, photos, setPhotos }) => {
  const [key] = useState(Date.now());

  useEffect(() => {
    if (Platform.OS !== 'web') {
      (async () => {
        const { status: cameraStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (cameraStatus !== 'granted') {
          Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
        }
      })();
    }
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets?.[0]?.base64) {
        setPhotos(prev => [...prev, {
          foto: result.assets[0].base64,
          status: status,
          filename: 'photo.jpg'
        }]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Gagal memilih foto');
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    
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

  if (Platform.OS === 'web') {
    return (
      <View style={styles.photoUploaderContainer}>
        <View style={styles.photoInputContainer}>
          <input
            key={key}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            style={styles.fileInput}
          />
        </View>
        <PhotoPreview photos={photos} setPhotos={setPhotos} status={status} />
      </View>
    );
  }

  return (
    <View style={styles.photoUploaderContainer}>
      <TouchableOpacity onPress={pickImage} style={styles.pickImageButton}>
        <Camera size={24} color={APP_COLORS.primary} />
        <Text style={styles.pickImageButtonText}>Pilih Foto</Text>
      </TouchableOpacity>
      <PhotoPreview photos={photos} setPhotos={setPhotos} status={status} />
    </View>
  );
};

const styles = StyleSheet.create({
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
    marginLeft: 8,
    color: APP_COLORS.primary,
    fontSize: 16,
  },
  photoPreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  photoPreviewItem: {
    width: Platform.OS === 'web' ? '48%' : '45%',
    margin: '1%',
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
});

export default PhotoUploader;