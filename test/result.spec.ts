import { Err, Ok, Result } from "../src";

describe("Ok", () => {
  it("throws when passed an error", () => {
    expect(() => Ok(new Error("fail"))).toThrow(TypeError);
  });

  test("map", () => {
    expect(Ok("hello").map(a => a.toUpperCase()).value).toBe("HELLO");
  });

  test("flatMap", () => {
    expect(
      Ok("hello world")
        .flatMap(a => Result(a.match(/(world)/g) || new Error("no match")))
        .map(a => a[0])
        .get()
    ).toBe("world");
    expect(() =>
      Ok("hello foo")
        .flatMap(a => Result(a.match(/(world)/g) || new Error("no match")))
        .map(a => a[0])
        .get()
    ).toThrow("no match");
  });

  test("forEach", () => {
    const f = jest.fn();
    Ok("a").forEach(f);
    expect(f).toHaveBeenCalledWith("a");
  });

  test("get", () => {
    expect(Ok("a").get()).toBe("a");
  });

  test("getError", () => {
    expect(Ok("a").getError()).toBeUndefined();
  });

  test("getValue", () => {
    expect(Ok("a").getValue()).toBe("a");
  });

  test("join", () => {
    expect(Ok("a").join(() => -1, v => v.length)).toBe(1);
  });

  test("use", () => {
    const f = jest.fn();
    Ok("a").use(f);
    expect(f).toHaveBeenCalledWith("a");
  });
});

describe("Err", () => {
  test("map", () => {
    expect(
      Err<string>(new Error("fail")).map(a => a.toUpperCase()).value
    ).toBeInstanceOf(Error);
  });

  test("flatMap", () => {
    expect(() =>
      Err<string>(new Error("fail"))
        .flatMap(a => Result(a.match(/(world)/g) || new Error("no match")))
        .map(a => a[1])
        .get()
    ).toThrow("fail");
  });

  test("forEach", () => {
    const f = jest.fn();
    Err(new Error("fail")).forEach(f);
    expect(f).not.toHaveBeenCalled();
  });

  test("get", () => {
    expect(() => Err(new Error("fail")).get()).toThrow("fail");
  });

  test("getError", () => {
    expect(Err(new Error("fail")).getError()).toBeInstanceOf(Error);
  });

  test("getValue", () => {
    expect(Err(new Error("fail")).getValue()).toBeUndefined();
  });

  test("join", () => {
    expect(Err<string>(new Error("fail")).join(() => -1, v => v.length)).toBe(
      -1
    );
  });

  test("use", () => {
    const f = jest.fn();
    Err(new Error("fail")).forEach(f);
    expect(f).not.toHaveBeenCalled();
  });
});

test("Result", () => {
  expect(Result("a").isOk).toBe(true);
  expect(Result("a").value).toBe("a");
  expect(Result(null).isOk).toBe(true);
  expect(Result(undefined).isOk).toBe(true);
  expect(Result(new Error("fail")).isOk).toBe(false);
});

export {};
