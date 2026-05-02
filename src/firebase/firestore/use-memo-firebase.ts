
import { useMemo } from 'react';
import type { DependencyList } from 'react';

// A helper hook to memoize Firestore queries and references.
export function useMemoFirebase<T>(
  factory: () => T,
  deps: DependencyList | undefined
) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, deps);
}
