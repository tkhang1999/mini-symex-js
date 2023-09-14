import { init } from 'z3-solver';

export let z3 = undefined;

export const initZ3 = async () => {
    if (z3 === undefined) {
        const { Context } = await(init());
        z3 = Context('main');
    }
}