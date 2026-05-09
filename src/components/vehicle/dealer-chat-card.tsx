"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import type { Vehicle, Chat, ChatMessage } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User, MessageCircle, SendHorizonal, ImagePlus, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth as useMockAuth } from "@/hooks/use-auth";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, addDoc, serverTimestamp, updateDoc, doc, getDocs, limit, orderBy } from "firebase/firestore";
import { Skeleton } from "../ui/skeleton";
import Image from "next/image";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DealerChatCardProps {
    vehicle: Vehicle;
}

const findOrCreateChat = async (db, user1Id, user2Id, vehicleId) => {
    const participants = [user1Id, user2Id].sort();
    const q = query(
        collection(db, "chats"),
        where("vehicleId", "==", vehicleId),
        where("participants", "==", participants),
        limit(1)
    );

    const chatSnapshot = await getDocs(q);
    if (!chatSnapshot.empty) {
        return chatSnapshot.docs[0].id;
    } else {
        // Create a new chat
        const newChatRef = addDoc(collection(db, "chats"), {
            vehicleId,
            participants,
            lastMessageText: "Chat started.",
            lastMessageAt: serverTimestamp(),
        }).catch(async (serverError) => {
             const permissionError = new FirestorePermissionError({
                path: collection(db, "chats").path,
                operation: 'create',
                requestResourceData: { vehicleId, participants },
            });
            errorEmitter.emit('permission-error', permissionError);
            throw serverError;
        });
        return (await newChatRef).id;
    }
};


export function DealerChatCard({ vehicle }: DealerChatCardProps) {
    const { toast } = useToast();
    const mockAuth = useMockAuth(); // Using mock auth for user ID
    const db = useFirestore();

    const [chatId, setChatId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [chatLoading, setChatLoading] = useState(true);
    const scrollAreaRef = useRef<HTMLDivElement>(null);


    const otherPartyId = mockAuth.role === 'owner' ? vehicle.approvedDealerIds?.[0] : vehicle.ownerId;

    useEffect(() => {
        if (!db || !mockAuth.userId || !otherPartyId) return;

        findOrCreateChat(db, mockAuth.userId, otherPartyId, vehicle.id)
            .then(id => setChatId(id))
            .catch(err => {
                console.error("Error finding or creating chat:", err);
                toast({ variant: "destructive", title: "Could not initialize chat." });
            })
            .finally(() => setChatLoading(false));

    }, [db, mockAuth.userId, otherPartyId, vehicle.id, toast]);
    
    const messagesQuery = useMemoFirebase(() => {
        if (!chatId) return null;
        return query(collection(db, "chats", chatId, "messages"), orderBy("createdAt"));
    }, [db, chatId]);

    const { data: fetchedMessages, loading: messagesLoading } = useCollection<ChatMessage>(messagesQuery);
    
     useEffect(() => {
        if (fetchedMessages) {
            setMessages(fetchedMessages);
        }
    }, [fetchedMessages]);

    useEffect(() => {
        // Scroll to bottom when new messages arrive
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading || !chatId || !mockAuth.userId) return;

        setLoading(true);
        const textToSend = input;
        setInput("");

        const messagesCol = collection(db, "chats", chatId, "messages");
        const newMessageData = {
            text: textToSend,
            senderId: mockAuth.userId,
            createdAt: serverTimestamp(),
        };

        addDoc(messagesCol, newMessageData)
            .catch(async (serverError) => {
                const permissionError = new FirestorePermissionError({
                    path: messagesCol.path,
                    operation: 'create',
                    requestResourceData: newMessageData,
                });
                errorEmitter.emit('permission-error', permissionError);
            })
            .then(() => {
                const chatDocRef = doc(db, "chats", chatId);
                return updateDoc(chatDocRef, {
                    lastMessageText: textToSend,
                    lastMessageAt: serverTimestamp(),
                });
            })
            .catch(() => {/* The previous catch will handle it */})
            .finally(() => {
                setLoading(false);
            });
    };
    
    const handleSendImage = async () => {
        if (loading || !chatId || !mockAuth.userId) return;
        setLoading(true);
        const textToSend = input.trim();
        setInput("");

        // This would be a file upload in a real app.
        // Here, we just use a placeholder.
        const imageUrl = `https://picsum.photos/seed/${Math.random()}/400/300`;
        
        const messagesCol = collection(db, "chats", chatId, "messages");
        const newMessageData = {
            ...(textToSend && { text: textToSend }),
            imageUrl,
            senderId: mockAuth.userId,
            createdAt: serverTimestamp(),
        };

        addDoc(messagesCol, newMessageData)
             .catch(async (serverError) => {
                 const permissionError = new FirestorePermissionError({
                    path: messagesCol.path,
                    operation: 'create',
                    requestResourceData: newMessageData,
                });
                errorEmitter.emit('permission-error', permissionError);
            })
            .then(() => {
                const chatDocRef = doc(db, "chats", chatId);
                return updateDoc(chatDocRef, {
                    lastMessageText: `📷 ${textToSend || 'Image'}`,
                    lastMessageAt: serverTimestamp(),
                });
            })
            .catch(() => {/* The previous catch will handle it */})
            .finally(() => {
                setLoading(false);
            });
    }
  
    if (chatLoading) {
        return (
             <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64 mt-2" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-64 w-full" />
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-10 w-full" />
                </CardFooter>
             </Card>
        )
    }

    const imageMessages = messages.filter(msg => msg.imageUrl);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-3">
            <MessageCircle className="h-6 w-6 text-primary" />
            <div>
                <CardTitle>Dealer Chat</CardTitle>
                <CardDescription>Directly message your service provider.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col gap-4 overflow-hidden">
        <Tabs defaultValue="messages" className="w-full flex-grow flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="messages">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Messages
                </TabsTrigger>
                <TabsTrigger value="attachments">
                    <Paperclip className="mr-2 h-4 w-4" />
                    Photos & Files
                </TabsTrigger>
            </TabsList>
            <TabsContent value="messages" className="flex-grow mt-4 overflow-hidden">
                <ScrollArea className="h-full pr-4 -mr-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                    {messagesLoading ? (
                        <div className="text-center text-sm text-muted-foreground p-4">Loading messages...</div>
                    ): messages.length === 0 ? (
                        <div className="text-center text-sm text-muted-foreground p-4">
                            <p>Start the conversation!</p>
                        </div>
                    ) : (
                        messages.map((message, index) => (
                            <div key={message.id || index} className={cn("flex items-start gap-3", message.senderId === mockAuth.userId ? 'justify-end' : '')}>
                                {message.senderId !== mockAuth.userId && (
                                    <span className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <User className="h-5 w-5" />
                                    </span>
                                )}
                                <div className={cn(
                                    "rounded-lg max-w-sm",
                                    message.senderId === mockAuth.userId ? 'bg-primary text-primary-foreground' : 'bg-muted',
                                    message.imageUrl ? 'p-2' : 'p-3'
                                )}>
                                    {message.imageUrl && (
                                        <a href={message.imageUrl} target="_blank" rel="noopener noreferrer">
                                            <div className="relative aspect-video w-64 mb-2">
                                                <Image
                                                    src={message.imageUrl}
                                                    alt={message.text || 'Chat image'}
                                                    fill
                                                    className="object-cover rounded-md bg-secondary"
                                                    data-ai-hint="car service photo"
                                                />
                                            </div>
                                        </a>
                                    )}
                                    {message.text && (
                                        <p className="text-sm px-1">{message.text}</p>
                                    )}
                                </div>
                                {message.senderId === mockAuth.userId && (
                                    <span className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                                        <User className="h-5 w-5" />
                                    </span>
                                )}
                            </div>
                        ))
                    )}
                </div>
                </ScrollArea>
            </TabsContent>
            <TabsContent value="attachments" className="flex-grow mt-4 overflow-hidden">
                <ScrollArea className="h-full pr-4 -mr-4">
                    {imageMessages.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {imageMessages.map(message => (
                            <div key={message.id} className="group relative aspect-square">
                                <a href={message.imageUrl} target="_blank" rel="noopener noreferrer">
                                <Image
                                    src={message.imageUrl!}
                                    alt={message.text || 'Chat image'}
                                    fill
                                    className="object-cover rounded-md bg-secondary transition-opacity group-hover:opacity-80"
                                    data-ai-hint="car service photo"
                                />
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
                                {message.text && (
                                    <div className="absolute bottom-0 w-full p-1 bg-gradient-to-t from-black/60 to-transparent text-white text-[10px] font-semibold truncate text-center">
                                        {message.text}
                                    </div>
                                    )}
                                </a>
                            </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground p-4">
                            <p>No photos or attachments have been shared in this chat yet.</p>
                        </div>
                    )}
                </ScrollArea>
            </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="pt-6 border-t">
        <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
            <Button type="button" variant="ghost" size="icon" onClick={handleSendImage} disabled={loading || messagesLoading}>
                <ImagePlus className="h-5 w-5" />
                <span className="sr-only">Send Image</span>
            </Button>
          <Input 
            id="message" 
            placeholder="Type your message..." 
            className="flex-1" 
            autoComplete="off"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading || messagesLoading}
          />
          <Button type="submit" size="icon" disabled={loading || messagesLoading || !input.trim()}>
            <SendHorizonal className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
