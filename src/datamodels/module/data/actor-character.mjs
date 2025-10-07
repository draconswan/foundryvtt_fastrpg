import BoilerplateActorBase from "./base-actor.mjs";

export default class BoilerplateCharacter extends BoilerplateActorBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();

    schema.attributes = new fields.SchemaField({
      level: new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 1 })
      }),
    });

    schema.secondaryAbilities = new fields.SchemaField({
      healthpoints: new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 3 })
      }),
      mindpoints: new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 3 })
      }),
      react: new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 3 })
      }),
      fate: new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 1 })
      })
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
    schema.abilities = new fields.SchemaField(Object.keys(CONFIG.BOILERPLATE.abilities).reduce((obj, ability) => {
      obj[ability] = new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 5, min: 0 }),
      });
      return obj;
    }, {}));

    return schema;
  }

    prepareDerivedData() {
      const hp = this.system.healthpoints;
      const mp = this.system.mindpoints;
      const react = this.system.react;
      const fate = this.system.fate;

      hp.value = this.system.secondaryAbilities?.healthpoints?.value * 3 ?? hp.value;
      hp.max = this.system.secondaryAbilities?.healthpoints?.value * 3 ?? hp.max;

      mp.value = this.system.secondaryAbilities?.mindpoints?.value * 3 ?? mp.value;
      mp.max = this.system.secondaryAbilities?.mindpoints?.value * 3 ?? mp.max;

      react.value = this.system.secondaryAbilities?.react?.value ?? react.value;
      fate.value = this.system.secondaryAbilities?.fate?.value ?? fate.value;

      this.system.armor.value = 0;
      this.system.shielding.value = 0;
      this.system.money.value = 0;
      this.system.class.value = "";
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