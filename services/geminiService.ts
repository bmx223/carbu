
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
    En tant qu'analyste expert de la distribution de carburant à Bamako, analysez les données suivantes et générez un rapport clair, structuré et actionnable pour les citoyens.
    Le rapport doit être en français et suivre EXACTEMENT le format Markdown ci-dessous, en utilisant des listes à puces pour les sections.

    **Résumé Global:**
    [Une phrase ou deux résumant la situation générale de l'approvisionnement en carburant à Bamako.]

    **Zones à Privilégier (Meilleure Disponibilité):**
    * [Commune/Zone] : [Raison, ex: "Plusieurs stations disponibles avec des files d'attente courtes à moyennes."].
    * [Commune/Zone] : [Raison].

    **Zones sous Tension (Disponibilité Faible):**
    * [Commune/Zone] : [Raison, ex: "Nombreuses stations en rupture ou avec de très longues files."].
    * [Commune/Zone] : [Raison].

    **Conseils Stratégiques pour les Citoyens:**
    * [Conseil #1: Recommandez des actions spécifiques basées sur les données. Par exemple, "Considérez la Commune V où plusieurs stations ont du gasoil avec des files courtes." ou "Évitez la Commune VI en fin de journée où les tensions sont fortes."].
    * [Conseil #2: Un autre conseil concret et basé sur les données actuelles].

    **Prédictions à Court Terme (Prochaines 24h):**
    * [Prédiction #1: Identifiez une zone où la situation pourrait se dégrader. Par exemple, "Les stations en Commune I avec des files d'attente 'Longue' pourraient bientôt être en rupture de stock."].
    * [Prédiction #2: Une autre prédiction prudente].

    **Tendance Générale:**
    [Une phrase indiquant si la situation globale s'améliore, se dégrade ou est stable par rapport aux dernières heures.]

    Voici les données des stations à analyser :
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
