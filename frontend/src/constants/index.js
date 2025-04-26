// constants/index.js

// Mapping of item types to zones
export const itemToZoneMap = {
  bottle: "A",
  watch: "B",
  phone: "C",
};

export const zoneToItemMap = {
  A: "Bottle",
  B: "Watch",
  C: "Phone",
};

// Colors for different item types (Tailwind classes)
export const itemColors = {
  Bottle: "bg-blue-200 border-blue-500",
  Watch: "bg-green-200 border-green-500",
  Phone: "bg-purple-200 border-purple-500",
};

// Zone header colors
export const zoneHeaderColors = {
  A: "bg-blue-500",
  B: "bg-green-500",
  C: "bg-purple-500",
};

// Forklift capacity
export const FORKLIFT_CAPACITY = 5;

// Item type icons
export const itemTypeIcons = {
  Bottle: "🍾",
  Watch: "⌚",
  Phone: "📱",
};

// Forklift status colors
export const forkliftStatusColors = {
  AT_STATION: "bg-green-500",
  MOVING_TO_ZONE: "bg-yellow-500",
  PLACING_ITEMS: "bg-blue-500",
  RETURNING: "bg-purple-500",
};
