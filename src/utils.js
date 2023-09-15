import Z3 from "z3javascript";

export const z3Ctx = new Z3.Context();

export const solver = new Z3.Solver(z3Ctx, false, []);

let counter = 0;

export const readCounter = () => {
  return counter++;
};

// optional arguments where args[i] indicates whether the i-th boolean expression should be negated
export const args = process.argv.slice(2);

export const constraints = [];
