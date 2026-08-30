/// <reference types="vite/client" />
import { GoogleGenAI } from '@google/genai';

// Initialize Gemini Client
const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function enhanceRomanticLetter(userInput: string): Promise<string> {
  if (!userInput.trim()) {
    throw new Error('Por favor escribe algunas palabras para inspirar a la IA.');
  }

  if (!ai) {
    // Si no hay API key configurada, ofrecemos una versión poética estilizada de ejemplo
    return `Mi amor,\n\n${userInput}\n\nCada segundo a tu lado me confirma que eres el regalo más hermoso de mi vida. Gracias por hacer que mi mundo sea más brillante simplemente existiendo. Te amo infinitamente.`;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Eres un reconocido poeta y escritor romántico. El usuario te dará una idea o mensaje corto dirigido a su pareja ("su persona favorita"). Tu tarea es transformar esa idea en una carta romántica, poética, elegante, emotiva y profunda en español. 

Reglas:
1. Mantén la esencia y los detalles personales del mensaje original.
2. Usa un tono cálido, romántico, poético y sincero.
3. Divide el resultado en 3 a 5 párrafos bien estructurados.
4. No agregues saludos ni firmas genéricas como "Atentamente" al final, solo el cuerpo poético de la carta.

Mensaje original del usuario:
"${userInput}"`,
    });

    const result = response.text;
    if (!result) {
      throw new Error('No se pudo generar la carta romántica.');
    }

    return result.trim();
  } catch (error) {
    console.error('Error al generar la carta con Gemini:', error);
    // Fallback elegante
    return `${userInput}\n\nGracias por cada risa, cada abrazo y cada momento juntos. Prometo cuidar tu corazón y buscar mil formas de hacerte feliz todos los días. Te amo infinitamente.`;
  }
}
