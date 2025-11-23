import { type DependencyList, type Dispatch, type SetStateAction, useMemo, useState } from "react";

/**
 * A computed model is a memoized reactive property that recomputes upon updates in the depency list, while offering the user the choice to overwrite the recent value. Recent updates are reflected in both the model,
 * and the memoization function.
 */
export function useComputedModel<S>(
  factory: (prev: S) => S,
  deps: DependencyList,
  initialValue: S,
): Reactive<S>;
export function useComputedModel<S>(factory: (prev?: S) => S, deps: DependencyList): Reactive<S>;
export function useComputedModel<S>(
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
 * A computed property is analogous to a meomoized property in React, it updates upon changes in the dependencies.
 * However, it provides the previous value
 */
export function useComputed<S>(factory: (prev: S) => S, deps: DependencyList, initialValue: S): S;
export function useComputed<S>(factory: (prev?: S) => S, deps: DependencyList): S;
export function useComputed<S>(
  factory: (prev?: S) => S,
  deps: DependencyList,
  initialValue?: S,
): S | undefined {
  const model = useComputedModel(factory, deps, initialValue);
  return model.value;
}

/**
 * Vue-like reactive model that doesn't require knowledge dispatchers. Can be treated like a regular TS object.
 * Models create a shallow reactive reference. Use them where two-way bindings are expected such as form controls.
 */
class Reactive<S> {
  private readonly _value: S;
  readonly update: Dispatch<SetStateAction<S>> = () => {};

  get value(): S {
    return this._value;
  }

  set value(newValue: S) {
    this.update(newValue);
  }

  constructor(reactiveModel: [S, Dispatch<SetStateAction<S>>]) {
    [this._value, this.update] = reactiveModel;
  }

  isDefined(): this is Reactive<NonNullable<S>> {
    return this._value !== undefined && this._value !== null;
  }

  isEmpty(): boolean {
    return !this._value;
  }

  map<T>(mappingFn: (prev: S) => T): Reactive<T> {
    return useReactive<T>(mappingFn(this._value));
  }

  ifPresent(callable: (prev: NonNullable<S>, update: typeof this.update) => void): Reactive<S> {
    if (this.isDefined()) {
      callable(this._value, this.update);
    }
    return this;
  }

  reset(): Reactive<S> {
    this.update(undefined as S);
    return this;
  }
}

export type { Reactive };

/**
 * Vue-like reactive model that doesn't require knowledge dispatchers. Can be treated like a regular TS object.
 * Models create a shallow reactive reference. Use them where two-way bindings are expected such as form controls.
 */
export function useReactive<S>(initialValue: () => S): Reactive<S>;
export function useReactive<S>(initialValue: S): Reactive<S>;
export function useReactive<S>(): Reactive<S | undefined>;
export function useReactive<S>(initialValue?: S): Reactive<S> {
  const reactive = useState(initialValue);
  return new Reactive(reactive as [S, Dispatch<SetStateAction<S>>]);
}
