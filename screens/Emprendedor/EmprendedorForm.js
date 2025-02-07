import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { db, storage } from '../../firebase/firebaseconfig'; 
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';

const EmprendedorForm = () => {
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [fecha_nac, setFecha_nac] = useState('');
  const [cedula, setCedula] = useState('');
  const [genero, setGenero] = useState('');
  const [correo, setCorreo] = useState('');
  const [localidad, setLocalidad] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [id_usuario, setId_usuario] = useState('');
  const [fotoPerfil, setFotoPerfil] = useState(null); // Imagen seleccionada por el usuario
  const [loading, setLoading] = useState(false); // Estado de carga

  // Solicitar permisos de acceso a la galería
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Necesitamos permisos para acceder a la galería.');
      }
    })();
  }, []);

  // Función para seleccionar imagen desde la galería
  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Imagen cuadrada
        quality: 1,
      });

      if (!result.canceled) {
        setFotoPerfil(result.assets[0].uri); // Guardar la URI
      }
    } catch (error) {
      console.error("Error al seleccionar imagen:", error);
      Alert.alert('Error', 'Hubo un problema al seleccionar la imagen.');
    }
  };

  // Función para subir imagen a Firebase Storage
  const uploadImage = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const storageRef = ref(storage, `fotosPerfil/${id_usuario}_${Date.now()}.jpg`); // Uso de id_usuario para mayor unicidad
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error("Error al subir imagen:", error);
      Alert.alert('Error', 'Hubo un problema al subir la imagen.');
      return null;
    }
  };

  // Validar cédula
  const validarCedula = () => {
    // Ejemplo de validación simple: no puede estar vacío y debe tener al menos 6 dígitos
    const cedulaRegex = /^[0-9]{6,}$/;
    return cedulaRegex.test(cedula);
  };

  // Función para guardar los datos del emprendedor en Firestore
  const guardarEmprendedor = async () => {
    if (!id_usuario) {
      Alert.alert("ID de Usuario Requerido", "Por favor, ingresa el ID de usuario.");
      return;
    }

    if (!validarCedula()) {
      Alert.alert("Cédula Inválida", "Por favor, ingresa una cédula válida (mínimo 6 dígitos).");
      return;
    }

    setLoading(true);
    try {
      let uploadedURL = null;

      if (fotoPerfil) {
        uploadedURL = await uploadImage(fotoPerfil);
        if (!uploadedURL) {
          setLoading(false);
          return;
        }
      }

      // Guardar datos del emprendedor en Firestore
      await setDoc(doc(db, "emprendedores", String(id_usuario)), {
        nombres: nombres,
        apellidos: apellidos,
        fecha_nac: fecha_nac,
        cedula: cedula,
        genero: genero,
        correo: correo,
        localidad: localidad,
        descripcion: descripcion,
        id_usuario: id_usuario,
        foto_perfil_url: uploadedURL || '', // URL de Firebase Storage
      });

      Alert.alert("Éxito", "Emprendedor guardado correctamente!");

      // Limpiar el formulario
      setNombres('');
      setApellidos('');
      setFecha_nac('');
      setCedula('');
      setGenero('');
      setCorreo('');
      setLocalidad('');
      setDescripcion('');
      setId_usuario('');
      setFotoPerfil(null);
    } catch (error) {
      console.error("Error al guardar emprendedor:", error);
      Alert.alert("Error", "Hubo un problema al guardar el emprendedor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Registro de Emprendedor</Text>

      {/* Cuadro para la imagen de perfil */}
      <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
        {fotoPerfil ? (
          <Image
            source={{ uri: fotoPerfil }}
            style={styles.profileImage}
          />
        ) : (
          <Text style={styles.imageText}>Seleccionar Foto de Perfil</Text>
        )}
      </TouchableOpacity>

      {/* Campos de texto */}
      <Text style={styles.label}>Nombres:</Text>
      <TextInput
        style={styles.input}
        value={nombres}
        onChangeText={setNombres}
        placeholder="Ingresa tus nombres"
      />

      <Text style={styles.label}>Apellidos:</Text>
      <TextInput
        style={styles.input}
        value={apellidos}
        onChangeText={setApellidos}
        placeholder="Ingresa tus apellidos"
      />

      <Text style={styles.label}>Fecha de Nacimiento:</Text>
      <TextInput
        style={styles.input}
        value={fecha_nac}
        onChangeText={setFecha_nac}
        placeholder="YYYY-MM-DD"
      />

      <Text style={styles.label}>Cédula:</Text>
      <TextInput
        style={styles.input}
        value={cedula}
        onChangeText={setCedula}
        placeholder="Ingresa tu cédula"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Género:</Text>
      <TextInput
        style={styles.input}
        value={genero}
        onChangeText={setGenero}
        placeholder="Ingresa tu género"
      />

      <Text style={styles.label}>Correo:</Text>
      <TextInput
        style={styles.input}
        value={correo}
        onChangeText={setCorreo}
        placeholder="Ingresa tu correo electrónico"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Localidad:</Text>
      <TextInput
        style={styles.input}
        value={localidad}
        onChangeText={setLocalidad}
        placeholder="Ingresa tu localidad"
      />

      <Text style={styles.label}>Descripción:</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={descripcion}
        onChangeText={setDescripcion}
        placeholder="Descripción sobre ti"
        multiline={true}
        numberOfLines={4}
      />

      <Text style={styles.label}>ID Usuario:</Text>
      <TextInput
        style={styles.input}
        value={id_usuario}
        onChangeText={setId_usuario}
        placeholder="Ingresa tu ID de usuario"
        keyboardType="numeric"
      />

      {/* Botón de guardar */}
      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : (
        <Button title="Registrarse" onPress={guardarEmprendedor} color="#007BFF" />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#007BFF',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50, // Imagen circular
    borderWidth: 1,
    borderColor: '#007BFF',
  },
  imageText: {
    color: '#007BFF',
    padding: 10,
    borderWidth: 1,
    borderColor: '#007BFF',
    borderRadius: 50,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
  },
});

export default EmprendedorForm;


