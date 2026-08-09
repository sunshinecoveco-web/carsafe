
"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Vehicle, ServiceRecord, ActivityLogEntry, VehicleConsents } from "@/lib/types";
import Image from "next/image";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/supabase";
import { ServiceHistoryCard } from "./service-history-card";
import { AiRecommendationTool } from "./ai-recommendation-tool";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransferOwnershipCard } from "./transfer-ownership-card";
import { useToast } from "@/hooks/use-toast";
import { ActivityLogCard } from "./activity-log-card";
import { NextServicePredictorCard } from "./next-service-predictor-card";
import { VehicleChatCard } from "./vehicle-chat-card";
import { VehicleReport } from "./vehicle-report";
import { getDealers } from "@/lib/data";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { ShieldAlert, Share2, Nfc, Gauge, Palette, Hash } from "lucide-react";
import { AiSalesCopyCard } from "./ai-sales-copy-card";
import { Button } from "../ui/button";
import { EditVehicleDialog } from "./edit-vehicle-dialog";
import { PublicLinkCard } from "./public-link-card";
import { IncentivesCard } from "./incentives-card";
import { ShareWithDealerCard } from "./share-with-dealer-card";
import { ConsentManagementCard } from "./consent-management-card";
import { ViolationsCheckCard } from "./violations-check-card";
import { RecurringProblemsDetectorCard } from "./recurring-problems-detector-card";
import { DealerChatCard } from "./dealer-chat-card";
import { InsuranceDealerChatCard } from "./insurance-dealer-chat-card";
import { FuelUsageCard } from "./fuel-usage-card";
import { InsurerFlagsCard } from "./insurer-flags-card";
import { InsurerLinkRequestModal } from "./insurer-link-request-modal";
import { InsurerServiceHistoryCard } from "./insurer-service-history-card";
import { WorkshopServiceHistoryCard } from "./workshop-service-history-card";
import { DealerReadonlySections } from "./dealer-readonly-sections";
import { cn } from "@/lib/utils";

interface VehicleFlag {
  id: string;
  vehicle_id: string;
  insurer_id: string;
  flag_type: string;
  description: string;
  visibility: "internal" | "external";
  created_at: string;
}

export function VehicleDetails({ vehicle: initialVehicle }: { vehicle: Vehicle }) {
  const [vehicle, setVehicle] = useState(initialVehicle);
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isDealerVerified, setIsDealerVerified] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isClaimOpen, setIsClaimOpen] = useState(false);
  const [claimFlags, setClaimFlags] = useState<VehicleFlag[]>([]);
  const [claimFlagsLoading, setClaimFlagsLoading] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const transferredIds = JSON.parse(localStorage.getItem('carsafe_transferred_ids') || '[]');
    if (transferredIds.includes(initialVehicle.id)) {
      toast({
        variant: "destructive",
        title: "Vehicle Transferred",
        description: "You no longer have access to this vehicle.",
      });
      router.replace('/dashboard');
      return;
    }
    
    async function checkDealerVerification() {
        if (auth.role === 'dealer' && auth.userId) {
            const dealers = await getDealers();
            const currentDealer = dealers.find(d => d.id === auth.userId);
            if (currentDealer?.isVerified) {
                setIsDealerVerified(true);
            }
        }
    }

    if (auth.isAuthenticated) {
        checkDealerVerification();
    }
  }, [auth.isAuthenticated, auth.role, auth.userId, initialVehicle.id, router, toast]);

  const fetchClaimFlags = async () => {
    if (!vehicle.id) return;
    setClaimFlagsLoading(true);

    const { data, error } = await supabase
      .from('vehicle_flags')
      .select('*')
      .eq('vehicle_id', vehicle.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setClaimFlags(data as VehicleFlag[]);
    }
    setClaimFlagsLoading(false);
  };

  useEffect(() => {
    if (isClaimOpen && vehicle.status === 'in_claim') {
      fetchClaimFlags();
    }
  }, [isClaimOpen, vehicle.id, vehicle.status]);

  const handleUpdate = (updatedData: Partial<Vehicle>) => {
    setVehicle(prevVehicle => {
      const newVehicle = { ...prevVehicle, ...updatedData };
      if (updatedData.serviceHistory) {
        newVehicle.serviceHistory = [...updatedData.serviceHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }
      return newVehicle;
    });
  };

  const handleShare = async () => {
    const shareData = {
        title: `Vehicle: ${vehicle.make} ${vehicle.model}`,
        text: `Vehicle: ${vehicle.make} ${vehicle.model} (${vehicle.year})\nVIN: ${vehicle.vin}`,
        url: window.location.href,
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
        } catch (error) {
            console.error('Error sharing:', error);
            if ((error as DOMException)?.name !== 'AbortError') {
                 toast({
                    variant: 'destructive',
                    title: 'Could not share',
                    description: 'An error occurred while trying to share the vehicle details.',
                });
            }
        }
    } else {
        try {
            await navigator.clipboard.writeText(`${shareData.text}\n\nView details here: ${shareData.url}`);
            toast({
                title: 'Details Copied!',
                description: 'Vehicle details have been copied to your clipboard.',
            });
        } catch (error) {
            console.error('Error copying to clipboard:', error);
            toast({
                variant: 'destructive',
                title: 'Could not copy',
                description: 'Failed to copy details to clipboard.',
            });
        }
    }
  };

  const canTransfer = auth.role === 'owner' || (auth.role === 'reseller' && vehicle.status === 'for_sale' && vehicle.approvedResellerIds?.includes(auth.userId!));
  const canGenerateSalesCopy = auth.role === 'reseller' && vehicle.status === 'for_sale' && vehicle.approvedResellerIds?.includes(auth.userId!);
  const isReadOnly = auth.role === 'insurance' && !vehicle.approvedInsuranceIds?.includes(auth.userId!);
  const showPublicLink = vehicle.status === 'for_sale' && (auth.role === 'owner' || auth.role === 'reseller');
  const isOwner = auth.role === 'owner';
  const isAssignedDealer = auth.role === 'dealer' && !!vehicle.approvedDealerIds?.includes(auth.userId!);
  const showDealerChat = isOwner || isAssignedDealer;

  const isAssignedInsurance = auth.role === 'insurance' && !!vehicle.approvedInsuranceIds?.includes(auth.userId!);
  const isAssignedDealerForClaim = auth.role === 'dealer' && vehicle.status === 'in_claim' && !!vehicle.approvedDealerIds?.includes(auth.userId!);
  const showInsuranceChat = (isAssignedInsurance || isAssignedDealerForClaim) && vehicle.status === 'in_claim';
  const showInsurerFlags = (auth.role === 'insurance' && isAssignedInsurance) || (auth.role === 'dealer' && !!vehicle.approvedDealerIds?.includes(auth.userId!)) || (auth.role === 'reseller' && !!vehicle.approvedResellerIds?.includes(auth.userId!)) || auth.role === 'workshop';
  const canAddInsurerFlags = auth.role === 'insurance' && isAssignedInsurance;
  const showLinkToOwner = auth.role === 'insurance' && isAssignedInsurance && vehicle.status === 'insurer_added' && (!vehicle.ownerId || vehicle.ownerId === '');
  const showInsurerServiceHistory = auth.role === 'insurance' && isAssignedInsurance;
  const showWorkshopServiceHistory = auth.role === 'workshop';
  const showDealerReadonlySections = auth.role === 'dealer' && isAssignedDealer;
  const canViewDealerPolicy = auth.role === 'dealer' && isAssignedDealer && !!vehicle.consents.allowDealerServiceAccess;

  const claimServiceEntries = vehicle.serviceHistory.filter((entry) => /claim/i.test(entry.service) || /claim/i.test(entry.notes || ""));
  const claimActivityEntries = vehicle.activityLog.filter((entry) => /claim/i.test(entry.action) || /claim/i.test(entry.details || ""));
  const claimFlagsWithMatch = claimFlags.filter((flag) => /claim/i.test(flag.flag_type) || /claim/i.test(flag.description));

  const getStatusBadge = () => {
    if (vehicle.status === 'for_sale') return <Badge variant="secondary">For Sale</Badge>;
    if (vehicle.status === 'in_claim') {
      return (
        <Dialog open={isClaimOpen} onOpenChange={setIsClaimOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className={cn(
                badgeVariants({ variant: 'destructive' }),
                'cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
              )}
            >
              Active Insurance Claim
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Claim Details</DialogTitle>
              <DialogDescription>
                Information related to this active insurance claim.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 pt-4">
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-semibold text-red-700">Claim status</p>
                <p className="mt-1 text-sm text-foreground">Active Insurance Claim</p>
              </div>

              <div className="rounded-lg border border-border bg-background p-4">
                <p className="text-sm font-semibold text-foreground">Insurance details</p>
                <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                  <div>
                    <p className="font-medium text-foreground">Provider</p>
                    <p>{vehicle.insurance.provider || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Policy</p>
                    <p>{vehicle.insurance.policyNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Coverage</p>
                    <p>{vehicle.insurance.coverage || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Expires</p>
                    <p>{vehicle.insurance.expires || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-background p-4">
                <p className="text-sm font-semibold text-foreground">Claim-related service items</p>
                {claimServiceEntries.length > 0 ? (
                  <div className="mt-3 space-y-3">
                    {claimServiceEntries.map((service) => (
                      <div key={service.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <p className="font-medium text-foreground">{service.service}</p>
                        <p className="text-sm text-muted-foreground">{service.date}</p>
                        <p className="mt-1 text-sm">Cost: {service.cost}</p>
                        {service.notes && <p className="mt-1 text-sm text-muted-foreground">{service.notes}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">No claim-specific service entries found.</p>
                )}
              </div>

              <div className="rounded-lg border border-border bg-background p-4">
                <p className="text-sm font-semibold text-foreground">Claim-related activity log</p>
                {claimActivityEntries.length > 0 ? (
                  <div className="mt-3 space-y-3">
                    {claimActivityEntries.map((activity) => (
                      <div key={activity.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <p className="font-medium text-foreground">{activity.action}</p>
                        <p className="text-sm text-muted-foreground">{activity.timestamp}</p>
                        {activity.details && <p className="mt-1 text-sm text-muted-foreground">{activity.details}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">No claim-related activity log entries found.</p>
                )}
              </div>

              <div className="rounded-lg border border-border bg-background p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-foreground">Claim flags</p>
                  {claimFlagsLoading && <p className="text-xs text-muted-foreground">Loading flags…</p>}
                </div>
                {claimFlagsWithMatch.length > 0 ? (
                  <div className="mt-3 space-y-3">
                    {claimFlagsWithMatch.map((flag) => (
                      <div key={flag.id} className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                        <p className="font-medium text-amber-900">{flag.flag_type}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{new Date(flag.created_at).toLocaleDateString()}</p>
                        <p className="mt-2 text-sm text-foreground">{flag.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">No claim-related flags recorded yet.</p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button onClick={() => setIsClaimOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    }
    return null;
  }
  
  if (!isClient) {
    return null;
  }
  
  const tabList = [
    { value: 'overview', label: 'Overview' },
    { value: 'consumption', label: 'Fuel/Energy' },
    { value: 'dealer_chat', label: 'Dealer Chat', condition: showDealerChat },
    { value: 'insurance_chat', label: 'Insurance Chat', condition: showInsuranceChat },
    { value: 'ai_tools', label: 'AI Tools' },
    { value: 'incentives', label: 'Incentives', condition: isOwner },
    { value: 'reports', label: 'Reports & Actions' },
  ].filter(tab => tab.condition !== false);

  const gridColsMap: { [key: number]: string } = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    7: 'grid-cols-7',
  };


  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <Badge variant="outline" className="mb-2">{vehicle.year}</Badge>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">{vehicle.make} {vehicle.model}</h1>
          <p className="mt-1 text-lg text-muted-foreground font-mono">{vehicle.vin}</p>
          {(vehicle.registrationNumber || vehicle.colour || vehicle.mileage != null) && (
            <div className="mt-2 flex flex-wrap gap-3">
              {vehicle.registrationNumber && (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Hash className="h-3.5 w-3.5" />
                  {vehicle.registrationNumber}
                </span>
              )}
              {vehicle.colour && (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Palette className="h-3.5 w-3.5" />
                  {vehicle.colour}
                </span>
              )}
              {vehicle.mileage != null && (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Gauge className="h-3.5 w-3.5" />
                  {vehicle.mileage.toLocaleString()} km
                </span>
              )}
            </div>
          )}
          <div className="mt-4">{getStatusBadge()}</div>
        </div>
        <div className="flex items-center gap-2">
          {isOwner && (
            <>
              <EditVehicleDialog vehicle={vehicle} ownerId={auth.userId!} onVehicleUpdated={handleUpdate} />
              <Button variant="outline" onClick={() => toast({ title: "NFC not configured", description: "This is where NFC tap functionality would be implemented for sharing."})}>
                <Nfc className="mr-2 h-4 w-4" />
                Share via NFC
              </Button>
              <Button variant="outline" size="icon" onClick={handleShare} aria-label="Share Vehicle">
                <Share2 className="h-5 w-5" />
              </Button>
            </>
          )}
          {showLinkToOwner && (
            <InsurerLinkRequestModal vehicle={vehicle} userId={auth.userId} canRequest={true} />
          )}
        </div>
      </div>

       {isReadOnly && (
        <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Read-Only Access</AlertTitle>
            <AlertDescription>
                You are viewing this vehicle's record for claim verification purposes. All editing functions are disabled.
            </AlertDescription>
        </Alert>
       )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className={cn("grid w-full", gridColsMap[tabList.length])}>
            {tabList.map(tab => (
                <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
            ))}
        </TabsList>
        <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                {showInsurerServiceHistory ? (
                  <InsurerServiceHistoryCard vehicle={vehicle} />
                ) : showWorkshopServiceHistory ? (
                  <WorkshopServiceHistoryCard
                    serviceHistory={vehicle.serviceHistory}
                    onUpdateHistory={(newHistory: ServiceRecord[]) => handleUpdate({ serviceHistory: newHistory })}
                    vehicleId={vehicle.id}
                    userId={auth.userId}
                  />
                ) : (
                  <ServiceHistoryCard 
                    serviceHistory={vehicle.serviceHistory}
                    onUpdateHistory={(newHistory: ServiceRecord[]) => handleUpdate({ serviceHistory: newHistory })}
                    vehicleId={vehicle.id}
                    userRole={auth.role}
                    userId={auth.userId}
                    isDealerVerified={isDealerVerified}
                  />
                )}
                </div>
                <div className="space-y-8">
                  {showDealerReadonlySections && (
                    <DealerReadonlySections vehicle={vehicle} canViewPolicy={canViewDealerPolicy} />
                  )}
                  {showInsurerFlags && (
                    <InsurerFlagsCard
                      vehicle={vehicle}
                      userRole={auth.role}
                      userId={auth.userId}
                      canAddFlag={canAddInsurerFlags}
                    />
                  )}
                  <ActivityLogCard activityLog={vehicle.activityLog} />
                </div>
            </div>
        </TabsContent>
        <TabsContent value="consumption" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <FuelUsageCard vehicle={vehicle} />
            </div>
        </TabsContent>
        {showDealerChat && (
            <TabsContent value="dealer_chat" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <DealerChatCard vehicle={vehicle} />
                </div>
            </TabsContent>
        )}
        {showInsuranceChat && (
            <TabsContent value="insurance_chat" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <InsuranceDealerChatCard vehicle={vehicle} />
                </div>
            </TabsContent>
        )}
         <TabsContent value="ai_tools" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                    <VehicleChatCard vehicle={vehicle} />
                    <AiRecommendationTool vehicle={vehicle} />
                </div>
                <div className="space-y-8">
                  <NextServicePredictorCard vehicle={vehicle} />
                  <RecurringProblemsDetectorCard vehicle={vehicle} />
                  {canGenerateSalesCopy && <AiSalesCopyCard vehicle={vehicle} />}
                </div>
            </div>
        </TabsContent>
        {isOwner && (
            <TabsContent value="incentives" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <IncentivesCard />
                </div>
            </TabsContent>
        )}
        <TabsContent value="reports" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8">
              <VehicleReport vehicle={vehicle} userRole={auth.role} />
              {isOwner && <ShareWithDealerCard vehicleId={vehicle.id} disabled={!vehicle.consents.allowDealerServiceAccess} />}
              {isOwner && <ConsentManagementCard vehicle={vehicle} onUpdate={handleUpdate} />}
            </div>
            <div className="space-y-8">
              <ViolationsCheckCard vehicle={vehicle} />
              {showPublicLink && <PublicLinkCard vehicleId={vehicle.id} />}
              {canTransfer && <TransferOwnershipCard vehicle={vehicle} />}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
