/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  return foundry.applications.handlebars.loadTemplates([
    // Actor partials.
    'systems/boilerplate/templates/actor/parts/actor-skills.hbs',
    'systems/boilerplate/templates/actor/parts/actor-benefits.hbs',
    'systems/boilerplate/templates/actor/parts/actor-items.hbs',
    'systems/boilerplate/templates/actor/parts/actor-powers.hbs',
    'systems/boilerplate/templates/actor/parts/actor-plothooks.hbs',
    // Item partials
    'systems/boilerplate/templates/item/parts/item-effects.hbs',
  ]);
};
