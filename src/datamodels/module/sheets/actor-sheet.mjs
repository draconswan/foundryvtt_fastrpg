import {
  onManageActiveEffect,
  prepareActiveEffectCategories,
} from '../helpers/effects.mjs';

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class BoilerplateActorSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['boilerplate', 'sheet', 'actor'],
      width: 600,
      height: 600,
      tabs: [
        {
          navSelector: '.sheet-tabs',
          contentSelector: '.sheet-body',
          initial: 'features',
        },
      ],
    });
  }

  /** @override */
  get template() {
    return `systems/boilerplate/templates/actor/actor-${this.actor.type}-sheet.hbs`;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = super.getData();

    // Use a safe clone of the actor data for further operations.
    const items = this.actor.items.contents;
    context.armor     = items.filter(i => i.type === "armor");
    context.gear      = items.filter(i => i.type === "item");
    context.weapons   = items.filter(i => i.type === "weapon");
    context.channels  = items.filter(i => i.type === "channel");
    context.skills    = items.filter(i => i.type === "skill")
    context.benefits  = items.filter(i => i.type === "benefit")
    context.plothooks = items.filter(i => i.type === "plothook")

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = this.actor.system
    context.flags = this.actor.flags

    // Adding a pointer to CONFIG.BOILERPLATE
    context.config = CONFIG.BOILERPLATE;

    // Prepare character data and items.
    if (this.actor.type == 'character') {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }

    // Prepare NPC data and items.
    if (this.actor.type == 'npc') {
      this._prepareItems(context);
    }

    // Enrich biography info for display
    // Enrichment turns text like `[[/r 1d20]]` into buttons
    context.enrichedBiography = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      this.actor.system.biography,
      {
        // Whether to show secret blocks in the finished html
        secrets: this.document.isOwner,
        // Necessary in v11, can be removed in v12
        async: true,
        // Data to fill in for inline rolls
        rollData: this.actor.getRollData(),
        // Relative UUID resolution
        relativeTo: this.actor,
      }
    );

    // Prepare active effects
    context.effects = prepareActiveEffectCategories(
      // A generator that returns all effects stored on the actor
      // as well as any items
      this.actor.allApplicableEffects()
    );

    return context;
  }

  /**
   * Character-specific context modifications
   *
   * @param {object} context The context object to mutate
   */
  _prepareCharacterData(context) {
    // This is where you can enrich character-specific editor fields
    // or setup anything else that's specific to this type
  }

  /**
   * Organize and classify Items for Actor sheets.
   *
   * @param {object} context The context object to mutate
   */
  _prepareItems(context) {
      // Initialize containers.
      const gear = [];
      const armor = [];
      const weapons = [];
      const channels = [];
      const powers = [];
      const skills = [];
      const benefits = [];
      const plothooks = [];

      // Iterate through items, allocating to containers
      for (let i of context.items) {
        i.img = i.img || Item.DEFAULT_ICON;
        // Append to gear.
        if (i.type === 'item') {
          gear.push(i);
        }
        // Append to Armor
        else if (i.type == "armor"){
          armor.push(i);
        }
        // Append to Weapons
        else if (i.type == "weapon"){
          weapons.push(i);
        }
        // Append to Channels
        else if (i.type == "channel"){
          channels.push(i);
        }
        // Append to powers.
        else if (i.type === 'power') {
          powers.push(i);
        }
        // Append to skills.
        else if (i.type === 'skill') {
          skills.push(i);
        }
        // Append to benefits.
        else if (i.type === 'benefit') {
          benefits.push(i);
        }
        else if (i.type === 'plothook') {
          plothooks.push(i);
        }
      }

      // Assign and return
      context.gear = gear;
      context.armor = armor;
      context.weapons = weapons;
      context.channels = channels;
      context.powers = powers;
      context.skills = skills;
      context.benefits = benefits;
      context.plothooks = plothooks;
    }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Render the item sheet for viewing/editing prior to the editable check.
    html.on('click', '.item-edit', (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      item.sheet.render(true);
    });

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add Inventory Item
    html.on('click', '.item-create', this._onItemCreate.bind(this));

    // Allow dropping Channels onto Armor slots
    html.find(".armor-slot").on("drop", ev => this._onChannelDrop(ev));

    // Delete Inventory Item
    html.on('click', '.item-delete', (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Active Effect management
    html.on('click', '.effect-control', (ev) => {
      const row = ev.currentTarget.closest('li');
      const document =
        row.dataset.parentId === this.actor.id
          ? this.actor
          : this.actor.items.get(row.dataset.parentId);
      onManageActiveEffect(ev, document);
    });

    // Rollable abilities.
    html.on('click', '.rollable', this._onRoll.bind(this));

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = (ev) => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains('inventory-header')) return;
        li.setAttribute('draggable', true);
        li.addEventListener('dragstart', handler, false);
      });
    }
  }

  async _onChannelDrop(event) {
    event.preventDefault();
    const armorId = event.currentTarget.dataset.itemId;

    // Get the dropped data
    const data = TextEditor.getDragEventData(event); // v13+ helper
    if (data.type !== "Item") return;

    const item = await foundry.documents.Item.fromDropData(data);
    if (!item || item.type !== "channel") return;

    // Update the channel to link it to this armor
    await item.update({ "system.parentArmor": armorId });
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = foundry.utils.duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      system: data,
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system['type'];

    // Finally, create the item!
    return await Item.create(itemData, { parent: this.actor });
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    // Handle item rolls.
    if (dataset.rollType) {
      if (dataset.rollType == 'item') {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
      }
      else if (dataset.rollType == 'skill') {
        const itemId = element.closest('.item').dataset.itemId;
        const skill = this.actor.items.get(itemId);
        const name = skill.name;
        const mod = skill.system.ranks;
        const specialization = skill.system.specialization;
        if (mod > 0) {
          const channels = this.actor.items.filter(i =>
              i.type === "channel" &&
              (i.system.skill === name || i.system.skill === (name + ": " + specialization))
          )
          const bonus = channels?.map(c => c.system.bonus)
          let rollFormula = `${mod}ds`;
          if (bonus > 0) {
            rollFormula += `+${bonus}`
          }
          const roll = new Roll(rollFormula);
          roll.evaluate().then(r => {
            r.toMessage({
              speaker: ChatMessage.getSpeaker({ actor: this.actor }),
              flavor: `${dataset.label} Dice Pool`,
              rollMode: game.settings.get('core', 'rollMode'),
            });
          });
        } else {
          ui.notifications.warn(`${dataset.label} modifier must be at least 1 to roll.`);
        }
        return;
      }
    }

    // Handle custom data-action like "roll@primaryAttributes.str"
    const action = dataset.action;
    const match = action?.match(/^roll@primaryAttributes\.(\w+)$/);
    if (match) {
        const attrKey = match[1];
        const attr = this.actor.system.primaryAttributes?.[attrKey];
        const mod = attr?.value ?? 0;

        if (mod > 0) {
          const roll = new Roll(`${mod}ds`);
          roll.evaluate().then(r => {
            r.toMessage({
              speaker: ChatMessage.getSpeaker({ actor: this.actor }),
              flavor: `${attrKey.toUpperCase()} Dice Pool`,
              rollMode: game.settings.get('core', 'rollMode'),
            });
          });
        } else {
          ui.notifications.warn(`${attrKey.toUpperCase()} modifier must be at least 1 to roll.`);
        }
        return;
    }

    // Handle rolls that supply the formula directly.
    if (dataset.roll) {
      let label = dataset.label ? `[ability] ${dataset.label}` : '';
      let roll = new Roll(dataset.roll, this.actor.getRollData());
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        rollMode: game.settings.get('core', 'rollMode'),
      });
      return roll;
    }
  }
}
