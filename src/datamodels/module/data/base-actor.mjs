import BoilerplateDataModel from "./base-model.mjs";

export default class BoilerplateActorBase extends BoilerplateDataModel {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const requiredDouble = { required: true, nullable: false, integer: false };
    const schema = {};
    schema.biography = new fields.StringField({ required: true, blank: true }); // equivalent to passing ({initial: ""}) for StringFields
    return schema;
  }

}