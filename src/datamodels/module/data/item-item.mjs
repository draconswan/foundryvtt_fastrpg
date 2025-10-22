import BoilerplateItemBase from "./base-item.mjs";

export default class BoilerplateItem extends BoilerplateItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();
    schema.details = new fields.StringField({ blank: true });
    return schema;
  }

  prepareDerivedData() {
    //Add update here
  }
}