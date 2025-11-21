import { type DependencyList, type Dispatch, type SetStateAction, useMemo, useState } from "react";

/**
 * A computed model is a memoized reactive property that recomputes upon updates in the depency list, while offering the user the choice to overwrite the recent value. Recent updates are reflected in both the model,
 * and the memoization function.
 */
export function useComputedModel<S>(
  factory: (prev: S) => S,
  deps: DependencyList,
  initialValue: S,
): Model<S>;
export function useComputedModel<S>(factory: (prev?: S) => S, deps: DependencyList): Model<S>;
export function useComputedModel<S>(
  factory: (prev?: S) => S,
  deps: DependencyList,
  initialValue?: S,
): Model<S> {
  const previous = useModel<S>(initialValue as S);
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
class Model<S> {
  private _value: S;
  private _dispatch: Dispatch<SetStateAction<S>>;

  get value(): S {
    return this._value;
  }

  set value(newValue: S) {
    this._dispatch(newValue);
  }

  constructor(reactiveModel: [S, Dispatch<SetStateAction<S>>]) {
    [this._value, this._dispatch] = reactiveModel;
  }

  update(newValue: S): void;
  update(fun: (previous: S) => S): void;
  update(fun: S | ((previous: S) => S)): void {
    this._dispatch(fun);
  }

  isDefined(): this is Model<NonNullable<S>> {
    return this._value !== undefined && this._value !== null;
  }

  isEmpty(): boolean {
    return !this._value;
  }

  map<T>(mappingFn: (prev: S) => T): Model<T> {
    return useModel<T>(mappingFn(this._value));
  }

  ifPresent(callable: (prev: NonNullable<S>, update: typeof this._dispatch) => void): Model<S> {
    if (this.isDefined()) {
      callable(this._value, this._dispatch);
    }
    return this;
  }

  reset(): Model<S> {
    this.update(undefined as S);
    return this;
  }
}

export type { Model };

export function useModel<S>(initialValue: () => S): Model<S>;
export function useModel<S>(initialValue: S): Model<S>;
export function useModel<S>(): Model<S | undefined>;
export function useModel<S>(initialValue?: S): Model<S> {
  const reactiveModel = useState(initialValue);
  return new Model(reactiveModel as [S, Dispatch<SetStateAction<S>>]);
}
