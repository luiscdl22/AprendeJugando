// data/tutorial.js

export const TUTORIAL_PASOS = [
  {
    id: 1,
    numero: "1",
    titulo: "Elige una categoría",
    descripcion: "Elige una categoría. Cada una tiene preguntas diferentes.",
    color: "#8B5CF6",
    imagen: require("../assets/images/tutorial/paso1_categorias.png"),
    audio: require("../assets/sounds/tutorial/paso1.mp3"),
  },
  {
    id: 2,
    numero: "2",
    titulo: "Observa y piensa",
    descripcion: "Mira la imagen o silueta y lee la pista.",
    color: "#4FC3D5",
    imagen: require("../assets/images/tutorial/paso2_observa.png"),
    audio: require("../assets/sounds/tutorial/paso2.mp3"),
  },
  {
    id: 3,
    numero: "3",
    titulo: "Elige tu respuesta",
    descripcion: "Toca tu respuesta y confirma con Sí.",
    color: "#FFB347",
    imagen: require("../assets/images/tutorial/paso3_respuesta.png"),
    audio: require("../assets/sounds/tutorial/paso3.mp3"),
  },
  {
    id: 4,
    numero: "4",
    titulo: "¡Gana estrellas!",
    descripcion: "Cada acierto te da una estrella.",
    color: "#FFD166",
    imagen: require("../assets/images/tutorial/paso4_estrella.png"),
    audio: require("../assets/sounds/tutorial/paso4.mp3"),
  },
];

export const TUTORIAL_TEXTOS = {
  intro: "¡Bienvenido! Soy Sabio y te guiaré paso a paso. ¿Empezamos?",
  final: "¿Quieres que te lo repita?",
};

export const TUTORIAL_AUDIOS = {
  intro: require("../assets/sounds/tutorial/intro.mp3"),
  final: require("../assets/sounds/tutorial/final.mp3"),
};

export const TUTORIAL_CONFIG = {
  titulo: "Aprende y Gana",
  colorFondo: ["#6C3FCF", "#4A6FD4", "#E8F4FD"],
};