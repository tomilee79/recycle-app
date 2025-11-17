/**
 * @fileoverview This file contains Zod schemas for form validation in client components.
 * These schemas are decoupled from the AI flow definitions to prevent server-side
 * code from being bundled with the client application.
 */
import { z } from 'zod';

const OptimizeRouteLocationSchema = z.object({
  id: z.string(),
  address: z.string(),
});

export const OptimizeRouteInputSchema = z.object({
  startPoint: z.string().describe('The starting and ending point of the route, e.g., "본사 차고지".'),
  locations: z.array(OptimizeRouteLocationSchema).describe('An array of locations to be visited.'),
});

export const OptimizeRouteOutputSchema = z.object({
  optimizedRoute: z.array(OptimizeRouteLocationSchema).describe('The optimized route as an ordered array of locations, including the start/end point.'),
  reasoning: z.string().describe('A brief explanation of why this route is optimal.'),
});

export type OptimizeRouteLocation = z.infer<typeof OptimizeRouteLocationSchema>;
export type OptimizeRouteInput = z.infer<typeof OptimizeRouteInputSchema>;
export type OptimizeRouteOutput = z.infer<typeof OptimizeRouteOutputSchema>;
