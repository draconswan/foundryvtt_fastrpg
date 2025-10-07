import BoilerplateItemBase from "./base-item.mjs";

export default class BoilerplateBenefit extends BoilerplateItemBase {
    static defineSchema(){
        const fields = foundry.data.fields;
        const requiredInteger = { required: true, nullable: false, integer: true };
        const schema = super.defineSchema();

        schema.level = new fields.NumberField({...requiredInteger, initial: 1, min: 1});
        schema.notes = new fields.StringField({ initial: "Description/Notes"});

        return schema;
    }
}