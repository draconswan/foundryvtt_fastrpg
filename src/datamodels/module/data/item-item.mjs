import BoilerplateItemBase from "./base-item.mjs";

export default class BoilerplateItem extends BoilerplateItemBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();
    schema.name = new fields.StringField({ blank: true });
    schema.details = new fields.StringField({ blank: true });
    return schema;
  }

  prepareDerivedData() {
//     if (this.armor != null && this.armor >= 0) {
//       console.log("Parent Armor")
//       console.log(this.parent.parent.system.armor.value)
//       console.log("Item Armor")
//       console.log(this.armor)
//       this.parent.parent.system.armor.value += this.armor
//     }
//     if (this.shielding != null && this.shielding >= 0) {
//       console.log("Parent Shielding")
//       console.log(this.parent.parent.system.shielding.value)
//       console.log("Item Shielding")
//       console.log(this.shielding)
//       this.parent.parent.system.shielding.value += this.shielding
//     }
  }
}