import {doyToDate,parseFilenameDate} from './utils.js';

export function detectFormat(text,fileName=''){
  const upper=text.slice(0,4000).toUpperCase();
  return {kind:upper.includes('START OF ROTIPOLARMAP')?'classic-rotipolarmap':'unknown',compressed:/\.gz$/i.test(fileName),extension:fileName.match(/(\.INX(?:\.gz)?|\.\d{2}f(?:\.gz)?|\.gz)$/i)?.[0]||''};
}

export function parseRotiFile(text,fileName=''){
  const warnings=[];const format=detectFormat(text,fileName);
  const lines=text.replace(/\r/g,'').split('\n');
  const start=lines.findIndex(l=>/START OF ROTIPOLARMAP/i.test(l));
  const end=lines.findIndex((l,i)=>i>start&&/END OF ROTIPOLARMAP/i.test(l));
  if(start<0||end<0)throw new Error('Classic START/END OF ROTIPOLARMAP section was not found.');
  const headerText=lines.slice(0,start).join('\n');
  const productName=(headerText.match(/IGS ROTI maps/i)?.[0])||'IGS ROTI maps';
  const dateNums=(lines[start+1]||'').match(/[-+]?\d+/g)?.map(Number)||[];
  const metadata={productName,fileName,format:format.kind,inputExtension:format.extension,section:'NH',coordinateSystem:'Corrected MLAT / MLT'};
  if(dateNums.length>=3){metadata.year=dateNums[0];metadata.month=dateNums[1];metadata.day=dateNums[2];metadata.date=`${dateNums[0].toString().padStart(4,'0')}-${dateNums[1].toString().padStart(2,'0')}-${dateNums[2].toString().padStart(2,'0')}`;metadata.doy=Math.floor((Date.UTC(dateNums[0],dateNums[1]-1,dateNums[2])-Date.UTC(dateNums[0],0,0))/86400000)}
  const fnDate=parseFilenameDate(fileName);if(fnDate.date){metadata.filenameDate=fnDate.date;if(metadata.date&&fnDate.date!==metadata.date)warnings.push(`Filename date ${fnDate.date} disagrees with header date ${metadata.date}.`);metadata.doy ??= fnDate.doy;metadata.year ??= fnDate.year;metadata.date ??= fnDate.date;}
  const rows=[];let i=start+2;
  while(i<end){const nums=(lines[i].match(/[-+]?\d*\.?\d+(?:[Ee][-+]?\d+)?/g)||[]).map(Number);const isRowHeader=nums.length>=3&&nums.length<=4&&Math.abs(nums[0])<=90&&Math.abs(nums[1])<=24&&Math.abs(nums[2])<=360;
    if(!isRowHeader){i++;continue}const mlat=nums[0];const startDeg=nums[1];const endDeg=nums[2];i++;const values=[];
    while(i<end&&values.length<180){const vnums=(lines[i].match(/[-+]?\d*\.?\d+(?:[Ee][-+]?\d+)?/g)||[]).map(Number);const maybeHeader=vnums.length>=3&&vnums.length<=4&&Math.abs(vnums[0])<=90&&Math.abs(vnums[1])<=24&&Math.abs(vnums[2])<=360;if(maybeHeader&&values.length>=170)break;values.push(...vnums);i++;}
    if(values.length!==180)warnings.push(`MLAT ${mlat} row has ${values.length} values; expected 180.`);
    rows.push({mlat,startDeg,endDeg,values:values.slice(0,180)});
  }
  if(!rows.length)throw new Error('No MLAT rows were parsed from ROTIPOLARMAP.');
  const columns=Math.max(...rows.map(r=>r.values.length));
  metadata.gridSize=`${rows.length} × ${columns}`;
  if(rows.length!==20||columns!==180)warnings.push(`Unexpected grid size ${metadata.gridSize}; classic files are usually 20 × 180.`);
  const zeroCount=rows.flatMap(r=>r.values).filter(v=>v===0).length;const total=rows.reduce((a,r)=>a+r.values.length,0);
  if(zeroCount/total>0.5)warnings.push(`Many cells are zero or missing (${Math.round(100*zeroCount/total)}%).`);
  if(rows.some(r=>r.values.some(v=>v>1)))warnings.push('Some values exceed the default 0–1 TECU/min scale; rendering clips them unless another scale is selected.');
  return {metadata,warnings,sections:{NH:{name:'NH',rows,mltBins:columns,mlatRows:rows.length,mltStepHours:24/columns}},activeSection:'NH'};
}
