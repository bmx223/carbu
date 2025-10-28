
import { GoogleGenAI } from "@google/genai";
import type { Station } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const analyzeFuelTrends = async (stations: Station[]): Promise<string> => {
  const model = 'gemini-2.5-flash';

  const simplifiedData = stations.map(s => ({
    nom: s.name,
    commune: s.communeName,
    statut: s.status,
    file_attente: s.queue,
    carburants_disponibles: Object.entries(s.fuelAvailability)
      .filter(([, available]) => available)
      .map(([fuel]) => fuel)
      .join(', ') || 'Aucun',
  }));

  const prompt = `
    En tant qu'analyste de la situation des carburants à Bamako, analysez les données suivantes.
    Fournissez un résumé concis (3-4 phrases) pour les citoyens sur la situation globale, les zones à surveiller et des conseils utiles.
    Répondez en français.

    Données des stations :
    ${JSON.stringify(simplifiedData, null, 2)}
  `;

  try {
    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Une erreur s'est produite lors de l'analyse des tendances. Veuillez réessayer plus tard.";
  }
};
