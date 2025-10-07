export const ActorSystemData = {
  healthpoints: {
    type: Object,
    default: () => ({ value: 10, min: 0 })
  },
  mindpoints: {
    type: Object,
    default: () => ({ value: 5, min: 0 })
  },
  react: {
    type: Object,
    default: () => ({ value: 5, min: 0 })
  },
  fate: {
    type: Object,
    default: () => ({ value: 1, min: 0 })
  },
  biography: {
    type: String,
    default: ""
  },
  abilities: {
    type: Object,
    default: () => ({
      dex: { value: 5 },
      bod: { value: 5 },
      int: { value: 5 },
      will: { value: 5 }
    })
  }
};