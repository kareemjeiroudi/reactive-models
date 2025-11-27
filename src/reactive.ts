import { type DependencyList, type Dispatch, type SetStateAction, useMemo, useState } from "react";

/**
 * A computed reactive is a memoized reactive property that recomputes upon updates in the dependency list, while offering the user the choice to overwrite the recent value. Recent updates are reflected in both the reactive reference
 * as well as the memoization function.
 */
export function useComputedReactive<S>(
  factory: (prev: S) => S,
  deps: DependencyList,
  initialValue: S,
): Reactive<S>;
export function useComputedReactive<S>(factory: (prev?: S) => S, deps: DependencyList): Reactive<S>;
export function useComputedReactive<S>(
  factory: (prev?: S) => S,
  deps: DependencyList,
  initialValue?: S,
): Reactive<S | undefined> {
  const previous = useReactive<S | undefined>(initialValue);
  const factoryWithHistory: () => S = () => {
    const newUpdate = factory(previous.value);
    previous.update(newUpdate);
    return newUpdate;
  };
  // biome-ignore lint/correctness/useExhaustiveDependencies: delegation call
  useMemo<S>(factoryWithHistory, deps);
  return previous;
}

/**
 * A computed memo is analogous to a meomoized property in React, it updates upon changes in the dependencies.
 * However, it provides the previous value
 */
export function useComputed<S>(factory: (prev: S) => S, deps: DependencyList, initialValue: S): S;
export function useComputed<S>(factory: (prev?: S) => S, deps: DependencyList): S;
export function useComputed<S>(
  factory: (prev?: S) => S,
  deps: DependencyList,
  initialValue?: S,
): S | undefined {
  const model = useComputedReactive(factory, deps, initialValue);
  return model.value;
}

/**
 * Vue-like reactive reference that doesn't require knowledge dispatchers. Can be treated like a regular TS object.
 * Reactive references create a shallow reactive reference. I.e. deeply nested changes to cause the Reactive state to change. See {} Use them where two-way bindings are expected such as form controls.
 */
type Reactive<S> = {
  readonly value: S;
  readonly update: Dispatch<SetStateAction<S>>;
  isDefined(): this is Reactive<NonNullable<S>>;

  isEmpty(): boolean;

  ifPresent(
    callable: (prev: NonNullable<S>, update: Dispatch<SetStateAction<S>>) => void,
  ): Reactive<S | undefined>;

  reset(): Reactive<S>;
};

export type { Reactive };

/**
 * Vue-like reactive model that doesn't require knowledge dispatchers. Can be treated like a regular TS object.
 * Models create a shallow reactive reference. For deep reactivity, see {@link DeepReactive}. Use them where two-way bindings are expected such as form controls.
 */
export function useReactive<S>(initialValue: () => S): Reactive<S>;
export function useReactive<S>(initialValue: S): Reactive<S>;
export function useReactive<S>(): Reactive<S | undefined>;
export function useReactive<S>(initialValue?: S): Reactive<S | undefined> {
  const [value, update] = useState(initialValue);

  const reactive: Reactive<S | undefined> = {
    value,
    update,
    isDefined(): this is Reactive<NonNullable<S>> {
      return value !== undefined && value !== null;
    },
    isEmpty(): boolean {
      return !value;
    },
    ifPresent(callable): Reactive<S | undefined> {
      if (this.isDefined()) {
        callable(this.value, this.update);
      }

      return this;
    },
    reset(): Reactive<S | undefined> {
      update(undefined);
      return this;
    },
  };

  return reactive;
}

// biome-ignore lint/complexity/noBannedTypes: will be implemented in a future update
export type DeepReactive<_S> = {};

export function useMemoOr<S>(
  factory: () => S | undefined,
  deps: DependencyList,
  alternative: S,
): S {
  const memo = useMemo<S | undefined>(factory, [...deps]);
  return memo ?? alternative;
}
