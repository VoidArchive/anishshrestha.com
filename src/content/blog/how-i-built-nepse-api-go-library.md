---
title: 'How I Built a Go Library for the NEPSE API'
slug: 'how-i-built-nepse-api-go-library'
description: 'A type-safe Go client for NEPSE with automatic token handling via css.wasm reproduction, structured errors, retries, and clean modular design.'
date: '2026-01-02'
published: true
tags: ['go', 'nepse', 'api', 'fintech', 'nepal', 'library']
---

Building a reliable API client for the Nepal Stock Exchange (NEPSE) is a rite of passage for many Nepali developers. The official NEPSE website is a treasure trove of data, but without a documented public API, accessing that data programmatically is a challenge.

I recently built go-nepse, a type-safe Go client that solves the biggest hurdles of scraping NEPSE: authentication, reliability, and type safety. Here's a deep dive into how it works.

The Challenge: Protection by Obfuscation
The most interesting part of the NEPSE API is its authentication mechanism. It's not a standard OAuth flow. When you visit the NEPSE site, it fetches a token, but that token isn't used directly.

Instead, the server sends a "proof" response containing 5 integer "salts":

```go
{
  "salt1": 105,
  "salt2": 110,
  "salt3": 99,
  "salt4": 115,
  "salt5": 112,
  "accessToken": "...",
  "refreshToken": "...",
  "serverTime": 1704234234000
}
```

The client must then use these salts to figure out which characters to remove from the accessToken before sending it back in the Authorization header.

On the official website, this logic is hidden inside a WebAssembly file named
css.wasm
(yes, named like a stylesheet to blend in). This WASM module exports functions that take the salts as input and return the indices of the "junk" characters to strip from the token.

The Solution: Embedding the WASM Runtime
Initially, I considered reverse-engineering the WASM logic and rewriting it in Go. However, that's brittle. If NEPSE changes the WASM logic detailed in
css.wasm
, my library would break.

Instead, I chose a more robust approach: embedding the WASM file directly into the Go library.

Using \_embed and the excellent wazero runtime, go-nepse executes the exact same WASM logic as the browser.

```go
//go:embed css.wasm
var cssWasm []byte
type tokenParser struct {
    rt  wazero.Runtime
    // ... exported WASM functions
}
func (p *tokenParser) indicesFromSalts(s [5]int) (tokenIndices, error) {
    // Call the WASM functions with salt permutations
    // exactly matching the browser's behavior
    // ...
}
```

This ensures that as long as the
css.wasm
file itself doesn't change drastically (or if I update the embedded file), the library behaves exactly like a legitimate browser client.

Reliability: Retries and Exponential Backoff
Scraping is inherently unstable. The NEPSE server might be under load, or rate limits might kick in. A good library should handle this gracefully.

I implemented a custom transport layer that wraps http.Client. It automatically handles retries with exponential backoff for network errors, 5xx server errors, and rate limits (429).

```go
func (c *Client) doRequest(req *http.Request) (*http.Response, error) {
    maxDelay := 30 * time.Second
    for attempt := 0; attempt <= c.options.MaxRetries; attempt++ {
        if attempt > 0 {
            // Exponential backoff: 1s, 2s, 4s...
            delay := min(c.options.RetryDelay*time.Duration(1<<uint(attempt-1)), maxDelay)
            // ... wait ...
        }
        resp, err := c.httpClient.Do(req)
        // ... handle retry conditions ...
    }
}
```

This means the user of the library doesn't need to write their own retry loops. They just call client.MarketSummary(ctx) and it works, even if the network blips.

Automatic Token Management
The
Client
struct manages the authentication lifecycle transparently. You don't need to manually fetch or refresh tokens.

When you make a request, the client checks if it has a valid token. If not, or if it's nearing expiration (tokens last about 60 seconds), it proactively fetches a new one.

Crucially, if a request fails with 401 Unauthorized, the client automatically forces a token refresh and retries the request once. This self-healing mechanism makes long-running processes (like data collectors) much more stable.

```go
// Retry once on 401 with fresh token
if resp.StatusCode == http.StatusUnauthorized && !tokenRetry {
    _ = resp.Body.Close()
    if err := c.authManager.ForceUpdate(ctx); err != nil {
        return nil, NewInternalError("failed to refresh token", err)
    }
    return c.doAuthenticatedRequest(ctx, endpoint, true)
}
```

Type Safety and Structured Errors
One of the main reasons to use Go is its type system. Parsing JSON into map[string]any is painful and error-prone.

go-nepse provides concrete structs for every API response. Whether you're fetching
MarketSummary
,
PriceHistory
, or
FloorSheet
, you get a typed struct with proper JSON tags.

I also implemented structured error handling. Instead of just returning strings, the library returns a \*NepseError which wraps the underlying error and classifies it into types like ErrorTypeNetwork, ErrorTypeRateLimit, or ErrorTypeNotFound.

```go
if err != nil {
    var nepseErr *nepse.NepseError
    if errors.As(err, &nepseErr) {
        switch nepseErr.Type {
        case nepse.ErrorTypeRateLimit:
            // Handle rate limit specifically
        }
    }
}
```

Conclusion
Building go-nepse was a fun exercise in replicating browser behavior server-side. By leveraging wazero to run the original
css.wasm
, the library achieves a level of robustness that pure reverse-engineering couldn't match.

Combined with automatic retries, transparent token management, and Go's strong typing, it provides a solid foundation for anyone building financial tools for the Nepali market.

The code is open source and available on GitHub. (Repo Link)[https://github.com/voidarchive/go-nepse]
