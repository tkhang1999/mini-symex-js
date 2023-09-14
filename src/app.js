import { SymbolicInt, solvers } from './symbolic.js';
import { initZ3, z3 } from './utils.js';


const test = (x, y, z) => {
    if (x === y) {
        if (y === z) {
            console.log("1");
            return;
        }
        console.log("2")
        return;
    }
    console.log("3");
    return;
}

(async () => {
    await initZ3();

    solvers.push(new z3.Solver());

    test(new SymbolicInt('x'), new SymbolicInt('y'),  new SymbolicInt('z'));

    console.log(solvers.length);
})().catch(e => {
    console.error('error', e);
    process.exit(1);
});
