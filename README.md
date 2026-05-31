# ROTI Polar Map Viewer

ROTI Polar Map Viewer is a static GitHub Pages web app for quick-look inspection of IGS-style ROTI polar map files. It lets a user choose a local ROTI map file, parse the classic northern-hemisphere `ROTIPOLARMAP` section in the browser, render a corrected magnetic latitude / magnetic local time polar heatmap, compute compact statistics, derive a ROTI-based oval proxy, and export the map and derived data.

## Local-only processing

All processing is client-side. The selected file is read with the browser File API and is not uploaded anywhere. The app has no backend, database, or server-side processing requirement; it is suitable for GitHub Pages or any static file host.

## Supported input formats

The first version supports classic IGS-style northern hemisphere polar ROTI map sections containing:

- `START OF ROTIPOLARMAP`
- a date/header line
- corrected magnetic latitude rows
- 180 magnetic-local-time sector values per latitude row
- `END OF ROTIPOLARMAP`

Supported file naming patterns include modern names such as `IGS0OPSFIN_20250010000_01D_01D_ROT.INX` and `IGS0OPSFIN_20250010000_01D_01D_ROT.INX.gz`, plus old-style names such as `rotiDDD0.YYf` and `rotiDDD0.YYf.gz`. The parser does not rely only on the filename: it inspects the file contents and searches for the ROTIPOLARMAP section.

Gzip input is handled locally in the browser through the vendored gzip helper in `src/fflate.min.js`. If a browser cannot decompress gzip streams, use an uncompressed `.INX` file or a browser with gzip stream support.

## Coordinates and map orientation

The polar map is plotted in corrected magnetic latitude (MLAT) and magnetic local time (MLT), not geographic longitude/latitude.

- 90° MLAT is near the center of the polar plot.
- Lower MLAT values are farther from the center.
- 12 MLT / noon is at the top.
- 00 / 24 MLT / midnight is at the bottom.
- 18 MLT / dusk is on the left.
- 06 MLT / dawn is on the right.

The expected classic grid is usually 20 MLAT rows from about 89° to 51° with 2° spacing and 180 MLT sectors with 8-minute spacing.

## What ROTI shows

ROTI is the Rate Of TEC Index. It is a measure of short-term variability or fluctuation activity in GNSS-derived total electron content. High ROTI values indicate stronger ionospheric irregularity activity in the product's sampling and processing context.

## What ROTI does not show

ROTI does **not** show absolute TEC. It is not a direct optical aurora measurement, not a direct particle precipitation product, and not a geographic map. A daily ROTI polar map is also not a single instantaneous global snapshot; it summarizes activity in the temporal/product context of the input file.

## ROTI versus TEC

TEC is the integrated electron content along a signal path or mapped to an ionospheric grid. ROTI is derived from variations in TEC and emphasizes fluctuation activity. A region can have large TEC but modest ROTI if it is smooth, or moderate TEC with high ROTI if it is highly structured.

## Comparing ROTI maps with LOFAR/dTEC observations

ROTI maps can be useful quick-look context for LOFAR differential TEC (dTEC) observations because both relate to ionospheric structure and variability. However, they do not measure the same quantity, may have different cadence and spatial sampling, and are expressed in different coordinate systems or projection conventions. Use the viewer to compare broad activity timing, magnetic-local-time sectors, and high-latitude irregularity context, not as authoritative reprocessing or one-to-one validation.

## Auroral oval / irregularity belt proxy

The app computes a ROTI-based high-latitude irregularity belt proxy for each MLT sector. It includes four modular methods:

1. **Threshold**: finds cells where `ROTI >= threshold`, then estimates equatorward boundary, ridge, and poleward boundary from active cells.
2. **Ridge**: finds the MLAT of maximum ROTI if the sector has enough activity.
3. **Gradient**: looks for finite-difference ROTI gradients along MLAT to estimate edges around a local maximum, with safety checks for weak detections.
4. **Hybrid**: combines threshold and gradient detection, rejects weak or noisy sectors, and reports confidence between 0 and 1.

Smoothing can be disabled or applied lightly/medium over MLT as a circular series so 23.9 h and 0 h are neighbors. Raw unsmoothed boundaries are preserved for export.

> The detected boundary is a ROTI-based proxy of the high-latitude ionospheric irregularity belt. It should not be interpreted as an optical auroral oval boundary.

## Statistics and sectors

After loading a file, the app reports metadata, value statistics (min, max, mean, median, p90, p95, p99), active cells above the selected threshold, and activity percentage. It also summarizes four MLT sectors:

- Dawn: 06–12 MLT
- Noon: 12–18 MLT
- Dusk: 18–24 MLT
- Midnight: 00–06 MLT

## Exports

Available exports include:

- map PNG
- compact report PNG
- statistics and settings JSON
- cell grid CSV with `date,doy,section,mlat,mlt_hour,mlt_deg,roti`
- oval proxy CSV with `date,doy,section,method,threshold,smoothing,mlt_hour,equatorward_mlat,ridge_mlat,poleward_mlat,max_roti,confidence`

## Warnings and validation

The UI displays non-blocking warnings for likely issues such as filename/header date disagreement, unexpected grid size, decompression failure, parse failure, many zero values, values above the default 0–1 scale, or weak oval-proxy detection.

## Limitations and caveats

- This is a quick-look visualization and comparison tool, not authoritative scientific reprocessing.
- ROTI shows variability/fluctuation activity, not absolute TEC.
- Coordinates are corrected magnetic latitude and magnetic local time, not geographic coordinates.
- A daily ROTI polar map is not a single instantaneous global snapshot.
- The oval overlay is a ROTI-based irregularity proxy and must not be interpreted as a physical optical auroral oval boundary.
- Southern hemisphere and equatorial sections are represented in the internal model for later extension, but the MVP focuses on the classic northern hemisphere `ROTIPOLARMAP` section.

## Development

Open `index.html` through a local static server, for example:

```bash
python3 -m http.server 8000
```

Then browse to `http://localhost:8000/` and load one of the files in `samples/`.
