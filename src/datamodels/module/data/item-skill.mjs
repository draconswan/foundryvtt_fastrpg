import BoilerplateItemBase from "./base-item.mjs";

export default class BoilerplateSkill extends BoilerplateItemBase {
    static defineSchema(){
        const fields = foundry.data.fields;
        const requiredInteger = { required: true, nullable: false, integer: true };
        const schema = super.defineSchema();

        schema.ranks = new fields.NumberField({...requiredInteger, initial: 1, min: 1, max: 5});
        schema.specialization = new fields.StringField({ initial: "Skill Specialization"});
        schema.roll = new fields.SchemaField({
            diceNum: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1 }),
            diceSize: new fields.StringField({ initial: "f6" }),
            diceBonus: new fields.StringField({ initial: "+0" })
        });
        schema.formula = new fields.StringField({ blank:true });

        return schema;
    }

    prepareDerivedData() {
        const roll = this.roll;

        this.formula = `${roll.diceNum}${roll.diceSize}${roll.diceBonus}`
    }
}