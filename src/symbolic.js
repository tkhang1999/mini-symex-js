import { z3 } from "./utils";

export let solvers = [];

const symbolicBool = (sym) => {
    // copy satSolvers to a temporary list and reset satSolvers    
    const oldSolvers = solvers;
    solvers = [];
    // creat new solvers from current satSolvers and sym
    while (oldSolvers.length != 0) {
        const oldSolver = oldSolvers.pop();
        for (let val in [true, false]) {
            addNewSolver(sym, oldSolver, val);
        }
    }
    console.log("solvers: " + solvers.length);
}

const addNewSolver = (sym, oldSolver, shouldNegate) => {
    const newSolver = new z3.Solver();
    newSolver.add(oldSolver.assertions());
    if (shouldNegate) {
        newSolver.add(sym);
    } else {
        newSolver.add(z3.Not(sym));
    }

    solvers.push(newSolver);
}

export class SymbolicInt {
    id;

    constructor(id) {
        this.id = id;
    }

    [Symbol.for('===')] (other) {
        symbolicBool(z3.Eq(z3.Int.const(this.id), z3.Int.const(other.id)));
        return true;
    }

    [Symbol.for('!==')] (other) {
        symbolicBool(z3.Not(z3.Eq(z3.Int.const(this.id), z3.Int.const(other.id))));
    }
}
