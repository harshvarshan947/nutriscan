import { ProductDetails } from '../types/product';
import { HealthAssessmentResult } from '../types/assessment';
import { UserProfile } from '../types/profile';

interface AiExplanationRequest {
  product: ProductDetails;
  assessment: HealthAssessmentResult;
  userProfile?: UserProfile;
  apiKey?: string;
}

export const aiService = {
  /**
   * Generate an educational natural-language summary.
   * If an API key is available and online, calls Gemini API with strict safety system prompts.
   * Otherwise, generates a deterministic, expert nutritionist-crafted summary immediately.
   */
  async generateSummary(request: AiExplanationRequest): Promise<string> {
    const { product, assessment, userProfile, apiKey } = request;

    // If Gemini API key is provided and browser is online, attempt API call
    if (apiKey && navigator.onLine) {
      try {
        const generated = await this.callGeminiApi(apiKey, product, assessment, userProfile);
        if (generated && generated.trim().length > 20) {
          return generated;
        }
      } catch (err) {
        console.warn('Gemini API call failed, using deterministic nutritionist engine:', err);
      }
    }

    // High quality deterministic rule-based template generation (100% reliable & instant)
    return this.generateDeterministicExplanation(product, assessment, userProfile);
  },

  /**
   * Deterministic explanation builder based on exact calculated factors
   */
  generateDeterministicExplanation(
    product: ProductDetails,
    assessment: HealthAssessmentResult,
    userProfile?: UserProfile
  ): string {
    const n = product.nutrientsServing || product.nutrients100g;
    const servLabel = product.nutrientsServing ? `per serving (${product.servingSize})` : 'per 100g';
    const paragraphs: string[] = [];

    // Opening Assessment
    if (assessment.qualityTier === 'Excellent') {
      paragraphs.push(
        `${product.name} presents an outstanding nutritional profile ${servLabel}. It provides a wholesome balance of essential nutrients with minimal excess sugars or saturated fats.`
      );
    } else if (assessment.qualityTier === 'Good') {
      paragraphs.push(
        `${product.name} offers a solid nutritional makeup ${servLabel} that can easily fit into a well-rounded eating pattern.`
      );
    } else if (assessment.qualityTier === 'Moderate') {
      paragraphs.push(
        `${product.name} delivers moderate nutritional value ${servLabel}. While it provides usable energy, certain components (such as sugars, saturated fat, or sodium) are worth balancing across the rest of your day's meals.`
      );
    } else {
      paragraphs.push(
        `${product.name} is quite energy-dense with higher levels of concentrated nutrients ${servLabel}. It is best enjoyed mindfully as an occasional treat rather than a primary dietary staple.`
      );
    }

    // Key Highlights & Trade-offs
    const positives = assessment.positiveFactors.map((f) => f.title.toLowerCase());
    const cautions = assessment.cautionFactors.map((f) => f.title.toLowerCase());

    const highlights: string[] = [];
    if (positives.length > 0) {
      highlights.push(`Key positives include its ${positives.slice(0, 2).join(' and ')}.`);
    }
    if (cautions.length > 0) {
      highlights.push(`Points to keep in mind include its ${cautions.slice(0, 2).join(' and ')}.`);
    }
    if (highlights.length > 0) {
      paragraphs.push(highlights.join(' '));
    }

    // Practical Dietary Action
    if (n.protein >= 10 && n.fiber >= 4) {
      paragraphs.push(
        `Because it is rich in both dietary fiber (${n.fiber}g) and protein (${n.protein}g), it helps promote steady fullness and stable energy release.`
      );
    } else if (n.sugars > 15) {
      paragraphs.push(
        `Pairing this with a source of protein or fiber (like Greek yogurt, raw nuts, or seeds) can help slow carbohydrate absorption and maintain steady energy levels.`
      );
    } else if (n.sodium > 500) {
      paragraphs.push(
        `Given its higher sodium content (${n.sodium}mg), consider enjoying it alongside fresh fruits, greens, or unsalted whole grains to keep your total daily sodium balanced.`
      );
    } else {
      paragraphs.push(
        `Enjoy as part of a varied, nutrient-dense diet rich in whole grains, vegetables, and lean protein sources.`
      );
    }

    return paragraphs.join('\n\n');
  },

  /**
   * Gemini 1.5 / 2.0 Flash API caller with strict safety boundaries
   */
  async callGeminiApi(
    apiKey: string,
    product: ProductDetails,
    assessment: HealthAssessmentResult,
    userProfile?: UserProfile
  ): Promise<string> {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`;

    const structuredData = {
      productName: product.name,
      brand: product.brand,
      serving: product.servingSize || '100g',
      calories: (product.nutrientsServing || product.nutrients100g).calories,
      proteinGrams: (product.nutrientsServing || product.nutrients100g).protein,
      carbsGrams: (product.nutrientsServing || product.nutrients100g).carbohydrates,
      sugarGrams: (product.nutrientsServing || product.nutrients100g).sugars,
      fatGrams: (product.nutrientsServing || product.nutrients100g).fat,
      saturatedFatGrams: (product.nutrientsServing || product.nutrients100g).saturatedFat,
      fiberGrams: (product.nutrientsServing || product.nutrients100g).fiber,
      sodiumMg: (product.nutrientsServing || product.nutrients100g).sodium,
      calculatedQualityScore: assessment.qualityScore,
      qualityTier: assessment.qualityTier,
      positivePoints: assessment.positiveFactors.map((f) => f.title),
      cautionPoints: assessment.cautionFactors.map((f) => f.title),
      userGoal: userProfile?.goal || 'general healthy eating',
    };

    const systemPrompt = `You are a friendly, evidence-based nutrition education assistant for a food scanning app.
STRICT SAFETY & ETHICAL RULES:
1. Explain the product's nutrition in 2-3 concise, warm, educational paragraphs.
2. Base your explanation strictly on the provided structured numbers.
3. NEVER diagnose any medical disease or health condition.
4. NEVER claim the user has diabetes, hypertension, obesity, or any pathology.
5. NEVER advise stopping or changing medications.
6. NEVER say a food is "toxic" or "forbidden". Instead, talk about balance, portion sizing, and pairing.
7. End with a practical, non-judgmental suggestion on how to balance this food in a daily diet.`;

    const userPrompt = `Here is the food data to explain:
${JSON.stringify(structuredData, null, 2)}

Provide a concise, easy-to-read, 2-3 paragraph educational explanation for the consumer.`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 350,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return text || '';
  },
};
