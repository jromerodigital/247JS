/// <reference types="vite/client" />
import { GoogleGenAI } from '@google/genai';

const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

/**
 * ASISTENTE DE REDACCIÓN ROMÁNTICA Y SOPORTE POÉTICO
 * Transforma ideas cortas en cartas poéticas profundas y emotivas.
 */
export async function enhanceRomanticLetter(userInput: string): Promise<string> {
  if (!userInput.trim()) {
    throw new Error('Por favor escribe algunas palabras para inspirar al asistente poético.');
  }

  if (!ai) {
    // Fallback poético estilizado sin API key
    return `Mi amor,\n\n${userInput}\n\nCada segundo a tu lado me confirma que eres el regalo más hermoso de mi vida. Gracias por iluminar mis días con tu mirada y tu sonrisa.\n\nHemos construido algo hermoso en tan poco tiempo, y me emociona saber que esto es solo el comienzo de nuestra historia. Te amo infinitamente.`;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Eres un escritor romántico experto en convertir pensamientos sencillos en cartas de amor profundas, poéticas y sumamente emotivas.

INSTRUCCIONES DE ESTILO:
- Mantén la autenticidad y los detalles del usuario.
- Usa lenguaje evocador, poético pero natural y humano. Evita sonar demasiado plano o robótico.
- Divide la carta en 3 o 4 párrafos fluidos y conmovedores.
- NO agregues firmas genéricas al final (como "Atentamente", "Con amor", etc.), enfócate solo en el cuerpo de la carta.

IDEA O MENSAJE DEL USUARIO:
"${userInput}"`,
    });

    const result = response.text;
    if (!result) throw new Error('No se pudo generar la carta romántica.');
    return result.trim();
  } catch (error) {
    console.error('Error al generar la carta con Gemini:', error);
    return `${userInput}\n\nGracias por cada risa, cada abrazo y por ser mi lugar seguro en el mundo. Prometo buscar todos los días una nueva forma de hacerte feliz. Te amo con todo mi corazón.`;
  }
}
