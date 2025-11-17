'use server';

/**
 * @fileOverview This file defines a Genkit flow for optimizing a collection route.
 *
 * - optimizeRoute - A function that accepts a list of locations and returns an optimized route.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const OptimizeRouteLocationSchema = z.object({
  id: z.string(),
  address: z.string(),
});

const OptimizeRouteInputSchema = z.object({
  startPoint: z.string().describe('The starting and ending point of the route, e.g., "본사 차고지".'),
  locations: z.array(OptimizeRouteLocationSchema).describe('An array of locations to be visited.'),
});

const OptimizeRouteOutputSchema = z.object({
  optimizedRoute: z.array(OptimizeRouteLocationSchema).describe('The optimized route as an ordered array of locations, including the start/end point.'),
  reasoning: z.string().describe('A brief explanation of why this route is optimal.'),
});

export type OptimizeRouteInput = z.infer<typeof OptimizeRouteInputSchema>;
export type OptimizeRouteOutput = z.infer<typeof OptimizeRouteOutputSchema>;


export async function optimizeRoute(
  input: OptimizeRouteInput
): Promise<OptimizeRouteOutput> {
  const { output } = await ai.generate({
    model: ai.model('googleai/gemini-1.5-flash-latest'),
    prompt: `You are an expert logistics coordinator for a waste management company. Your task is to determine the most efficient route for a collection truck.

  You will be given a starting point and a list of collection addresses. The route must start at the startPoint, visit all locations, and finally return to the startPoint.

  Starting Point: ${input.startPoint}
  Collection Addresses:
  ${input.locations.map(l => `- ${l.address} (ID: ${l.id})`).join('\n')}

  Your goal is to reorder the list of collection addresses to create the most logical and efficient route.

  IMPORTANT: The final 'optimizedRoute' array in your output MUST begin with the 'startPoint' location and also end with the 'startPoint' location. All other locations must be visited in between. The 'startPoint' should have an ID of 'start_end'.

  Consider the geographic proximity of the addresses to each other to minimize travel time and distance. Use a common-sense approach based on typical city layouts (e.g., group addresses in the same neighborhood together).

  Return the full list of locations in the optimized order, including the start and end points. Also provide a brief, one-sentence reasoning for your chosen route.
  `,
    output: {
        schema: OptimizeRouteOutputSchema,
    }
  });

  return output!;
}
