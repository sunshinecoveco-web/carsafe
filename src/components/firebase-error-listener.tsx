"use client";

import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, enableNetwork, disableNetwork } from "firebase/firestore";
import { app } from "@/lib/firebase";
import { AlertCircle, WifiOff, Wifi } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function FirebaseErrorListener() {
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const auth = getAuth(app);
    const db = getFirestore(app);

    const unsubscribeAuth = onAuthStateChanged(auth, 
      (user) => {
        setError(null);
      },
      (authError) => {
        console.error("Firebase Auth Error:", authError);
        setError(`Authentication error: ${authError.message}`);
        setShowAlert(true);
      }
    );

    const handleOnline = () => {
      setIsOffline(false);
      enableNetwork(db).catch(console.error);
      setError(null);
      setShowAlert(false);
    };

    const handleOffline = () => {
      setIsOffline(true);
      disableNetwork(db).catch(console.error);
      setError("You are offline. Some features may be unavailable.");
      setShowAlert(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if (!navigator.onLine) {
      handleOffline();
    }

    const handleError = (event: ErrorEvent) => {
      if (event.message && event.message.includes("firebase")) {
        console.error("Firebase Error Caught:", event.error);
        setError(`Firebase error: ${event.message}`);
        setShowAlert(true);
      }
    };

    window.addEventListener("error", handleError);

    return () => {
      unsubscribeAuth();
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("error", handleError);
    };
  }, []);

  useEffect(() => {
    if (showAlert && !isOffline) {
      const timer = setTimeout(() => {
        setShowAlert(false);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showAlert, isOffline]);

  if (!showAlert || !error) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
      <Alert variant={isOffline ? "default" : "destructive"} className="shadow-lg">
        {isOffline ? <WifiOff className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
        <AlertTitle>{isOffline ? "Offline Mode" : "Connection Issue"}</AlertTitle>
        <AlertDescription className="flex items-center gap-2">
          {error}
          {isOffline && (
            <Wifi className="h-4 w-4 text-muted-foreground" />
          )}
        </AlertDescription>
        <button
          onClick={() => {
            setShowAlert(false);
            setError(null);
          }}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
        >
          ×
        </button>
      </Alert>
    </div>
  );
}
