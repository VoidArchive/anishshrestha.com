---
title: 'Introducing NTX: The Modern Way to Explore NEPSE'
slug: 'introducing-ntx'
description: 'A deep dive into building a high-performance, ad-free NEPSE visualization platform using Go, ConnectRPC, and SvelteKit.'
date: '2026-01-13'
published: true
tags: ['go', 'sveltekit', 'nepse', 'connect-rpc', 'ntx', 'open-source']
---

If you've ever tried to check company fundamentals in Nepal, you know the struggle. The official [NEPSE](https://www.nepalstock.com.np/) website is functional but often slow and clunky. Third-party portals exist, but they are usually riddled with ads, confusing layouts, and paywalls for basic info.

I built **[NTX (Nepal Trade Xplorer)](https://github.com/voidarchive/ntx)** to solve this. It's a clean, fast, and open-source stock screener designed for one thing: giving you a clear snapshot of market data without the noise.

![NTX Showcase](/ntx-showcase.png)

## The Problem: Noise and Friction

As a developer and an investor, I found myself constantly frustrated by the existing tools when I just wanted to check a company's status.

- **Latency**: Loading a simple company page often took seconds.
- **Ads**: Pop-ups and banner ads distracted from the data.
- **UX**: Important metrics like P/E ratio, paid-up capital, or dividends were often buried or hard to compare.

I wanted a tool that felt instant, looked premium, and respected the user's time.

## The Solution: Speed and Simplicity

NTX is designed to be a "pro" tool that is accessible to everyone. There are no ads, no trackers, and no paywalls. The interface is highly dense, prioritizing data per pixel.

Key features include:

- **Stock Screener**: Quickly filter companies based on fundamental metrics.
- **Company Snapshots**: A dense, single-page view of a company's key metrics, price history, and details.
- **Market Overview**: See top gainers, losers, and index performance at a glance.

## Under the Hood: The "Over-Engineered" Stack

Let's be honest: **this stack is completely over-engineered for a stock screener.**

I could have built this with a simple Next.js app and a few API calls. But NTX wasn't just about building a product; it was a playground for me to learn and experiment with a modern, scalable "cloud-native" stack.

Here is the tech stack I chose to learn:

### Backend: Go + ConnectRPC

I chose **Go** for the backend to learn how to build production-grade services.

- **Go-Nepse**: The core data fetching logic comes from **[go-nepse](/blog/how-i-built-nepse-api-go-library)**, a library I wrote to handle NEPSE's unique authentication challenges.
- **ConnectRPC**: Instead of standard REST, I used **[ConnectRPC](https://connectrpc.com/)**. It allows me to define my API schema in Protocol Buffers (Protobuf). This ensures strict contracts between my frontend and backend—if I change a field in the backend, the frontend build fails immediately.

### Frontend: SvelteKit

**SvelteKit** is my framework of choice for its incredible performance and developer experience.

- **Reactivity**: Svelte's compiler-based approach means less runtime overhead.
- **SSR**: Server-Side Rendering ensures the content is crawlable and loads instantly.

I used **Tailwind CSS** for styling and **shadcn-svelte** for the UI components.

## Challenges & Lessons

The biggest challenge was data normalization. NEPSE's raw data can be inconsistent—sometimes a company name is spelled differently across endpoints, or a symbol changes. Building a robust ingestion pipeline that handles these edge cases gracefully was a major learning experience.

## Conclusion

NTX started as a weekend project to scratch my own itch and to over-engineer a solution for the sake of learning. It has grown into a mature, open-source platform.

If you are interested in Go, SvelteKit, or just want to see how a modern full-stack app is put together, check out the code.

Check out the code: [github.com/voidarchive/ntx](https://github.com/voidarchive/ntx)
