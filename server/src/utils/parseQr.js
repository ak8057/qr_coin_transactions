// parse text like "ITEM:bottle|GREENCOIN:10|TXN:uuid|..."
function parseQrText(text) {
  const parts = text.split("|");
  const obj = {};
  for (const p of parts) {
    const [k, ...rest] = p.split(":");
    if (!k) continue;
    obj[k.trim()] = rest.join(":").trim();
  }
  // numeric conversions
  if (obj.GREENCOIN) obj.GREENCOIN = Number(obj.GREENCOIN);
  if (obj.TS) {
    const n = Number(obj.TS);
    if (!isNaN(n)) obj.TS = n;
  }
  return obj;
}

module.exports = parseQrText;
