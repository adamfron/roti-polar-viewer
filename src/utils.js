export const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
export const round=(v,d=2)=>Number.isFinite(v)?Number(v.toFixed(d)):null;
export function doyToDate(year,doy){const d=new Date(Date.UTC(year,0,doy));return d.toISOString().slice(0,10)}
export function parseFilenameDate(fileName=''){let m=fileName.match(/_(\d{4})(\d{3})\d{4}_/);if(m)return{year:+m[1],doy:+m[2],date:doyToDate(+m[1],+m[2])};m=fileName.match(/roti(\d{3})0\.(\d{2})f/i);if(m){const yy=+m[2];const y=yy>=80?1900+yy:2000+yy;return{year:y,doy:+m[1],date:doyToDate(y,+m[1])}}return{};}
export function downloadBlob(content,name,type){const blob=content instanceof Blob?content:new Blob([content],{type});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},0)}
export function csvEscape(v){if(v==null||Number.isNaN(v))return'';const s=String(v);return /[",\n]/.test(s)?`"${s.replaceAll('"','""')}"`:s}
export function percentile(sorted,p){if(!sorted.length)return NaN;const i=(sorted.length-1)*p;const lo=Math.floor(i),hi=Math.ceil(i);return lo===hi?sorted[lo]:sorted[lo]+(sorted[hi]-sorted[lo])*(i-lo)}
export function circularSmooth(points,key,radius){if(radius<=0)return points.map(p=>({...p}));const n=points.length;return points.map((p,i)=>{const q={...p};let sum=0,w=0;for(let k=-radius;k<=radius;k++){const r=points[(i+k+n)%n];const val=r[key];if(Number.isFinite(val)){const wt=radius+1-Math.abs(k);sum+=val*wt;w+=wt}}q[key]=w?sum/w:p[key];return q})}
