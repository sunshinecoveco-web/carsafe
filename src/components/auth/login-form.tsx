"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { LogIn, User, KeyRound } from "lucide-react";
import type { UserRole } from "@/hooks/use-auth";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const mockUsers: Record<string, { password; role; userId }> = {
    'owner@carsafe.app': { password: 'password123', role: 'owner', userId: 'owner-1' },
    'dealer@carsafe.app': { password: 'dealerpass', role: 'dealer', userId: 'dealer-1' },
    'reseller@carsafe.app': { password: 'resellerpass', role: 'reseller', userId: 'reseller-1' },
    'insurance@carsafe.app': { password: 'insurancepass', role: 'insurance', userId: 'insurance-1' },
}

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(values: LoginFormValues) {
    const { email, password } = values;
    const user = mockUsers[email.toLowerCase()];

    if (user && user.password === password) {
        localStorage.setItem('carsafe_user', JSON.stringify({ isAuthenticated: true, role: user.role, userId: user.userId }));
        toast({ title: "Login Successful", description: `Welcome back!` });
        router.push("/dashboard");
    } else {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid email or password. Please try again.",
      });
      form.setError("email", { type: "manual", message: "Invalid credentials" });
      form.setError("password", { type: "manual", message: "Invalid credentials" });
    }
  }

  return (
    <Card className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
                <p className="text-sm text-muted-foreground text-center">
                    Enter a demo email below and its password:<br/>
                    <span className="font-semibold text-foreground">owner@carsafe.app</span> (password123)<br/>
                    <span className="font-semibold text-foreground">dealer@carsafe.app</span> (dealerpass)<br/>
                    <span className="font-semibold text-foreground">reseller@carsafe.app</span> (resellerpass)<br/>
                    <span className="font-semibold text-foreground">insurance@carsafe.app</span> (insurancepass)
                </p>
            </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input type="email" placeholder="you@example.com" {...field} className="pl-10" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input type="password" placeholder="••••••••" {...field} className="pl-10" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Signing In..." : <> <LogIn className="mr-2 h-4 w-4"/> Sign In</>}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
