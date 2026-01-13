import {
  onManageActiveEffect,
  prepareActiveEffectCategories,
} from '../helpers/effects.mjs';

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class BoilerplateActorSheet extends foundry.appv1.sheets.ActorSheet {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['boilerplate', 'sheet', 'actor'],
      width: 720,
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
    const actor = this.actor;
    const context = {
      actor,
      system: actor.system,
      flags: actor.flags,
      editable: this.isEditable,
      config: CONFIG.BOILERPLATE,
      items: actor.items
    };

    // Use a safe clone of the actor data for further operations.
    const items = actor.items;
    context.armor        = items.filter(i => i.type === "armor");
    context.gear         = items.filter(i => i.type === "item");
    context.weapons      = items.filter(i => i.type === "weapon");
    context.channels     = items.filter(i => i.type === "channel");
    context.attachments  = items.filter(i => i.type === "attachment");
    context.skills       = items.filter(i => i.type === "skill")
    context.benefits     = items.filter(i => i.type === "benefit")
    context.plothooks    = items.filter(i => i.type === "plothook")

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = this.actor.system
    context.flags = this.actor.flags

    // Adding a pointer to CONFIG.BOILERPLATE
    context.config = CONFIG.BOILERPLATE;

    // Prepare character data and items.
    if (actor.type == 'character') {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }

    // Prepare NPC data and items.
    if (actor.type == 'npc') {
      this._prepareItems(context);
    }

    // Enrich biography info for display
    // Enrichment turns text like `[[/r 1d20]]` into buttons
    context.enrichedBiography = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      actor.system.biography,
      {
        // Whether to show secret blocks in the finished html
        secrets: this.document.isOwner,
        // Necessary in v11, can be removed in v12
        async: true,
        // Data to fill in for inline rolls
        rollData: actor.getRollData(),
        // Relative UUID resolution
        relativeTo: actor,
      }
    );

    // Prepare active effects
    context.effects = prepareActiveEffectCategories(
      // A generator that returns all effects stored on the actor
      // as well as any items
      actor.allApplicableEffects()
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
      const attachments = [];
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
        else if (i.type == "armor") {
          armor.push(i);
        }
        // Append to Weapons
        else if (i.type == "weapon") {
          weapons.push(i);
        }
        // Append to Channels
        else if (i.type == "channel") {
          channels.push(i);
        }
        // Append to Attachments
        else if (i.type == "attachment"){
          attachments.push(i);
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
      context.attachments = attachments;
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

  _promptAttributeSelection(skill, label) {
    const attributes = this.actor.system.primaryAttributes ?? {};
    let content = `
      <p>Add any miscellaneous bonuses or penalties:</p>
      <div class="form-group flexrow flex-group-center">
        <label class="align-left">Misc Bonus</label>
        <input type="number" name="miscBonus" value="0"/>
      </div>
      <p>Choose how to apply the attribute:</p>
    `;

    const buttons = {};
    // Flat bonus buttons (top row)
    for (let [key, attr] of Object.entries(attributes)) {
      const val = attr?.value ?? 0;
      buttons[`${key}-bonus`] = {
        label: `${key.toUpperCase()} (+${val})`,
        callback: html => {
          const misc = parseInt(html.find("input[name='miscBonus']").val()) || 0;
          this._rollSkill(skill, key, label, false, misc);
        }
      };
    }

    // Dice buttons (bottom row)
    for (let [key, attr] of Object.entries(attributes)) {
      const val = attr?.value ?? 0;
      buttons[`${key}-dice`] = {
        label: `${key.toUpperCase()} (${val}ds)`,
        callback: html => {
          const misc = parseInt(html.find("input[name='miscBonus']").val()) || 0;
          this._rollSkill(skill, key, label, true, misc);
        }
      };
    }

    new Dialog({
      title: `Select Attribute for ${skill.name}`,
      content,
      buttons,
      default: Object.keys(attributes)[0]
    }).render(true);
  }

  _rollSkill(skill, attrKey, label, rollAsDice=false, miscBonus=0) {
    const mod = skill.system.ranks ?? 0;
    const specialization = skill.system.specialization;

    let rollFormula = `${mod}ds`;
    //Add selected attribute value
    const attrValue = this.actor.system.primaryAttributes?.[attrKey]?.value ?? 0;
    if (attrValue > 0) {
      if (rollAsDice) {
        rollFormula += `+${attrValue}ds`;
      } else {
        rollFormula += `+${attrValue}`;
      }
    }
    // Add channel bonus
    const channels = this.actor.items.filter(i =>
        i.type === "channel" &&
        (i.system.skill === skill.name || i.system.skill === (skill.name + ": " + specialization))
    )
    const bonus = channels.reduce((sum, c) => sum + (c.system.bonus ?? 0), 0);
    if (bonus > 0) {
      rollFormula += `+${bonus}`;
    }
    if (miscBonus != 0) {
      rollFormula += `+${miscBonus}`;
    }

    const roll = new Roll(rollFormula);
    roll.evaluate().then(r => {
      r.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: `${label} Dice Pool (${attrKey.toUpperCase()} ${rollAsDice ? "as dice" : "bonus"} + misc ${miscBonus})`,
        rollMode: game.settings.get("core", "rollMode"),
      });
    });
    return;
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
        if (skill) return this._promptAttributeSelection(skill, dataset.label);
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

  async _onDrop(event) {
    event.preventDefault();

    const data = TextEditor.getDragEventData(event);

    // Only handle item drops
    if (data.type !== "Item") return super._onDrop(event);

    // Get the dropped item
    const dropped = await Item.implementation.fromDropData(data);

    // -----------------------------
    // 1. ITEM → ACTOR (default)
    // -----------------------------
    // If the drop is NOT on a specific slot, let Foundry handle it normally.
    const slot = event.target.closest("[data-item-id]");
    if (!slot) {
      return super._onDrop(event);
    }

    const targetItemId = slot.dataset.itemId;
    const targetItem = this.actor.items.get(targetItemId);

    // -----------------------------
    // 2. ATTACHMENT → WEAPON
    // -----------------------------
    if (dropped.type === "attachment" && targetItem?.type === "weapon") {
        const allowed = targetItem.system.constructor.allowedAttachmentTypes[targetItem.system.type] ?? [];
        // If invalid, warn and abort
        if (!allowed.includes(dropped.system.type)) {
          ui.notifications.warn(
            `${dropped.name} cannot be attached to a ${targetItem.system.type} weapon`
          );
          return;
        }

        return this.actor.createEmbeddedDocuments("Item", [{
            name: dropped.name,
            type: "attachment",
            system: {
              parentWeapon: targetItemId,
              type: dropped.system.type
            }
        }]);
    }

    // -----------------------------
    // 3. CHANNEL → ARMOR
    // -----------------------------
    if (dropped.type === "channel" && targetItem?.type === "armor") {
      return this.actor.createEmbeddedDocuments("Item", [{
        name: dropped.name,
        type: "channel",
        system: {
          parentArmor: targetItemId,
          bonus: dropped.system.bonus ?? 1,
          skill: dropped.system.skill ?? ""
        }
      }]);
    }

    // -----------------------------
    // 4. Anything else → default
    // -----------------------------
    return super._onDrop(event);
  }
}
