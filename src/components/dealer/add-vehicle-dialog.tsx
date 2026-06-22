"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  searchVehicleByRegOrVin,
  isVehicleLinked,
  linkVehicleToDealer,
  createDealerVehicle,
} from "@/lib/dealer";
import type { DealerProfile, DealerVehicle } from "@/lib/dealer";
import {
  Car,
  CheckCircle2,
  Link2,
  Loader2,
  PlusCircle,
  Search,
} from "lucide-react";

// ─── Search tab ───────────────────────────────────────────────────────────────

type SearchState =
  | { phase: "idle" }
  | { phase: "searching" }
  | { phase: "found"; vehicle: DealerVehicle; alreadyLinked: boolean }
  | { phase: "not_found" }
  | { phase: "linked" };

function SearchTab({
  profile,
  onLinked,
  onCreateInstead,
  prefillQuery,
}: {
  profile: DealerProfile;
  onLinked: () => void;
  onCreateInstead: (query: string) => void;
  prefillQuery?: string;
}) {
  const { toast } = useToast();
  const [query, setQuery] = useState(prefillQuery ?? "");
  const [state, setState] = useState<SearchState>({ phase: "idle" });
  const [linking, setLinking] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setState({ phase: "searching" });

    const vehicle = await searchVehicleByRegOrVin(query);
    if (!vehicle) {
      setState({ phase: "not_found" });
      return;
    }
    const linked = await isVehicleLinked(profile.id, vehicle.id);
    setState({ phase: "found", vehicle, alreadyLinked: linked });
  };

  const handleLink = async (vehicleId: string) => {
    setLinking(true);
    const { error } = await linkVehicleToDealer(profile.id, vehicleId);
    setLinking(false);
    if (error) {
      toast({ variant: "destructive", title: "Could not link vehicle", description: error });
      return;
    }
    setState({ phase: "linked" });
    onLinked();
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          placeholder="Registration number or VIN"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="font-mono"
        />
        <Button type="submit" disabled={state.phase === "searching" || !query.trim()}>
          {state.phase === "searching" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </form>

      {state.phase === "found" && (
        <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Car className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold">
                  {state.vehicle.year} {state.vehicle.make} {state.vehicle.model}
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  {state.vehicle.registrationNumber ?? state.vehicle.vin}
                </p>
                {state.vehicle.colour && (
                  <p className="text-xs text-muted-foreground">{state.vehicle.colour}</p>
                )}
              </div>
            </div>
            <Badge variant="outline" className="text-xs flex-shrink-0">
              {state.vehicle.status === "for_sale"
                ? "For Sale"
                : state.vehicle.status === "in_claim"
                ? "In Claim"
                : "Active"}
            </Badge>
          </div>

          {state.alreadyLinked ? (
            <div className="flex items-center gap-2 text-sm text-green-700">
              <CheckCircle2 className="h-4 w-4" />
              Already linked to your dealership
            </div>
          ) : (
            <Button
              className="w-full"
              onClick={() => handleLink(state.vehicle.id)}
              disabled={linking}
            >
              {linking ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Linking…</>
              ) : (
                <><Link2 className="mr-2 h-4 w-4" />Link to My Fleet</>
              )}
            </Button>
          )}
        </div>
      )}

      {state.phase === "linked" && (
        <Alert className="border-green-300 bg-green-50 text-green-800">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>Vehicle successfully linked to your fleet.</AlertDescription>
        </Alert>
      )}

      {state.phase === "not_found" && (
        <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4 space-y-3 text-center">
          <p className="text-sm text-muted-foreground">
            No vehicle found for <span className="font-mono font-medium">{query}</span>.
          </p>
          <Button variant="outline" size="sm" onClick={() => onCreateInstead(query)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add This Vehicle
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Create tab ───────────────────────────────────────────────────────────────

const currentYear = new Date().getFullYear();

const createSchema = z.object({
  make: z.string().min(1, "Required"),
  model: z.string().min(1, "Required"),
  year: z
    .number({ invalid_type_error: "Enter a valid year" })
    .int()
    .min(1900)
    .max(currentYear + 1),
  registrationNumber: z.string().min(1, "Required"),
  vin: z.string().min(1, "Required"),
  colour: z.string().min(1, "Required"),
  mileage: z.number({ invalid_type_error: "Enter a valid number" }).int().min(0),
  condition: z.enum(["Excellent", "Good", "Fair", "Poor"]),
  askingPrice: z.number({ invalid_type_error: "Enter a valid amount" }).min(0).optional(),
  status: z.enum(["active", "for_sale", "in_claim"]),
});

type CreateValues = z.infer<typeof createSchema>;

function CreateTab({
  profile,
  onCreated,
  onExistingFound,
  prefillReg,
}: {
  profile: DealerProfile;
  onCreated: () => void;
  onExistingFound: (vehicle: DealerVehicle) => void;
  prefillReg?: string;
}) {
  const { toast } = useToast();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      registrationNumber: prefillReg ?? "",
      status: "active",
      condition: "Good",
      mileage: 0,
      year: currentYear,
    },
  });

  const onSubmit = async (values: CreateValues) => {
    setServerError(null);
    const { vehicleId, existing, error } = await createDealerVehicle(profile, {
      ...values,
      registrationNumber: values.registrationNumber,
      askingPrice: values.askingPrice ?? null,
    });

    if (error === "exists" && existing) {
      onExistingFound(existing);
      return;
    }
    if (error) {
      setServerError(error);
      return;
    }
    if (vehicleId) {
      toast({
        title: "Vehicle added",
        description: `${values.year} ${values.make} ${values.model} has been added to your fleet.`,
      });
      form.reset();
      onCreated();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="make" render={({ field }) => (
            <FormItem>
              <FormLabel>Make</FormLabel>
              <FormControl><Input placeholder="Toyota" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="model" render={({ field }) => (
            <FormItem>
              <FormLabel>Model</FormLabel>
              <FormControl><Input placeholder="Corolla" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="year" render={({ field }) => (
            <FormItem>
              <FormLabel>Year</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder={String(currentYear)}
                  {...field}
                  onChange={e => field.onChange(parseInt(e.target.value, 10))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="colour" render={({ field }) => (
            <FormItem>
              <FormLabel>Colour</FormLabel>
              <FormControl><Input placeholder="White" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="registrationNumber" render={({ field }) => (
          <FormItem>
            <FormLabel>Registration Number</FormLabel>
            <FormControl>
              <Input placeholder="ABC 123 GP" className="font-mono uppercase" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="vin" render={({ field }) => (
          <FormItem>
            <FormLabel>VIN</FormLabel>
            <FormControl>
              <Input placeholder="1HGBH41JXMN109186" className="font-mono uppercase" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="mileage" render={({ field }) => (
            <FormItem>
              <FormLabel>Mileage (km)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  {...field}
                  onChange={e => field.onChange(parseInt(e.target.value, 10))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="condition" render={({ field }) => (
            <FormItem>
              <FormLabel>Condition</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Excellent">Excellent</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Fair">Fair</SelectItem>
                  <SelectItem value="Poor">Poor</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="askingPrice" render={({ field }) => (
            <FormItem>
              <FormLabel>Asking Price (R) — optional</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  placeholder="250000"
                  {...field}
                  value={field.value ?? ""}
                  onChange={e =>
                    field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="status" render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="for_sale">For Sale</SelectItem>
                  <SelectItem value="in_claim">In Claim</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {serverError && (
          <Alert variant="destructive">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding Vehicle…</>
          ) : (
            <><PlusCircle className="mr-2 h-4 w-4" />Add Vehicle</>
          )}
        </Button>
      </form>
    </Form>
  );
}

// ─── Main dialog ──────────────────────────────────────────────────────────────

interface DealerAddVehicleDialogProps {
  profile: DealerProfile;
  onVehicleLinked: () => void;
}

export function DealerAddVehicleDialog({ profile, onVehicleLinked }: DealerAddVehicleDialogProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"search" | "create">("search");
  const [prefillReg, setPrefillReg] = useState("");

  // When PATH A finds an existing vehicle, switch to the search tab and pre-populate
  const handleExistingFound = (vehicle: DealerVehicle) => {
    setPrefillReg(vehicle.registrationNumber ?? vehicle.vin);
    setTab("search");
  };

  const handleLinked = () => {
    onVehicleLinked();
    // Keep dialog open so dealer can see the success state and choose to close
  };

  const handleCreated = () => {
    onVehicleLinked();
    setOpen(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setTab("search");
      setPrefillReg("");
    }
    setOpen(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Vehicle
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Vehicle to Fleet</DialogTitle>
          <DialogDescription>
            Search for an existing vehicle by registration number or VIN, or create a new listing.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={v => setTab(v as "search" | "create")} className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search">
              <Search className="mr-2 h-4 w-4" />
              Search Existing
            </TabsTrigger>
            <TabsTrigger value="create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="mt-4">
            <SearchTab
              profile={profile}
              onLinked={handleLinked}
              onCreateInstead={q => {
                setPrefillReg(q);
                setTab("create");
              }}
              prefillQuery={prefillReg}
            />
          </TabsContent>

          <TabsContent value="create" className="mt-4">
            <CreateTab
              profile={profile}
              onCreated={handleCreated}
              onExistingFound={handleExistingFound}
              prefillReg={prefillReg}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
