import React, { useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Baloo2_700Bold, Baloo2_800ExtraBold } from '@expo-google-fonts/baloo-2';

const { width } = Dimensions.get('window');

const PASOS = [
  {
    numero: '1',
    color: '#4FC3D5',
    colorBorde: '#3AA8BA',
    imagen: require('../assets/images/tut_paso1.png'),
    titulo: 'Elige una categoría',
    descripcion: 'Escoge la categoría que más te guste: animales, frutas, transportes y más.',
  },
  {
    numero: '2',
    color: '#88CC88',
    colorBorde: '#6AAE6A',
    imagen: require('../assets/images/tut_paso2.png'),
    titulo: 'Adivina la silueta',
    descripcion: 'Verás una silueta misteriosa. ¡Elige cuál de las 3 imágenes corresponde!',
  },
  {
    numero: '3',
    color: '#FFB347',
    colorBorde: '#E0903A',
    imagen: require('../assets/images/tut_paso3.png'),
    titulo: '¡Dato curioso!',
    descripcion: 'Si aciertas, ¡ganarás una ⭐ y aprenderás algo increíble sobre lo que adivinaste!',
  },
  {
    numero: '4',
    color: '#C39BD3',
    colorBorde: '#A569BD',
    imagen: require('../assets/images/tut_paso4.png'),
    titulo: 'Tus resultados',
    descripcion: 'Al terminar verás cuántas estrellas ganaste. ¡Intenta conseguirlas todas!',
  },
];

function BotonRegresar({ onPress }) {
  return (
    <TouchableOpacity style={styles.botonRegresar} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.textoRegresar}>← Regresar</Text>
    </TouchableOpacity>
  );
}

export default function ComoJugar({ navigation }) {
  const [fontsLoaded] = useFonts({ Baloo2_700Bold, Baloo2_800ExtraBold });
  const scrollRef = useRef(null);

  if (!fontsLoaded) return null;

  return (
    <LinearGradient
      colors={['#E8F4FD', '#C5E3F7', '#A8D4F0']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.fondo}
    >
      <StatusBar style="dark" />
      <SafeAreaView style={styles.contenido}>
        <BotonRegresar onPress={() => navigation.goBack()} />

        <Text style={styles.titulo}>¿Cómo se juega?</Text>

        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContenido}
          showsVerticalScrollIndicator={false}
        >
          {PASOS.map((paso, index) => (
            <View
              key={paso.numero}
              style={[styles.tarjeta, { backgroundColor: paso.color, borderColor: paso.colorBorde }]}
            >
              <View style={styles.filaSuperior}>
                <View style={styles.circuloNumero}>
                  <Text style={styles.numero}>{paso.numero}</Text>
                </View>
                <Text style={styles.titulopaso}>{paso.titulo}</Text>
              </View>

              <View style={styles.circuloImagen}>
                <Image source={paso.imagen} style={styles.imagen} resizeMode="contain" />
              </View>

              <Text style={styles.descripcion}>{paso.descripcion}</Text>

              {index < PASOS.length - 1 && (
                <Text style={styles.flechaEntrada}>▼  ▼  ▼</Text>
              )}
            </View>
          ))}

          <View style={{ height: 20 }} />
        </ScrollView>

        <TouchableOpacity
          style={styles.botonAccion}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Categorias')}
        >
          <Text style={styles.textoBotonAccion}>¡LISTO, VAMOS!</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1 },
  contenido: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  botonRegresar: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFC400',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#1A3C5E',
    elevation: 4,
    marginBottom: 10,
  },
  textoRegresar: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 14,
    color: '#1A3C5E',
  },
  titulo: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 34,
    color: '#1A3C5E',
    textAlign: 'center',
    marginBottom: 14,
  },
  scroll: { flex: 1 },
  scrollContenido: { paddingBottom: 8 },

  tarjeta: {
    borderRadius: 28,
    borderWidth: 3,
    padding: 22,
    marginBottom: 10,
    alignItems: 'center',
    elevation: 5,
  },
  filaSuperior: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 18,
  },
  circuloNumero: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 2,
    borderColor: 'rgba(26,60,94,0.25)',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 14,
  },
  numero: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 24, color: '#1A3C5E',
  },
  titulopaso: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 24, color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  circuloImagen: {
    width: width * 0.6, height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: 'rgba(255,255,255,0.45)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  imagen: { width: width * 0.46, height: width * 0.46 },
  descripcion: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 20, color: '#FFFFFF',
    textAlign: 'center', lineHeight: 28,
  },
  flechaEntrada: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 16,
    letterSpacing: 6,
  },

  botonAccion: {
    backgroundColor: '#FFC400',
    paddingVertical: 18,
    borderRadius: 50,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#1A3C5E',
    shadowColor: '#1A3C5E',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.28,
    shadowRadius: 0,
    elevation: 7,
    marginTop: 12,
  },
  textoBotonAccion: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 22, color: '#1A3C5E',
    letterSpacing: 0.5,
  },
});