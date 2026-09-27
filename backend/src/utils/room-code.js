import { ROOM_CODE_PATTERN } from "../../../shared/constants/languages.js";

export function isValidRoomCode(value) {
  return typeof value === "string" && ROOM_CODE_PATTERN.test(value);
}

export function createRoomCode() {
  return Math.floor(10000 + Math.random() * 90000).toString();
}
