import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import LottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ChatScreen() {
  const [messages, setMessages] = useState<{ text: string; sender: string }[]>([]);
  const [input, setInput] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'men' | 'woman'>('men');
  const [hairColor, setHairColor] = useState('#000000');
  const [shirtColor, setShirtColor] = useState('#0000FF');
  const [ws, setWs] = useState<WebSocket | null>(null);

  const avatarRef = useRef<LottieView>(null);
  const heartRef = useRef<LottieView>(null);
  const laughRef = useRef<LottieView>(null);
  const scrollRef = useRef<ScrollView>(null);

  const [showHeart, setShowHeart] = useState(false);
  const [showLaugh, setShowLaugh] = useState(false);

  // Cambié acá para que no tire error de tipos
  const reactionTimeout = useRef<NodeJS.Timeout | number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const avatarJson = await AsyncStorage.getItem('avatar');
        const storedName = await AsyncStorage.getItem('userName');

        if (avatarJson) {
          const avatar = JSON.parse(avatarJson);
          if (avatar.gender === 'men' || avatar.gender === 'woman') setGender(avatar.gender);
          if (avatar.hairColor) setHairColor(avatar.hairColor);
          if (avatar.shirtColor) setShirtColor(avatar.shirtColor);
        }

        if (storedName) setName(storedName);
      } catch (e) {
        console.error('Error cargando datos del chat', e);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!name) return;

    const socket = new WebSocket('ws://192.168.0.109:8080'); // Ajustar IP o dominio real
    setWs(socket);

    socket.onopen = () => {
      console.log('Conectado a WebSocket');
      socket.send(JSON.stringify({ type: 'user_connected', userId: name }));
    };

    socket.onmessage = event => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.text && msg.sender) {
          setMessages(prev => {
            const updated = [...prev, msg];
            setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
            return updated;
          });
          detectEmotions(msg.text);
        }
      } catch (e) {
        console.error('Mensaje no es JSON válido:', event.data);
      }
    };

    socket.onerror = e => console.error('WebSocket error', e);
    socket.onclose = () => console.log('WebSocket cerrado');

    return () => socket.close();
  }, [name]);

  const playReaction = (type: 'heart' | 'laugh') => {
    if (reactionTimeout.current) clearTimeout(reactionTimeout.current as number);

    if (type === 'heart') {
      setShowHeart(true);
      setShowLaugh(false);
    } else {
      setShowLaugh(true);
      setShowHeart(false);
    }

    reactionTimeout.current = setTimeout(() => {
      setShowHeart(false);
      setShowLaugh(false);
    }, 2000);
  };

  const detectEmotions = (text: string) => {
    const normalized = text.toLowerCase();
    if (/❤️|love/.test(normalized)) {
      playReaction('heart');
    } else if (/😂|jaja|xd|lol/.test(normalized)) {
      playReaction('laugh');
    }
  };

  const sendMessage = () => {
    const trimmed = input.trim();
    if (trimmed && name && ws?.readyState === WebSocket.OPEN) {
      const newMessage = { type: 'chat_message', text: trimmed, sender: name };
      ws.send(JSON.stringify(newMessage));
      setMessages(prev => [...prev, newMessage]);
      avatarRef.current?.play();
      detectEmotions(trimmed);
      setInput('');
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.welcomeText}>Bienvenidx al chat {name}</Text>
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

      

      <ScrollView style={styles.messages} ref={scrollRef}>
        {messages.map((msg, i) => {
          const isMine = msg.sender === name;
          return (
            <View
              key={i}
              style={[
                styles.bubble,
                {
                  alignSelf: isMine ? 'flex-end' : 'flex-start',
                  backgroundColor: isMine ? '#daf8cb' : '#e0e0e0',
                },
              ]}
            >
              <Text style={styles.sender}>{isMine ? 'Tú' : msg.sender}</Text>
              <Text style={styles.message}>{msg.text}</Text>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Escribí un mensaje..."
          value={input}
          onChangeText={setInput}
          onSubmitEditing={sendMessage}
          returnKeyType="send"
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={{ color: '#fff' }}>Enviar</Text>
        </TouchableOpacity>
      </View>

      {showHeart && (
        <View style={styles.fullscreenAnimation}>
          <LottieView
            ref={heartRef}
            source={require('../assets/animations/heart.json')}
            loop={false}
            autoPlay
            style={{ width: 300, height: 300 }}
          />
        </View>
      )}
      {showLaugh && (
        <View style={styles.fullscreenAnimation}>
          <LottieView
            ref={laughRef}
            source={require('../assets/animations/laugh.json')}
            loop={false}
            autoPlay
            style={{ width: 300, height: 300 }}
          />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  avatarContainer: { alignItems: 'center', marginBottom: 10 },
  welcomeText: { fontSize: 20, fontWeight: '600', textAlign: 'center', marginBottom: 10 },
  messages: { flex: 1, marginVertical: 10 },
  bubble: {
    padding: 10,
    marginVertical: 4,
    borderRadius: 10,
    maxWidth: '80%',
  },
  sender: { fontWeight: 'bold', marginBottom: 2, color: '#333' },
  message: { fontSize: 16 },
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
  fullscreenAnimation: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0)',
    zIndex: 999,
  },
});
