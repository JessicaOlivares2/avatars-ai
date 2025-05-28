import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const colors = ['blue', 'green', 'red', 'purple'];

export default function AvatarSelector({ selectedColor, onSelect }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Elegí un color para tu avatar:</Text>
      <View style={styles.options}>
        {colors.map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.circle,
              { backgroundColor: color, borderWidth: selectedColor === color ? 3 : 0 }
            ]}
            onPress={() => onSelect(color)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  title: { fontSize: 16, marginBottom: 10 },
  options: { flexDirection: 'row', gap: 10 },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 10,
    borderColor: 'black'
  }
});
