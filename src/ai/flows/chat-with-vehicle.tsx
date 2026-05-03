'use server';
/**
 * @fileOverview An AI-powered chatbot to answer questions about a vehicle's service history.
 *
 * - chatWithVehicle - A function that allows a user to ask questions about a vehicle's service history.
 * - ChatWithVehicleInput - The input type for the chatWithVehicle function.
 * - ChatWithVehicleOutput - The return type for the chatWithVehicle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatWithVehicleInputSchema = z.object({
  vehicleHistory: z.string().describe("The full service history of the vehicle, including dates, services performed, costs, and notes."),
  query: z.string().describe("The user's question about the vehicle's service history."),
});
export type ChatWithVehicleInput = z.infer<typeof ChatWithVehicleInputSchema>;

const ChatWithVehicleOutputSchema = z.object({
  answer: z.string().describe("The AI's answer to the user's query, based *only* on the provided history."),
});
export type ChatWithVehicleOutput = z.infer<typeof ChatWithVehicleOutputSchema>;

export async function chatWithVehicle(input: ChatWithVehicleInput): Promise<ChatWithVehicleOutput> {
  return chatWithVehicleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatWithVehiclePrompt',
  input: {schema: ChatWithVehicleInputSchema},
  output: {schema: ChatWithVehicleOutputSchema},
  prompt: `You are a helpful AI assistant for a vehicle management app. Your role is to answer user questions about a specific vehicle's service history.
You will be provided with the complete service history. Your answers must be based *exclusively* on this information. Do not invent details or use external knowledge.
If the answer cannot be found in the provided history, say "I can't find that information in the service history."

Here is the vehicle's service history:
---
{{{vehicleHistory}}}
---

User's question: "{{{query}}}"

Your answer:`,
});

const chatWithVehicleFlow = ai.defineFlow(
  {
    name: 'chatWithVehicleFlow',
    inputSchema: ChatWithVehicleInputSchema,
    outputSchema: ChatWithVehicleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
