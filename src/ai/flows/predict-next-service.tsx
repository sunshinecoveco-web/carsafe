
'use server';
/**
 * @fileOverview AI-powered tool to predict the next vehicle service.
 *
 * - predictNextService - A function that predicts the next likely service.
 */

import {ai} from '@/ai/genkit';
import { PredictNextServiceInputSchema, PredictNextServiceOutputSchema, type PredictNextServiceInput, type PredictNextServiceOutput } from '@/lib/types';

export async function predictNextService(input: PredictNextServiceInput): Promise<PredictNextServiceOutput> {
  return predictNextServiceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictNextServicePrompt',
  input: {schema: PredictNextServiceInputSchema},
  output: {schema: PredictNextServiceOutputSchema},
  prompt: `You are an expert AI automotive technician specializing in predicting maintenance schedules for both gasoline-powered (ICE) and electric (EV) vehicles.
Based on the vehicle's make, model, year, and its service history, predict the single most likely *next routine maintenance service* and its estimated due date.

First, determine if the vehicle is an EV or ICE vehicle based on its make and model (e.g., Tesla is an EV). Tailor your prediction accordingly.
- For ICE vehicles, focus on things like oil changes, filters, and spark plugs.
- For EV vehicles, focus on things like tire rotation, cabin air filters, brake fluid health, and battery coolant.

Vehicle Make: {{{make}}}
Vehicle Model: {{{model}}}
Vehicle Year: {{{year}}}
Service History (Date: Service performed):
{{{serviceHistory}}}

Your task:
1. Analyze the service history to understand what was done and when.
2. Consider typical maintenance intervals for this specific vehicle type (EV or ICE), model, and year.
3. Predict the next logical *routine* service. Focus on wear-and-tear items and scheduled maintenance.
4. Crucially, IGNORE non-routine work such as cosmetic repairs, accident damage, or one-off fixes (e.g., 'Replaced broken mirror', 'Fixed dent').
5. Estimate the due date for this service in YYYY-MM-DD format, assuming average vehicle usage from the last service date.
6. Provide a concise reasoning for your prediction.`,
});

const predictNextServiceFlow = ai.defineFlow(
  {
    name: 'predictNextServiceFlow',
    inputSchema: PredictNextServiceInputSchema,
    outputSchema: PredictNextServiceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
