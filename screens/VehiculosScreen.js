// screens/VehiculosScreen.js

import React from 'react';
import JuegoGenerico from '../components/JuegoGenerico';
import { VEHICULOS, CATEGORIA_CONFIG } from '../data/vehiculos';

export default function VehiculosScreen({ navigation }) {
  return (
    <JuegoGenerico
      datos={VEHICULOS}
      categoria="vehiculos"
      titulo={CATEGORIA_CONFIG.titulo}
      coloresGradiente={CATEGORIA_CONFIG.coloresGradiente}
      colorFondo={CATEGORIA_CONFIG.colorFondo}
      navigation={navigation}
    />
  );
}