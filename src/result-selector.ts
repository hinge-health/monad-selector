import { Err, isResult, Result } from "./result";

export type ResultSelector<State, ResultType, Selectors> = (
  state: State,
  result?: ResultType | Result<ResultType> | Error
) => Result<ResultType> & Selectors;

export function ResultSelector<State, ResultType, Selectors>(
  selectorFactory: (s: State, r: Result<ResultType>) => Selectors
): ResultSelector<State, ResultType, Selectors> {
  return (s, r) => {
    let result: Result<ResultType>;

    if (r === undefined) {
      result = Err(new Error(`result is undefined`));
    } else if (isResult(r)) {
      result = r;
    } else {
      result = Result(r);
    }

    return { ...result, ...selectorFactory(s, result) };
  };
}
