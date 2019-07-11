export interface Just<A> extends MaybeOps<A> {
  /**
   * Set to true if the value is undefined (`Nothing`), false otherwise
   * (`Just`).
   */
  isNothing: false;
  /** The value contained within the Maybe, potentially undefined. */
  value: A;
}

export interface Nothing<A> extends MaybeOps<A> {
  isNothing: true;
  value: undefined;
}

/** A monad that either holds a value (`Just`) or undefined (`Nothing`). */
export type Maybe<A> = Just<A> | Nothing<A>;

export interface MaybeOps<A> {
  /**
   * Takes a function that returns a Maybe and applies it to the wrapped value,
   * returning a Maybe containing the final result. Helpful when dealing with
   * functions that also return Maybe types.
   *
   * `Just`: Transform the Maybe into (potentially) a different Maybe type.
   * `Nothing`: Does nothing and will not call `f`.
   *
   * ```typescript
   * Maybe("a")
   *   .flatMap(a => Maybe().map(b => a === b))
   *   .value; // undefined
   * Maybe("a")
   *   .flatMap(a => Maybe("b").map(b => a === b))
   *   .value; // false
   * ```
   */
  flatMap<B>(f: (a: A) => Maybe<B>): Maybe<B>;
  /**
   * Allows running a function with side effects on the value contained within
   * a Maybe, but only if it has a value.
   *
   * `Just`: Call the supplied function on the value contained within the Maybe.
   * `Nothing`: Does nothing and will not call `f`.
   */
  forEach(f: (a: A) => void): void;
  /**
   * Attempt to read the value contained within the Maybe, throwing an error if
   * it is undefined.
   *
   * `Just`: Gets the underlying value, which will not be `undefined` or `null`.
   * `Nothing`: Throws a `TypeError`.
   */
  get(): A;
  /**
   * Coalesces the value contained within the Maybe into another type. This
   * allows safely extracting values from a Maybe.
   *
   * `Just`: Calls the second function (`f2`) on the value contained within the
   *     Maybe.
   * `Nothing`: Calls the first function (`f1`) with no arguments.
   *
   * ```typescript
   * const message = Maybe(undefined);
   * message.join(() => "no message", v => v.toUpperCase()) === "no message";
   * ```
   */
  join<B>(f1: () => B, f2: (a: A) => B): B;
  /**
   * Allows safely transforming the value within a Maybe type in a chainable
   * manner.
   *
   * `Just`: Transform the value contained within the Maybe to another value.
   * `Nothing`: Does nothing and will not call `f`.
   *
   * ```typescript
   * Maybe("hello")
   *   .map(s => s.toUpperCase())
   *   .value === "HELLO";
   * ```
   */
  map<B>(f: (a: A) => B): Maybe<B>;
  /**
   * Same as `forEach`.
   */
  use(f: (a: A) => void): void;
}

/**
 * A type predicate that returns true if the provided object is a Maybe.
 *
 * ```typescript
 * if (isMaybe(a) && !a.isNothing) {
 *     console.log(a.value); // a.value is not undefined
 * }
 * ```
 */
export function isMaybe<A>(a: Maybe<A> | A): a is Maybe<A> {
  return (a as Maybe<A>).isNothing !== undefined;
}

/**
 * Creates a Maybe monad from a value.
 *
 * The Maybe monad either holds a defined value (`Just`) or nothing (`Nothing`).
 *
 * A `Nothing` is only returned if `undefined` or `null` is provided as a value.
 *
 * ```typescript
 * const just = Maybe(1); // Just(1)
 * const nothing = Maybe(undefined); // Nothing()
 * typeof just.value === "number";
 * typeof nothing.value === "undefined";
 * ```
 */
export function Maybe<A>(a?: A | null): Maybe<A> {
  return a === undefined || a === null ? Nothing() : Just(a);
}

/**
 * Creates a Maybe that represents nothing.
 *
 * In TypeScript you will typically want to provide a type argument otherwise
 * the resulting type will be `Maybe<never>`, which is not particularly useful.
 *
 * ```typescript
 * const nada = Nothing(); // Maybe<never> (not useful)
 * const n1 = Nothing<number>(); // Maybe<number> (type argument)
 * const n2: Maybe<number> = Nothing(); // Maybe<number> (type coercion)
 * ```
 */
export function Nothing<A>(): Nothing<A> {
  return {
    flatMap: () => Nothing(),
    forEach: () => undefined,
    get: () => {
      throw new TypeError("value is undefined");
    },
    isNothing: true,
    join: f => f(),
    map: () => Nothing(),
    use: () => undefined,
    value: undefined
  };
}

/**
 * Creates a Maybe from a value. The value must not be `null` or `undefined`.
 *
 * ```typescript
 * const just = Just(1); // Maybe<number>
 * const err = Just(null); // throws TypeError
 * ```
 */
export function Just<A>(a: A): Just<A> {
  if (a === undefined || a === null) {
    throw new TypeError(
      "invalid argument provided to Just: undefined and null values are not allowed"
    );
  }
  return {
    flatMap: f => f(a),
    forEach: f => f(a),
    get: () => a,
    isNothing: false,
    join: (_, f) => f(a),
    map: f => Maybe(f(a)),
    use: f => f(a),
    value: a
  };
}
