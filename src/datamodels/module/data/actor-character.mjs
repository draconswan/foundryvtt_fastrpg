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

    const armor = this.armor;
    const shielding = this.shielding;

    const bod = this.primaryAttributes?.bod?.value;
    const will = this.primaryAttributes?.will?.value;
    const dex = this.primaryAttributes?.dex?.value;
    const int = this.primaryAttributes?.int?.value;

    healthpoints.value = bod != null ? bod * 3 : healthpoints.value;
    healthpoints.max = bod != null ? bod * 3 : healthpoints.max;

    mindpoints.value = will != null ? will * 3 : mindpoints.value;
    mindpoints.max = will != null ? will * 3 : mindpoints.max;

    let armorBonus = 0;
    let shieldingBonus = 0;
    if (this.parent?.items?.size > 0){
      for (const item of this.parent.items) {
        if (item.type == "armor") {
          if (item.system.armor != null && item.system.armor > 0) {
            armorBonus += item.system.armor
          }
          if (item.system.shielding != null && item.system.shielding > 0) {
            shieldingBonus += item.system.shielding
          }
        }
        if (item.type == "benefit") {
          if (item.name == "Tough") {
            let level = item.system.level
            if (level == 5) {
              armorBonus += Math.ceil(bod/2.0)
            } else if (level == 10) {
              armorBonus += bod
            }
          }
          if (item.name == "Iron Will") {
            let level = item.system.level
            if (level == 5) {
              shieldingBonus += Math.ceil(will/2.0)
            } else if (level == 10) {
              shieldingBonus += will
            }
          }
        }
      }
    }
    armor.value = armorBonus
    shielding.value = shieldingBonus

    react.value = (dex != null && int != null) ? (dex + int) / 2.0 : react.value;
  }

  getRollData() {
    const data = {};

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@str.mod + 4`.
    if (this.primaryAttributes) {
      for (let [k,v] of Object.entries(this.primaryAttributes)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }
    if (this.secondaryAttributes) {
      for (let [k,v] of Object.entries(this.secondaryAttributes)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }

    data.lvl = this.attributes.level.value;
    data.armor = this.armor.value;
    data.shielding = this.shielding.value;
    data.money = this.money.value;
    data.class = this.class.value;
    return data
  }

  async _onRoll(event) {
    event.preventDefault();
    const button = event.currentTarget;
    const action = button.dataset.action;
    console.log(action);
    switch (action) {
      case "rollStrDice": {
        const mod = this.actor.system.abilities.str.mod;
        if (mod > 0) {
          const roll = new Roll(`${mod}d20`);
          await roll.evaluate({ async: true });
          roll.toMessage({ flavor: "Strength Dice Pool" });
        } else {
          ui.notifications.warn("Strength modifier must be at least 1 to roll.");
        }
        break;
      }

      // Add more custom actions here...

      default: {
        // Fallback: use data-roll if present
        const formula = button.dataset.roll;
        const label = button.dataset.label ?? "Dice Roll";

        if (formula) {
          const roll = new Roll(formula, this.actor.getRollData());
          await roll.evaluate({ async: true });
          roll.toMessage({ flavor: label });
        } else {
          ui.notifications.warn("No valid roll or action defined.");
        }
      }
    }
  }
}