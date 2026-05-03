
import { config } from 'dotenv';
config();

import '@/ai/flows/service-recommendation.ts';
import '@/ai/flows/predict-next-service.ts';
import '@/ai/flows/chat-with-vehicle-flow.ts';
import '@/ai/flows/generate-sales-description-flow.ts';
import '@/ai/flows/categorize-service-flow.ts';
import '@/ai/flows/recurring-problems-flow.ts';
import '@/ai/flows/violations-check-flow.ts';
import '@/ai/flows/fuel-projection-flow.ts';
