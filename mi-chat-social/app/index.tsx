import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import LottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const COLORS = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00'];

export default function AvatarScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [gender, setGender] = useState<'men' | 'woman'>('men');
  const [hairColor, setHairColor] = useState('#000000');
  const [shirtColor, setShirtColor] = useState('#0000FF');

  useEffect(() => {
    AsyncStorage.getItem('avatar').then((data) => {
      if (data) {
        const { gender, hairColor, shirtColor, name } = JSON.parse(data);
        if (gender === 'men' || gender === 'woman') setGender(gender);
        if (hairColor) setHairColor(hairColor);
        if (shirtColor) setShirtColor(shirtColor);
        if (name) setName(name);
      }
    });
  }, []);

  const handleContinue = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Por favor, escribí tu nombre antes de continuar');
      return;
    }
    const avatar = { gender, hairColor, shirtColor, name: name.trim() };
    try {
      await AsyncStorage.setItem('avatar', JSON.stringify(avatar));
      await AsyncStorage.setItem('userName', name.trim());  // Guardar nombre aparte
      Alert.alert('Avatar guardado', '¡Tu avatar fue personalizado con éxito!');
      router.push('/chat');
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el avatar');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¿Cuál es tu nombre?</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Escribí tu nombre"
      />

      <Text style={styles.title}>Elegí tu género</Text>
      <View style={styles.genderContainer}>
        <TouchableOpacity
          style={[styles.genderButton, gender === 'men' && styles.genderSelected]}
          onPress={() => setGender('men')}
        >
          <Text style={styles.genderText}>Hombre</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.genderButton, gender === 'woman' && styles.genderSelected]}
          onPress={() => setGender('woman')}
        >
          <Text style={styles.genderText}>Mujer</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Color de pelo</Text>
      <View style={styles.colorContainer}>
        {COLORS.map((color) => (
          <TouchableOpacity
            key={color}
            style={[styles.colorCircle, { backgroundColor: color }, hairColor === color && styles.colorSelected]}
            onPress={() => setHairColor(color)}
          />
        ))}
      </View>

      <Text style={styles.title}>Color de ropa</Text>
      <View style={styles.colorContainer}>
        {COLORS.map((color) => (
          <TouchableOpacity
            key={color}
            style={[styles.colorCircle, { backgroundColor: color }, shirtColor === color && styles.colorSelected]}
            onPress={() => setShirtColor(color)}
          />
        ))}
      </View>

      <LottieView
        source={gender === 'men' ? require('../assets/animations/men.json') : require('../assets/animations/woman.json')}
        autoPlay
        loop
        style={{ width: 200, height: 200, marginVertical: 20 }}
        colorFilters={[
          { keypath: 'Hair Front', color: hairColor },
          { keypath: 'Body', color: shirtColor },
        ]}
      />

      <Button title="Ir al Chat" onPress={handleContinue} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginTop: 20 },
  genderContainer: { flexDirection: 'row', marginTop: 10 },
  genderButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#666',
    marginHorizontal: 10,
    borderRadius: 10,
  },
  genderSelected: {
    backgroundColor: '#666',
  },
  genderText: { color: '#fff', fontWeight: 'bold' },
  colorContainer: { flexDirection: 'row', marginTop: 10 },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSelected: {
    borderColor: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    width: '80%',
    marginTop: 10,
  },
});
