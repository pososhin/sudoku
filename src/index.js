class Pixel {
  constructor(num) {
    this.number = num || null
    this.impssbl = []
    this.parent = [];
  }
  setParent = (p, r, c) => {
    this.parent.push({ p: p, r: r, c: c });
  };
  getNum = () => Number(this.number);

  setNum = (ns) => {
    let n = Number(ns);
    if (this.number && this.number != n) {
      console.log("this.number,n", this.number, n)
      throw new Error('WTF!!!');
    }
    if (!this.number && n) {
      for (let i in this.parent) if (!this.parent[i].p.check(n)) {
        throw new Error('Ilegat insert');
      }
    }
    this.impssbl = [1, 2, 3, 4, 5, 6, 7, 8, 9]
      .slice(0, n - 1)
      .concat([1, 2, 3, 4, 5, 6, 7, 8, 9].slice(n));
    this.number = n;
    this.parent.forEach((item, i, arr) => arr[i].p.impossible(n));
    return n;
  };
  impossible_normalize = () => {
    let r = {};
    for (let i in this.impssbl) r[this.impssbl[i]] = 1;
    this.impssbl = [];
    for (let i in r) this.impssbl.push(r);
  }
  impossible = (ns) => {
    let num = Number(ns);
    if (num) {
      if (num > 9 || num < 1) throw new Error('Pixel impossible [' + num + ']');
      if (!this.getNum()) {
        if (!this.impssbl.includes(num)) this.impssbl.push(num);
        if (this.possible().length == 1 && !this.getNum()) {
          this.setNum(this.possible()[0]);
        }
      }
    }
    return this.impssbl;
  }
  possible = () => {
    if (this.isDone()) return [this.number];
    let r = [];
    for (let i = 1; i <= 9; i++) if (!this.impssbl.includes(i)) r.push(i);
    return r;
  }
  isPossible = (num) => !this.impssbl.includes(num);
  isDone = () => (this.number) ? true : false;
}
class Vector {
  constructor(v) {
    let vec = v || Array.from({ length: 9 }, (_, i) => null);
    this.vector = Array.from({ length: 9 }, (_, i) =>
      (typeof (vec[i]) == 'number') ? new Pixel(vec[i]) : vec[i]
    );
    this.impssbl = []
  }
  getPixel = (i) => this.vector[i];
  getVector = () => this.vector;
  check = (num) => {
    for (let i in this.vector) {
      let n = this.vector[i].getNum();
      if (n == num) return false;
    }
    return true;
  }
  impossible = (num) => {
    if (num) {
      if (num > 9 || num < 1) throw new Error('Pixel impossible [' + num + ']');
      this.impssbl = [];
      for (let i in this.vector) {
        let n = this.vector[i].getNum();
        if (n)
          this.impssbl.push(n)
        else
          this.vector[i].impossible(num);
      }
    }
    return this.impssbl;
  }
  check_possible = () => {
    let h = {};
    for (let j = 0; j < 9; j++) {
      let p = this.getPixel(j).possible();
      for (let i in p) h[p[i]] = 1
    }
    return (Object.keys(h).length == 9);
  }
  aanalyze = () => {
    let cnt = {}
    for (let j = 0; j < 9; j++) {
      if (!this.getPixel(j).getNum()) {
        let p = this.getPixel(j).possible();
        for (let k in p) {
          if (!cnt[p[k]]) cnt[p[k]] = { count: 0, j: j };
          cnt[p[k]].count++;
        }
      }
    }
    return cnt;
  }

}
const _range2 = (i, j) => [Math.floor(i / 3) * 3 + Math.floor(j / 3), (i % 3) * 3 + j % 3];
class Matrix {
  constructor(m) {
    this.vectors = m;
    for (let i in this.vectors)
      for (let j in this.vectors[i].getVector())
        this.vectors[i].getPixel(j).setParent(this.vectors[i], i, j);
  }
  get = (r, c) => this.vectors[r].getPixel(c);
  row = (r) => this.vectors[r];
  impossible_pixels = () => {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (this.get(i, j).getNum());
        this.row(i).impossible(this.get(i, j).getNum());
      }
    }
  }
  check = (b) => {
    for (let i in this.vectors)
      if (!this.vectors[i].check(b)) return false;
    return true;
  }
  check_possible = () => {
    for (let i = 0; i < 9; i++) {
      if (!this.row(i).check_possible()) return false;
    }
    return true;
  }
  last_hero = () => {
    for (let i = 0; i < 9; i++) {
      let cnt = this.row(i).aanalyze();
      for (let c in cnt) {
        if (cnt[c].count == 1) {
          this.get(i, cnt[c].j).setNum(Number(c))
        }
      }
    }
  }
}
class Sudoku {
  constructor(m) {
    let mtrx = m || Array.from({ length: 9 }, (_, i) => (Array.from({ length: 9 }, (_, i) => (null))));
    this.rows = new Matrix(Array.from({ length: 9 }, (_, i) => new Vector(m[i])));
    this.cols = new Matrix(Array.from({ length: 9 }, (_, i) => new Vector((Array.from({ length: 9 }, (_, j) => (
      this.rows.get(j, i)
    ))))));
    this.ranges = new Matrix(Array.from({ length: 9 }, (_, i) => new Vector((Array.from({ length: 9 }, (_, j) => {
      return this.rows.get(_range2(i, j)[0], _range2(i, j)[1]);
    })))));
    this.fl_not_possible = false;
  }

  check_possible = () => {
    return !this.fl_not_possible
      && this.rows.check_possible()
      && this.cols.check_possible()
      && this.ranges.check_possible();
  }
  get_count = () => {
    let m = this.get_normalize();
    let count = 0;
    for (let i in m) for (let j in m[i]) count += ((m[i][j]) ? 1 : 0);
    return count;
  }
  get_count_impossible = () => {
    let m = this.get_normalize();
    let count = 0;
    for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) {
      let p = this.rows.get(i, j)
      count += ((p.getNum()) ? 9 : p.impossible().length);
    };
    return count;
  }
  get_normalize = () => Array.from({ length: 9 }, (_, i) =>
  (Array.from({ length: 9 }, (_, j) => {
    let n = this.rows.get(i, j).getNum();
    return ((n) ? n : 0);
  })));

  get_negative = () => Array.from({ length: 9 }, (_, i) =>
  (Array.from({ length: 9 }, (_, j) => {
    let n = this.rows.get(i, j).getNum();
    let k = this.rows.get(i, j).impossible().length;
    return ((n) ? '.' : k);
  })));

  print_matrix = (mtrx) => {
    let m = mtrx || this.get_normalize();
    for (let i = 0; i < 9; i++) {
      let s = '';
      for (let j = 0; j < 9; j++) {
        let n = m[i][j];
        if (!(j % 3) && j != 0) s = s + '|';
        s = s + ' ' + ((n) ? n : '_');
      }
      if (!(i % 3) && i != 0) console.log('------+------+------');
      console.log(s);
    }
    console.log('');
  }

  impossible_pixels = () => {
    try {
      this.rows.impossible_pixels();
      this.cols.impossible_pixels();
      this.ranges.impossible_pixels();
    } catch (e) {
      this.fl_not_possible = false;
    }
  }

  last_hero = () => {
    try {
      this.rows.last_hero();
      this.cols.last_hero();
      this.ranges.last_hero();
    } catch (e) {
      this.fl_not_possible = false;
    }
  }
  notresolved = () => {
    let r = [];
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        let p = this.rows.get(i, j);
        if (!p.getNum()) {
          r.push({
            r: i,
            c: j,
            possible: p.possible(),
          });
        }
      }
    }
    return r;
  }
}

module.exports = function solveSudoku(matrix) {
  return solveRecursion(matrix);
}
const solveRecursion = function (matrix) {
  let mtrx = new Sudoku(matrix);
  let r;
  do {
    if (mtrx.get_count() == 81) return mtrx.get_normalize();
    r = mtrx.get_count_impossible();
    mtrx.impossible_pixels();
    mtrx.last_hero();
  } while (r != mtrx.get_count_impossible());
  // mtrx.print_matrix();
  if (mtrx.check_possible()) {
    let notres = mtrx.notresolved();
    let new_mtrx = mtrx.get_normalize();
    for (let i in notres) {
      for (let j in notres[i].possible) {
        new_mtrx[notres[i].r][notres[i].c] = notres[i].possible[j]
        let res = solveRecursion(new_mtrx);
        if(res) return res;
      }
    }
  }
  return null;
}
