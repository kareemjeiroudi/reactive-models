import { type DependencyList, useMemo, useState } from "react";
import { useModel } from "./reactive";

export const usePromise = <T>(promise: Promise<T>, initialValue?: T): T => {
  const [value, setValue] = useState<T>(initialValue as T);
  promise.then(setValue);
  return value;
};

export const useAsyncMemo = <S>(
  factory: () => Promise<S>,
  deps: DependencyList,
  initialValue?: S,
): S => {
  const current = useModel<S>(initialValue as S);
  // biome-ignore lint/correctness/useExhaustiveDependencies: delegration call to React API
  const promise = useMemo(factory, deps);
  promise.then((asyncValue) => current.update(asyncValue));
  return current.value;
};
