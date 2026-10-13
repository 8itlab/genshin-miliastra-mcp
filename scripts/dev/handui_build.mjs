// Builds the save that is opened in the editor to configure screen controls by hand: two bars, an image, a timer
// display and a button, each as the tool writes it. node scripts/dev/handui_build.mjs <base.gil> <out dir>
import fs from 'node:fs';import path from 'node:path';
import {addProgressBar,addImage,addGlobalTimer,addTimerDisplay,addButton} from '../../src/scene-save.mjs';
const [base,out]=process.argv.slice(2);fs.mkdirSync(out,{recursive:true});
let at=base;const step=(r)=>{at=r.mapPath;return r;};
const a=step(addProgressBar({mapPath:at,name:'HU_bar_a',variable:'HU_a',max:10,position:[-500,300],size:[240,40]},out));
const b=step(addProgressBar({mapPath:at,name:'HU_bar_b',variable:'HU_b',max:10,position:[-500,220],size:[240,40]},out));
const c=step(addProgressBar({mapPath:at,name:'HU_bar_c',variable:'HU_c',max:10,position:[-500,140],size:[240,40]},out));
const image=step(addImage({mapPath:at,name:'HU_image',image:105163,position:[-500,40],size:[80,80]},out));
step(addGlobalTimer({mapPath:at,name:'HU_clock',seconds:60},out));
const clock=step(addTimerDisplay({mapPath:at,name:'HU_clock_shown',timer:'HU_clock'},out));
const button=step(addButton({mapPath:at,name:'HU_button'},out));
const final=path.join(out,'handui.gil');fs.copyFileSync(at,final);
console.log(JSON.stringify({final,bars:[a.controlId,b.controlId,c.controlId],image:image.controlId,clock:clock.controlId,button:button.controlId}));
