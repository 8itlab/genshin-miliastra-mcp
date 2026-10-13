import { createHash } from 'node:crypto';
import { CoreError } from './errors.js';

export const INPUT_DIGEST_VERSION = '1';
export function sha256(bytes: string | Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex');
}

// JSON-only, sorted object keys, order-preserving arrays, no lossy coercions.
export function canonicalJson(value: unknown): string {
  const active = new Set<object>();
  function encode(v: unknown): string {
    if (v === null || typeof v === 'boolean' || typeof v === 'string') return JSON.stringify(v);
    if (typeof v === 'number' && Number.isFinite(v)) return JSON.stringify(v);
    if (typeof v !== 'object' || v === null) throw new CoreError('INVALID_ARGUMENT', 'Expected finite JSON values');
    if (active.has(v)) throw new CoreError('INVALID_ARGUMENT', 'Cyclic JSON input');
    const proto = Object.getPrototypeOf(v);
    if (!Array.isArray(v) && proto !== Object.prototype && proto !== null) throw new CoreError('INVALID_ARGUMENT', 'Expected plain JSON object');
    if (Object.getOwnPropertySymbols(v).length) throw new CoreError('INVALID_ARGUMENT', 'JSON cannot contain symbol keys');
    active.add(v);
    try {
      if (Array.isArray(v)) {
        if (Object.keys(v).length !== v.length) throw new CoreError('INVALID_ARGUMENT', 'Sparse or extended arrays are not JSON');
        return '[' + Array.from({length:v.length},(_,i)=>{
          const descriptor=Object.getOwnPropertyDescriptor(v,String(i));
          if(!descriptor || !('value' in descriptor))throw new CoreError('INVALID_ARGUMENT','Array slots must be ordinary JSON values');
          return encode(descriptor.value);
        }).join(',') + ']';
      }
      return '{' + Object.keys(v).sort().map(key => {
        const descriptor = Object.getOwnPropertyDescriptor(v, key)!;
        if (!('value' in descriptor)) throw new CoreError('INVALID_ARGUMENT', 'JSON accessors are not supported');
        return JSON.stringify(key) + ':' + encode(descriptor.value);
      }).join(',') + '}';
    } finally { active.delete(v); }
  }
  return encode(value);
}

export function inputDigest(value: unknown): string {
  return sha256(canonicalJson({ inputDigestVersion: INPUT_DIGEST_VERSION, value }));
}

export function canonicalQuaternion(input: readonly number[]): [number, number, number, number] {
  if (input.length !== 4 || !input.every(Number.isFinite)) throw new CoreError('INVALID_ARGUMENT', 'Quaternion must contain four finite numbers');
  const magnitude = Math.hypot(...input);
  if (magnitude < 1e-12 || !Number.isFinite(magnitude)) throw new CoreError('INVALID_ARGUMENT', 'Quaternion magnitude must be nonzero and finite');
  const values = input.map(v => v / magnitude);
  // w first, then x/y/z; q and -q share a deterministic representation.
  const pivot = [values[3], values[0], values[1], values[2]].find(v => v !== 0)!;
  return values.map(v => v === 0 ? 0 : pivot < 0 ? -v : v) as [number, number, number, number];
}
