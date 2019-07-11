import { isMaybe, Just, Maybe, Nothing } from "./maybe";

export type MaybeSelector<State, ResultType, Selectors> = (
  state: State,
  result?: ResultType | Maybe<ResultType>
) => Maybe<ResultType> & Selectors;

export function MaybeSelector<State, ResultType, Selectors>(
  selectorFactory: (s: State, r: Maybe<ResultType>) => Selectors
): MaybeSelector<State, ResultType, Selectors> {
  return (s, r) => {
    let result: Maybe<ResultType>;

    if (r === undefined) {
      result = Nothing();
    } else if (isMaybe(r)) {
      result = r;
    } else {
      result = Just(r);
    }

    return { ...result, ...selectorFactory(s, result) };
  };
}
