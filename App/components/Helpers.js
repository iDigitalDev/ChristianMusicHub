export function invertColor(hex) {
  if (hex === null) {
    return '000000';
  }
  var r = parseInt(hex.slice(0, 2), 16),
    g = parseInt(hex.slice(2, 4), 16),
    b = parseInt(hex.slice(4, 6), 16);

  const brightness = Math.round(
    (parseInt(r) * 299 + parseInt(g) * 587 + parseInt(b) * 114) / 1000,
  );

  return brightness > 125 ? '000000' : 'ffffff';
}
