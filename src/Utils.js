export function RandomNumber(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max + 1 - min) + min);
}
