# Reactive Models

A tiny, React-friendly reactive contract for parent–child components — with ergonomic two-way binding, inspired by Vue’s v-model and Angular's two-way binding, but implemented idiomatically for React.

Reactive Models eliminate the need for explicit onChange / onUpdate callback props.
If a child component receives a Model<T>, it is implicitly allowed to read and update that value.

This results in cleaner component APIs, less prop noise, and a far more expressive and compositional state flow.

## ✨ Features

* Two-way binding without callback props
Parent passes a Model<T>; child can update it safely and predictably.
* Reactive ergonomics
`model.value++`, `model.update(fn)`, `model.map(fn)` — expressive and intuitive.
* Fully parent-owned state
Models never escape the parent’s lifecycle; they are not global stores or proxies.
* Computed Models
Create memoized derivations that also expose previous values.
* Async memo utilities
For promise-based reactive flows (`useAsyncMemo`, `usePromise`).
* TypeScript-first
Models are fully typed and support generics everywhere.

* No contexts, stores, proxies, or global state.
Just local, declarative, reactive contracts.


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
import { useModel } from "@kareemjeiroudi/reactive-models";

function Parent() {
  const name = useModel("");

  return <Child name={name} />;
}
```

Child component

```ts
import type { Model } from "@kareemjeiroudi/reactive-models";

function Child({ name }: { name: Model<string> }) {
  return (
    <input
      value={name.value}
      onChange={e => name.update(e.target.value)}
    />
  );
}
```

No callback props.
No prop drilling.
Just a reactive, two-way binding contract.

## 🧩 API Overview

### Reactive model

```ts
useModel(initialValue)
```

Creates a parent-owned reactive model.

```ts
const count = useModel(0);

count.value++;           // update
count.update(v => v+1);  // functional update
count.reset();           // reset to initial value
```

Model exposes:

```ts
type Model<T> = {
  value: T;
  update(fn: (prev: T) => T): void;
  isDefined(): boolean;
  map<U>(fn: (value: T) => U): Model<U>;
  ifPresent(fn: (value: T) => void): void;
  reset(): void;
}
```

### Computed property

```ts
useComputed<T>(compute: (prev: T | undefined) => T, deps: any[])
```

A memoized value that provides the previously memoized value in the memo function (the history).

```ts
const fullName = useComputed(prev => {
  return `${first.value} ${last.value}`;
}, [first.value, last.value]);
```


### Computed Model

```ts
useComputedModel(...)
```

Like `useComputed`, but returns an read-write Model.

```ts
const cappedCount = useComputedModel(prev => {
  return Math.min(count.value, 10);
}, [count.value]);
```
The main difference here is that while a computed property is read-only, and can't be overwritten, computed models can be updated manually. The written value is put in memoization history.

### Promises

Stop me here if you've experience this problem before: you've declared a asynchronous reactive state in component (particularily client components), however couldn't use awaits. This hooks proxies the promise for you, and delivers it upon promise resolve.

```ts
usePromise(promise)
```

### Asynchronous memos

Similar to `usePromise` but offers memoization options. In a future, release, I will provide a way for React compiler to detect the dependecies and improve memoization too.

```ts
useAsyncMemo(promise, deps)

Resolve promises reactively and store the result in a model.

const user = useAsyncMemo(
  () => fetch("/api/user").then(res => res.json()),
  []
);
```

## 💡 Why Reactive Models?

React’s default state passing pattern is noisy:

```ts
<Child value={name} onChange={setName} />
```

For every “controlled” component, you get:
* a value prop
* one or multiple callback props
* parent boilerplate
* child boilerplate

Reactive Models collapse this into a single, expressive value contract:

```ts
<Child model={nameModel} />
```

The child does not need to know how to update, only that it can.
React still owns the state — but ergonomics improve drastically.

## 🔬 Philosophy

This library does not attempt to replace React, add global stores, or introduce proxies. It simply gives React a missing primitive: a shared value reference that preserves parent ownership but allows child mutation. This fits naturally into React’s mental model, without introducing side effects or unexpected rendering patterns.


## 📐 TypeScript Support

* The entire API is typed end-to-end.
* Child contracts are explicit:
  ```ts
  function Field({ model }: { model: Model<FieldState> }) { ... }
  ```
* Mapping remains strongly typed:
  ```ts
  const upper = name.map(n => n.toUpperCase());
  ```

## 📎 License

MIT © Kareem Jeiroudi