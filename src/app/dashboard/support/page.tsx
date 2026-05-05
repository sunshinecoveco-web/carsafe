import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, LifeBuoy, ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";

const faqs = [
    {
        question: "How does CarSafe protect my data rights?",
        answer: "CarSafe is built on the principle of 'Privacy by Design'. In accordance with the Protection of Personal Information Act (POPIA), we ensure that you have full control over your vehicle's data. You must explicitly grant consent for dealers, resellers, or insurance partners to view your records. You can revoke this consent instantly through your dashboard."
    },
    {
        question: "What is the 'Verified Source of Truth'?",
        answer: "To prevent fraud and maintain the integrity of a vehicle's history, service records can only be added by verified, authorized service dealers. This creates a trusted audit trail that benefits owners (by increasing resale value) and buyers (by ensuring the car was properly maintained)."
    },
    {
        question: "Does CarSafe use blockchain?",
        answer: "CarSafe currently utilizes a 'Cryptographic Integrity Chain' in the activity log. This is the core architectural foundation of blockchain. Every event is linked to the previous one using a unique cryptographic hash, ensuring that the history is verifiable and tamper-proof. This structure is designed to be easily migrated to a decentralized blockchain ledger in the future."
    },
    {
        question: "Can I delete my data?",
        answer: "Yes. Under modern data protection laws, you have the 'Right to be Forgotten'. If you choose to delete your CarSafe account, we will remove your personal profile. However, verified service records attached to a vehicle's VIN are maintained as part of the vehicle's permanent history to ensure the safety and transparency of the automotive secondary market."
    },
    {
        question: "How do I grant access to a new workshop?",
        answer: "Navigate to your vehicle's 'Reports & Actions' tab. Use the 'Share with Dealer' card to generate a unique, one-time QR code. When the workshop scans this code, you will be prompted to provide a 6-digit access code, ensuring that only physical proximity and explicit consent grant access."
    }
]

export default function SupportPage() {
    return (
        <div className="container mx-auto max-w-5xl p-4 sm:px-6 md:p-8">
            <div className="mb-8">
                <Button asChild variant="ghost" className="pl-0 mb-4 hover:bg-transparent">
                    <Link href="/dashboard" className="flex items-center">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Link>
                </Button>
                <div className="flex items-center gap-3">
                    <LifeBuoy className="h-8 w-8 text-primary" />
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                            Support & Consumer Rights
                        </h1>
                        <p className="mt-1 text-lg text-muted-foreground">
                            Understanding your protections and getting help with CarSafe.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, index) => (
                            <AccordionItem value={`item-${index}`} key={index}>
                                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                                <AccordionContent className="text-muted-foreground leading-relaxed">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
                <div className="space-y-6">
                     <Card>
                        <CardHeader>
                            <CardTitle>Contact Support</CardTitle>
                            <CardDescription>Our team is ready to assist you.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Phone className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">Phone Support</p>
                                    <a href="tel:+278005551234" className="text-sm text-primary hover:underline">+27 (800) 555-1234</a>
                                </div>
                            </div>
                             <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Mail className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">Email Support</p>
                                    <a href="mailto:rights@carsafe.app" className="text-sm text-primary hover:underline">rights@carsafe.app</a>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-primary" />
                                <CardTitle className="text-sm">Compliance Badge</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">
                                This application is fully compliant with the South African Protection of Personal Information Act (POPIA) and the Consumer Protection Act (CPA).
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
