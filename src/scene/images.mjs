// The picture library of the image control (图片资源库): every picture of the platform that a screen can show, by its id.
// The editor shows it as a grid, each picture with its id under it; the pages here are photographs of that grid, taken
// category by category on 2026-10-13 (scripts/dev/imgcat.py). A picture is chosen by looking at a page and reading the
// id under it: there are no names to search.
import fs from 'node:fs';
import {fail} from '../adapter.mjs';
const DIR=new URL('./image-library/',import.meta.url);
const INDEX=JSON.parse(fs.readFileSync(new URL('index.json',DIR),'utf8'));
export const imageCategories=()=>INDEX.categories;
export const imageIdKnown=id=>INDEX.categories.some(c=>id>=c.firstId&&id<=c.lastId);
export function imageCatalog({category,page=1}={}){
  const list=INDEX.categories.map(c=>({category:c.category,chineseName:c.zh,holds:c.about,firstId:c.firstId,lastId:c.lastId,pictures:c.count,pages:Math.ceil(c.files.length/PER_CALL)}));
  if(!category){
    const out={categories:list,total:list.reduce((n,c)=>n+c.pictures,0),
      note:'Ask for one category to see its pictures: each page is a photograph of the editor\'s own grid with the id under every picture. Use an id as image in scene_add_image. The ids of a category run without gaps from firstId to lastId.'};
    return {content:[{type:'text',text:JSON.stringify(out)}],structuredContent:out};
  }
  const found=INDEX.categories.find(c=>c.category===category||c.zh===category);
  if(!found)fail('IMAGE_CATEGORY_NOT_FOUND','No such category of pictures.',{category,categories:list.map(c=>c.category)});
  const pages=Math.ceil(found.files.length/PER_CALL);
  if(page<1||page>pages)fail('IMAGE_PAGE_NOT_FOUND','This category has '+pages+' page(s).',{category,page});
  const files=found.files.slice((page-1)*PER_CALL,page*PER_CALL);
  const out={category:found.category,chineseName:found.zh,holds:found.about,firstId:found.firstId,lastId:found.lastId,pictures:found.count,page,pages,sheets:files.length,
    note:'Each sheet is a photograph of the grid in the editor: the six digits under a picture are its id (image in scene_add_image). Sheets follow one another down the list and overlap by a row or two.'};
  return {content:[{type:'text',text:JSON.stringify(out)},...files.map(f=>({type:'image',mimeType:'image/jpeg',data:fs.readFileSync(new URL(f,DIR)).toString('base64')}))],structuredContent:out};
}
const PER_CALL=4;
