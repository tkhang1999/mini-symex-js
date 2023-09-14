import { solver, getZ3Ctx, counter, readCounter, args, addArg, addCons, constraints } from './utils';
import { spawnSync } from 'child_process';

export const symbolicBool = (sym, isChild) => {
    let result = undefined;

    if (!isChild) {
        if (counter === args.length + 1) {
            const nextArgs = [...args];
            nextArgs.push("true");
            const child = spawnSync(process.argv[0], [process.argv[1], ...nextArgs], { encoding: 'utf-8' });
            console.log(child.stdout);
        }
        solver.assert(sym);
        result = true;
        addCons(`assume ${sym}`);
    } else {
        solver.assert(getZ3Ctx().mkNot(sym));
        result = false;
        addCons(`assume (not ${sym})`);
    }

    if (counter === args.length + 1) {
        addArg("false");
    }

    if (!solver.check()) {
        console.log(`Path unreachable: ${constraints}`);
        process.exit(0);
    }

    return result;
}

export class SymbolicInt {
    id;
    expr;

    constructor(id) {
        const ctx = getZ3Ctx();
        this.id = id;
        this.expr = ctx.mkIntVar(this.id);
    }

    [Symbol.for('===')] (other) {
        const ctx = getZ3Ctx();
        return symbolicBool(ctx.mkEq(this.expr, other.getZ3Expr()), args[readCounter()] === 'true');
        // symbolicBool(Z3.Eq(z3.Int.const(this.id), z3.Int.const(other.id)));
    }

    [Symbol.for('!==')] (other) {
        const ctx = getZ3Ctx();
        return symbolicBool(ctx.mkNot(ctx.mkEq(this.expr, other.getZ3Expr())), args[readCounter()] === 'true');
        // symbolicBool(z3.Not(z3.Eq(z3.Int.const(this.id), z3.Int.const(other.id))));
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
            results = results + `\n${arg.getZ3Expr()} = ${model.eval(arg.getZ3Expr())}`;
        }
    
        console.log(results);
    }    
}
