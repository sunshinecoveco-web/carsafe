"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Logo from "@/components/logo";
import { createResellerProfile, getResellerProfile } from "@/lib/reseller";
import { Loader2, Tag } from "lucide-react";
import type { AuthState } from "@/hooks/use-auth";

const schema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  contactEmail: z.string().email("Enter a valid email address"),
  contactNumber: z.string().min(10, "Enter a valid contact number"),
  address: z.string().min(10, "Enter a full street address"),
});

type FormValues = z.infer<typeof schema>;

export default function ResellerSetupPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      companyName: "",
      contactEmail: "",
      contactNumber: "",
      address: "",
    },
  });

  useEffect(() => {
    const stored = localStorage.getItem("carsafe_user");
    if (!stored) { router.replace("/login"); return; }

    let parsed: AuthState;
    try { parsed = JSON.parse(stored); } catch { router.replace("/login"); return; }

    if (!parsed.isAuthenticated || parsed.role !== "reseller") {
      router.replace("/login");
      return;
    }

    getResellerProfile(parsed.userId!).then(profile => {
      if (profile) { router.replace("/dashboard"); return; }
      setUserId(parsed.userId!);
      setChecking(false);
    });
  }, [router]);

  const onSubmit = async (values: FormValues) => {
    if (!userId) return;
    setServerError(null);

    const { profile, error } = await createResellerProfile(userId, values);
    if (error) { setServerError(error); return; }
    if (profile) router.push("/dashboard");
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-2">
          <Logo />
          <p className="text-sm text-muted-foreground">Reseller Onboarding</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary" />
              <CardTitle>Complete Your Reseller Profile</CardTitle>
            </div>
            <CardDescription>
              Set up your reseller account to access vehicles shared with you by their owners.
              You only complete this once.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company / Trading Name</FormLabel>
                      <FormControl>
                        <Input placeholder="SA Auto Resellers" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="info@saautoresellers.co.za" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Number</FormLabel>
                        <FormControl>
                          <Input placeholder="082 555 1234" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="45 Market Street, Cape Town, 8001"
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {serverError && (
                  <Alert variant="destructive">
                    <AlertDescription>{serverError}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    "Complete Setup & Go to Dashboard"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
