import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { schemaRegistry } from '../dist/core/schemas.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','docs','schemas');
fs.mkdirSync(root,{recursive:true});
for(const [name,schema] of Object.entries(schemaRegistry)) {
  const json=zodToJsonSchema(schema,{name,target:'jsonSchema7'});
  json.$comment='Structural schema only. Runtime refinements additionally enforce reference integrity, digest equality and quaternion canonicalization.';
  fs.writeFileSync(path.join(root,name+'.schema.json'),JSON.stringify(json,null,2)+'\n');
}
console.log(`Exported ${Object.keys(schemaRegistry).length} structural schemas; semantic refinements remain in the core validator.`);
