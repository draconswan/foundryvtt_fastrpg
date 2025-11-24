import BoilerplateItemBase from "./base-item.mjs";

export default class BoilerplateArmor extends BoilerplateItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();
    schema.name = new fields.StringField({ blank: true });
    schema.armor = new fields.NumberField({ required: false, integer: true, blank: true});
    schema.shielding = new fields.NumberField({ required: false, integer: true, blank: true});
    schema.channelingSlots = new fields.NumberField({ required: false, integer: true, blank: true});
    schema.details = new fields.StringField({ blank: true });
    schema.usedSlots = new fields.NumberField({ required: false, integer: true, blank: true});

    return schema;
  }

  prepareDerivedData() {
    super.prepareDerivedData?.()

    // Always initialize
    const item = this.parent;

    if (item.parent?.items) {
      const channels = item.parent.items.filter(i =>
        i.type === "channel" &&
        i.system.parentArmor === item.id // link field on the Channel
      );
      console.log(channels.map(c => c.system.bonus))
      this.usedSlots = channels.map(c => c.system.bonus).reduce((sum, bonus) => sum + bonus, 0);

      // Enforce slot limit
      if (channels.length > this.channelingSlots) {
        ui.notifications.warn(`${this.name} has more channels than available slots!`);
      }
    }
  }
}