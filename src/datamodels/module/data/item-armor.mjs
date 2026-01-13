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
    const actor = this.parent?.parent;
    const max = this.channelingSlots ?? 0;
    if (!actor) {
      this.channelSlots = Array.from({ length: max }, () => ({ item: null }));
      return;
    }

    const item = this.parent;
    if (actor.items) {
      const channels = actor.items.filter(i =>
        i.type === "channel" &&
        i.system.parentArmor === item.id
      );
      this.channelSlots = [
        ...channels.map(ch => ({ item: ch })),
        ...Array.from({ length: max - channels.length }, () => ({ item: null }))
      ];
    }
  }
}