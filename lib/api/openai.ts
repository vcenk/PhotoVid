import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true // Only for demo/client-side testing
});

/**
 * Enhance a user prompt for better cinematic results
 */
export const enhancePrompt = async (userPrompt: string, industry: string = 'Real Estate') => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert prompt engineer for cinematic AI video generation. 
          Your goal is to take a simple description and turn it into a high-quality, professional prompt.
          Focus on lighting (golden hour, soft interiors), camera movement (slow pan, orbit), and texture.
          Context: ${industry}`
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI Enhancement Error:", error);
    return userPrompt; // Fallback to original
  }
};
