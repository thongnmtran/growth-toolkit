// import mongoose from 'mongoose';
import { nativeMath, hex, integer, real, bool } from 'random-js';
import { v1, v4 } from 'uuid';
import md5 from 'md5';

const engine = nativeMath;

export function hash(value: unknown) {
  return md5(JSON.stringify(value));
}

export function randomHex(length = 8, upercase = false) {
  return hex(upercase)(engine, length);
}

export function randomDocId(): string {
  // return new mongoose.Types.ObjectId().toString();
  return '';
}

export function uuid(version: 1 | 4 = 4) {
  if (version === 1) {
    return v1();
  }
  return v4();
}

export function randomInt(min: number, max: number) {
  return integer(min, max)(engine);
}

export function randomFloat(min: number, max: number) {
  return real(min, max)(engine);
}

export function randomBool() {
  return bool()(engine);
}

export function randomItem(array = []) {
  if (!Array.isArray(array) || array.length <= 0) {
    return null;
  }
  return array[randomInt(0, array.length - 1)];
}

export function seeding() {
  const currentMiliSeconds = Date.now() % 500;
  for (let index = 0; index < currentMiliSeconds; index++) {
    randomInt(0, 100);
  }
}

seeding();
