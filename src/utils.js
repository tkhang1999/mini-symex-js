import Z3 from 'z3javascript';

const ctx = new Z3.Context();

export const getZ3Ctx = () => {
    return ctx;
}

export const solver = new Z3.Solver(ctx, false, []);

export let counter = 0;

export const readCounter = () => {
    return counter++;
}

export const args = process.argv.slice(2);

export const addArg = (val) => {
    args.push(val);
}

export const constraints = [];

export const addCons = (cons) => {
    constraints.push(cons)
}
