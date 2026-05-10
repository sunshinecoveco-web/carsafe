
'use server';

/**
 * @fileOverview AI-powered service recommendation tool.
 *
 * - serviceRecommendation - A function that provides service recommendations based on vehicle data and service history.
 * - ServiceRecommendationInput - The input type for the serviceRecommendation function.
 * - ServiceRecommendationOutput - The return type for the serviceRecommendation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ServiceRecommendationInputSchema = z.object({
  make: z.string().describe('The make of the vehicle.'),
  model: z.string().describe('The model of the vehicle.'),
  year: z.number().describe('The year the vehicle was manufactured.'),
  historicalServices: z.string().describe('A list of historical services performed on the vehicle.'),
});
export type ServiceRecommendationInput = z.infer<typeof ServiceRecommendationInputSchema>;

const ServiceRecommendationOutputSchema = z.object({
  recommendations: z.string().describe('A list of recommended services for the vehicle, taking into account both the official manufacturer schedule and the vehicle\'s actual service history.'),
});
export type ServiceRecommendationOutput = z.infer<typeof ServiceRecommendationOutputSchema>;


const getManufacturerData = ai.defineTool(
  {
    name: 'getManufacturerData',
    description: "Retrieves the official manufacturer's recommended maintenance schedule for a specific vehicle model and year.",
    inputSchema: z.object({
      make: z.string(),
      model: z.string(),
      year: z.number(),
    }),
    outputSchema: z.string(),
  },
  async (input) => {
    // Simulated South African manufacturer data
    if (input.make === 'Toyota' && input.model.includes('Hilux')) {
      return `
- Every 10,000km: Oil Change, Fuel Filter Inspection
- Every 20,000km: Replace Air Filter, Inspect Brake System
- Every 40,000km: Replace Diesel Fuel Filter, Inspect Drive Belts
- Every 100,000km: Replace Camshaft Drive Belt (if applicable)`;
    }
    if (input.make === 'Volkswagen' || input.make === 'VW') {
        return `
- Every 15,000km: Minor Service (Oil Change, Oil Filter)
- Every 30,000km: Major Service (Oil, Pollen Filter, Brake Fluid)
- Every 60,000km: Replace Spark Plugs, Air Filter, Inspect Cooling System
- Every 90,000km: Inspect/Replace Timing Belt`;
    }
    if (input.make === 'BMW') {
        return `
- CBS (Condition Based Service): Vehicle sensors determine when oil, brakes, and spark plugs need replacement.
- Typically every 15,000km - 20,000km: Engine Oil Service.
- Every 2nd Oil Service: Replace Microfilter, Air Filter, and Fuel Filter.
- Every 3rd Oil Service: Replace Spark Plugs.`;
    }
    return 'No specific manufacturer data found for this model in the South African database. Use general best practices for this vehicle class.';
  }
)


export async function serviceRecommendation(input: ServiceRecommendationInput): Promise<ServiceRecommendationOutput> {
  return serviceRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'serviceRecommendationPrompt',
  input: {schema: ServiceRecommendationInputSchema},
  output: {schema: ServiceRecommendationOutputSchema},
  tools: [getManufacturerData],
  prompt: `You are an expert automotive technician specializing in the South African vehicle market. Your goal is to provide a clear, concise list of recommended services.

First, use the getManufacturerData tool to fetch the official recommended maintenance schedule for the vehicle.

Then, analyze the vehicle's actual service history provided below. Note that South African service intervals are often measured in Kilometers (km).

Finally, compare the manufacturer's schedule with the actual history to recommend the next services that are due or overdue. Prioritize the most critical services first.

Vehicle Make: {{{make}}}
Vehicle Model: {{{model}}}
Vehicle Year: {{{year}}}
Historical Services:
---
{{{historicalServices}}}
---

Provide your final recommendations below.
`,
});

const serviceRecommendationFlow = ai.defineFlow(
  {
    name: 'serviceRecommendationFlow',
    inputSchema: ServiceRecommendationInputSchema,
    outputSchema: ServiceRecommendationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
