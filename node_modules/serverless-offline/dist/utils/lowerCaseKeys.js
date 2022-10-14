"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseHeaders;
const {
  entries,
  fromEntries
} = Object; // (obj: { [string]: string }): { [Lowercase<string>]: string }

function parseHeaders(obj) {
  return fromEntries(entries(obj).map(([k, v]) => [k.toLowerCase(), v]));
}