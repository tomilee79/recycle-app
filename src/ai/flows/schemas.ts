import { z } from 'genkit';

/**
 * Schemas for predict-material-type flow
 */
export const PredictMaterialTypeInputSchema = z.object({
  location: z
    .string()
    .min(3, "위치는 최소 3자 이상이어야 합니다.")
    .describe('The location where the recycling collection is taking place.'),
  time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "시간을 HH:MM 형식으로 입력해주세요.")
    .describe('The time of day when the collection occurs.'),
});
export type PredictMaterialTypeInput = z.infer<typeof PredictMaterialTypeInputSchema>;

export const PredictMaterialTypeOutputSchema = z.object({
  predictedMaterialType: z
    .string()
    .describe('The predicted type of recycled material being collected.'),
  confidenceLevel: z
    .number()
    .describe('The confidence level of the prediction (0-1).'),
});
export type PredictMaterialTypeOutput = z.infer<typeof PredictMaterialTypeOutputSchema>;


/**
 * Schemas for optimize-route-flow
 */
export const OptimizeRouteInputSchema = z.object({
  startPoint: z.string().describe('The starting point of the route, e.g., "본사 차고지".'),
  locations: z.array(z.object({
    id: z.string(),
    address: z.string(),
  })).describe('An array of locations to be visited.'),
});
export type OptimizeRouteInput = z.infer<typeof OptimizeRouteInputSchema>;

export const OptimizeRouteOutputSchema = z.object({
  optimizedRoute: z.array(z.object({
    id: z.string(),
    address: z.string(),
  })).describe('The optimized route as an ordered array of locations.'),
  reasoning: z.string().describe('A brief explanation of why this route is optimal.'),
});
export type OptimizeRouteOutput = z.infer<typeof OptimizeRouteOutputSchema>;
