export function RandomNumber(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max + 1 - min) + min);
}

export function DeepClone(obj) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    const newArray = [];
    for (let i = 0; i < obj.length; i++) {
      newArray[i] = DeepClone(obj[i]);
    }
    return newArray;
  }

  const newObj = {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      newObj[key] = DeepClone(obj[key]);
    }
  }

  return newObj;
}
