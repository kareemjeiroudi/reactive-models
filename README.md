# Reactive References

A tiny, React-friendly reactive contract for parent–child components — with ergonomic two-way binding, inspired by Vue’s v-model and Angular's two-way binding, but implemented idiomatically for React.

Reactive references eliminate the need for explicit `onChange` / `onUpdate` callback props.
If a child component receives a `Reactive<T>`, it is implicitly allowed to read and update that value.

This results in cleaner component APIs, less prop noise, and a far more expressive and compositional state flow.

## ✨ Features

* Two-way binding without callback props
Parent passes a `Reactive<T>`; child can update it safely and predictably.
* Reactive ergonomics
`reactive.value++`, `reactive.update(fn)`, `reactive.map(fn)` — expressive and intuitive.
* Fully parent-owned state never escape the parent’s lifecycle; they are not global stores or proxies.
* Computed Reactives create memoized derivations that also expose previous values.
* Async memo utilities for promise-based reactive flows (`useAsyncComputed`, `useAsyncReactive`).
* TypeScript-first: fully typed and support generics everywhere.

* No contexts, stores, proxies, or global state. Just local, declarative, reactive contracts.

* Fully bundled, minified, and split for optimal tree-shaking. The package ships with both ESM and CJS builds, though ESM is recommended for maximum tree-shaking. Type definitions (`.d.ts`) are included directly in the package.


## 📦 Install

```bash
npm install @kareemjeiroudi/reactive-models
```

```bash
pnpm add @kareemjeiroudi/reactive-models
```

```bash
yarn add @kareemjeiroudi/reactive-models
```

```bash
bun add @kareemjeiroudi/reactive-models
```

## 🚀 Getting Started

Parent component

```ts
import { useReactive } from "@kareemjeiroudi/reactive-models";

function Parent() {
  const name = useReactive("");

  return <Child name={name} />;
}
```

Child component

```ts
import type { Reactive } from "@kareemjeiroudi/reactive-models";

function Child({ name }: { name: Reactive<string> }) {
  return (
    <input
      value={name.value}
      onChange={name.update}
    />
  );
}
```

No callback props. No prop drilling. Just a reactive, two-way binding contract.

## 🧩 API Overview

### Reactive Reference

```ts
useReactive(initialValue)
```

Creates a parent-owned reactive model.

```ts
const count = useReactive(0);

count.value++;           // update value directly
count.update(v => v+1);  // functional update (update is Dispatch<SetStateAction<S>>)
count.reset();           // reset to undefined
```

Reference exposes:

```ts
type Reactive<S> = {
  value: S;
  update: Dispatch<SetStateAction<S>>;
  isDefined(): boolean;
  map<U>(fn: (value: S) => U): Model<U>;
  ifPresent(fn: (value: S) => void): void;
  reset(): void;
}
```

### Computed Memo

```ts
useComputed<S>(compute: (prev: S | undefined) => S, deps: any[], initialValue?: S)
```

A memoized primitive value that recomputes when dependencies change, providing the previously memoized value in the compute function (the history). This returns a primitive value, not a reference.

```ts
const fullName = useComputed(prev => {
  return `${first.value} ${last.value}`;
}, [first.value, last.value]);
```

### Computed Reactive

```ts
useComputedReactive(factory, deps, initialValue?)
```

A memoized reactive reference that recomputes when dependencies change, storing its previous value and allowing you to overwrite the computed value manually. Useful when you want a computed value that is still writable.

```ts
const cappedCount = useComputedReactive(prev => {
  return Math.min(count.value, 10);
}, [count.value]);
```

### Promises

Stop me here if you've experienced this problem before: you've declared asynchronous reactive state in a component (particularly client components), but couldn't use awaits. This hook proxies the promise for you, and delivers it upon promise resolve.

```ts
useAsyncReactive(promise)
```

### Asynchronous memos

Similar to `useAsyncReactive` but offers memoization options. In a future release, there will be a way for the React compiler to detect dependencies and improve memoization too.

```ts
useAsyncComputed(promise, deps)
```

Resolves promises and keeps track of dependencies updates reactively.

```ts
const user = useAsyncComputed(
  (prev?) => fetch("/api/user").then(res => res.json()),
  []
);
```

Obviously, because this a computed memo, you still have access the memo history. 😎

## 💡 Why Reactive References?

React’s default state passing pattern is noisy:

```ts
<Child value={name} onChange={setName} />
```

For every “controlled” component, you get:
* a value prop
* one or multiple callback props
* parent boilerplate
* child boilerplate

Reactive references collapse this into a single, expressive value contract reducing the overhead:

```ts
<Child color={reactiveColor} />
```

The child does not need to know how to update, only that it can.
React still owns the state — but ergonomics improve drastically.

## 🔬 Philosophy

This library does not attempt to replace React, add global stores, or introduce proxies. It simply gives React a missing primitive: a shared value reference that preserves parent ownership but allows child mutation. This fits naturally into React’s mental model, without introducing side effects or unexpected rendering patterns.


## 📐 TypeScript Support

* The entire API is typed end-to-end.
* Child contracts are explicit:
  ```ts
  function Field({ value }: { value: Reactive<FieldState> }) { ... }
  ```
* Mapping remains strongly typed:
  ```ts
  const upper = name.map(n => n.toUpperCase());
  ```

## 🧱 Build Output

This package is fully bundled, minified, and split to enable optimal tree‑shaking.  
We ship:
- **ESM** (`import`) — *recommended*
- **CJS** (`require`) — for legacy Node/CommonJS environments  
- **TypeScript types** (`.d.ts`) included

Using ESM ensures you benefit from maximum tree-shaking and smaller bundle sizes.

## 🙋 Maintainer

This package is maintained by a single developer as a side‑project, born out of solving real ergonomic issues encountered in day‑to‑day React development. Thank you for your support!

## 💬 Feedback & Discussions

If you encounter any issues, have feature requests, or want to provide feedback, feel free to open a GitHub Discussion. Community input is welcome and appreciated.

## 📎 License

MIT © Kareem Jeiroudi