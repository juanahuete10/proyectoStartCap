import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { db } from '../../firebase/firebaseconfig'; // Asegúrate de importar tu configuración de Firebase
import { setDoc, doc } from 'firebase/firestore';

export default function Registro({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [perfil, setPerfil] = useState(''); // Estado para el perfil

  // Expresión regular para validar un correo electrónico
  const validarEmail = (email) => {
    const regex = /\S+@\S+\.\S+/;
    return regex.test(email);
  };

  const registrarUsuario = async () => {
    const auth = getAuth();

    // Validar el formato del correo electrónico
    if (!email || !validarEmail(email)) {
      Alert.alert('Error', 'Por favor, introduce un correo electrónico válido.');
      return;
    }

    // Validar que la contraseña no esté vacía o sea demasiado corta
    if (!password || password.length < 6) {
      Alert.alert('Error', 'Por favor, introduce una contraseña de al menos 6 caracteres.');
      return;
    }

    // Validar que se haya seleccionado un perfil
    if (!perfil) {
      Alert.alert('Error', 'Por favor, selecciona un perfil.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Guardar usuario en Firestore
      await setDoc(doc(db, "usuarios", user.uid), {
        email,
        perfil, // Guardar el perfil seleccionado
      });

      Alert.alert('Éxito', 'Usuario registrado con éxito!');
      navigation.navigate('SeleccionPerfil'); // Navegar a Selección de Perfil
    } catch (error) {
      console.error('Error al registrar:', error.code, error.message);
      if (error.code === 'auth/invalid-email') {
        Alert.alert('Error', 'El formato del correo electrónico no es válido.');
      } else {
        Alert.alert('Error', 'Error al registrar: ' + error.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro</Text>
      <TextInput
        placeholder="Correo electrónico"
        value={email}
        onChangeText={(text) => setEmail(text.trim())} // Eliminar espacios adicionales
        style={styles.input}
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      
      {/* Selector de perfil */}
      <Text style={styles.label}>Selecciona tu perfil:</Text>
      <View style={styles.buttonContainer}>
        <Button title="Inversionista" onPress={() => setPerfil('Inversionista')} />
        <Button title="Emprendedor" onPress={() => setPerfil('Emprendedor')} />
        <Button title="Administrador" onPress={() => setPerfil('Administrador')} />
      </View>

      <Button title="Registrarse" onPress={registrarUsuario} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  label: {
    marginTop: 20,
    fontSize: 18,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
});
