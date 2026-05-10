'use server';
/**
 * @fileOverview An AI-powered tool to generate compelling sales descriptions for vehicles.
 *
 * - generateSalesDescription - A function that creates a sales pitch for a vehicle.
 * - GenerateSalesDescriptionInput - The input type for the generateSalesDescription function.
 * - GenerateSalesDescriptionOutput - The return type for the generateSalesDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSalesDescriptionInputSchema = z.object({
  make: z.string().describe('The make of the vehicle.'),
  model: z.string().describe('The model of the vehicle.'),
  year: z.number().describe('The year the vehicle was manufactured.'),
  vin: z.string().describe('The Vehicle Identification Number.'),
  serviceHighlights: z.string().describe("A summary of the most important and recent service history items. This should be a newline-separated list."),
});
export type GenerateSalesDescriptionInput = z.infer<typeof GenerateSalesDescriptionInputSchema>;

const GenerateSalesDescriptionOutputSchema = z.object({
  salesDescription: z.string().describe("The generated sales description, written in an engaging and professional tone suitable for an online car listing. It should be a few paragraphs long."),
});
export type GenerateSalesDescriptionOutput = z.infer<typeof GenerateSalesDescriptionOutputSchema>;

export async function generateSalesDescription(input: GenerateSalesDescriptionInput): Promise<GenerateSalesDescriptionOutput> {
  return generateSalesDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSalesDescriptionPrompt',
  input: {schema: GenerateSalesDescriptionInputSchema},
  output: {schema: GenerateSalesDescriptionOutputSchema},
  prompt: `You are an expert car salesperson who writes compelling and trustworthy online listings for used vehicles.
Your task is to write a sales description for the vehicle detailed below.

Highlight the vehicle's key features and emphasize its excellent maintenance history, which you should reference directly.
The tone should be professional, confident, and appealing to a potential buyer. Start with a strong opening line.

Vehicle Details:
- Make: {{{make}}}
- Model: {{{model}}}
- Year: {{{year}}}
- VIN: {{{vin}}}

Key Service Highlights:
---
{{{serviceHighlights}}}
---

Based on the information above, generate the sales description.
`,
});

const generateSalesDescriptionFlow = ai.defineFlow(
  {
    name: 'generateSalesDescriptionFlow',
    inputSchema: GenerateSalesDescriptionInputSchema,
    outputSchema: GenerateSalesDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
