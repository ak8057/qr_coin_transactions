const COIN_MAP = {
  bottle: 10,
  plate: 5,
  "wine glass": 7,
  cup: 5,
  book: 3,
  "cell phone": 20,
  keyboard: 15,
  mouse: 8,
  remote: 8,
  laptop: 30,
};

function getCoinsForItem(itemName) {
  if (!itemName) return 0;
  const key = itemName.toLowerCase().trim();
  return COIN_MAP[key] ?? 0;
}

module.exports = { COIN_MAP, getCoinsForItem };
