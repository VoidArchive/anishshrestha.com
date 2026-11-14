---
title: 'Putting 141 Hydro Plants on a Map of Nepal by River Basin'
slug: 'ntx-hydro-map-river-basins'
description: 'How the NTX hydro page works: a hand-reviewed plant table, nine river basins, a static SVG map, and daily rain and discharge for every plant.'
date: '2026-11-14'
published: true
tags: ['ntx', 'go', 'sqlite', 'sveltekit', 'nepse', 'hydropower']
series: 'system-design'
project: 'ntx'
---

Hydropower is the biggest sector on the Nepal Stock Exchange by number of companies. The NTX sector table listed 112 of them on 13 November. Their earnings depend on water, and the water depends on which river the plant sits on.

A stock page does not show that. Two hydro companies can look unrelated in a screener and still share one river and one monsoon. So I added a [hydro page to NTX](https://ntx.anishshrestha.com/hydro) that puts every listed plant on a map of Nepal, grouped by river basin, with the day's rain and river discharge beside each one.

![The NTX hydro page: a map of Nepal with rivers drawn in orange and a dot for each listed hydropower plant](/ntx-hydro.webp)

The page opened like this on 14 November:

> 141 plants of 110 listed companies on 93 rivers. Basins on 2026-11-14: Koshi normal, Gandaki normal, Karnali normal, Mahakali normal, Bagmati normal, West Rapti normal, Kankai normal.

This post covers the four parts behind that sentence: the plant table, the basins, the map, and the daily readings.

## The plant table is a CSV I reviewed by hand

There is no feed that says which listed company owns which plant on which river. The closest source is the Department of Electricity Development (DoED), which publishes tables of operating plants and generation licences.

A script drafts the plant list from a saved snapshot of those two DoED pages. I then reviewed every row by hand. The result is one file, `data/hydro_plants.csv`, with these columns:

```
symbol,plant,river,basin,district,mw,lat,lon,status,source_url
```

The worker loads that file into SQLite every time the server starts, keyed on the symbol and the plant name. Nothing scrapes DoED at runtime.

I chose a reviewed file over a daily scrape because a scrape would put coordinates on the map that nobody had checked. The cost is that adding a plant means editing the CSV and deploying.

The loader is strict. One bad row fails the whole load, so a mistake cannot reach the map:

- the basin must be one of the nine in the list
- the status must be `operating` or `under_construction`
- every row needs a source URL
- the latitude must be between 26 and 31 and the longitude between 80 and 89, which is the box Nepal fits in

Two things about this table are approximate, and the page should not pretend otherwise. The coordinates are the centre of the licence area that DoED publishes, so a dot can sit a few kilometres from the real intake. And two plants under 1 MW are left out.

## Nine basins, and a river belongs to exactly one

A river and a basin are different things in NTX. The river is the one the licence names, such as Tamakoshi, Trishuli or Kabeli. The basin is the drainage basin that river flows into.

There are nine basins: Koshi, Gandaki, Karnali, Mahakali, Bagmati, Kamala, West Rapti, Babai and Kankai. Every river belongs to exactly one of them. If a row names a basin outside that list, it is treated as an error in the table. It does not become a tenth basin.

Seven of the nine have listed plants today:

| Basin      | Plants |
| ---------- | ------ |
| Koshi      | 56     |
| Gandaki    | 55     |
| Kankai     | 15     |
| Karnali    | 8      |
| Mahakali   | 3      |
| Bagmati    | 3      |
| West Rapti | 1      |

Koshi and Gandaki hold 111 of the 141 plants between them.

I work at the basin level for colouring the map and for the state of a region. Two plants on different tributaries are on different rivers, but if they share a basin they share most of their weather.

## The map is a static SVG

The map has no tiles, no map service, and no geo library in the browser.

A Python script builds it once. It takes Nepal's outline from geoBoundaries and the rivers from HydroRIVERS, clips the rivers to the outline, and projects everything with one Mercator projection. The output is a JSON file of SVG path strings, about 236 KB, committed to the repo.

The projection's parameters are stored in that file. The page uses the same formula to place the plant dots, which is why a dot lands on the river the script drew.

The script also has to decide which basin each stretch of river belongs to. It walks downstream from that stretch until it passes a known anchor point on a basin's main river, and gives the stretch that basin.

Not every stream in Nepal is drawn. A stretch is kept if it is a large enough river, or if it lies close to a plant, so every plant's own river appears.

I left out district boundaries. The open boundary data I used only has the 75 districts from before Nepal became a federal republic.

Tiles would have added a third-party service and a network call to a page that is otherwise a single database read.

## Two readings per plant per day

Each plant gets a reading for each day: the rain and the river discharge at its coordinates. Both come from Open-Meteo, in two separate calls:

- rain from the forecast endpoint, using the ECMWF IFS model
- discharge from the flood endpoint, which serves GloFAS v4

The discharge is modelled on a 5 km grid. It is not a gauge in the river, and the page says so.

A job runs every day at 06:00 Nepal time. Each run re-reads the last seven days, so a morning the job missed fills itself in on the next run. The first run for a new plant fetches 92 days of rain and ten years of discharge, about 3,650 rows.

A reading is a day that has happened. Forecast days are never stored.

Nepal has no daylight saving, so the code uses a fixed time zone and does not depend on the system's time zone database.

```go
// Nepal has no daylight saving, so a fixed zone avoids depending on tzdata.
var nepalTime = time.FixedZone("NPT", 5*3600+45*60)
```

## Plant state comes from two published rules

A plant is in one of three states: normal, heavy rain, or high discharge.

- Heavy rain means the day's rain at the plant is 50 mm or more. That is the Department of Hydrology and Meteorology's 24-hour "heavy" category.
- High discharge means the day's discharge is above the 95th percentile of that plant's own daily discharge over the last ten years.

The whole rule is this function:

```go
func PlantState(r sqlc.HydroReading, p95 float64, hasP95 bool) ntxv1.PlantState {
	if hasP95 && r.DischargeM3s.Valid && r.DischargeM3s.Float64 > p95 {
		return ntxv1.PlantState_PLANT_STATE_HIGH_DISCHARGE
	}
	if r.RainMm.Valid && r.RainMm.Float64 >= HeavyRainMM {
		return ntxv1.PlantState_PLANT_STATE_HEAVY_RAIN
	}
	return ntxv1.PlantState_PLANT_STATE_NORMAL
}
```

High discharge is the worse state, so it wins when both rules hold. A plant with no discharge history yet has no percentile and cannot be "high discharge".

Each plant is compared with its own record because the rivers differ so much in size. A discharge that is ordinary for a big river would be a flood on a small one, so one fixed number could not work for all 141 plants.

A basin's state is the worst state among its plants. If the latest reading is more than two days old, the page labels the state as stale.

These rules are printed on the page beside the states they produce. A state is a description of a day that happened. It is not an alert and not a forecast.

## State is worked out on every request

The state is never saved in the database. It is worked out on each request from the latest reading and the plant's percentile.

The percentile pass is the expensive part. It sorts about half a million rows and takes a couple of seconds. So the API keeps the finished map in memory and only rebuilds it when a newer reading has been fetched. The first request after the morning job, or after a restart, pays for the rebuild. Every request after that is served from memory.

## The opening sentence is written in Go

The sentence at the top of the page is composed in the backend, from the same plant list the map and the table use:

```go
s := fmt.Sprintf("%d plants of %d listed companies on %d rivers.",
	len(plants), len(companies), len(rivers))
```

It then adds each basin that has plants, with its state on the newest reading day. The front end prints the string it is given. Because one function counts the plants for both the sentence and the list, the two cannot disagree.

## One hydro per basin

The basin also feeds a rule in my own, private part of NTX. For a year I ran my NEPSE investing from one long note of written rules, and one of them was "one hydro per basin". NTX now checks that rule for me. If I already hold a company with a plant in a basin, another company with a plant in the same basin is turned away, with the reason in one sentence:

```
a plant in the <basin> basin, which <symbol> already occupies
```

The rule reads the plant table and ignores the sector label. A company with two plants in two basins occupies both.

## On a phone

On a phone the map is touch-driven. Tapping a dot opens the plant and its weather. Tapping a river, or a basin chip above the map, zooms to that basin and filters the list, and tapping again zooms back out. The plant table becomes a stacked list.

## Try it

The page is live at [ntx.anishshrestha.com/hydro](https://ntx.anishshrestha.com/hydro), and the code is in [github.com/voidarchive/ntx](https://github.com/voidarchive/ntx).
