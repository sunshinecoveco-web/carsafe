
'use server';
/**
 * @fileOverview An AI-powered tool to project fuel or energy usage.
 */

import {ai} from '@/ai/genkit';
import { FuelProjectionInputSchema, FuelProjectionOutputSchema, type FuelProjectionInput, type FuelProjectionOutput } from '@/lib/types';

export async function projectFuelUsage(input: FuelProjectionInput): Promise<FuelProjectionOutput> {
  return fuelProjectionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'fuelProjectionPrompt',
  input: {schema: FuelProjectionInputSchema},
  output: {schema: FuelProjectionOutputSchema},
  prompt: `You are an expert vehicle efficiency analyst. You will analyze the provided fuel/energy usage history for a vehicle and project future costs.

Vehicle: {{{make}}} {{{model}}}
History (Date, Amount, Cost, Odometer):
{{{fuelHistory}}}

Your task:
1. Determine if this is an Electric Vehicle (EV) or Internal Combustion Engine (ICE) vehicle based on the model.
2. Calculate the average efficiency based on odometer changes and fuel/energy amounts provided. (L/100km for ICE, kWh/100km for EV).
3. Estimate the projected spend for the next 30 days based on the frequency and cost of previous records.
4. Provide a helpful, concise insight (e.g., "Efficiency has improved by 5% since the last service" or "High usage detected on weekends").

Format efficiency clearly with units.`,
});

const fuelProjectionFlow = ai.defineFlow(
  {
    name: 'fuelProjectionFlow',
    inputSchema: FuelProjectionInputSchema,
    outputSchema: FuelProjectionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
