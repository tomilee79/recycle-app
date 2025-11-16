/**
 * @fileoverview This file contains Zod schemas for form validation in client components.
 * These schemas are decoupled from the AI flow definitions to prevent server-side
 * code from being bundled with the client application.
 */
import { z } from 'zod';

/**
 * Schema for the predict material type form.
 */
export const PredictMaterialTypeFormSchema = z.object({
  location: z
    .string()
    .min(3, "위치는 최소 3자 이상이어야 합니다.")
    .describe('The location where the recycling collection is taking place.'),
  time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "시간을 HH:MM 형식으로 입력해주세요.")
    .describe('The time of day when the collection occurs.'),
});

// Note: The related server-side types (PredictMaterialTypeInput, PredictMaterialTypeOutput)
// are defined and exported directly from 'src/ai/flows/predict-material-type.ts'.

const OptimizeRouteLocationSchema = z.object({
  id: z.string(),
  address: z.string(),
});

export const OptimizeRouteInputSchema = z.object({
  startPoint: z.string().describe('The starting point of the route, e.g., "본사 차고지".'),
  locations: z.array(OptimizeRouteLocationSchema).describe('An array of locations to be visited.'),
});

export const OptimizeRouteOutputSchema = z.object({
  optimizedRoute: z.array(OptimizeRouteLocationSchema).describe('The optimized route as an ordered array of locations.'),
  reasoning: z.string().describe('A brief explanation of why this route is optimal.'),
});

export type OptimizeRouteLocation = z.infer<typeof OptimizeRouteLocationSchema>;
export type OptimizeRouteInput = z.infer<typeof OptimizeRouteInputSchema>;
export type OptimizeRouteOutput = z.infer<typeof OptimizeRouteOutputSchema>;
