import BoilerplateActorBase from "./base-actor.mjs";

export default class BoilerplateCharacter extends BoilerplateActorBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const requiredDouble = { required: true, nullable: false, integer: false };
    const schema = super.defineSchema();

    schema.attributes = new fields.SchemaField({
      level: new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 1 })
      }),
    });

    schema.armor = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 0 })
    });

    schema.shielding = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 0 })
    });

    schema.money = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 0 })
    });

    schema.class = new fields.SchemaField({
      value: new fields.StringField({ required: false, initial: "" })
    });

    // Iterate over ability names and create a new SchemaField for each.
    schema.primaryAttributes = new fields.SchemaField(Object.keys(CONFIG.BOILERPLATE.primaryAttributes).reduce((obj, ability) => {
      obj[ability] = new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 5, min: 0 }),
      });
      return obj;
    }, {}));

    // Iterate over ability names and create a new SchemaField for each.
    schema.secondaryAttributes = new fields.SchemaField(Object.keys(CONFIG.BOILERPLATE.secondaryAttributes).reduce((obj, ability) => {
      obj[ability] = new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 5, min: 0 }),
      });
      return obj;
    }, {}));

    return schema;
  }

  prepareDerivedData() {
    const healthpoints = this.secondaryAttributes.healthpoints;
    const mindpoints = this.secondaryAttributes.mindpoints;
    const react = this.secondaryAttributes.react;
    const fate = this.secondaryAttributes.fate;

    healthpoints.value = this.primaryAttributes?.bod?.value * 3 ?? healthpoints.value;
    healthpoints.max = this.primaryAttributes?.bod?.value * 3 ?? healthpoints.max;

    mindpoints.value = this.primaryAttributes?.will?.value * 3 ?? mindpoints.value;
    mindpoints.max = this.primaryAttributes?.will?.value * 3 ?? mindpoints.max;

    react.value = (this.primaryAttributes?.dex?.value + this.primaryAttributes?.int?.value) / 2.0 ?? react.value;

    fate.value = 1;

    this.armor.value = 0;
    this.shielding.value = 0;
    this.money.value = 0;
    this.class.value = "";
  }

  getRollData() {
    const data = {};

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@str.mod + 4`.
    if (this.abilities) {
      for (let [k,v] of Object.entries(this.abilities)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }

    data.lvl = this.attributes.level.value;

    return data
  }
}