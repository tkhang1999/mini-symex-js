import { solver, readCounter, args, constraints, z3Ctx } from "./utils";
import { spawnSync } from "child_process";

export const symbolicBool = (expr, shouldNegate) => {
  let result = undefined;

  if (shouldNegate !== "true") {
    // if this condition is encountered for the first time based on args length,
    // a child process will be spawned to negate this condition to take another path.
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
    }
    // current process to not negate "expr"
    args.push("false");
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

/**
 * SymbolicInt is a wrapper class to represent integer symbolic values using Z3 expression.
 *
 * Operator overloading is needed for symbolic execution.
 */
export class SymbolicInt {
  id;
  expr;

  constructor(id) {
    this.id = id;
    this.expr = z3Ctx.mkIntVar(this.id);
  }

  [Symbol.for("===")](other) {
    return symbolicBool(
      z3Ctx.mkEq(this.expr, other.getZ3Expr()),
      args[readCounter()],
    );
  }

  [Symbol.for("!==")](other) {
    return symbolicBool(
      z3Ctx.mkNot(z3Ctx.mkEq(this.expr, other.getZ3Expr())),
      args[readCounter()],
    );
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
      results =
        results + `\n${arg.getZ3Expr()} = ${model.eval(arg.getZ3Expr())}`;
    }

    console.log(results);
  }
};
