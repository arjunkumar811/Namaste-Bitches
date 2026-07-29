export const ADJECTIVES = [
  "Blue", "Silent", "Crimson", "Shadow", "Cosmic", "Neon", "Quantum", "Solar",
  "Mystic", "Cyber", "Phantom", "Gilded", "Obsidian", "Frozen", "Blazing", "Vortex",
  "Astral", "Velocity", "Echo", "Radiant", "Eclipse", "Stealth", "Zenith", "Apex"
];

export const NOUNS = [
  "Panda", "Fox", "Eagle", "Wolf", "Tiger", "Viper", "Raven", "Griffin",
  "Panther", "Falcon", "Cheetah", "Dragon", "Phoenix", "Lynx", "Serpent", "Jaguar",
  "Hawk", "Leopard", "Nomad", "Wanderer", "Stalker", "Sphinx", "Kitsune", "Cobalt"
];

export const AVATARS = [
  "🐱", "🦊", "🐺", "🦅", "🐼", "🐍", "🦝", "🦁", "🐯", "🐵",
  "🦉", "🐙", "🦈", "🐲", "🤖", "👽", "🚀", "🪐", "⚡", "🔥"
];

export const ACCENT_COLORS = [
  "#00f2fe", // Cyber Cyan
  "#ff007f", // Neon Pink
  "#8a2be2", // Electric Purple
  "#00ff87", // Neon Emerald
  "#ffcf00", // Cyber Gold
  "#4facfe", // Ocean Blue
  "#ff5722", // Solar Orange
  "#00e676", // Matrix Green
];

export function generateRandomIdentity() {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const username = `${adj} ${noun}`;
  const avatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
  const accentColor = ACCENT_COLORS[Math.floor(Math.random() * ACCENT_COLORS.length)];

  return { username, avatar, accentColor };
}
