"use client";

import { useState } from "react";
import type { Vehicle } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User, MessageSquare, SendHorizonal } from "lucide-react";
import { chatWithVehicle } from "@/ai/flows/chat-with-vehicle-flow";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Message {
    role: 'user' | 'ai';
    text: string;
}

export function VehicleChatCard({ vehicle }: { vehicle: Vehicle }) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const serviceHistory = vehicle.serviceHistory
        .map(s => `On ${s.date}, the service performed was "${s.service}" which cost $${s.cost}. Notes: ${s.notes || 'N/A'}. Parts: ${s.parts?.map(p => `${p.quantity}x ${p.name}`).join(', ') || 'N/A'}.`)
        .join('\n');

      const result = await chatWithVehicle({
        vehicleHistory: serviceHistory || "No service history on record.",
        query: input,
      });

      if (result?.answer) {
        const aiMessage: Message = { role: 'ai', text: result.answer };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error("AI did not return a valid answer.");
      }

    } catch (err) {
      console.error(err);
      toast({
          variant: 'destructive',
          title: "Error",
          description: "Could not get a response from the AI. Please try again."
      });
      // remove the user's message if the call fails
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-3">
            <MessageSquare className="h-6 w-6 text-primary" />
            <div>
                <CardTitle>Chat with your AI Assistant</CardTitle>
                <CardDescription>Ask questions about this vehicle's history.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col gap-4 overflow-hidden">
        <ScrollArea className="flex-grow pr-4 -mr-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground p-4">
                    <p>Ask a question like: <br /><em>"When was the last oil change?"</em></p>
                </div>
            ) : (
                messages.map((message, index) => (
                    <div key={index} className={cn("flex items-start gap-3", message.role === 'user' ? 'justify-end' : '')}>
                        {message.role === 'ai' && (
                            <span className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Bot className="h-5 w-5" />
                            </span>
                        )}
                        <div className={cn(
                            "p-3 rounded-lg max-w-sm",
                            message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        )}>
                            <p className="text-sm">{message.text}</p>
                        </div>
                         {message.role === 'user' && (
                            <span className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                                <User className="h-5 w-5" />
                            </span>
                        )}
                    </div>
                ))
            )}
            {loading && (
                <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Bot className="h-5 w-5 animate-pulse" />
                    </span>
                    <div className="p-3 rounded-lg bg-muted">
                        <p className="text-sm text-muted-foreground italic">Thinking...</p>
                    </div>
                </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="pt-6 border-t">
        <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
          <Input 
            id="message" 
            placeholder="Type your message..." 
            className="flex-1" 
            autoComplete="off"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <Button type="submit" size="icon" disabled={loading || !input.trim()}>
            <SendHorizonal className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
