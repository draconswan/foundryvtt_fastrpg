import BoilerplateItemBase from "./base-item.mjs";

export default class BoilerplateChannel extends BoilerplateItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();
    schema.name = new fields.StringField({ blank: true });
    schema.bonus = new fields.NumberField({ required: true, integer: true, min: 1, max: 3 });
    schema.skill = new fields.StringField({ black: false, required: true });
    schema.parentArmor = new fields.StringField({ blank: true }); // Armor item ID

    return schema;
  }

  prepareDerivedData() {
    super.prepareDerivedData?.();

    // If this channel is linked to an armor, resolve it
    if (this.parent && this.parentArmor) {
      const armor = this.parent.parent.items.get(this.parentArmor);
      this.parentArmorItem = armor ?? null;
    }
  }
}