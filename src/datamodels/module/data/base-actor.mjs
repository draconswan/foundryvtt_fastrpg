import BoilerplateDataModel from "./base-model.mjs";

export default class BoilerplateActorBase extends BoilerplateDataModel {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const requiredDouble = { required: true, nullable: false, integer: false };
    const schema = {};

//     schema.healthpoints = new fields.SchemaField({
//       value: new fields.NumberField({ ...requiredInteger, initial: 10, min: 0 }),
//       max: new fields.NumberField({ ...requiredInteger, initial: 10 })
//     });
//     schema.mindpoints = new fields.SchemaField({
//       value: new fields.NumberField({ ...requiredInteger, initial: 5, min: 0 }),
//       max: new fields.NumberField({ ...requiredInteger, initial: 5 })
//     });
//     schema.react = new fields.SchemaField({
//       value: new fields.NumberField({ ...requiredDouble, initial: 5, min: 0 })
//     });
//     schema.fate = new fields.SchemaField({
//       value: new fields.NumberField({ ...requiredInteger, initial: 1, min: 0 })
//     });
    schema.biography = new fields.StringField({ required: true, blank: true }); // equivalent to passing ({initial: ""}) for StringFields

    return schema;
  }

}