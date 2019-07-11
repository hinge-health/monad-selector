import { Maybe, MaybeSelector } from "../src";

interface RootState {
  session: {
    userId: string;
  };
  users: {
    [id: string]: UserState | undefined;
  };
}
interface UserState {
  id: string;
  createdAt: string;
  profileUrl: string;
}

const initialState: RootState = {
  session: {
    userId: "1"
  },
  users: {
    ["1"]: {
      createdAt: "",
      id: "1",
      profileUrl: "http://website.test/user/1/profile"
    }
  }
};

const root = (state: RootState) => ({
  session() {
    return session(state);
  },
  user(id: string) {
    return user(state, state.users[id]);
  }
});
const session = (state: RootState) => ({
  user() {
    return user(state, root(state).user(state.session.userId));
  }
});
const user = MaybeSelector((_: RootState, result: Maybe<UserState>) => ({
  profileUrl() {
    return result.map(r => r.profileUrl);
  }
}));

describe("MaybeSelector", () => {
  it("handles undefined values", () => {
    expect(
      root(initialState)
        .user("-1")
        .profileUrl().value
    ).toBeUndefined();
  });

  it("allows chaining on defined values", () => {
    expect(
      root(initialState)
        .session()
        .user()
        .profileUrl().value
    ).toBe("http://website.test/user/1/profile");
  });
});

export {};
