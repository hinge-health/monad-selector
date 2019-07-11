export interface Ok<A> extends ResultOps<A> {
  /** Set to true if there is no Error (`Ok`), false otherwise (`Err`). */
  isOk: true;
  /** The value contained within the Result, potentially an Error. */
  value: A;
}

export interface Err<A> extends ResultOps<A> {
  isOk: false;
  value: Error;
}

/** A monad that either holds a value (`Ok`) or an Error (`Err`). */
export type Result<A> = Err<A> | Ok<A>;

export interface ResultOps<A> {
  /**
   * Takes a function that returns a Result and applies it to the wrapped value,
   * returning a Result containing the final result. Helpful when dealing with
   * functions that also return Result types.
   *
   * `Ok`: Transform the Result into (potentially) a different Result type.
   * `Err`: Does nothing and will not call `f`.
   *
   * ```typescript
   * Result("a")
   *   .flatMap(a => Err(new Error("fail")).map(b => a === b))
   *   .value; // Error: fail
   * Result("a")
   *   .flatMap(a => Ok("b").map(b => a === b))
   *   .value; // false
   * ```
   */
  flatMap<B>(f: (a: A) => Result<B>): Result<B>;
  /**
   * Allows running a function with side effects on the value contained within a
   * Result, but only if it has a value.
   *
   * `Ok`: Call the supplied function on the value contained within the Result.
   * `Err`: Does nothing and will not call `f`.
   *
   */
  forEach(f: (a: A) => void): void;
  /**
   * Either return the value contained within the Result or throws the enclosed
   * error if the value is an Error.
   *
   * `Ok`: Gets the underlying value, which will not be an `Error`.
   * `Err`: Throws the underlying error.
   */
  get(): A;
  /**
   * Attempt to extract the error from a Result, or undefined if it is an `Ok`.
   *
   * `Ok`: Returns `undefined`.
   * `Err`: Returns an `Error`.
   */
  getError(): Error | undefined;
  /**
   * Attempt to extract the value from a Result, or undefined if it is an `Err`.
   *
   * `Ok`: Returns the value.
   * `Err`: Returns `undefined`.
   */
  getValue(): A | undefined;
  /**
   * Coalesces the value contained within the Result into another type. This
   * allows safely extracting values from a Result.
   *
   * `Ok`: Calls the second function (`f2`) on the value contained within the
   *     Result.
   * `Err`: Calls the first function (`f1`) on the error contained within the
   *     Result.
   *
   * ```typescript
   * const message = Result(new Error("fail"));
   * message.join(e => e.message, v => v.toUpperCase()) === "fail";
   * ```
   */
  join<B>(fe: (e: Error) => B, fa: (a: A) => B): B;
  /**
   * Allows safely transforming the value within a Result type in a chainable
   * manner.
   *
   * `Ok`: Transform the value contained within the Result to another value.
   * `Err`: Does nothing and will not call `f`. The error value is preserved.
   *
   * ```typescript
   * Err<string>(new Error("fail"))
   *   .map(s => s.toUpperCase())
   *   .get(); // throws Error: fail
   * ```
   */
  map<B>(f: (a: A) => B): Result<B>;
  /**
   * Same as `forEach`.
   */
  use(f: (a: A) => void): void;
}

/**
 * A type predicate that returns true if the provided object is a Result.
 *
 * ```typescript
 * if (isResult(a) && a.isOk) {
 *   console.log(a.value); // a.value is not an Error
 * }
 * ```
 */
export function isResult<A>(a: Result<A> | A | Error): a is Result<A> {
  return (a as Result<A>).isOk !== undefined;
}

/**
 * Creates a Result monad from a value.
 *
 * The Result monad either holds a value (`Ok`) or an Error (`Err`).
 *
 * An `Err` is only returned if an `Error` object is provided as a value.
 *
 * ```typescript
 * const ok = Result(1); // Ok(1)
 * const err = Result(new Error("fail")); // Err(new Error("fail"))
 * typeof ok.value === "number";
 * (ok.value instanceof Error) === true;
 * ```
 */
export function Result<A>(a: A | Error): Result<A> {
  return a instanceof Error ? Err(a) : Ok(a);
}

/**
 * Creates a Result that represents an error.
 *
 * In TypeScript you will typically want to provide a type argument otherwise
 * the resulting type will be `Result<never>`, which is not particularly useful.
 *
 * ```typescript
 * const nada = Err(new Error("fail")); // Result<never> (not useful)
 * const n1 = Err<number>(new Error("fail")); // Result<number> (type argument)
 * const n2: Result<number> = Err(new Error("fail")); // Result<number> (type coercion)
 * ```
 */
export function Err<A>(e: Error): Err<A> {
  if (!(e instanceof Error)) {
    throw new TypeError(
      "invalid argument provided to Err: only Error values are allowed"
    );
  }
  return {
    flatMap: () => Err(e),
    forEach: () => undefined,
    get: () => {
      throw e;
    },
    getError: () => e,
    getValue: () => undefined,
    isOk: false,
    join: f => f(e),
    map: () => Err(e),
    use: () => undefined,
    value: e
  };
}

/**
 * Creates a Result from a value. The value must not be an `Error` object.
 *
 * ```typescript
 * const ok = Ok(1); // Result<number>
 * const err = Ok(new Error("fail")); // throws TypeError
 * ```
 */
export function Ok<A>(a: A): Ok<A> {
  if (a instanceof Error) {
    throw new TypeError(
      "invalid argument provided to Ok: Error values are not allowed"
    );
  }
  return {
    flatMap: f => f(a),
    forEach: f => f(a),
    get: () => a,
    getError: () => undefined,
    getValue: () => a,
    isOk: true,
    join: (_, f) => f(a),
    map: f => Result(f(a)),
    use: f => f(a),
    value: a
  };
}
