import React, { useState } from 'react';
import { StyleSheet, View, Image, TouchableOpacity, Text, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function CameraScreen({ navigation }) {
  const [photo, setPhoto] = useState(null);

  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      alert('Camera permission is required!');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      base64: false,
      exif: false,
      saveToPhotos: true,
    });
    if (!result.cancelled) {
      setPhoto(result.assets[0]);
    }
  };

  if (!photo) {
    return (
      <LinearGradient
        colors={['#ffffffff', '#fafafaff']}
        style={styles.gradient}
      >
        <View style={styles.container}>
          <Ionicons name="camera" size={80} color="#00000" style={styles.iconShadow} />
          <Text style={styles.title}>Smile Camera</Text>
          <Text style={styles.subtitle}>Capture your best smile and save it forever!</Text>
          <TouchableOpacity style={styles.button} onPress={openCamera}>
            <LinearGradient
              colors={['#ffb347', '#ffcc33']}
              style={styles.buttonGradient}
              start={[0, 0]}
              end={[1, 1]}
            >
              <Ionicons name="camera-outline" size={32} color="#fff" />
              <Text style={styles.buttonText}>Open Camera</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={32} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#ffffffff', '#ffffffff']}
      style={styles.gradient}
    >
      <View style={styles.previewContainer}>
        <Image source={{ uri: photo.uri }} style={styles.previewImage} />
        <Text style={styles.congratsText}>Congrats, you are smiling!</Text>
        <TouchableOpacity style={styles.doneButton} onPress={() => navigation.goBack()}>
          <LinearGradient
            colors={['#ffb347', '#ffcc33']}
            style={styles.doneButtonGradient}
            start={[0, 0]}
            end={[1, 1]}
          >
            <Ionicons name="checkmark" size={32} color="#fff" />
            <Text style={styles.doneButtonText}>Done</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  iconShadow: {
    marginBottom: 16,
    
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
    opacity: 0.8,
  },
  title: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#00000',
    marginBottom: 8,
    letterSpacing: 1.5,
    textShadowColor: '#000',
  },
  subtitle: {
    fontSize: 18,
    color: '#5a5858ff',
    marginBottom: 40,
    textAlign: 'center',

    textShadowRadius: 4,
  },
  button: {
    width: width * 0.7,
    borderRadius: 30,
    overflow: 'hidden',
    marginBottom: 30,
    elevation: 5,
    shadowColor: '#b0bd00ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
    letterSpacing: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 24,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 20,
    padding: 6,
  },
  previewContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 40,
  },
  previewImage: {
    width: width * 0.85,
    height: width * 1.1,
    borderRadius: 30,
    marginBottom: 30,
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  congratsText: {
    color: '#000000ff',
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 30, // Only one marginBottom
  },
  doneButton: {
    width: width * 0.5,
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#ffb347',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  doneButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 30,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
    letterSpacing: 1,
  },
});