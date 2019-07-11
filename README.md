# monad-selector <!-- omit in toc -->
A collection of utilities for writing monadic state selector functions.

This library is 100% TypeScript comaptible with strict typing and was heavily inspired by [space-lift](https://github.com/AlexGalays/spacelift).

- [Introduction and Examples](#introduction-and-examples)
  - [What is a selector function?](#what-is-a-selector-function)
  - [Selector factories](#selector-factories)
  - [Type-safe selector factories](#type-safe-selector-factories)
- [API](#api)

## Introduction and Examples

### What is a selector function?

The concept is pretty simple: a selector function is simply a function that accepts a state object, possibly some extra arguments, and returns some value that is _derived_ from the passed-in state.

Selector functions are commonly seen in redux-based projects, and this library in particular is designed to help tame complexity in these projects.

```typescript
interface Todo {
  id: number;
  task: string;
}
interface RootState {
  todos: Todo[]
}
function getTodo(state: RootState, id: number) {
  return state.todos[id];
}
```

[Learn more about selector functions here.](https://redux.js.org/introduction/learning-resources#selectors)

A problem frequently encountered with selector functions, especially when composing multiple selectors together, is dealing with potentially undefined values.

```typescript
function getTodoSummary(state: RootState, id: number) {
  const todo = getTodo(state, id);
  return todo.task.substr(2);
}
// TypeError: Cannot read property 'substr' of undefined
console.log(getTodoSummary({ todos: [] }, 1));
```

The obvious solution can quickly lead to undefined checks propagating through the code:

```typescript
function getTodo(state: RootState, id: number): Todo | undefined {
  return state.todos[id];
}
function getTodoSummary(state: RootState, id: number): string | undefined {
  const todo = getTodo(state, id);
  return todo === undefined ? undefined : todo.task.substr(2);
}
const summary = getTodoSummary({ todos: [] }, 1);
if (summary !== undefined) {
  console.log(summary); // will never get here
}
```

Read on to see how this can be be better organized.

### Selector factories

This concept is important to using this library effectively, as it makes heavy use of method chaining and organizing selector functions this way lets you take full advantage of it.

> ### A selector factory is a selector function that returns an object containing more selector functions.

That's all there is to it!

Let's reorganize the previous example a bit to show what that looks like:

```typescript
const todo = (_: RootState, todo: Todo | undefined) => ({
  summary: () => result === undefined ? undefined : todo.task.substr(2)
});
const root = (state: RootState) => ({
  todo: (id: number) => todo(state, state.todos[id])
});
const summary = root({ todos: [] }).todo(1).summary();
if (summary !== undefined) {
  console.log(summary); // will never get here
}
```

This way of organizing selector functions yields nice chaining syntax and lets you organize selector functions to match the shape of your state tree (or however you like, really).

It's especially nice when you want to associate a bunch of functions (like `summary()` above) that operate on a single data type.

A less trivial selector factory might be invoked like so:

```typescript
const dollars = root(state)
  .session()
  .loggedInUser()
  .purchaseHistory()
  .mostRecent()
  .totalAmount();
```

There's a lot of places where this can go wrong, however. What if there's no logged in user? What if they have no purchase history? Heck, what if the entire session is undefined?

### Type-safe selector factories

Aside from the cool chain syntax with selector factories we still don't get around the undefined checks; _yet_. Now let's try using a Result!

```typescript
const todo = ResultSelector("Todo", (_: RootState, todo: Result<Todo>) => ({
  summary: () => todo.map(v => v.task.substr(2))
}));
const root = (state: RootState) => ({
  todo: (id: number) => todo(state, state.todos[id])
});
root({ todos: [] })
  .todo(1)
  .summary()
  .use(s => console.log(s));  // will not log!
```

Check that out! In the callbacks for `use()` and `map()`, we are *guaranteed* not to get an undefined value!

In the less trivial example, a Result monad will let you see exactly what went wrong without breaking the chain.

```typescript
root(stateBeforeLogin)
  .session()         // Ok<Session>
  .loggedInUser()    // Err<User>            (User not logged in)
  .purchaseHistory() // Err<Array<Purchase>> (User not logged in)
  .mostRecent()      // Err<Purchase>        (User not logged in)
  .totalAmount()     // Err<number>          (User not logged in)
  .join(
    err => {
      console.log(err); // Error: User not logged in
    },
    dollars => {
      console.log(`Total amount: ${dollars}`); // will not log!
    }
  );
```

## API

Refer to the docstrings for details and usage examples.

- [Maybe](src/maybe.ts)
- [MaybeSelector](src/maybe-selector.ts)
- [Result](src/result.ts)
- [ResultSelector](src/result-selector.ts) 
