// screens/AnimalesScreen.js
import React from 'react';
import JuegoGenerico from '../components/JuegoGenerico';
import { ANIMALES, CATEGORIA_CONFIG } from '../data/animales';

export default function AnimalesScreen({ navigation }) {
  return (
    <JuegoGenerico
      datos={ANIMALES}
      categoria="animales"
      titulo={CATEGORIA_CONFIG.titulo}
      coloresGradiente={CATEGORIA_CONFIG.coloresGradiente}
      colorFondo={CATEGORIA_CONFIG.colorFondo}
      navigation={navigation}
    />
  );
}