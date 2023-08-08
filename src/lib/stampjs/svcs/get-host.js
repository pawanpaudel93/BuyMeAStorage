import {
  always,
  compose,
  cond,
  equals,
  T,
  takeLast,
  join,
  split,
  identity,
} from "ramda";

export function getHost() {
  if (!globalThis.location) {
    return "arweave.net";
  }
  return compose(
    cond([
      [equals("gitpod.io"), always("arweave.net")],
      [equals("arweave.dev"), always("arweave.net")],
      [equals("localhost"), always("arweave.net")],
      [equals("vercel.app"), always("arweave.net")],
      [T, identity],
    ]),
    join("."),
    takeLast(2),
    split(".")
  )(location.hostname);
}
