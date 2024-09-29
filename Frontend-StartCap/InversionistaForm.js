import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { db } from '../firebase/firebaseconfig';
import { doc, setDoc } from 'firebase/firestore';

const InversionistaForm = () => {
  const [nombre1, setNombre1] = useState('');
  const [nombre2, setNombre2] = useState('');
  const [apellido1, setApellido1] = useState('');
  const [apellido2, setApellido2] = useState('');
  const [cedula, setCedula] = useState('');
  const [correo, setCorreo] = useState('');
  const [localidad, setLocalidad] = useState('');
  const [id_Usuario, setId_Usuario] = useState('');
  const [foto_perfil, setFotoPerfil] = useState(null);

  const validarCedula = (text) => {
    const regexConGuiones = /^[0-9]{3}-[0-9]{6}-[0-9]{4}[A-Za-z]{1}$/; // 15 caracteres con guiones
    const regexSinGuiones = /^[0-9]{13}[A-Za-z]{1}$/; // 13 dígitos seguidos de una letra
    return regexSinGuiones.test(text) || regexConGuiones.test(text);
  };

  const formatearCedula = (text) => {
    // Elimina cualquier carácter que no sea número o letra
    let newText = text.replace(/[^0-9A-Za-z]/g, '');

    // Añade los guiones automáticamente según la longitud
    if (newText.length > 3) newText = `${newText.slice(0, 3)}-${newText.slice(3)}`;
    if (newText.length > 11) newText = `${newText.slice(0, 11)}-${newText.slice(11)}`;

    setCedula(newText);
  };

  const limpiarCampos = () => {
    setNombre1('');
    setNombre2('');
    setApellido1('');
    setApellido2('');
    setCedula('');
    setCorreo('');
    setLocalidad('');
    setId_Usuario('');
    setFotoPerfil(null);
  };

  const guardarInversionista = async () => {
    // Verifica que los campos requeridos estén completos y la cédula sea válida
    if (!nombre1 || !apellido1 || !cedula || !correo || !localidad || !id_Usuario) {
      Alert.alert("Error", "Por favor completa todos los campos requeridos.");
      return;
    }

    if (!validarCedula(cedula)) {
      Alert.alert("Error", "La cédula no es válida debe tener 15 caracteres incluyendo guiones.");
      return;
    }

    try {
      await setDoc(doc(db, "inversionistas", id_Usuario), {
        nombre1,
        nombre2,
        apellido1,
        apellido2,
        cedula,
        correo,
        localidad,
        foto_perfil,
      });
      Alert.alert("Éxito", "Inversionista guardado con éxito!");

      // Limpia los campos después de guardar
      limpiarCampos();
    } catch (error) {
      console.error("Error al guardar inversionista:", error);
      Alert.alert("Error", "Hubo un error al guardar el inversionista.");
    }
  };

  const seleccionarFoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permiso requerido", "Se necesita permiso para acceder a la galería.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setFotoPerfil(result.assets[0].uri); 
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {foto_perfil && (
        <Image
          source={{ uri: foto_perfil }} 
          style={styles.fotoPerfil} 
        />
      )}
      <Button title="Seleccionar Foto" onPress={seleccionarFoto} />

      <Text style={styles.label}>Primer Nombre:</Text>
      <TextInput style={styles.input} value={nombre1} onChangeText={setNombre1} />

      <Text style={styles.label}>Segundo Nombre:</Text>
      <TextInput style={styles.input} value={nombre2} onChangeText={setNombre2} />

      <Text style={styles.label}>Primer Apellido:</Text>
      <TextInput style={styles.input} value={apellido1} onChangeText={setApellido1} />

      <Text style={styles.label}>Segundo Apellido:</Text>
      <TextInput style={styles.input} value={apellido2} onChangeText={setApellido2} />

      <Text style={styles.label}>Cédula:</Text>
      <TextInput
        style={styles.input}
        value={cedula}
        onChangeText={formatearCedula}
        placeholder="000-000000-0000#"
        maxLength={15} // Limitar a 15 caracteres
      />

      <Text style={styles.label}>Correo:</Text>
      <TextInput style={styles.input} value={correo} onChangeText={setCorreo} />

      <Text style={styles.label}>Localidad:</Text>
      <TextInput style={styles.input} value={localidad} onChangeText={setLocalidad} />

      <Text style={styles.label}>ID Usuario:</Text>
      <TextInput style={styles.input} value={id_Usuario} onChangeText={setId_Usuario} />

      <Button title="Registrarse" onPress={guardarInversionista} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginVertical: 8,
    alignSelf: 'flex-start',
    marginLeft: 10,
  },
  input: {
    width: '90%',
    borderWidth: 1,
    borderColor: '#007BFF',
    borderRadius: 5,
    padding: 10,
    fontSize: 14,
    color: '#000',
    marginVertical: 5,
  },
  fotoPerfil: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
});

export default InversionistaForm;
