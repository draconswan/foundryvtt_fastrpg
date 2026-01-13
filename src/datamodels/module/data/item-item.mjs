import BoilerplateItemBase from "./base-item.mjs";

export default class BoilerplateItem extends BoilerplateItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();
    schema.name = new fields.StringField({ blank: true });
    schema.details = new fields.StringField({ blank: true });
    schema.quantity = new fields.NumberField({ required: false, min:0, max:99 })
    return schema;
  }
}