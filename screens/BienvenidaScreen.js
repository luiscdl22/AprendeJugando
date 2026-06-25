import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Baloo2_700Bold, Baloo2_800ExtraBold } from '@expo-google-fonts/baloo-2';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const TOTAL_PASOS = 3;

const AVATARES = [
  { id: 1, imagen: require('../assets/images/avatar1.png') },
  { id: 2, imagen: require('../assets/images/avatar2.png') },
  { id: 3, imagen: require('../assets/images/avatar3.png') },
  { id: 4, imagen: require('../assets/images/avatar4.png') },
  { id: 5, imagen: require('../assets/images/avatar5.png') },
];

function BarraProgreso({ pasoActual, onRegresar }) {
  const progreso = pasoActual / TOTAL_PASOS;
  return (
    <View style={styles.barraContenedor}>
      <TouchableOpacity onPress={onRegresar} style={styles.botonFlecha} activeOpacity={0.7}>
        <Text style={styles.flecha}>←</Text>
      </TouchableOpacity>
      <View style={styles.barraFondo}>
        <View style={[styles.barraRelleno, { width: `${progreso * 100}%` }]} />
      </View>
    </View>
  );
}

export default function BienvenidaScreen({ navigation }) {
  const [fontsLoaded] = useFonts({ Baloo2_700Bold, Baloo2_800ExtraBold });
  const [paso, setPaso] = useState(1);
  const [nombre, setNombre] = useState('');
  const [edad, setEdad] = useState('');
  const [avatarSeleccionado, setAvatarSeleccionado] = useState(null);

  if (!fontsLoaded) return null;

  const regresar = () => {
    if (paso === 1) navigation.goBack();
    else setPaso(paso - 1);
  };

  const continuar = async () => {
    if (paso === 1 && nombre.trim().length === 0) return;
    if (paso === 2 && edad.trim().length === 0) return;
    if (paso === 3 && !avatarSeleccionado) return;
    Keyboard.dismiss();
    if (paso < TOTAL_PASOS) {
      setPaso(paso + 1);
    } else {
      try {
        await AsyncStorage.setItem('perfil', JSON.stringify({
          nombre: nombre.trim(),
          edad,
          avatarSeleccionado,
        }));
      } catch (e) {}
      navigation.navigate('ComoJugar', { nombre: nombre.trim(), edad, avatarSeleccionado });
    }
  };

  const botonActivo = () => {
    if (paso === 1) return nombre.trim().length > 0;
    if (paso === 2) return edad.trim().length > 0;
    if (paso === 3) return avatarSeleccionado !== null;
    return true;
  };

  return (
    <LinearGradient
      colors={['#E8F4FD', '#C5E3F7', '#A8D4F0']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.fondo}
    >
      <StatusBar style="dark" />
      <SafeAreaView style={styles.contenido}>
        <KeyboardAvoidingView
          style={{ flex: 1, width: '100%' }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <BarraProgreso pasoActual={paso} onRegresar={regresar} />

          {/* PASO 1 — Nombre */}
          {paso === 1 && (
            <View style={styles.cuerpo}>
              <Image
                source={require('../assets/images/mascota.png')}
                style={styles.mascota}
                resizeMode="contain"
              />
              <Text style={styles.titulo}>¿Cómo te llamas?</Text>
              <Text style={styles.subtitulo}>¡Sabio quiere conocerte!</Text>
              <TextInput
                style={styles.input}
                placeholder="Escribe tu nombre..."
                placeholderTextColor="#5A9BC2"
                value={nombre}
                onChangeText={setNombre}
                maxLength={20}
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={continuar}
              />
            </View>
          )}

          {/* PASO 2 — Edad */}
          {paso === 2 && (
            <View style={styles.cuerpo}>
              <Image
                source={require('../assets/images/mascota.png')}
                style={styles.mascota}
                resizeMode="contain"
              />
              <Text style={styles.titulo}>¿Cuántos años tiene{'\n'}{nombre}?</Text>
              <Text style={styles.subtitulo}>¡Personalizamos el juego para ti!</Text>
              <TextInput
                style={styles.input}
                placeholder="Tu edad..."
                placeholderTextColor="#5A9BC2"
                value={edad}
                onChangeText={(t) => setEdad(t.replace(/[^0-9]/g, '').slice(0, 2))}
                keyboardType="number-pad"
                maxLength={2}
                returnKeyType="done"
                onSubmitEditing={continuar}
              />
            </View>
          )}

          {/* PASO 3 — Selección de avatar */}
          {paso === 3 && (
            <View style={styles.cuerpoAvatar}>
              <Text style={styles.titulo}>¡Elige tu personaje,{'\n'}{nombre}!</Text>
              <Text style={styles.subtitulo}>Este será tu compañero de aventuras</Text>

              <View style={styles.filaAvatares}>
                {AVATARES.slice(0, 3).map((av) => {
                  const seleccionado = avatarSeleccionado === av.id;
                  return (
                    <View key={av.id} style={styles.contenedorAvatar}>
                      <TouchableOpacity
                        onPress={() => setAvatarSeleccionado(av.id)}
                        activeOpacity={0.8}
                        style={[styles.circuloAvatar, seleccionado && styles.circuloAvatarSeleccionado]}
                      >
                        <Image source={av.imagen} style={styles.imagenAvatar} resizeMode="cover" />
                      </TouchableOpacity>
                      {seleccionado && (
                        <View style={styles.checkAvatar}>
                          <Text style={styles.checkTexto}>✓</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
              <View style={styles.filaAvatares}>
                {AVATARES.slice(3, 5).map((av) => {
                  const seleccionado = avatarSeleccionado === av.id;
                  return (
                    <View key={av.id} style={styles.contenedorAvatar}>
                      <TouchableOpacity
                        onPress={() => setAvatarSeleccionado(av.id)}
                        activeOpacity={0.8}
                        style={[styles.circuloAvatar, seleccionado && styles.circuloAvatarSeleccionado]}
                      >
                        <Image source={av.imagen} style={styles.imagenAvatar} resizeMode="cover" />
                      </TouchableOpacity>
                      {seleccionado && (
                        <View style={styles.checkAvatar}>
                          <Text style={styles.checkTexto}>✓</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[styles.botonContinuar, { opacity: botonActivo() ? 1 : 0.4 }]}
            onPress={continuar}
            disabled={!botonActivo()}
            activeOpacity={0.8}
          >
            <Text style={styles.textoBoton}>
              {paso === TOTAL_PASOS ? '¡EMPEZAR!' : 'CONTINUAR'}
            </Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1 },
  contenido: { flex: 1, alignItems: 'center' },

  barraContenedor: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
    width: '100%',
  },
  botonFlecha: {
    width: 36, height: 36,
    justifyContent: 'center', alignItems: 'center',
  },
  flecha: { fontSize: 26, color: '#1A3C5E', fontWeight: '800' },
  barraFondo: {
    flex: 1, height: 16,
    backgroundColor: 'rgba(26,60,94,0.18)',
    borderRadius: 10, overflow: 'hidden',
  },
  barraRelleno: {
    height: '100%',
    backgroundColor: '#FFC400',
    borderRadius: 10,
  },

  cuerpo: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 28, gap: 16,
  },
  cuerpoAvatar: {
    flex: 1, alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 10,
  },

  filaAvatares: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginVertical: 10,
  },
  circuloAvatar: {
    width: (width - 120) / 3,
    height: (width - 120) / 3,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 4,
    borderColor: 'rgba(26,60,94,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    elevation: 4,
  },
  circuloAvatarSeleccionado: {
    borderColor: '#FFC400',
    borderWidth: 5,
    backgroundColor: 'rgba(255,196,0,0.15)',
    elevation: 8,
  },
  imagenAvatar: {
    width: '100%',
    height: '100%',
  },
  contenedorAvatar: {
    position: 'relative',
  },
  checkAvatar: {
    position: 'absolute',
    bottom: 0,
    right: -4,
    width: 28, height: 28,
    borderRadius: 14,
    backgroundColor: '#FFC400',
    borderWidth: 2.5,
    borderColor: '#1A3C5E',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  checkTexto: {
    fontSize: 14,
    color: '#1A3C5E',
    fontWeight: '900',
  },

  mascota: { width: 180, height: 180, marginBottom: 8 },

  titulo: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 28, color: '#1A3C5E',
    textAlign: 'center',
  },
  subtitulo: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 16, color: '#2E6B9E',
    textAlign: 'center', marginTop: -8,
  },

  input: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: 18,
    borderWidth: 3,
    borderColor: '#1A3C5E',
    paddingVertical: 14,
    paddingHorizontal: 20,
    fontFamily: 'Baloo2_700Bold',
    fontSize: 20,
    color: '#1A3C5E',
    marginTop: 10,
  },

  botonContinuar: {
    backgroundColor: '#FFC400',
    marginHorizontal: 24, marginBottom: 16,
    paddingVertical: 18, borderRadius: 50,
    alignItems: 'center',
    borderWidth: 3, borderColor: '#1A3C5E',
    shadowColor: '#1A3C5E',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    elevation: 6,
  },
  textoBoton: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 20, color: '#1A3C5E', letterSpacing: 1,
  },
});