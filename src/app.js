import { SymbolicNumber, symExe } from "./symbolic.js";
import { strict as assert } from "assert";

const test = (x, y, z) => {
  if (x === y ** 2) {
    const t = y * -2.5 + 1;
    if (t > z + 3) {
      const u = z * -3.5;
      if (x <= u / 4) {
        assert(false);
      }
    }
  }
};

const fArgs = [
  new SymbolicNumber("x"),
  new SymbolicNumber("y"),
  new SymbolicNumber("z"),
];

symExe(test, fArgs);
