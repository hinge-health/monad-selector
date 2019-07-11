import { Just, Maybe, Nothing } from "../src";

describe("Just", () => {
  it("throws when passed null or undefined", () => {
    expect(() => Just(null)).toThrow(TypeError);
  });

  test("map", () => {
    expect(Just("hello").map(a => a.toUpperCase()).value).toBe("HELLO");
  });

  test("flatMap", () => {
    expect(
      Just("hello world")
        .flatMap(a => Maybe(a.match(/(world)/g)))
        .map(a => a[0]).value
    ).toBe("world");
    expect(
      Just("hello foo")
        .flatMap(a => Maybe(a.match(/(world)/g)))
        .map(a => a[0]).value
    ).toBeUndefined();
  });

  test("forEach", () => {
    const f = jest.fn();
    Just("a").forEach(f);
    expect(f).toHaveBeenCalledWith("a");
  });

  test("get", () => {
    expect(Just("a").get()).toBe("a");
  });

  test("join", () => {
    expect(Just("a").join(() => -1, v => v.length)).toBe(1);
  });

  test("use", () => {
    const f = jest.fn();
    Just("a").use(f);
    expect(f).toHaveBeenCalledWith("a");
  });
});

describe("Nothing", () => {
  test("map", () => {
    expect(Nothing<string>().map(a => a.toUpperCase()).value).toBeUndefined();
  });

  test("flatMap", () => {
    expect(
      Nothing<string>()
        .flatMap(a => Maybe(a.match(/(world)/g)))
        .map(a => a[0]).value
    ).toBeUndefined();
  });

  test("forEach", () => {
    const f = jest.fn();
    Nothing().forEach(f);
    expect(f).not.toHaveBeenCalled();
  });

  test("get", () => {
    expect(() => Nothing().get()).toThrow(TypeError);
  });

  test("join", () => {
    expect(Nothing<string>().join(() => -1, v => v.length)).toBe(-1);
  });

  test("use", () => {
    const f = jest.fn();
    Nothing().use(f);
    expect(f).not.toHaveBeenCalled();
  });
});

test("Maybe", () => {
  expect(Maybe("a").isNothing).toBe(false);
  expect(Maybe("a").value).toBe("a");
  expect(Maybe(null).isNothing).toBe(true);
  expect(Maybe(undefined).isNothing).toBe(true);
});

export {};
