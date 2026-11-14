---
title: 'Introducing NTX: The Modern Way to Explore NEPSE'
slug: 'introducing-ntx'
description: 'How I built NTX, a fast, ad-free NEPSE visualization platform, with Go, ConnectRPC and SvelteKit.'
date: '2026-01-13'
published: true
tags: ['go', 'sveltekit', 'nepse', 'connect-rpc', 'ntx', 'open-source']
series: 'system-design'
project: 'ntx'
---

Checking company fundamentals in Nepal is harder than it should be. The official [NEPSE](https://www.nepalstock.com.np/) website works but is often slow and clunky. Third-party portals exist, but they usually come with ads, confusing layouts, and paywalls for basic info.

So I built [NTX (Nepal Trade Xplorer)](https://github.com/voidarchive/ntx). It's a clean, fast, open-source stock screener that gives you a clear snapshot of market data without the noise.

![NTX Showcase](/ntx-showcase.png)

## The problem: noise and friction

As a developer and an investor, I kept getting frustrated with the existing tools when I just wanted to check a company's status. Loading a simple company page often took seconds. Pop-ups and banner ads distracted from the data. Important metrics like P/E ratio, paid-up capital, or dividends were often buried or hard to compare.

I wanted a tool that felt instant, looked premium, and respected the user's time.

## The solution: speed and simplicity

NTX is meant to be a "pro" tool that anyone can use. There are no ads, no trackers, and no paywalls. The interface is very dense and puts data per pixel first.

There are three main features. The stock screener quickly filters companies on fundamental metrics. A company snapshot is a dense, single-page view of a company's key metrics, price history, and details. The market overview shows top gainers, losers, and index performance at a glance.

## Under the hood: the "over-engineered" stack

This stack is completely over-engineered for a stock screener. I could have built it with a simple Next.js app and a few API calls. But I also wanted NTX to be a playground where I could learn and experiment with a modern, scalable "cloud-native" stack, so this is what I chose to learn.

### Backend: Go + ConnectRPC

I chose Go for the backend to learn how to build production-grade services.

The core data fetching logic comes from [go-nepse](/blog/how-i-built-nepse-api-go-library), a library I wrote to handle NEPSE's unusual authentication.

Instead of standard REST, I used [ConnectRPC](https://connectrpc.com/). It lets me define my API schema in Protocol Buffers (Protobuf), which gives me strict contracts between my frontend and backend: if I change a field in the backend, the frontend build fails immediately.

### Frontend: SvelteKit

SvelteKit is my framework of choice for its performance and developer experience. Svelte's compiler-based approach means less runtime overhead, and server-side rendering (SSR) makes the content crawlable and means it loads instantly.

I used Tailwind CSS for styling and shadcn-svelte for the UI components.

## Challenges & lessons

The biggest challenge was data normalization. NEPSE's raw data can be inconsistent: sometimes a company name is spelled differently across endpoints, or a symbol changes. I learned a lot building an ingestion pipeline that handles those cases.

## Conclusion

NTX started as a weekend project to scratch my own itch and to over-engineer something for the sake of learning. It has since grown into a mature, open-source platform.

If you are interested in Go or SvelteKit, or just want to see how a full-stack app like this is put together, the code is at [github.com/voidarchive/ntx](https://github.com/voidarchive/ntx).
