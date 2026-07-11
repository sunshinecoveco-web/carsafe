
"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Vehicle, ServiceRecord, ActivityLogEntry, VehicleConsents } from "@/lib/types";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";

export function VehicleDetails({ vehicle: initialVehicle }: { vehicle: Vehicle }) {
  const [vehicle, setVehicle] = useState(initialVehicle);
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isDealerVerified, setIsDealerVerified] = useState(false);
  const [isClient, setIsClient] = useState(false);

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
  const isAssignedDealer = auth.role === 'dealer' && vehicle.approvedDealerIds?.includes(auth.userId!);
  const showDealerChat = isOwner || isAssignedDealer;

  const isAssignedInsurance = auth.role === 'insurance' && vehicle.approvedInsuranceIds?.includes(auth.userId!);
  const isAssignedDealerForClaim = auth.role === 'dealer' && vehicle.status === 'in_claim' && vehicle.approvedDealerIds?.includes(auth.userId!);
  const showInsuranceChat = (isAssignedInsurance || isAssignedDealerForClaim) && vehicle.status === 'in_claim';
  const showInsurerFlags = (auth.role === 'insurance' && isAssignedInsurance) || (auth.role === 'dealer' && vehicle.approvedDealerIds?.includes(auth.userId!)) || (auth.role === 'reseller' && vehicle.approvedResellerIds?.includes(auth.userId!));
  const canAddInsurerFlags = auth.role === 'insurance' && isAssignedInsurance;

  const getStatusBadge = () => {
    if (vehicle.status === 'for_sale') return <Badge variant="secondary">For Sale</Badge>;
    if (vehicle.status === 'in_claim') return <Badge variant="destructive">Active Insurance Claim</Badge>;
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
        {isOwner && (
          <div className="flex items-center gap-2">
            <EditVehicleDialog vehicle={vehicle} ownerId={auth.userId!} onVehicleUpdated={handleUpdate} />
            <Button variant="outline" onClick={() => toast({ title: "NFC not configured", description: "This is where NFC tap functionality would be implemented for sharing."})}>
              <Nfc className="mr-2 h-4 w-4" />
              Share via NFC
            </Button>
            <Button variant="outline" size="icon" onClick={handleShare} aria-label="Share Vehicle">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        )}
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
                <ServiceHistoryCard 
                    serviceHistory={vehicle.serviceHistory}
                    onUpdateHistory={(newHistory: ServiceRecord[]) => handleUpdate({ serviceHistory: newHistory })}
                    vehicleId={vehicle.id}
                    userRole={auth.role}
                    userId={auth.userId}
                    isDealerVerified={isDealerVerified}
                />
                </div>
                <div className="space-y-8">
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
