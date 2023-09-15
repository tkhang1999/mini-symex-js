import { solver, readCounter, args, constraints, z3Ctx } from "./utils";
import { spawnSync } from "child_process";
import { Fraction } from "fractional";

export const symbolicBool = (expr, shouldNegate) => {
  let result = undefined;

  if (shouldNegate !== "true") {
    // if this expression is encountered for the first time as "args[counter] === undefined",
    // a child process will be spawned to negate this expression to take an alternative path.
    if (shouldNegate === undefined) {
      // child process to negate "expr"
      const childArgs = [...args, "true"];
      const child = spawnSync(
        process.argv[0],
        [process.argv[1], ...childArgs],
        {
          encoding: "utf-8",
        },
      );
      console.log(child.stdout);

      // mark this expression as encountered (should not negate) by the current process
      // so that subsequent spawned child processes will not try to negate it again
      args.push("false");
    }
    // current process to not negate "expr"
    solver.assert(expr);
    result = true;
    constraints.push(`assume ${expr}`);
  } else {
    // alternative path taken by spawned child process
    solver.assert(z3Ctx.mkNot(expr));
    result = false;
    constraints.push(`assume (not ${expr})`);
  }

  if (!solver.check()) {
    // if given constraints is unsatisfiable, stop processing further
    console.log(`Path unreachable: ${constraints}`);
    process.exit(0);
  }

  return result;
};

const getNumZ3Expr = (i) => {
  if (typeof i === "number") {
    // as Z3 does not support decimal number we need to convert it to fraction
    const { numerator, denominator } = new Fraction(i);
    return z3Ctx.mkDiv(z3Ctx.mkIntVal(numerator), z3Ctx.mkIntVal(denominator));
  }
  return i.getZ3Expr();
};

/**
 * SymbolicNumber is a wrapper class to represent number symbolic values using Z3 expression.
 *
 * Operator overloading is needed for symbolic execution.
 */
export class SymbolicNumber {
  expr;

  constructor(expr) {
    if (typeof expr === "string") {
      this.expr = z3Ctx.mkRealVar(expr);
    } else {
      this.expr = expr;
    }
  }

  [Symbol.for("===")](other) {
    return symbolicBool(
      z3Ctx.mkEq(this.expr, getNumZ3Expr(other)),
      args[readCounter()],
    );
  }

  [Symbol.for("==")](other) {
    return this === other;
  }

  [Symbol.for("!==")](other) {
    return symbolicBool(
      z3Ctx.mkNot(z3Ctx.mkEq(this.expr, getNumZ3Expr(other))),
      args[readCounter()],
    );
  }

  [Symbol.for("!=")](other) {
    return this !== other;
  }

  [Symbol.for("<")](other) {
    return symbolicBool(
      z3Ctx.mkLt(this.expr, getNumZ3Expr(other)),
      args[readCounter()],
    );
  }

  [Symbol.for("<=")](other) {
    return symbolicBool(
      z3Ctx.mkLe(this.expr, getNumZ3Expr(other)),
      args[readCounter()],
    );
  }

  [Symbol.for(">")](other) {
    return symbolicBool(
      z3Ctx.mkGt(this.expr, getNumZ3Expr(other)),
      args[readCounter()],
    );
  }

  [Symbol.for(">=")](other) {
    return symbolicBool(
      z3Ctx.mkGe(this.expr, getNumZ3Expr(other)),
      args[readCounter()],
    );
  }

  [Symbol.for("+")](other) {
    return new SymbolicNumber(z3Ctx.mkAdd(this.expr, getNumZ3Expr(other)));
  }

  [Symbol.for("-")](other) {
    return new SymbolicNumber(z3Ctx.mkSub(this.expr, getNumZ3Expr(other)));
  }

  [Symbol.for("*")](other) {
    return new SymbolicNumber(z3Ctx.mkMul(this.expr, getNumZ3Expr(other)));
  }

  [Symbol.for("/")](other) {
    return new SymbolicNumber(z3Ctx.mkDiv(this.expr, getNumZ3Expr(other)));
  }

  [Symbol.for("%")](other) {
    return new SymbolicNumber(z3Ctx.mkMod(this.expr, getNumZ3Expr(other)));
  }

  [Symbol.for("**")](other) {
    return new SymbolicNumber(z3Ctx.mkPower(this.expr, getNumZ3Expr(other)));
  }

  getZ3Expr() {
    return this.expr;
  }
}

export const symExe = (f, fArgs) => {
  try {
    f(...fArgs);
  } catch (e) {
    console.error(e.message);
  } finally {
    const model = solver.getModel();

    let results = `
Constraints: ${constraints}
Results:`;
    for (const arg of fArgs) {
      results += `\n${arg.getZ3Expr()} = ${model.eval(arg.getZ3Expr())}`;
    }

    console.log(results);
  }
};
