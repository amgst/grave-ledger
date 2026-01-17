
import { GoogleGenAI, Type } from "@google/genai";
import { GraveRecord } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeGraveRecords = async (records: GraveRecord[]) => {
  const model = "gemini-3-flash-preview";
  
  const recordSummary = records.map(r => ({
    name: r.deceasedFullName,
    death: r.dateOfDeath,
    age: r.ageAtDeath,
    grave: r.graveNumber
  }));

  const prompt = `Analyze these graveyard records for a small local cemetery. 
    Provide the analysis strictly in Urdu.
    Summarize trends in lifespan and mortality over time based on the data provided. 
    Keep the tone respectful and professional.
    
    Data: ${JSON.stringify(recordSummary)}`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });
    return response.text;
  } catch (error) {
    return "تجزیہ کرنے میں دشواری پیش آئی۔";
  }
};

export const suggestNotes = async (deceasedName: string) => {
  const model = "gemini-3-flash-preview";
  const prompt = `Generate a short, respectful memorial note in Urdu for a burial record for ${deceasedName}. 
    Provide 2 variations. Max 30 words each. Use beautiful Urdu poetic or traditional language.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        temperature: 0.9,
      }
    });
    return response.text;
  } catch (error) {
    return "اللہ غریقِ رحمت کرے۔";
  }
};

export const extractGraveInfoFromImage = async (base64Data: string, mimeType: string) => {
  const model = "gemini-3-flash-preview";
  
  const prompt = `You are an expert at reading Urdu (Nastaliq) headstones.
    Carefully examine the provided image of a headstone (vertical photo).
    Look specifically for:
    - Keywords like "ولادت" (Waladat) followed by a year or date for birth. If only a year (e.g., 1990) is found, format it as YYYY-01-01.
    - Keywords like "وفات" (Wafat) followed by a year or date for death.
    - Keyword "عمر" (Age) followed by a number representing years lived.
    - Names written in large Urdu script.
    - Phrases like "بن" (son of) or "بنت" (daughter of) to identify parentNames.
    - Phrases like "زوجہ" (wife of) to identify husbandName.

    LOGIC FOR AGE:
    - If the word "عمر" (Age) is present, extract the number.
    - If "عمر" is NOT present but you found both birth and death years, calculate the age yourself (Death Year - Birth Year).
    - Return the result in the 'ageAtDeath' field as an integer.

    Return the results strictly in JSON format.
    IMPORTANT: Provide the names and notes in Urdu script.
    - deceasedFullName (In Urdu script)
    - parentNames (Father/Mother mentioned, in Urdu script)
    - husbandName (In Urdu script)
    - dateOfBirth (YYYY-MM-DD format)
    - dateOfDeath (YYYY-MM-DD format)
    - ageAtDeath (Integer)
    - notes (Urdu script)
    - gender (Male, Female, or Other)

    Only return JSON.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        },
        { text: prompt }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            deceasedFullName: { type: Type.STRING },
            parentNames: { type: Type.STRING },
            husbandName: { type: Type.STRING },
            dateOfBirth: { type: Type.STRING },
            dateOfDeath: { type: Type.STRING },
            ageAtDeath: { type: Type.INTEGER },
            notes: { type: Type.STRING },
            gender: { type: Type.STRING },
          }
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("OCR Error:", error);
    return null;
  }
};
