import { ConcolicNumber, concolicFuzz } from "./concolic.js";
import { strict as assert } from "assert";

/**
 * Concolic Execution
 */
const conf = (x, y, z, t) => {
  let count = 0;
  if (x === "b".charCodeAt()) {
    count++;
  }
  if (y === "a".charCodeAt()) {
    count++;
  }
  if (z === "d".charCodeAt()) {
    count++;
  }
  if (t === "!".charCodeAt()) {
    count++;
  }
  if (count >= 3) {
    assert(false);
  }
};

const confArgs = [
  new ConcolicNumber("x"),
  new ConcolicNumber("y"),
  new ConcolicNumber("z"),
  new ConcolicNumber("t"),
];
concolicFuzz(conf, confArgs, [0, 0, 0, 0]);
