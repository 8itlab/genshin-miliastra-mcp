import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectCompiledText} from '../../src/compiled-text-check.mjs';
const graph=value=>({nodes:[{nodeIndex:7,pins:[{value:{bString:{val:value}}}]}]});
test('compiled dynamic interpolation is rejected with node and source location evidence',()=>{
 const findings=inspectCompiledText(graph('x=[object Object]'),'\nf.printString(`x=${position.x}`)');
 assert.equal(findings.length,1);assert.equal(findings[0].nodeIndex,7);
 assert.deepEqual(findings[0].possibleTemplateLocations,[{line:2,column:15}]);
});
test('explicit literal object text is allowed, unrelated literals do not hide generated coercion',()=>{
 assert.deepEqual(inspectCompiledText(graph('[object Object]'),"f.printString('[object Object]')"),[]);
 assert.equal(inspectCompiledText(graph('x=[object Object]'),"const s='[object Object]'").length,1);
 assert.equal(inspectCompiledText(graph('x=[object Object]'),'// x=[object Object]').length,1);
});
test('nested typed strings are inspected and dynamic connections are not guessed to be text',()=>{
 const nested={nodes:[{nodeIndex:2,pins:[{value:{bConcreteValue:{value:{bString:{val:'bad [object Object]'}}}}}]}]};
 assert.equal(inspectCompiledText(nested,'').length,1);
 assert.deepEqual(inspectCompiledText({nodes:[{nodeIndex:1,pins:[{value:{bString:{val:''}},connects:[{id:4}]}]}]},'runtime'),[]);
 assert.deepEqual(inspectCompiledText(graph('ordinary string'),'runtime'),[]);
});
