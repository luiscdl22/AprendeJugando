// screens/UtilesScreen.js

import React from 'react';
import JuegoGenerico from '../components/JuegoGenerico';
import { UTILES, CATEGORIA_CONFIG } from '../data/utiles';

export default function UtilesScreen({ navigation }) {
  return (
    <JuegoGenerico
      datos={UTILES}
      categoria="utiles"
      titulo={CATEGORIA_CONFIG.titulo}
      coloresGradiente={CATEGORIA_CONFIG.coloresGradiente}
      colorFondo={CATEGORIA_CONFIG.colorFondo}
      navigation={navigation}
    />
  );
}