import Z3 from "z3javascript";

export class Z3Utils {
  #z3Ctx;
  #solver;

  constructor() {
    this.#z3Ctx = new Z3.Context();
    this.#solver = new Z3.Solver(this.#z3Ctx, false, []);
  }

  getZ3Ctx() {
    return this.#z3Ctx;
  }

  getSolver() {
    return this.#solver;
  }
}
