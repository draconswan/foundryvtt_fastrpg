import BoilerplateItemBase from "./base-item.mjs";

export default class BoilerplateAttachment extends BoilerplateItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();
    schema.name = new fields.StringField({ blank: true });
    schema.type = new fields.StringField({ blank: true, required: true});
    schema.details = new fields.StringField({ blank: true })
    schema.parentWeapon = new fields.StringField({ blank: true }); // Armor item ID

    return schema;
  }

  prepareDerivedData() {
    super.prepareDerivedData?.();

    // If this attachment is linked to a weapon, resolve it
    if (this.parent && this.parentWeapon) {
      const weapon = this.parent.parent.items.get(this.parentWeapon);
      this.parentWeaponItem = weapon ?? null;
    }
  }
}