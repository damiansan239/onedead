import { customAlphabet } from "nanoid/non-secure";

import type { Result } from "@/game/types";

export const formatResult = (result: Result) => {
  if (!result) return "";

  if (result.deadCount == 0 && result.injuredCount == 0) {
    return "None";
  }
  const deadCount = result?.deadCount !== 0 ? `${result?.deadCount} dead` : "";
  const injuredCount =
    result?.injuredCount != 0 ? `${result?.injuredCount} injured` : "";

  return `${deadCount}  ${injuredCount}`;
};

export const generateName = (): string => {
  const alphabet =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const nanoid = customAlphabet(alphabet, 16);
  return nanoid();
};

export const addValue = (input: string, value: string) => {
  if (input.length !== 1) {
    throw new Error("Input cannot be longer that one integer");
  }

  let numbers = "";
  for (const v of value) {
    if (v !== "_") {
      numbers = numbers.concat(v);
    } else {
      break;
    }
  }

  if (numbers.length !== 4) {
    numbers = numbers.concat(input);
  }

  let remainder = 4 - numbers.length;
  let spaces = remainder - 1;

  while (remainder != 0) {
    numbers = numbers.concat("_");
    if (spaces) {
      numbers = numbers.concat(" ");
      spaces--;
    }
    remainder--;
  }
  return numbers;
};
