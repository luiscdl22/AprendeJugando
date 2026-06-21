import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Speech from "expo-speech";

const FRASE_PRUEBA =
  "Bienvenido a Aprende Jugando. Presiona el botón Jugar para comenzar con la diversión.";

export default function PruebaVoces() {
  const [voces, setVoces] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    Speech.getAvailableVoicesAsync().then((todas) => {
      const espanol = todas.filter((v) =>
        v.language?.toLowerCase().startsWith("es"),
      );
      setVoces(espanol);
      setCargando(false);
    });
  }, []);

  const probarVoz = (voz) => {
    Speech.stop();
    Speech.speak(FRASE_PRUEBA, {
      voice: voz.identifier,
      language: voz.language,
      pitch: 1.15,
      rate: 0.92,
    });
  };

  return (
    <SafeAreaView style={styles.contenedor}>
      <Text style={styles.titulo}>Voces en español encontradas</Text>
      <Text style={styles.subtitulo}>
        {cargando
          ? "Buscando voces instaladas en tu teléfono..."
          : `${voces.length} voces disponibles. Toca una para escucharla.`}
      </Text>

      <Text style={styles.tip}>
        Tip: en iOS busca las que digan "Enhanced" o "Premium" en calidad —
        suenan mucho más naturales que las "Default". En Android, las que
        terminan en "-network" suelen ser las de mejor calidad (necesitan
        internet).
      </Text>

      <FlatList
        data={voces}
        keyExtractor={(item) => item.identifier}
        contentContainerStyle={{ paddingBottom: 30 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.fila} onPress={() => probarVoz(item)}>
            <Text style={styles.nombre}>{item.name}</Text>
            <Text style={styles.detalle}>{item.identifier}</Text>
            <Text style={styles.detalle}>
              {item.language} · calidad: {item.quality || "Default"}
            </Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: "#fff",
  },
  titulo: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2D2A55",
    marginBottom: 4,
  },
  subtitulo: { fontSize: 14, color: "#555", marginBottom: 10 },
  tip: {
    fontSize: 12,
    color: "#6FA8E8",
    backgroundColor: "#EFF6FF",
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
  },
  fila: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  nombre: { fontSize: 16, fontWeight: "700", color: "#2D2A55" },
  detalle: { fontSize: 12, color: "#777" },
});
