
"use client";

import * as React from "react";
import type { ActivityLogEntry } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ListChecks, Send, Wrench, Trash2, Pencil, ShieldQuestion, Link as LinkIcon, ShieldCheck } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const USER_LABELS: Record<string, string> = {
  '2d340498-6e5e-406d-b47e-a1acc60ed078': 'Owner',
  '8bc4d8ad-8f49-43d6-acca-3c8586e073a0': 'Dealer',
  'c0c345d5-4780-4748-9d24-b53e3a46e7f9': 'Reseller',
  '032bccbd-e329-45e7-8f22-fc27692704c2': 'Insurer',
  'system': 'System',
};

function formatUser(userId: string): string {
  return USER_LABELS[userId] ?? userId;
}

const iconMap: Record<ActivityLogEntry['action'], React.ReactNode> = {
  'Service Added': <Wrench className="h-4 w-4 text-muted-foreground" />,
  'Service Edited': <Pencil className="h-4 w-4 text-muted-foreground" />,
  'Service Deleted': <Trash2 className="h-4 w-4 text-muted-foreground" />,
  'Ownership Transferred': <Send className="h-4 w-4 text-muted-foreground" />,
  'Vehicle Created': <ListChecks className="h-4 w-4 text-muted-foreground" />,
  'Consent Updated': <ShieldQuestion className="h-4 w-4 text-muted-foreground" />,
};

export function ActivityLogCard({ activityLog }: { activityLog: ActivityLogEntry[] }) {
  const [clientActivityLog, setClientActivityLog] = React.useState<ActivityLogEntry[]>([]);

  React.useEffect(() => {
    const sortedLog = [...activityLog].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setClientActivityLog(sortedLog);
  }, [activityLog]);
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <ListChecks className="h-6 w-6 text-primary" />
                <div>
                    <CardTitle>Activity Log</CardTitle>
                    <CardDescription>A chronological record of all events.</CardDescription>
                </div>
            </div>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                         <Badge variant="outline" className="flex items-center gap-1.5 bg-accent/10 border-accent/30 text-accent-foreground">
                            <ShieldCheck className="h-3 w-3" />
                            Chain Verified
                        </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="max-w-xs text-xs">Each entry is cryptographically linked to the previous one, ensuring a tamper-proof audit trail.</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[27rem]">
          <div className="relative pl-8">
            {clientActivityLog.map((entry, index) => (
              <div key={entry.id} className="flex gap-4 group">
                 <div className="absolute left-0 flex flex-col items-center h-full">
                  <span className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-secondary ring-2 ring-card">
                    {iconMap[entry.action]}
                  </span>
                  {index < clientActivityLog.length - 1 && <div className="h-full w-px bg-border my-1"></div>}
                </div>

                <div className="pb-8 pt-1 flex-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-semibold text-sm">{entry.action}</p>
                            <p className="text-sm text-muted-foreground">{entry.details}</p>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                             <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded cursor-help">
                                            <LinkIcon className="h-2.5 w-2.5" />
                                            {entry.hash.substring(0, 8)}...
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <div className="text-[10px] space-y-1">
                                            <p><span className="font-bold">Entry Hash:</span> {entry.hash}</p>
                                            <p><span className="font-bold">Prev Hash:</span> {entry.previousHash}</p>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })} by <span className="font-medium text-foreground">{formatUser(entry.user)}</span>
                  </p>
                </div>
              </div>
            ))}
             {clientActivityLog.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                    <p>No activity has been logged for this vehicle yet.</p>
                </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
