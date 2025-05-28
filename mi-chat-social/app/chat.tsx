import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Animated } from 'react-native';
import LottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ChatScreen() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [gender, setGender] = useState<'men' | 'woman'>('men');
  const [hairColor, setHairColor] = useState('#000000');
  const [shirtColor, setShirtColor] = useState('#0000FF');

  const avatarRef = useRef<LottieView>(null);
  const heartRef = useRef<LottieView>(null);
  const laughRef = useRef<LottieView>(null);

  const heartOpacity = useRef(new Animated.Value(0)).current;
  const laughOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loadAvatar = async () => {
      const json = await AsyncStorage.getItem('avatar');
      if (json) {
        const avatar = JSON.parse(json);
        if (avatar.gender === 'men' || avatar.gender === 'woman') setGender(avatar.gender);
        if (avatar.hairColor) setHairColor(avatar.hairColor);
        if (avatar.shirtColor) setShirtColor(avatar.shirtColor);
      }
    };
    loadAvatar();
  }, []);

  const animateReaction = (ref: React.RefObject<LottieView>, opacity: Animated.Value) => {
    ref.current?.play();
    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 1000,
        delay: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const playReaction = (type: 'heart' | 'laugh') => {
    if (type === 'heart') {
      animateReaction(heartRef, heartOpacity);
    } else {
      animateReaction(laughRef, laughOpacity);
    }
  };

  const detectEmotions = (text: string) => {
    const normalized = text.toLowerCase();
    if (normalized.includes('❤️') || normalized.includes('love')) {
      playReaction('heart');
    } else if (
      normalized.includes('😂') ||
      normalized.includes('jaja') ||
      normalized.includes('xd') ||
      normalized.includes('lol')
    ) {
      playReaction('laugh');
    }
  };

  const sendMessage = () => {
    const trimmed = input.trim();
    if (trimmed) {
      setMessages([...messages, trimmed]);
      avatarRef.current?.play();
      detectEmotions(trimmed);
      setInput('');
    }
  };

  return (
    <View style={styles.container}>
      {/* Reacciones pantalla completa */}
      <Animated.View style={[styles.reaction, { opacity: heartOpacity }]}>
        <LottieView
          ref={heartRef}
          source={require('../assets/animations/heart.json')}
          loop={false}
          style={styles.fullscreenLottie}
        />
      </Animated.View>
      <Animated.View style={[styles.reaction, { opacity: laughOpacity }]}>
        <LottieView
          ref={laughRef}
          source={require('../assets/animations/laugh.json')}
          loop={false}
          style={styles.fullscreenLottie}
        />
      </Animated.View>

      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <LottieView
          ref={avatarRef}
          source={
            gender === 'men'
              ? require('../assets/animations/men.json')
              : require('../assets/animations/woman.json')
          }
          autoPlay
          loop
          style={{ width: 200, height: 200 }}
          colorFilters={[
            { keypath: 'Hair Front', color: hairColor },
            { keypath: 'Body', color: shirtColor },
          ]}
        />
      </View>

      {/* Mensajes */}
      <View style={styles.messages}>
        {messages.map((msg, i) => (
          <Text key={i} style={styles.message}>{msg}</Text>
        ))}
      </View>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Escribí un mensaje..."
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={{ color: '#fff' }}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  avatarContainer: { alignItems: 'center', marginBottom: 10 },
  reaction: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenLottie: {
    width: 250,
    height: 250,
  },
  messages: { flex: 1, marginVertical: 10 },
  message: { fontSize: 16, paddingVertical: 4 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#ccc',
    paddingTop: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    marginLeft: 10,
    borderRadius: 10,
  },
});
