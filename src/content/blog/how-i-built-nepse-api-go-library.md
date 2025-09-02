---
title: 'How I Built a Go Library for the NEPSE API'
slug: 'how-i-built-nepse-api-go-library'
description: 'A type-safe Go client for NEPSE with automatic token handling via css.wasm reproduction, structured errors, retries, and clean modular design.'
date: '2025-09-02'
published: true
tags: ['go', 'nepse', 'api', 'fintech', 'nepal', 'library']
---

## Overview

`nepseauth` is a Go client for the NEPSE (Nepal Stock Exchange) API. It implements type-safe responses, context-aware calls, structured errors, and automatic token mint/refresh by reproducing NEPSE’s browser-side token derivation using an embedded WebAssembly module (`css.wasm`). The design favors testability and clear interfaces.

# Inside nepseauth: Cracking NEPSE Auth and Building a Typed Go Client

This post is a technical walkthrough of how this library was engineered: how NEPSE’s obfuscated authentication works, how we implemented it safely in Go, and what the client exposes for market data. It is written for developers who want to understand the internals and extend or audit the code.

- Repo: `github.com/voidarchive/nepseauth`
- Language: Go 1.21+
- Auth runtime: WebAssembly (wazero)
- HTTP stack: `net/http` with retry/backoff and browser-like headers

> Credit: Special thanks to the research in <https://github.com/basic-bgnr/NepseUnofficialApi> for documenting NEPSE’s token obfuscation scheme. This library builds on those findings and reimplements the algorithm with a sandboxed WASM runtime and a production-grade client.

---

## TL;DR

- The NEPSE site returns obfuscated `accessToken`/`refreshToken` plus five integer salts from `/api/authenticate/prove`.
- A small WASM blob exposes five functions that map salts to positions; removing bytes at those indices reconstructs valid tokens.
- We embed the WASM (`auth/data/css.wasm`) and execute it with `wazero` to compute indices entirely in-memory.
- A token `Manager` deduplicates refreshes, caches tokens for ~45s, and exposes helpers to attach the `Authorization: Salter <token>` header.
- The `nepse` package provides a typed, ergonomic HTTP client for NEPSE endpoints with retries and consistent error types.

---

## Background & Goals

NEPSE’s public endpoints are gated by short-lived bearer tokens that are not standard JWTs and are intentionally obfuscated. The browser receives a JSON payload with:

- `salt1..salt5`: Five integers
- `accessToken` and `refreshToken`: Obfuscated strings
- `serverTime`: A server timestamp (ms)

The browser JS then derives indices from the salts, drops bytes at those indices from each token, and uses the result as the real token in the `Authorization` header with a custom scheme (`Salter`).

Goals of this project:

- Reimplement the browser’s token derivation in a safe, testable, server-friendly way.
- Do not ship a JS runtime; run the same logic inside a compact WASM sandbox.
- Provide a clean, typed Go client for the rest of the NEPSE API.

---

## Architecture Overview

- `auth/` — Authentication runtime
  - `auth/token.go`: Token manager, WASM loader, index computation, string splicing.
  - `auth/data/css.wasm`: Embedded WASM that mimics browser math for indices.
- `nepse/` — Public API client
  - `nepse/http_client.go`: Implements `auth.NepseHTTP`, request retries, auth header injection.
  - `nepse/config.go`: Centralizes base URL, endpoints, and baseline headers.
  - `nepse/errors.go`: Strongly-typed error mapping and retry hints.
  - `nepse/types.go`: Response models for summary, indices, scrips, prices, depth, graphs, etc.
- `cmd/examples/basic_usage.go` — A runnable tour of most endpoints.

The auth package is independent of HTTP details (via an interface) and the client package implements that interface. This keeps the WASM runtime isolated and makes it easy to swap transports.

---

## Authentication Internals

### 1) Wire Protocol

- GET `/api/authenticate/prove` → returns salts and two obfuscated strings:
  - `salt1..salt5` (ints), `accessToken` (string), `refreshToken` (string), `serverTime` (ms)
- Client derives five indices for access and five for refresh using a deterministic function of salts.
- Remove the bytes in the token at those indices; the result is the real bearer.
- Use header: `Authorization: Salter <access>` for data endpoints.
- When a request returns 401, call `/api/authenticate/refresh-token` with `Authorization: Salter <refresh>` to get a new pair.

We keep tokens “fresh” for up to 45 seconds by default; beyond that we recompute.

### 2) Safe Execution via WASM

We embed a precompiled WASM (`auth/data/css.wasm`) and execute it with `wazero` to obtain indices. The module exports five `i32` functions (names reflect the minified browser code): `cdx`, `rdx`, `bdx`, `ndx`, `mdx`.

Loader and export resolution (excerpt from `auth/token.go`):

```go
rt := wazero.NewRuntime(ctx)
compiled, _ := rt.CompileModule(ctx, cssWasm)
mod, _ := rt.InstantiateModule(ctx, compiled, wazero.NewModuleConfig())

cdx := mod.ExportedFunction("cdx")
rdx := mod.ExportedFunction("rdx")
bdx := mod.ExportedFunction("bdx")
ndx := mod.ExportedFunction("ndx")
mdx := mod.ExportedFunction("mdx")
```

- `cdx(s1, s2, s3, s4, s5) -> int32`

```go
// Access indices: n, l, o, p, q
n := cdx(s1, s2, s3, s4, s5)
l := rdx(s1, s2, s4, s3, s5)
o := bdx(s1, s2, s4, s3, s5)
p := ndx(s1, s2, s4, s3, s5)
q := mdx(s1, s2, s4, s3, s5)

// Refresh indices: a, b, c, d, e
a := cdx(s2, s1, s3, s5, s4)
b := rdx(s2, s1, s3, s4, s5)
c := bdx(s2, s1, s4, s3, s5)
d := ndx(s2, s1, s4, s3, s5)
e := mdx(s2, s1, s4, s3, s5)
```

This mirrors the browser’s function call order and parameter permutations recorded by the community. Using WASM keeps the implementation close to the original behavior, reduces reimplementation risk, and avoids embedding brittle JS.

### 3) Splicing the Tokens

Once indices are computed, we delete bytes at those positions and concatenate the remaining pieces. We sort indices defensively and operate on bytes (tokens are ASCII/base64-like):

```go
func sliceSkipAt(s string, positions ...int) string {
    if len(positions) == 0 { return s }
    ps := append([]int(nil), positions...)
    sort.Ints(ps)

    b := []byte(s)
    var out []byte
    prev := 0
    for _, p := range ps {
        if 0 <= p && p < len(b) {
            out = append(out, b[prev:p]...)
            prev = p + 1
        }
    }
    out = append(out, b[prev:]...)
    return string(out)
}
```

If any index is out-of-range we ignore it (best-effort), matching browser leniency.

### 4) Token Lifecycle and Concurrency Control

`auth.Manager` centralizes token state and refresh coordination:

- Caches `accessToken`, `refreshToken`, salts, and a timestamp.
- Treats tokens as valid for `maxUpdatePeriod` (default 45s).
- Uses `singleflight` to deduplicate concurrent refreshes across goroutines.
- Exposes `AccessToken(ctx)`, `RefreshToken(ctx)`, `GetSalts(ctx)`, and `ForceUpdate(ctx)`.
- Injects headers via `auth.AuthHeader(req, token)` which sets `Authorization: Salter ...`.

Minimal usage path:

```go
m, _ := auth.NewManager(httpClient) // httpClient implements NepseHTTP
access, _ := m.AccessToken(ctx)
req.Header.Set("Authorization", "Salter "+access)
```

The `Manager` does not do I/O directly. It depends on a tiny interface so the HTTP layer is swappable:

```go
type NepseHTTP interface {
    GetTokens(ctx context.Context) (*TokenResponse, error)
    RefreshTokens(ctx context.Context, refreshToken string) (*TokenResponse, error)
}
```

---

## HTTP Client Design

The `nepse` package implements `auth.NepseHTTP` and all public data endpoints in one place, with a few key choices:

- Browser-like headers (user-agent, sec-ch, fetch hints) from `nepse/config.go` to avoid server heuristics.
- TLS verification is configurable; defaults in examples are relaxed for convenience, but for production you should enable verification.
- Automatic retries with backoff on transient errors or 429/5xx, using typed errors from `nepse/errors.go` to decide retryability.
- Transparent content decoding leverages Go’s `net/http`.

Auth’d request path (excerpt from `nepse/http_client.go`):

```go
token, err := h.authManager.AccessToken(ctx)
req, _ := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
auth.AuthHeader(req, token)
req.Header.Set("Content-Type", "application/json")
h.setCommonHeaders(req, true)
resp, err := h.doRequest(req)

if resp.StatusCode == http.StatusUnauthorized {
    _ = h.authManager.ForceUpdate(ctx)
    // retry once with a fresh token
}
```

Retries keep the client resilient without hammering the service:

```go
for attempt := 0; attempt <= h.options.MaxRetries; attempt++ {
    if attempt > 0 { time.Sleep(backoff(attempt)) }
    resp, err := h.client.Do(req)
    if shouldRetry(resp, err) { continue }
    return resp, err
}
```

---

## What You Can Do With It

The client covers the most frequently used NEPSE data surfaces:

- Market-wide
  - Summary, open/close status
  - NEPSE index plus all sub-indices and their daily graphs
  - Live market tape, supply/demand snapshot
- Securities & Companies
  - Security list, company list, sector groupings
  - Find by symbol, detailed company view
- Trading data
  - Today’s prices for a business date
  - Historical price/volume windows
  - Market depth by symbol
  - Floor sheets (security-specific and full)

Response models in `nepse/types.go` give you strongly-typed fields (e.g., `MarketSummary`, `NepseIndex`, `TodayPrice`, `FloorSheetEntry`, `MarketDepth`, `GraphResponse`).

---

## Quick Start

```go
client, err := nepse.NewClient(nil) // or nepse.NewClientWithTLS(true)
if err != nil { log.Fatal(err) }
defer client.Close(context.Background())

ctx := context.Background()
summary, err := client.GetMarketSummary(ctx)
if err != nil { log.Fatal(err) }
fmt.Printf("Turnover: %.2f\n", summary.TotalTurnover)

sec, _ := client.FindSecurityBySymbol(ctx, "NABIL")
det, _ := client.GetCompanyDetails(ctx, sec.ID)
fmt.Println(det.SecurityName, det.SectorName)
```

For a full end-to-end tour, see `cmd/examples/basic_usage.go` which exercises most endpoints with simple logging, optional graphs, and floorsheet queries.

---

## Notable Design Choices

- WebAssembly with `wazero`: Keeps the salt→index math faithful to the browser and isolated from the host process (no CGO, no JS).
- Singleflight refresh: Eliminates thundering herds when many goroutines fetch simultaneously.
- Clean separation: `auth` is transport-agnostic; `nepse` implements it and adds retries, headers, and endpoint coverage.
- Typed errors: Consumers can switch on `ErrorType` to decide retries and user messaging.
- Conservative string ops: Byte-level splicing to avoid rune pitfalls and extra allocations.

---

## Limitations & Future Work

- The token WASM is a moving part; if NEPSE changes the logic or function order, we’ll need to refresh `css.wasm` and its call pattern.
- Floor sheet and some endpoints have stricter rate limits; robust client-side caching could further reduce load.
- Expanded tests: Mock `NepseHTTP` to add more auth edge cases and fuzz indices/splicing.
- Streaming endpoints: Consider a watch/polling helper for live tape consumers.

---

## Acknowledgements

- Auth reverse-engineering inspiration: <https://github.com/basic-bgnr/NepseUnofficialApi>
- Wazero for a great embeddable WASM runtime: <https://github.com/tetratelabs/wazero>

If you build on this library or discover API changes, issues and PRs are welcome.
