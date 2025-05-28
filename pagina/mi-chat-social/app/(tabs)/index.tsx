import React, { useEffect, useRef, useState } from 'react';
import { View, Button, StyleSheet, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import uuid from 'react-native-uuid';

// Animaciones (ajustá el path según la ubicación real)
import heartAnimation from '../../assets/animations/heart.json';
import laughAnimation from '../../assets/animations/laugh.json';
import idleAnimation from '../../assets/animations/idle.json';

const SOCKET_URL = 'ws://192.168.0.109:8080'; // Usá tu IP local real

export default function HomeScreen() {
  const [reaction, setReaction] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const lottieRef = useRef<LottieView>(null);
  const [clientId] = useState(() => uuid.v4() as string);

  useEffect(() => {
    const socket = new WebSocket(SOCKET_URL);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('✅ Conectado al servidor WebSocket');
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'reaction' && data.sender !== clientId) {
        console.log(`➡️ Recibida reacción: ${data.reaction}`);
        setReaction(data.reaction);
      }
    };

    socket.onclose = () => {
      console.log('❌ Conexión WebSocket cerrada');
    };

    socket.onerror = (err) => {
      console.error('🔥 WebSocket error:', err);
    };

    return () => {
      socket.close();
    };
  }, []);

  const sendReaction = (type: string) => {
    const socket = socketRef.current;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'reaction',
        reaction: type,
        sender: clientId,
      }));
      setReaction(type);
    }
  };

  const getAnimation = () => {
    switch (reaction) {
      case 'heart':
        return heartAnimation;
      case 'laugh':
        return laughAnimation;
      default:
        return idleAnimation;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💬 Reaccioná</Text>
      <LottieView
        ref={lottieRef}
        source={getAnimation()}
        autoPlay
        loop
        style={styles.animation}
      />
      <View style={styles.buttons}>
        <Button title="❤️" onPress={() => sendReaction('heart')} />
        <Button title="😂" onPress={() => sendReaction('laugh')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    marginBottom: 20,
  },
  animation: {
    width: 200,
    height: 200,
  },
  buttons: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 30,
  },
});
