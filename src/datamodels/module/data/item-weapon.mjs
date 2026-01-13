import BoilerplateItemBase from "./base-item.mjs";

export default class BoilerplateWeapon extends BoilerplateItemBase {

  static allowedAttachmentTypes = {
    Pistol: ["Sights", "Barrel"],
    Rifle: ["Sights", "Shoulder Stock", "Under-barrel", "Barrel"],
    "Sniper Rifle": ["Scope", "Under-barrel", "Barrel"],
    Melee: ["Grip", "Edge"],
    Unarmed: ["Weight", "Contact"],
    Channeler: []
  };

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();
    schema.name = new fields.StringField({ blank: true });
    schema.type = new fields.StringField({
      choices: {
        Pistol: "Pistol",
        Rifle: "Rifle",
        "Sniper Rifle": "Sniper Rifle",
        Melee: "Melee",
        Unarmed: "Unarmed",
        Channeler: "Channeler"
      },
      initial: "Pistol",
      required: true
    });
    schema.range = new fields.StringField({
        choices: {
            Melee: "Melee",
            Ranged: "Ranged",
            Both: "Both"
        },
        initial: "Ranged",
        required: true
    });
    schema.damage = new fields.StringField({ blank: true });
    schema.details = new fields.StringField({ blank: true });
    schema.attachments = new fields.ArrayField(
      new fields.StringField({ blank: true })
    );
    return schema;
  }

    prepareDerivedData() {
      super.prepareDerivedData?.();

      const actor = this.parent?.parent;
      if (!actor) {
        this.attachmentSlots = [];
        return;
      }
      const allowed = this.constructor.allowedAttachmentTypes[this.type] ?? [];
      const item = this.parent;
      const attachments = item.parent?.items?.filter(i =>
        i.type === "attachment" &&
        i.system.parentWeapon === this.id
      ) ?? [];

      // Map: type → attachment
      const byType = {};
      for (const att of attachments) {
        byType[att.system.type] = att;
      }

      // Build ordered slot list
      this.attachmentSlots = allowed.map(type => ({
        type,
        item: byType[type] ?? null
      }));
    }
}