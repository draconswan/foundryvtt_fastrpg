import BoilerplateItemBase from "./base-item.mjs";

export default class BoilerplateSkill extends BoilerplateItemBase {
    static defineSchema(){
        const fields = foundry.data.fields;
        const requiredInteger = { required: true, nullable: false, integer: true };
        const schema = super.defineSchema();

        schema.ranks = new fields.NumberField({...requiredInteger, initial: 1, min: 1, max: 5});
        schema.specialization = new fields.StringField({ initial: "Skill Specialization"});

        return schema;
    }

    prepareDerivedData() {
    }
}