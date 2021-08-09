class Pixel {
  constructor(num) {
    this.number = num || null
    this.impssbl = []
    this.parent = [];
  }
  setParent = (p,r,c) => {
    this.parent.push({p:p,r:r,c:c});
  };
  getNum = () => Number(this.number);

  setNum = (ns) => {
    let n = Number(ns);
    if (this.number && this.number != n) {
      console.log("this.number,n", this.number, n)
      throw new Error('WTF!!!');
    }
    if (!this.number && n) {
      for(let i in this.parent) if(!this.parent[i].p.check(n)) {
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
  impossible_normalize = ()=>{
    let r={};
    for(let i in this.impssbl) r[this.impssbl[i]]=1;
    this.impssbl = [];
    for(let i in r) this.impssbl.push(r);
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
      if(n==num) return false;
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
    for (let j = 0; j < 9; j++){
      let p=this.getPixel(j).possible();
      for(let i in p) h[p[i]]=1
    }
    return (Object.keys(h).length==9);
  }

  aanalyze = () =>{
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
        this.vectors[i].getPixel(j).setParent(this.vectors[i],i,j);
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
  check = (b)=>{
    for(let i in this.vectors)
      if(!this.vectors[i].check(b)) return false;
      return true;
  }
  check_possible=()=>{
    for (let i = 0; i < 9; i++) {
      if(!this.row(i).check_possible()) return false;
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
  }

  test = () => {
    console.log("test", this.rows.get(5, 4).getNum())
    console.log("test", this.cols.get(4, 5).getNum())
    console.log("test", this.ranges.get(4, 7).getNum())
    let p = this.cols.get(4, 5);
    p.setNum(5);
    console.log("test", this.rows.get(5, 4).getNum())
    console.log("test", this.cols.get(4, 5).getNum())
    console.log("test", this.ranges.get(4, 7).getNum())
  };
  check_possible= () => {
    return this.rows.check_possible() && this.cols.check_possible() && this.ranges.check_possible() ;
  }
  get_count = () => {
    let m = this.get_normalize();
    let count = 0;
    for(let i in m) for(let j in m[i]) count+=((m[i][j]) ? 1 : 0);
    return count;
  }
  get_count_impossible = () => {
    let m = this.get_normalize();
    let count = 0;
    console.log(this.rows.get(0, 0))
    for(let i=0; i<9;i++) for(let j=0; j<9;j++){
      let p = this.rows.get(i, j)
      count+=((p.getNum()) ? 9 : p.impossible().length);
    } ;
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
      this.rows.impossible_pixels();
      this.cols.impossible_pixels();
      this.ranges.impossible_pixels();
  }

  last_hero = () => {
    try {
      this.rows.last_hero();
      this.cols.last_hero();
      this.ranges.last_hero();
    } catch (e) {
      console.log("....", e);
    }
  }
}

// module.exports = function solveSudoku(matrix) {
const solveSudoku = function (matrix) {
  let mtrx = new Sudoku(matrix);

  // mtrx.print_matrix();
  // console.log(mtrx.get_count());
  let r;
  do {
    r = false;
    r = impossible_pixels(mtrx) || r;
    console.log(mtrx.get_count());
    console.log(mtrx.get_count_impossible());
    r = last_hero(mtrx) || r;
    mtrx.print_matrix();
    console.log(mtrx.get_count());
    console.log(mtrx.get_count_impossible());
    console.log("check_possible",mtrx.check_possible());
  } while (r);

  // r = impossible_pixels(mtrx) || r;
  // mtrx.print_matrix();
  // console.log(mtrx.get_count());


  // return mtrx.get_normalize();
  return "mtrx.get_normalize()";
}

impossible_pixels = (mtrx) => {
  let c = mtrx.get_count();
  let count = 0;
  do {
    count = mtrx.get_count();
    mtrx.impossible_pixels();
  } while (mtrx.get_count() > count);
  return c != count;
}

last_hero = (mtrx) => {
  let c = mtrx.get_count();
  let count = 0;
  do {    
    count = mtrx.get_count();
    mtrx.last_hero();
  } while (mtrx.get_count() > count);
  return c != count;
}

console.log(solveSudoku(
  // [
  //   [0, 5, 0, 0, 7, 0, 0, 0, 1],
  //   [8, 7, 6, 0, 2, 1, 9, 0, 3],
  //   [0, 0, 0, 0, 3, 5, 0, 0, 0],
  //   [0, 0, 0, 0, 4, 3, 6, 1, 0],
  //   [0, 4, 0, 0, 0, 9, 0, 0, 2],
  //   [0, 1, 2, 0, 5, 0, 0, 0, 4],
  //   [0, 8, 9, 0, 6, 4, 0, 0, 0],
  //   [0, 0, 0, 0, 0, 7, 0, 0, 0],
  //   [1, 6, 7, 0, 0, 2, 5, 4, 0]
  // ]
  // ));
  // [
  //     [6, 5, 0, 7, 3, 0, 0, 8, 0],
  //     [0, 0, 0, 4, 8, 0, 5, 3, 0],
  //     [8, 4, 0, 9, 2, 5, 0, 0, 0],
  //     [0, 9, 0, 8, 0, 0, 0, 0, 0],
  //     [5, 3, 0, 2, 0, 9, 6, 0, 0],
  //     [0, 0, 6, 0, 0, 0, 8, 0, 0],
  //     [0, 0, 9, 0, 0, 0, 0, 0, 6],
  //     [0, 0, 7, 0, 0, 0, 0, 5, 0],
  //     [1, 6, 5, 3, 9, 0, 4, 7, 0]
  //   ]
  //   ));
  [
      [0, 0, 0, 0, 0, 0, 0, 0, 4],
      [0, 7, 5, 0, 0, 0, 0, 0, 0],
      [0, 1, 6, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [4, 0, 0, 0, 0, 0, 0, 0, 0]
    ]
    ));
/* ->
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9]
*/