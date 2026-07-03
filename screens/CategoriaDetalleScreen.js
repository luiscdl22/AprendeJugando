import React from 'react';
import { StyleSheet, Text, View, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Baloo2_700Bold, Baloo2_800ExtraBold } from '@expo-google-fonts/baloo-2';
import { useVideoPlayer, VideoView } from 'expo-video';

import CustomButton from '../components/CustomButton';

export default function CategoriaDetalleScreen({ navigation, route }) {
  const [fontsLoaded] = useFonts({ Baloo2_700Bold, Baloo2_800ExtraBold });
  const categoria = route.params?.categoria;

  const player = useVideoPlayer(categoria?.videoSource ?? null);

  if (!fontsLoaded || !categoria) return null;

  const irAJuego = () => {
    if (categoria.ruta) {
      navigation.navigate(categoria.ruta);
      return;
    }

    navigation.goBack();
  };

  return (
    <LinearGradient colors={['#6C3FCF', '#4A6FD4', '#E8F4FD']} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={styles.fondo}>
      <StatusBar style="light" />

      <SafeAreaView style={styles.contenido}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <Text style={styles.titulo}>{categoria.titulo}</Text>
          <Text style={styles.subtitulo}>{categoria.resumen}</Text>

          <View style={styles.tarjetaLectura}>
            <Text style={styles.tituloSeccion}>Lee esto primero</Text>
            <Text style={styles.textoLectura}>{categoria.detalle}</Text>
          </View>

          <View style={styles.tarjetaVideo}>
            <Text style={styles.tituloSeccion}>Video</Text>
            {categoria.videoSource ? (
              <VideoView player={player} style={styles.video} contentFit="contain" nativeControls />
            ) : (
              <View style={styles.videoPlaceholder}>
                <Image source={categoria.icono} style={styles.videoIcono} resizeMode="contain" />
                <Text style={styles.videoTexto}>Aquí puedes agregar un video corto de apoyo.</Text>
              </View>
            )}
          </View>

          <View style={styles.tarjetaResumen}>
            <Text style={styles.tituloSeccion}>Actividad</Text>
            <Text style={styles.textoLectura}>{categoria.resumen}</Text>
            <Text style={styles.textoExtra}>{categoria.detalle}</Text>
          </View>

          <CustomButton label={categoria.ruta ? 'Abrir actividad' : 'Volver al menú'} onPress={irAJuego} variant="primary" fullWidth />
          <CustomButton label="Volver" onPress={() => navigation.goBack()} variant="secondary" fullWidth style={{ marginTop: 8 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1 },
  contenido: { flex: 1, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  scroll: { paddingBottom: 12 },
  titulo: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 34, color: '#1A3C5E', textAlign: 'center' },
  subtitulo: { fontFamily: 'Baloo2_700Bold', fontSize: 15, color: 'rgba(26,60,94,0.82)', textAlign: 'center', marginTop: 4, marginBottom: 14 },
  tarjetaLectura: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 22,
    padding: 16,
    marginBottom: 12,
  },
  tarjetaVideo: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 22,
    padding: 16,
    marginBottom: 12,
  },
  tarjetaResumen: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
  },
  tituloSeccion: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 18, color: '#1A3C5E', marginBottom: 6 },
  textoLectura: { fontFamily: 'Baloo2_700Bold', fontSize: 15, color: '#1A3C5E', lineHeight: 22 },
  textoExtra: { fontFamily: 'Baloo2_700Bold', fontSize: 14, color: '#1A3C5E', lineHeight: 20, marginTop: 8 },
  video: {
    width: '100%',
    height: 220,
    backgroundColor: '#0F2440',
    borderRadius: 18,
  },
  videoPlaceholder: {
    minHeight: 220,
    borderRadius: 18,
    backgroundColor: '#DDEAF7',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  videoIcono: { width: 96, height: 96, marginBottom: 10 },
  videoTexto: { fontFamily: 'Baloo2_700Bold', fontSize: 14, color: '#1A3C5E', textAlign: 'center', lineHeight: 20 },
});