import BoilerplateItemBase from "./base-item.mjs";

export default class BoilerplatePlothook extends BoilerplateItemBase {
    static defineSchema(){
        const fields = foundry.data.fields;
        const requiredInteger = { required: true, nullable: false, integer: true };
        const schema = super.defineSchema();
        schema.points = new fields.NumberField({...requiredInteger, initial: 1, min: 1, max: 5});
        schema.comments = new fields.StringField({ initial: ""});
        return schema;
    }

    prepareDerivedData() {
    }
}