import {
  type DependencyList,
  type Dispatch,
  type SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";

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
): Reactive<S> {
  const previous = useReactive<S>(initialValue as S);
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

type Watcher<S> = (current?: S) => void;

type Reactive<S> = {
  readonly value: S;
  readonly update: Dispatch<SetStateAction<S>>;
  isDefined(): this is Reactive<NonNullable<S>>;

  isEmpty(): boolean;

  /**
   * Use `onUpdate` to register one or multiple watchers that run everytime the value is updated. Please don't perform more than one action per watcher.
   * It's just anti-pattern.
   * Don't attempt to mutate the reactive reference itself in the watcher or else you'll a get a recursive loop.
   * You can provide a watcher's id for additional verbosity and ease of declaration.
   * Be were that `onUpdate` isn't a reactive effect. This could be both an advatange and disadvantage to your code, depending on what you're trying to acheive.
   * However, you can mutate independet reactive state inside watchers. You're entitled to choosing between regular effects and custom watchers (untracked by react);
   */
  onUpdate(watcher: Watcher<S>): Reactive<S>;
  onUpdate(watcher: Watcher<S>, watcherId: string): Reactive<S>;

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
  let watchers: Watcher<S>[] = [];

  useEffect(() => {
    watchers.forEach((watcher) => {
      watcher(value);
    });

    return () => {
      watchers = [];
    };
  }, [value, watchers]);

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
    onUpdate(watcher) {
      setWatchers((prev) => [...prev, watcher]);
      return this;
    },
  };

  return reactive;
}

// biome-ignore lint/complexity/noBannedTypes: will be implemented in a future update
export type DeepReactive<_S> = {};
