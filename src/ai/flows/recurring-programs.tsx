'use server';
/**
 * @fileOverview An AI-powered tool to detect recurring problems in a vehicle's service history.
 *
 * - detectRecurringProblems - A function that analyzes service history for patterns.
 * - DetectRecurringProblemsInput - The input type for the function.
 * - DetectRecurringProblemsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectRecurringProblemsInputSchema = z.object({
  serviceHistory: z.string().describe("The full service history of the vehicle, including dates, services performed, and notes."),
});
export type DetectRecurringProblemsInput = z.infer<typeof DetectRecurringProblemsInputSchema>;

const DetectRecurringProblemsOutputSchema = z.object({
  hasRecurringProblem: z.boolean().describe("Set to true if a recurring problem is detected, otherwise false."),
  recurringProblem: z.string().optional().describe("A concise summary of the recurring problem, if one is found (e.g., 'Persistent Coolant Leak')."),
  analysis: z.string().optional().describe("A brief analysis explaining which service records indicate the recurring problem."),
});
export type DetectRecurringProblemsOutput = z.infer<typeof DetectRecurringProblemsOutputSchema>;

export async function detectRecurringProblems(input: DetectRecurringProblemsInput): Promise<DetectRecurringProblemsOutput> {
  return recurringProblemsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recurringProblemsPrompt',
  input: {schema: DetectRecurringProblemsInputSchema},
  output: {schema: DetectRecurringProblemsOutputSchema},
  prompt: `You are an expert vehicle diagnostic AI. Your task is to analyze a vehicle's service history to identify any recurring or chronic problems.
Look for repeated repairs of the same system or component (e.g., multiple entries for 'coolant leak', 'check engine light for misfire', 'A/C not cold').

If you find a pattern of recurring issues, set 'hasRecurringProblem' to true and provide a short title for the problem and an analysis.
If there are no clear recurring problems, set 'hasRecurringProblem' to false.

Service History:
---
{{{serviceHistory}}}
---

Analyze the history and provide your findings.`,
});

const recurringProblemsFlow = ai.defineFlow(
  {
    name: 'recurringProblemsFlow',
    inputSchema: DetectRecurringProblemsInputSchema,
    outputSchema: DetectRecurringProblemsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
