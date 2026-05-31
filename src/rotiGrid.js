export function getGrid(parsed,section='NH'){return parsed.sections[section]||parsed.sections.NH}
export function cells(grid){const out=[];for(const row of grid.rows){row.values.forEach((roti,j)=>{out.push({mlat:row.mlat,mltHour:j*grid.mltStepHours,mltDeg:j*360/grid.mltBins,roti})})}return out}
export function mlatExtent(grid){const lats=grid.rows.map(r=>r.mlat);return {min:Math.min(...lats),max:Math.max(...lats)}}
export function valueAt(grid,latIndex,mltIndex){const row=grid.rows[latIndex];return row?.values[(mltIndex+grid.mltBins)%grid.mltBins]}
export function mltSectorIndex(grid,mltHour){return Math.floor(((mltHour%24)+24)%24/grid.mltStepHours)}
