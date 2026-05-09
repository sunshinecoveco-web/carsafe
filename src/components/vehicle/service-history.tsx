"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import type { ServiceRecord, ServiceStatus, ServiceCategory } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Wrench, PlusCircle, Edit, Trash2, Link as LucideLink, UserCheck, CheckCircle2, Rocket, AlertCircle, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Label } from "../ui/label";
import type { UserRole } from "@/hooks/use-auth";
import Image from "next/image";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import React from "react";
import { categorizeService } from "@/ai/flows/categorize-service-flow";

// Form schema
const photoSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL." }).min(1, "URL is required."),
  label: z.string().min(1, "Label is required."),
});

const partSchema = z.object({
  name: z.string().min(1, "Part name is required."),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
});

const serviceFormSchema = z.object({
  id: z.string().optional(),
  date: z.string().min(1, "Date is required.").refine(d => new Date(d) <= new Date(), {
    message: "Service date cannot be in the future."
  }),
  service: z.string().min(1, "Service description is required."),
  cost: z.coerce.number().min(0, "Cost must be a non-negative number."),
  notes: z.string().optional(),
  invoiceUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  parts: z.array(partSchema).optional(),
  photos: z.array(photoSchema).optional(),
  status: z.enum(["Scheduled", "In Progress", "Awaiting Approval", "Ready for Pickup", "Completed"]),
});

type ServiceFormValues = z.infer<typeof serviceFormSchema>;

interface ServiceHistoryCardProps {
  serviceHistory: ServiceRecord[];
  onUpdateHistory: (newHistory: ServiceRecord[]) => void;
  vehicleId: string;
  userRole: UserRole | null;
  userId: string | null;
  isDealerVerified: boolean;
}

const statusMap: Record<ServiceStatus, { icon: React.ReactNode; badgeClass: string }> = {
    'Scheduled': { icon: <Clock className="h-3 w-3" />, badgeClass: "border-gray-400 bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600" },
    'In Progress': { icon: <Rocket className="h-3 w-3" />, badgeClass: "border-blue-400 bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700" },
    'Awaiting Approval': { icon: <AlertCircle className="h-3 w-3" />, badgeClass: "border-amber-400 bg-amber-50 text-amber-600 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-700" },
    'Ready for Pickup': { icon: <CheckCircle2 className="h-3 w-3" />, badgeClass: "border-green-400 bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700" },
    'Completed': { icon: <CheckCircle2 className="h-3 w-3" />, badgeClass: "border-gray-300 bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700" },
};


export function ServiceHistoryCard({ serviceHistory, onUpdateHistory, vehicleId, userRole, userId, isDealerVerified }: ServiceHistoryCardProps) {
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<ServiceRecord | null>(null);

    const isReadOnly = userRole === 'owner' || userRole === 'reseller' || userRole === 'insurance';

    const form = useForm<ServiceFormValues>({
        resolver: zodResolver(serviceFormSchema),
        defaultValues: {
            date: "",
            service: "",
            cost: 0,
            notes: "",
            invoiceUrl: "",
            parts: [],
            photos: [],
            status: "Scheduled",
        },
    });

    const { fields: partFields, append: appendPart, remove: removePart } = useFieldArray({
        control: form.control,
        name: "parts"
    });
    
    const { fields: photoFields, append: appendPhoto, remove: removePhoto } = useFieldArray({
        control: form.control,
        name: "photos"
    });

    const handleDialogOpen = (record: ServiceRecord | null = null) => {
        if (!isDealerVerified || isReadOnly) return; // Safeguard
        setEditingRecord(record);
        if (record) {
            form.reset({
                ...record,
                invoiceUrl: record.invoiceUrl || "",
                parts: record.parts || [],
                photos: record.photos || [],
            });
        } else {
            form.reset({
                date: new Date().toISOString().split('T')[0],
                service: "",
                cost: 0,
                notes: "",
                invoiceUrl: "",
                parts: [],
                photos: [],
                status: "Scheduled",
            });
        }
        setIsDialogOpen(true);
    };
    
    const handleDialogClose = () => {
        setIsDialogOpen(false);
        setEditingRecord(null);
        form.reset();
    }

    const onSubmit = async (values: ServiceFormValues) => {
        if (values.invoiceUrl === "") {
            delete values.invoiceUrl;
        }

        let category: ServiceCategory = 'Other';
        try {
            const result = await categorizeService({ serviceDescription: values.service });
            category = result.category;
        } catch (e) {
            console.error("Failed to categorize service, defaulting to 'Other'", e);
            toast({
                variant: "destructive",
                title: "AI Categorization Failed",
                description: "Could not categorize the service, assigned to 'Other'."
            });
        }

        let updatedHistory: ServiceRecord[];
        if (editingRecord) {
            // Editing existing record
            updatedHistory = serviceHistory.map((r) =>
                r.id === editingRecord.id ? { ...r, ...values, id: r.id, category } as ServiceRecord : r
            );
            toast({ title: "Service Updated", description: `Categorized as ${category}.` });
        } else {
            // Adding new record
            const newRecord: ServiceRecord = {
                ...values,
                id: `s${Date.now()}`, // Simple unique ID
                notes: values.notes || '',
                servicedBy: `Dealer ID: ${userId}`,
                category: category,
            };
            updatedHistory = [newRecord, ...serviceHistory];
            toast({ title: "Service Added", description: `Categorized as ${category}.` });
        }
        onUpdateHistory(updatedHistory);
        handleDialogClose();
    };
    
    const handleDelete = (recordId: string) => {
        const updatedHistory = serviceHistory.filter(r => r.id !== recordId);
        onUpdateHistory(updatedHistory);
        toast({
            variant: "destructive",
            title: "Service Deleted",
            description: "The service record has been removed."
        });
    }

    const getCardDescription = () => {
        if (isReadOnly) return "History managed by verified partners.";
        if (isDealerVerified) return "Manage all maintenance records.";
        return "Only verified dealers can add records."
    }

    return (
        <>
            <Card>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Wrench className="h-6 w-6 text-primary" />
                            <div>
                                <CardTitle>Service History</CardTitle>
                                <CardDescription>{getCardDescription()}</CardDescription>
                            </div>
                        </div>
                        {isDealerVerified && !isReadOnly && (
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => handleDialogOpen()}>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Add Service
                                </Button>
                            </DialogTrigger>
                        )}
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-96">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Service, Parts & Photos</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Cost</TableHead>
                                        {!isReadOnly && <TableHead className="text-right">Actions</TableHead>}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {serviceHistory.length > 0 ? (
                                        serviceHistory.map((record) => {
                                        const statusInfo = statusMap[record.status];
                                        return (
                                            <TableRow key={record.id}>
                                                <TableCell className="font-medium align-top">{record.date}</TableCell>
                                                <TableCell className="align-top">
                                                <div className="font-medium">{record.service}</div>
                                                {record.notes && <div className="text-xs text-muted-foreground">{record.notes}</div>}
                                                    {record.servicedBy && (
                                                    <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-medium mt-2">
                                                        <UserCheck className="h-3 w-3" /> 
                                                        <span>Verified: {record.servicedBy}</span>
                                                    </div>
                                                )}
                                                {record.parts && record.parts.length > 0 && (
                                                    <div className="mt-2">
                                                    <ul className="text-xs list-disc list-inside text-muted-foreground space-y-1 pl-4">
                                                        {record.parts.map((part, index) => (
                                                        <li key={index}>{part.quantity}x {part.name}</li>
                                                        ))}
                                                    </ul>
                                                    </div>
                                                )}
                                                {record.invoiceUrl && (
                                                    <a href={record.invoiceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mt-2">
                                                    <LucideLink className="h-3 w-3" /> View Invoice
                                                    </a>
                                                )}
                                                    {record.photos && record.photos.length > 0 && (
                                                    <div className="mt-4 px-10 relative w-full max-w-sm">
                                                    <Carousel className="w-full" opts={{ loop: record.photos.length > 1 }}>
                                                        <CarouselContent>
                                                        {record.photos.map((photo, index) => (
                                                            <CarouselItem key={index}>
                                                            <a href={photo.url} target="_blank" rel="noopener noreferrer" className="block">
                                                                <div className="relative aspect-video group">
                                                                <Image
                                                                    src={photo.url}
                                                                    alt={photo.label}
                                                                    fill
                                                                    className="rounded-md object-cover bg-muted group-hover:opacity-80 transition-opacity"
                                                                    data-ai-hint="car repair"
                                                                />
                                                                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                                                                <div className="absolute bottom-0 w-full p-1 bg-gradient-to-t from-black/60 to-transparent text-white text-xs font-semibold truncate text-center">
                                                                    {photo.label}
                                                                </div>
                                                                </div>
                                                            </a>
                                                            </CarouselItem>
                                                        ))}
                                                        </CarouselContent>
                                                        {record.photos.length > 1 && (
                                                        <>
                                                            <CarouselPrevious className="left-0" />
                                                            <CarouselNext className="right-0" />
                                                        </>
                                                        )}
                                                    </Carousel>
                                                    </div>
                                                )}
                                                </TableCell>
                                                <TableCell className="align-top">
                                                    <Badge variant="outline" className={`gap-1 whitespace-nowrap ${statusInfo.badgeClass}`}>
                                                        {statusInfo.icon} {record.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right align-top font-mono">
                                                ${record.cost.toFixed(2)}
                                                </TableCell>
                                                {!isReadOnly && (
                                                    <TableCell className="text-right align-top">
                                                    {isDealerVerified ? (
                                                        <div className="space-x-1">
                                                            <DialogTrigger asChild>
                                                                <Button variant="ghost" size="icon" onClick={() => handleDialogOpen(record)}>
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                            </DialogTrigger>
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            This action cannot be undone. This will permanently delete this service record.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction onClick={() => handleDelete(record.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Delete</AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </div>
                                                    ) : (
                                                        <span className="block text-xs text-muted-foreground italic pt-2">Read-only</span>
                                                    )}
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={isReadOnly ? 4 : 5} className="text-center h-24">
                                                No service history available.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </CardContent>

                    <DialogContent className="sm:max-w-xl" onInteractOutside={(e) => { e.preventDefault() }}>
                        <DialogHeader>
                            <DialogTitle>{editingRecord ? "Edit Service Record" : "Add New Service Record"}</DialogTitle>
                            <DialogDescription>
                                Accurately fill in the details of the service performed. The service will be automatically categorized by AI upon saving.
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <Tabs defaultValue="details" className="w-full">
                                    <TabsList className="grid w-full grid-cols-4">
                                        <TabsTrigger value="details">Details</TabsTrigger>
                                        <TabsTrigger value="status">Status</TabsTrigger>
                                        <TabsTrigger value="parts">Parts</TabsTrigger>
                                        <TabsTrigger value="photos">Photos</TabsTrigger>
                                    </TabsList>
                                    <div className="mt-4 max-h-[55vh] overflow-y-auto -mx-6 px-6 pt-2">
                                        <TabsContent value="details" className="space-y-4 mt-0">
                                            <FormField control={form.control} name="date" render={({ field }) => ( <FormItem><FormLabel>Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
                                            <FormField control={form.control} name="service" render={({ field }) => ( <FormItem><FormLabel>Service</FormLabel><FormControl><Input placeholder="e.g. Oil Change" {...field} /></FormControl><FormMessage /></FormItem> )} />
                                            <FormField control={form.control} name="cost" render={({ field }) => ( <FormItem><FormLabel>Cost ($)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem> )} />
                                            <FormField control={form.control} name="notes" render={({ field }) => ( <FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea placeholder="e.g. Synthetic oil, filter replaced." {...field} /></FormControl><FormMessage /></FormItem> )} />
                                            <FormField control={form.control} name="invoiceUrl" render={({ field }) => ( <FormItem><FormLabel>Invoice URL</FormLabel><FormControl><Input placeholder="https://example.com/invoice/123" {...field} /></FormControl><FormMessage /></FormItem> )} />
                                        </TabsContent>
                                        <TabsContent value="status" className="mt-0">
                                        <FormField
                                            control={form.control}
                                            name="status"
                                            render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Service Status</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                    <SelectValue placeholder="Select a status" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {(Object.keys(statusMap) as ServiceStatus[]).map(status => (
                                                    <SelectItem key={status} value={status}>
                                                        <div className="flex items-center gap-2">
                                                        {statusMap[status].icon}
                                                        {status}
                                                        </div>
                                                    </SelectItem>
                                                    ))}
                                                </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                            )}
                                        />
                                        </TabsContent>
                                        <TabsContent value="parts" className="mt-0">
                                            <div className="space-y-2">
                                                <Label>Parts Used</Label>
                                                {partFields.map((field, index) => (
                                                    <div key={field.id} className="grid grid-cols-[1fr_auto_auto] gap-2 items-start">
                                                        <FormField
                                                            control={form.control}
                                                            name={`parts.${index}.name`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormControl><Input placeholder="Part Name" {...field} /></FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name={`parts.${index}.quantity`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormControl><Input type="number" placeholder="Qty" className="w-20" {...field} /></FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <Button type="button" variant="ghost" size="icon" onClick={() => removePart(index)}>
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                ))}
                                                <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendPart({ name: "", quantity: 1 })}>
                                                    <PlusCircle className="mr-2 h-4 w-4" /> Add Part
                                                </Button>
                                            </div>
                                        </TabsContent>
                                        <TabsContent value="photos" className="mt-0">
                                            <div className="space-y-2">
                                                <Label>Photos</Label>
                                                {photoFields.map((field, index) => (
                                                    <div key={field.id} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-start">
                                                        <FormField
                                                            control={form.control}
                                                            name={`photos.${index}.url`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormControl><Input placeholder="https://example.com/photo.jpg" {...field} /></FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name={`photos.${index}.label`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormControl><Input placeholder="e.g. Before repair" {...field} /></FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <Button type="button" variant="ghost" size="icon" onClick={() => removePhoto(index)}>
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                ))}
                                                <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendPhoto({ url: "", label: "" })}>
                                                    <PlusCircle className="mr-2 h-4 w-4" /> Add Photo
                                                </Button>
                                            </div>
                                        </TabsContent>
                                    </div>
                                </Tabs>
                                <DialogFooter className="pt-4 border-t">
                                    <Button type="button" variant="ghost" onClick={handleDialogClose}>Cancel</Button>
                                    <Button type="submit" disabled={form.formState.isSubmitting}>
                                        {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </Card>
        </>
    );
}
