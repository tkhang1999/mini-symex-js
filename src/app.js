import { SymbolicInt, symExe } from './symbolic.js';
import { strict as assert } from 'assert';

const test = (x, y, z) => {
    if (x === y) {
        if (y === z) {
            if (x === z) {
                assert(false);
            } else {
                assert(true);
            }
        }
    }
}

const fArgs = [new SymbolicInt('x'), new SymbolicInt('y'), new SymbolicInt('z')];

symExe(test, fArgs);
