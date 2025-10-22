export class FastDieTerm extends foundry.dice.terms.DiceTerm {
  constructor({number = 1, faces = 6, options = {}} = {}) {
    super({number, faces, options});
  }

  async evaluate({minimize = false, maximize = false} = {}) {
    this.results = [];

    for (let i = 0; i < this.number; i++) {
      const roll = new Die({faces: this.faces}).roll({minimize, maximize});
      const mapped = roll.result === 1 ? 0 : (roll.result >= 2 && roll.result <= 5 ? 1 : 2);
      this.results.push({result: roll.result, active: true, mapped});
    }

    this._total = this.results.reduce((sum, r) => sum + r.mapped, 0);
    this._evaluated = true;
    return this;
  }

  get total() {
    return this._total;
  }

  get formula() {
    return `${this.number}ds`; // 'C' for custom
  }
}