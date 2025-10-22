export class ActorSystemData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };

    return {
      biography: new fields.StringField({ required: true, blank: true }),

      primaryAttributes: new fields.SchemaField({
        dex: new fields.SchemaField({
          value: new fields.NumberField({ ...requiredInteger, initial: 5, min: 1, max: 10 })
        }),
        bod: new fields.SchemaField({
          value: new fields.NumberField({ ...requiredInteger, initial: 5, min: 1, max: 10 })
        }),
        int: new fields.SchemaField({
          value: new fields.NumberField({ ...requiredInteger, initial: 5, min: 1, max: 10 })
        }),
        will: new fields.SchemaField({
          value: new fields.NumberField({ ...requiredInteger, initial: 5, min: 1, max: 10 })
        })
      }),

      secondaryAttributes: new fields.SchemaField({
        healthpoints: new fields.SchemaField({
          value: new fields.NumberField({ ...requiredInteger, initial: 15, min: 0 }),
          min: new fields.NumberField({ ...requiredInteger, initial: 0 })
        }),
        mindpoints: new fields.SchemaField({
          value: new fields.NumberField({ ...requiredInteger, initial: 15, min: 0 }),
          min: new fields.NumberField({ ...requiredInteger, initial: 0 })
        }),
        react: new fields.SchemaField({
          value: new fields.NumberField({ ...requiredInteger, initial: 5, min: 1 })
        }),
        fate: new fields.SchemaField({
          value: new fields.NumberField({ ...requiredInteger, initial: 1, min: 0 })
        })
      })
    };
  }
}