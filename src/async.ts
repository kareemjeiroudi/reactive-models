import { useMemo, type DependencyList } from "react";
import { type Reactive, useReactive } from "./reactive";

/**
 * A proxy for asynchronous reactive states. Helpful in client components. State is overwritable after the promise had been resolved.
 */
export function useAsyncReactive<S>(promise: Promise<S>, initialValue?: S): Reactive<S> {
  const reactive = useReactive<S>(initialValue as S);
  promise.then(reactive.update);
  return reactive;
}

/**
 * A proxy for asynchrounes memos. Allows the promise to be recalled upon change, since it's a part of the memoization function.
 */
export function useAsyncComputed<S>(
  factory: (prev: S) => Promise<S>,
  deps: DependencyList,
  initialValue: S,
): S;
export function useAsyncComputed<S>(factory: (prev?: S) => Promise<S>, deps: DependencyList): S;
export function useAsyncComputed<S>(
  factory: (prev?: S) => Promise<S>,
  deps: DependencyList,
  initialValue?: S,
): S {
  const previous = useReactive<S>(initialValue as S);
  const asyncFactory: () => Promise<S> = () => factory(previous.value);
  // biome-ignore lint/correctness/useExhaustiveDependencies: delegration call to React API
  useMemo(asyncFactory, deps).then(previous.update);
  return previous.value;
}
