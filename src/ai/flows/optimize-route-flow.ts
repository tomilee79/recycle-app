'use server';

/**
 * @fileOverview This file defines a Genkit flow for optimizing a collection route.
 *
 * - optimizeRoute - A function that accepts a list of locations and returns an optimized route.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const OptimizeRouteLocationSchema = z.object({
  id: z.string(),
  address: z.string(),
});

const OptimizeRouteInputSchema = z.object({
  startPoint: z.string().describe('The starting point of the route, e.g., "본사 차고지".'),
  locations: z.array(OptimizeRouteLocationSchema).describe('An array of locations to be visited.'),
});

const OptimizeRouteOutputSchema = z.object({
  optimizedRoute: z.array(OptimizeRouteLocationSchema).describe('The optimized route as an ordered array of locations.'),
  reasoning: z.string().describe('A brief explanation of why this route is optimal.'),
});

export type OptimizeRouteInput = z.infer<typeof OptimizeRouteInputSchema>;
export type OptimizeRouteOutput = z.infer<typeof OptimizeRouteOutputSchema>;


export async function optimizeRoute(
  input: OptimizeRouteInput
): Promise<OptimizeRouteOutput> {
  return optimizeRouteFlow(input);
}

const optimizeRoutePrompt = ai.definePrompt({
  name: 'optimizeRoutePrompt',
  input: { schema: OptimizeRouteInputSchema },
  output: { schema: OptimizeRouteOutputSchema },
  prompt: `You are an expert logistics coordinator for a waste management company. Your task is to determine the most efficient route for a collection truck.

  You will be given a starting point and a list of collection addresses.

  Starting Point: {{{startPoint}}}
  Collection Addresses:
  {{#each locations}}
  - {{this.address}} (ID: {{this.id}})
  {{/each}}

  Your goal is to reorder the list of collection addresses to create the most logical and efficient route, starting from the given start point and returning to it after the last collection.

  Consider the geographic proximity of the addresses to each other to minimize travel time and distance. Use a common-sense approach based on typical city layouts (e.g., group addresses in the same neighborhood together).

  Return the full list of locations in the optimized order. Also provide a brief, one-sentence reasoning for your chosen route.
  `,
});

const optimizeRouteFlow = ai.defineFlow(
  {
    name: 'optimizeRouteFlow',
    inputSchema: OptimizeRouteInputSchema,
    outputSchema: OptimizeRouteOutputSchema,
  },
  async input => {
    const { output } = await optimizeRoutePrompt(input);
    return output!;
  }
);
