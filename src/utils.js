import Z3 from "z3javascript";

export const z3Ctx = new Z3.Context();

export const solver = new Z3.Solver(z3Ctx, false, []);

let counter = 0;

export const readCounter = () => {
  return counter++;
};

// optional arguments where args[i] indicates whether the i-th boolean expression should be negated
export const args = process.argv.slice(2);

export const constraints = [];

const gcd = (a, b) => {
  return b ? gcd(b, a % b) : a;
};

export const decimalToFraction = (_decimal) => {
  if (_decimal % 1 == 0) {
    return {
      top: _decimal,
      bottom: 1,
      display: _decimal + ":" + 1,
    };
  } else {
    let top = _decimal.toString().replace(/\d+[.]/, "");
    let bottom = Math.pow(10, top.length);
    if (_decimal > 1) {
      top = +top + Math.floor(_decimal) * bottom;
    }
    let x = gcd(top, bottom);
    return {
      top: top / x,
      bottom: bottom / x,
      display: top / x + ":" + bottom / x,
    };
  }
};
