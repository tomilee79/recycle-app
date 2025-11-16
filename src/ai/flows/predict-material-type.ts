'use server';

/**
 * @fileOverview This file defines a Genkit flow for predicting the type of recycled material based on location and time.
 *
 * - predictMaterialType - A function that accepts location and time and returns a predicted material type.
 */

import {ai} from '@/ai/genkit';
import {
  PredictMaterialTypeInputSchema,
  type PredictMaterialTypeInput,
  PredictMaterialTypeOutputSchema,
  type PredictMaterialTypeOutput,
} from '@/ai/flows/schemas';

export async function predictMaterialType(
  input: PredictMaterialTypeInput
): Promise<PredictMaterialTypeOutput> {
  return predictMaterialTypeFlow(input);
}

const predictMaterialTypePrompt = ai.definePrompt({
  name: 'predictMaterialTypePrompt',
  input: {schema: PredictMaterialTypeInputSchema},
  output: {schema: PredictMaterialTypeOutputSchema},
  prompt: `You are an expert in predicting the type of recycled material being collected based on the location and time of day.

  Given the following information, predict the most likely type of recycled material being collected and your confidence level in the prediction.

  Location: {{{location}}}
  Time: {{{time}}}

  Consider factors such as typical recycling habits in the area and common waste disposal patterns at the given time.
  Set the predictedMaterialType to the predicted material and confidenceLevel to a number between 0 and 1 representing the certainty.
  `,
});

const predictMaterialTypeFlow = ai.defineFlow(
  {
    name: 'predictMaterialTypeFlow',
    inputSchema: PredictMaterialTypeInputSchema,
    outputSchema: PredictMaterialTypeOutputSchema,
  },
  async input => {
    const {output} = await predictMaterialTypePrompt(input);
    return output!;
  }
);
