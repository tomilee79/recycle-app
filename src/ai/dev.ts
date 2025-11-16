import { config } from 'dotenv';
config();

// This file is used to register all Genkit flows for the dev server.
import '@/ai/flows/predict-material-type';
import '@/ai/flows/optimize-route-flow';
