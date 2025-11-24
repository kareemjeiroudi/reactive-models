import { type DependencyList, useMemo } from "react";
import { type Reactive, useReactive } from "./reactive";

/**
 * A proxy for asynchronous reactive states. Helpful in client components. State is overwritable after the promise had been resolved. It behaves 1:1 the same as {@link useReactive} - the
 * only difference is that, it's unknown how long before the promise is resolved. It's always recommended to set an initial value therefore, if that's something your application cares about.
 */
export function useAsyncReactive<S>(promise: Promise<S>, initialValue?: S): Reactive<S> {
  const reactive = useReactive<S>(initialValue as S);
  promise.then(reactive.update);
  return reactive;
}

/**
 * A proxy for asynchrounes memos. This gives the advatange of reevaluating the promise upon changes in the dependency list, since it's a part of the memoization function.
 * On top of this, just like a regular computed property, it provides the update history inside the memoization function.
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
