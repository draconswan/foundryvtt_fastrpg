export class FastDieTerm extends foundry.dice.terms.DiceTerm {
    constructor({number = 1, faces = 6, options = {}} = {}) {
        super({faces: faces, number: number, options: options});
    }

    static DENOMINATION = "s";

    // async evaluate({minimize = false, maximize = false} = {}) {
    //     this.results = [];
    //     for (let i = 0; i < this.number; i++) {
    //         const die = new foundry.dice.terms.Die({faces: this.faces});
    //         const roll = await die.roll({minimize, maximize});
    //         const mapped = roll.result === 1 ? 0 : (roll.result >= 2 && roll.result <= 5 ? 1 : 2);
    //         this.results.push({result: roll.result, active: true, mapped});
    //     }
    //     this._total = this.results.reduce((sum, r) => sum + r.mapped, 0);
    //     this._evaluated = true;
    //     console.log(this)
    //     return this;
    // }

    // getTooltipData() {
    //     console.log("getTooltipData");
    //     super.getTooltipData();
    //     console.log(super.getTooltipData());
    //     // const { total, faces, flavor } = this;
    //     // const method = CONFIG.Dice.fulfillment.methods[this.method];
    //     // const icon = method?.interactive ? (method.icon ?? '<i class="fa-solid fa-bluetooth"></i>') : null;
    //     // return {
    //     //     total, faces, flavor, icon,
    //     //     method: method?.label,
    //     //     rolls: this.results.map(r => {
    //     //         return {
    //     //             result: this.getResultLabel(r),
    //     //             classes: this.getResultCSS(r).filterJoin(" ")
    //     //         };
    //     //     })
    //     // };
    // }

    // getResultLabel(result) {
    //     return {
    //         1: "0",
    //         2: "1",
    //         3: "1",
    //         4: "1",
    //         5: "1",
    //         6: "2"
    //     }[result.result];
    // }

    // getResultCSS(result) {
    //     console.log("getResultCSS");
    //     const resultCSS = [
    //         this.constructor.name.toLowerCase(),
    //         result.result === 1 ? "fastdie-zero" : result.result === 6 ? "fastdie-two" : "fastdie-one"
    //     ]
    //     console.log(resultCSS);
    //     return resultCSS;
    // }

    // get expression() {
    //     const x = this.constructor.DENOMINATION === "d" ? this._faces : this.constructor.DENOMINATION;
    //     return `${this._number}d${x}${this.modifiers.join("")}`;
    // }

    get total() {
        if (!this._evaluated) return undefined;
        for (let i = 0; i < this.results.length; i++) {
            this.results[i].mapped = (this.results[i].result === 1 ? 0 : ((this.results[i].result >= 2 && this.results[i] <= 5) ? 1 : this.results[i].result === 6 ? 2 : 0))
        }
        console.log(this.results);
        return this.results.reduce((sum, r) => sum + r.mapped, 0);
    }

    get formula() {
        return `${this.number}ds`;
    }
}