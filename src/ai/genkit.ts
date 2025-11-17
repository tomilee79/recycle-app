import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {gemini15Flash} from 'genkit/models';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY || '',
    }),
  ],
  models: [gemini15Flash],
  defaultModel: 'googleai/gemini-1.5-flash-latest',
});
