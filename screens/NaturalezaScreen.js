// screens/NaturalezaScreen.js

import React from 'react';
import JuegoGenerico from '../components/JuegoGenerico';
import { NATURALEZA, CATEGORIA_CONFIG } from '../data/naturaleza';

export default function NaturalezaScreen({ navigation }) {
  return (
    <JuegoGenerico
      datos={NATURALEZA}
      categoria="naturaleza"
      titulo={CATEGORIA_CONFIG.titulo}
      coloresGradiente={CATEGORIA_CONFIG.coloresGradiente}
      colorFondo={CATEGORIA_CONFIG.colorFondo}
      navigation={navigation}
    />
  );
}