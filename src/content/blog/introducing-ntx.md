---
title: 'Introducing NTX: The Modern Way to Explore NEPSE'
slug: 'introducing-ntx'
description: 'How I built NTX, a fast, ad-free company snapshot and screener for NEPSE, with Go, ConnectRPC, SQLite and SvelteKit.'
date: '2026-01-13'
published: true
tags: ['go', 'sveltekit', 'nepse', 'connect-rpc', 'ntx', 'open-source']
series: 'system-design'
project: 'ntx'
---

Checking company fundamentals in Nepal is harder than it should be. The official [NEPSE](https://www.nepalstock.com.np/) website works but is often slow and clunky. Third-party portals exist, but they usually come with ads, confusing layouts, and paywalls for basic info.

So I built [NTX (Nepal Trade Xplorer)](https://github.com/voidarchive/ntx). It's an open-source stock screener with fast pages and no ads.

![The NTX company page for Nabil Bank: share price chart, stock overview and ratings snowflake](/ntx-company.webp)

_I updated this post on 14 November 2026. NTX has changed a lot since January, and the sections below describe what is live now at [ntx.anishshrestha.com](https://ntx.anishshrestha.com)._

## The problem: noise and friction

As a developer and an investor, I kept getting frustrated with the existing tools when I just wanted to check a company's status. Loading a simple company page often took seconds. Pop-ups and banner ads distracted from the data. Important metrics like P/E ratio, paid-up capital, or dividends were often buried or hard to compare.

I wanted a tool that loaded instantly and put the numbers first.

## The solution: speed and simplicity

NTX is meant to be a "pro" tool that anyone can use. There are no ads, no trackers, and no paywalls. The interface is very dense and puts data per pixel first.

The company page is the product. It is one page that covers price, fundamentals, ownership, dividends, fund holdings and peers, so you can form a view of a stock without clicking around. Around it sit a screener, a market overview, a mutual funds list, and a [map of every listed hydropower plant](/blog/ntx-hydro-map-river-basins).

## Every page opens with a sentence

The rule I settled on in November is that every page opens with what the data says, in prose, with the period and the source beside every number. The home page on 13 November started like this:

> Closed at 2,655.23, down 0.24%, on turnover of Rs 3.05 Arba. 240 of 277 companies with a filed quarter are profitable.

The sectors table opens the same way. That day it said Commercial Banks was both the cheapest sector, at a median PE of 17.3x, and the most profitable, with all 19 of its filed companies in profit.

Those sentences are computed in the Go backend from the same rows the tables show, and the front end only prints them. I put that logic in Go for two reasons. A sector median needs every company's rows, which the backend already has. And the sentence templates and thresholds can be unit-tested against real filings.

A figure whose period or source is missing is shown as "not recorded". I did not start with that rule. It came from running my own investment plan for four months on a wrong bank NPL figure, and from twice mistaking an annualized monsoon-quarter EPS for a full year.

## Checks and a letter, never a tip

Each company is read against ten published checks. A check is a rule with a threshold, and its verdict is either Holds, Watch, or Needs more history. The checks are grouped into five axes: Value, Past, Health, Dividend and Ownership.

The rating is one letter from A to D, and it is the share of checks that hold. A needs 85% or more, B needs 60%, C needs 35%, and anything lower is a D. A check with no history counts as not holding, so a new listing cannot get an A by having nothing to measure. The page prints the coverage beside the letter, for example "B · 6 of 10 hold, 9 evaluated".

NTX never says buy or sell. The rating is a summary of rules you can read, and the rules are printed on the page next to the verdicts.

## The screener

The screener lists every company on NEPSE, 281 when I checked, with range filters on PE, PB, EPS, ROE, dividend yield and market cap, a minimum rating, and sector chips.

PE and EPS use the last four quarters when four consecutive quarters exist, and the latest filing otherwise. An "As of" column says which one each row used, so "4Q to Q1 2083/84" and "Q2 2081/82" are visibly different things.

## Under the hood: the "over-engineered" stack

This stack is completely over-engineered for a stock screener. I could have built it with a simple Next.js app and a few API calls. But I also wanted NTX to be a playground where I could learn and experiment with a modern, scalable "cloud-native" stack, so this is what I chose to learn.

### Backend: Go + ConnectRPC

I chose Go for the backend to learn how to build production-grade services.

The core data fetching logic comes from [go-nepse](/blog/how-i-built-nepse-api-go-library), a library I wrote to handle NEPSE's unusual authentication.

Instead of standard REST, I used [ConnectRPC](https://connectrpc.com/). It lets me define my API schema in Protocol Buffers (Protobuf), which gives me strict contracts between my frontend and backend: if I change a field in the backend, the frontend build fails immediately.

The server uses Go's `net/http` with no router framework. ConnectRPC handlers are plain `http.Handler` values, so there was nothing a router would add.

### One database file, one writer

The data path is short:

```
go-nepse --> background worker --> SQLite --> ConnectRPC --> SvelteKit
```

A background worker inside the server is the only thing that writes to the database. It syncs prices, the market day, companies and fundamentals at 15:05 Nepal time, after the market closes, and ownership and dividends at 10:00.

A web request never reaches NEPSE. Every page is a database read, which is why the pages are fast and why NTX keeps working when the exchange's site is slow.

The database is a single SQLite file, and the queries are generated by sqlc. NEPSE trades from 11:00 to 15:05, Sunday to Thursday, and outside those hours the data is a frozen end-of-day snapshot. One file on one disk is enough for that.

### Frontend: SvelteKit

SvelteKit is my framework of choice for its performance and developer experience. Svelte's compiler-based approach means less runtime overhead, and server-side rendering (SSR) makes the content crawlable and means it loads instantly.

I used Tailwind CSS for styling and shadcn-svelte for the UI components.

### Where it runs

The front end runs on Cloudflare Workers. The API is the Go binary in a Docker image on Railway, one replica in Singapore, with a `/health` check and a restart on failure. The SQLite file sits on a 5 GB Railway volume.

## Challenges & lessons

The biggest challenge was data normalization. NEPSE's raw data can be inconsistent: sometimes a company name is spelled differently across endpoints, or a symbol changes. I learned a lot building an ingestion pipeline that handles those cases.

Three of those cases took the longest.

NEPSE sends profit and paid-up capital with no unit. The number is whatever the company typed, so it can be rupees, thousands, lakh or crore, and it changes from filing to filing. One bank alone uses three different units. The worker rescales both figures to rupees before saving them. It checks paid-up capital against the company's own median, and profit against EPS times shares. A profit that is between 10 and 30 times off its EPS is stored as empty, because that gap is too big to be rounding and too small to be a unit mistake.

The quarterly EPS the exchange publishes is annualized, meaning the quarter is scaled up to a full year. For hydropower that overstates the year badly, because the first quarter is the monsoon. NTX keeps the figure the exchange sent and derives the quarter-only number when a page needs one.

Quarterly profit is year-to-date, cumulative from the start of the Nepali fiscal year. To get one quarter's profit you subtract the previous quarter's row in the same year.

Fiscal years follow the Nepali calendar, so NTX shows them as `2083/84` and never as the Gregorian span the exchange stores.

## What it does not do

There are no user accounts. Public data stays public and nothing asks you to log in.

The "AI Research" button does not call a model. It composes a research prompt from the company's data for you to paste into an assistant of your choice.

Mutual fund NAV and holdings are a static snapshot produced by a script, not live database data like the rest.

## Conclusion

NTX started as a weekend project to scratch my own itch and to over-engineer something for the sake of learning. It is now a live, open-source platform.

If you are interested in Go or SvelteKit, or just want to see how a full-stack app like this is put together, the code is at [github.com/voidarchive/ntx](https://github.com/voidarchive/ntx).
