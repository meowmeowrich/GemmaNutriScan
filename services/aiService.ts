import { FoodAnalysisResult, LmStudioConfig } from '../types';

const SYSTEM_PROMPT = `
You are an expert nutritionist AI analyzing food images.
You must output STRICT VALID JSON only. 
DO NOT write markdown code blocks (no \`\`\`json). 
DO NOT write any conversational text before or after the JSON.

Task:
1. Identify the food in the image.
2. Estimate the portion size and weight (guess the weight in grams).
3. Calculate calories and macros.
4. Estimate vitamin density.

Return strictly this JSON structure:
{
  "foodName": "Dish Name",
  "description": "Brief 1-sentence visual description.",
  "estimatedWeight": "e.g. 250g",
  "calories": 0,
  "macros": {
    "protein": { "name": "Protein", "amount": 0, "unit": "g" },
    "carbs": { "name": "Carbs", "amount": 0, "unit": "g" },
    "fat": { "name": "Fat", "amount": 0, "unit": "g" }
  },
  "vitamins": [
    { "name": "Vitamin A", "level": 0, "unit": "%DV" },
    { "name": "Vitamin C", "level": 0, "unit": "%DV" },
    { "name": "Iron", "level": 0, "unit": "%DV" },
    { "name": "Calcium", "level": 0, "unit": "%DV" }
  ],
  "healthScore": 5
}

If no food is detected, return: {"error": "No food detected"}
`;

export const analyzeFoodImage = async (
  base64Image: string,
  config: LmStudioConfig
): Promise<FoodAnalysisResult> => {
  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

  try {
    const payload = {
      model: config.model,
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this image." },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${cleanBase64}`
              }
            }
          ]
        }
      ],
      temperature: 0.1, // Extremely low temperature for strict JSON adherence
      max_tokens: 800,
      stream: false
    };

    const response = await fetch(`${config.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`AI Server Error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error("No response from AI model");
    }

    let contentString = data.choices[0].message.content;
    
    // Aggressive cleanup for local models that might be chatty
    contentString = contentString.replace(/```json/g, '').replace(/```/g, '').trim();
    // Attempt to find the first { and last }
    const firstBrace = contentString.indexOf('{');
    const lastBrace = contentString.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
        contentString = contentString.substring(firstBrace, lastBrace + 1);
    }

    try {
      const result = JSON.parse(contentString);
      if (result.error) throw new Error(result.error);
      return result as FoodAnalysisResult;
    } catch (e) {
      console.error("Raw Output:", contentString);
      throw new Error("Failed to parse nutrition data. The model output was not valid JSON.");
    }

  } catch (error) {
    console.error("Analysis failed", error);
    throw error;
  }
};