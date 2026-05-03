'use server';
/**
 * @fileOverview An AI-powered tool to check for traffic violations and registration issues.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ViolationsCheckInputSchema = z.object({
  vin: z.string().describe('The Vehicle Identification Number.'),
  make: z.string().describe('The make of the vehicle.'),
  model: z.string().describe('The model of the vehicle.'),
});
export type ViolationsCheckInput = z.infer<typeof ViolationsCheckInputSchema>;

const ViolationsCheckOutputSchema = z.object({
  hasOutstandingFines: z.boolean().describe('Whether the vehicle has outstanding traffic fines.'),
  finesSummary: z.string().optional().describe('A summary of the outstanding fines, if any.'),
  registrationStatus: z.enum(['Valid', 'Expired', 'Suspended', 'Flagged']).describe('The current legal registration status.'),
  legalNotes: z.string().optional().describe('Any additional legal or registration notes.'),
});
export type ViolationsCheckOutput = z.infer<typeof ViolationsCheckOutputSchema>;

export async function checkViolations(input: ViolationsCheckInput): Promise<ViolationsCheckOutput> {
  return violationsCheckFlow(input);
}

const prompt = ai.definePrompt({
  name: 'violationsCheckPrompt',
  input: {schema: ViolationsCheckInputSchema},
  output: {schema: ViolationsCheckOutputSchema},
  prompt: `You are an AI system connected to a simulated South African national traffic information database (e-NaTIS). 
Your task is to provide a realistic, simulated status check for the following vehicle:

Make: {{{make}}}
Model: {{{model}}}
VIN: {{{vin}}}

Based on common scenarios in South Africa, generate a plausible status.
- Occasionally include a minor outstanding fine (e.g., a R500 speeding fine in Gauteng).
- Occasionally flag a registration as 'Expired' if it's an older vehicle.
- Most checks should return 'Valid' and no fines to simulate a well-maintained legal record.

Be professional and authoritative in your notes.`,
});

const violationsCheckFlow = ai.defineFlow(
  {
    name: 'violationsCheckFlow',
    inputSchema: ViolationsCheckInputSchema,
    outputSchema: ViolationsCheckOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
