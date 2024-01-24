import { Z3Utils } from "./utils";
import { strict as assert } from "assert";
import { Fraction } from "fractional";

let z3Utils = new Z3Utils();
let z3Ctx = z3Utils.getZ3Ctx();
let solver = z3Utils.getSolver();

let trace = [];

const concolicBool = (expr) => {
  solver.push();
  solver.assert(expr);
  let isSat = solver.check();
  solver.pop();

  trace.push(isSat ? expr : z3Ctx.mkNot(expr));
  console.log(`${expr}: ${isSat}`);
  return isSat;
};

const getNumZ3Expr = (i) => {
  if (typeof i === "number") {
    // as Z3 does not support decimal number we need to convert it to fraction
    const { numerator, denominator } = new Fraction(i);
    return z3Ctx.mkDiv(z3Ctx.mkIntVal(numerator), z3Ctx.mkIntVal(denominator));
  } else if (i instanceof ConcolicNumber) {
    return i.getZ3Expr();
  } else {
    return i;
  }
};

/**
 * ConcolicNumber is a wrapper class to represent number concolic values using Z3 expression.
 *
 * Operator overloading is needed for concolic execution.
 */
export class ConcolicNumber {
  expr;

  constructor(expr) {
    if (typeof expr === "string") {
      this.expr = z3Ctx.mkRealVar(expr);
    } else {
      this.expr = expr;
    }
  }

  [Symbol.for("===")](other) {
    return concolicBool(z3Ctx.mkEq(this.expr, getNumZ3Expr(other)));
  }

  [Symbol.for("==")](other) {
    return this === other;
  }

  [Symbol.for("!==")](other) {
    return concolicBool(
      z3Ctx.mkNot(z3Ctx.mkEq(this.expr, getNumZ3Expr(other))),
      trace,
    );
  }

  [Symbol.for("!=")](other) {
    return this !== other;
  }

  [Symbol.for("<")](other) {
    return concolicBool(z3Ctx.mkLt(this.expr, getNumZ3Expr(other)));
  }

  [Symbol.for("<=")](other) {
    return concolicBool(z3Ctx.mkLe(this.expr, getNumZ3Expr(other)));
  }

  [Symbol.for(">")](other) {
    return concolicBool(z3Ctx.mkGt(this.expr, getNumZ3Expr(other)));
  }

  [Symbol.for(">=")](other) {
    return concolicBool(z3Ctx.mkGe(this.expr, getNumZ3Expr(other)));
  }

  [Symbol.for("+")](other) {
    return new ConcolicNumber(z3Ctx.mkAdd(this.expr, getNumZ3Expr(other)));
  }

  [Symbol.for("-")](other) {
    return new ConcolicNumber(z3Ctx.mkSub(this.expr, getNumZ3Expr(other)));
  }

  [Symbol.for("*")](other) {
    return new ConcolicNumber(z3Ctx.mkMul(this.expr, getNumZ3Expr(other)));
  }

  [Symbol.for("/")](other) {
    return new ConcolicNumber(z3Ctx.mkDiv(this.expr, getNumZ3Expr(other)));
  }

  [Symbol.for("%")](other) {
    return new ConcolicNumber(z3Ctx.mkMod(this.expr, getNumZ3Expr(other)));
  }

  [Symbol.for("**")](other) {
    return new ConcolicNumber(z3Ctx.mkPower(this.expr, getNumZ3Expr(other)));
  }

  getZ3Expr() {
    return this.expr;
  }

  toString() {
    return this.expr.toString();
  }
}

export const concolicFuzz = (f, args, values) => {
  assert(args.length === values.length);
  console.log(`\nFuzzing ${f.name} with args ${args} and values ${values}`);

  trace = [];

  solver.push();
  for (let i = 0; i < args.length; i++) {
    solver.assert(z3Ctx.mkEq(getNumZ3Expr(args[i]), getNumZ3Expr(values[i])));
  }
  try {
    f(...args);
  } catch (e) {
    console.error(e.message);
  }
  solver.pop();

  // as the current trace has been explored, we negate it to explore new paths
  if (trace.length !== 0) {
    solver.assert(z3Ctx.mkNot(z3Ctx.mkAndList(trace)));
  }

  while (trace.length !== 0) {
    solver.push();
    solver.assert(z3Ctx.mkNot(trace.pop()));
    trace.forEach((expr) => solver.assert(expr));
    let isSat = solver.check();
    solver.pop();

    if (isSat) {
      let model = solver.getModel();
      let newValues = args.map((arg) => model.eval(arg.getZ3Expr()));
      concolicFuzz(f, args, newValues);
    }
  }
};
