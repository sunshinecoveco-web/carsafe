"use client";

import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import type { FirestorePermissionError } from '@/firebase/errors';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      console.error(error); 

      toast({
        variant: 'destructive',
        duration: 20000,
        title: 'Firestore Permission Denied',
        description: (
          <div className="mt-2 w-full">
            <p className="text-sm">
              The {error.context.operation} operation on path{' '}
              <code className="bg-destructive-foreground/20 p-1 rounded-sm text-xs">
                {error.context.path}
              </code>{' '}
              was blocked by your security rules.
            </p>
            {error.context.requestResourceData && (
                 <details className="mt-2 text-xs">
                    <summary>View Sent Data</summary>
                    <pre className="mt-1 p-2 bg-destructive-foreground/20 rounded-md max-h-40 overflow-auto">
                        <code>
                            {JSON.stringify(error.context.requestResourceData, null, 2)}
                        </code>
                    </pre>
                </details>
            )}
          </div>
        ),
      });
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [toast]);

  return null;
}
