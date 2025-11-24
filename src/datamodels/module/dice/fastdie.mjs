export class FastDieTerm extends foundry.dice.terms.DiceTerm {
    constructor(termData){
        termData.faces = 6
        super(termData)
    }

    static DENOMINATION = "s";

    async evaluate({minimize = false, maximize = false} = {}) {
        this.results = [];
        for (let i = 0; i < this.number; i++) {
            const die = new foundry.dice.terms.Die({faces: this.faces});
            const roll = await die.roll({minimize, maximize});
            const mapped = roll.result === 1 ? 0 : (roll.result >= 2 && roll.result <= 5 ? 1 : 2);
            this.results.push({result: roll.result, active: true, mapped});
        }
        this._evaluated = true;
        return this;
    }

    get total() {
        if (!this._evaluated) {
            return undefined;
        }
        return this.results.reduce((sum, r) => sum + r.mapped, 0);
    }

    get formula() {
        return `${this.number}ds`;
    }
}