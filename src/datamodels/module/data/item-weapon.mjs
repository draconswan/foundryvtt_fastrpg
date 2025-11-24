import BoilerplateItemBase from "./base-item.mjs";

export default class BoilerplateWeapon extends BoilerplateItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();
    schema.name = new fields.StringField({ blank: true });
    schema.range = new fields.StringField({ blank: true });
    schema.damage = new fields.StringField({ blank: true });
    schema.details = new fields.StringField({ blank: true });
    return schema;
  }

  prepareDerivedData() {
  }
}