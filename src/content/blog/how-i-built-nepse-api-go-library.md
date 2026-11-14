---
title: 'How I Built a Go Library for the NEPSE API'
slug: 'how-i-built-nepse-api-go-library'
description: 'A type-safe Go client for NEPSE that runs the original css.wasm to handle tokens automatically, with structured errors, retries and a modular design.'
date: '2026-01-02'
published: true
tags: ['go', 'nepse', 'api', 'fintech', 'nepal', 'library']
series: 'system-design'
project: 'go-nepse'
---

A lot of Nepali developers end up writing an API client for the Nepal Stock Exchange (NEPSE) at some point. The official NEPSE website has a lot of data but no documented public API, so getting at that data from code is hard.

I recently built go-nepse, a type-safe Go client that handles the biggest hurdles of scraping NEPSE: authentication, reliability, and type safety. This post goes through how it works.

## The challenge: protection by obfuscation

The most interesting part of the NEPSE API is its authentication mechanism, which is not a standard OAuth flow. When you visit the NEPSE site, it fetches a token, but that token isn't used directly.

The server sends a "proof" response containing 5 integer "salts":

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

The client must then use these salts to figure out which characters to remove from the `accessToken` before sending it back in the Authorization header.

On the official website, this logic is hidden inside a WebAssembly file named `css.wasm` (yes, named like a stylesheet to blend in). This WASM module exports functions that take the salts as input and return the indices of the "junk" characters to strip from the token.

## The solution: embedding the WASM runtime

At first I considered reverse-engineering the WASM logic and rewriting it in Go, but that's brittle. If NEPSE changes the WASM logic detailed in `css.wasm`, my library would break.

So I embedded the WASM file directly into the Go library.

Using Go’s `embed` package and the excellent wazero runtime, go-nepse runs the exact same WASM logic as the browser.

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

As long as the `css.wasm` file itself doesn't change drastically (or if I update the embedded file), the library behaves exactly like a legitimate browser client.

## Reliability: retries and exponential backoff

Scraping is unstable. The NEPSE server might be under load, or rate limits might kick in, and a library should cope with both.

I wrote a custom transport layer that wraps `http.Client`. It retries with exponential backoff on network errors, 5xx server errors, and rate limits (429).

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

Users of the library don't need to write their own retry loops. They call `client.MarketSummary(ctx)` and it works, even if the network blips.

## Automatic token management

The `Client` struct manages the authentication lifecycle, so you don't need to fetch or refresh tokens yourself.

When you make a request, the client checks if it has a valid token. If not, or if it's nearing expiration (tokens last about 60 seconds), it fetches a new one first.

If a request fails with 401 Unauthorized, the client forces a token refresh and retries the request once. That makes long-running processes (like data collectors) much more stable.

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

## Type safety and structured errors

One of the main reasons to use Go is its type system. Parsing JSON into `map[string]any` is painful and error-prone.

go-nepse has concrete structs for every API response. Whether you're fetching `MarketSummary`, `PriceHistory`, or `FloorSheet`, you get a typed struct with proper JSON tags.

Errors are structured too. The library returns a `*NepseError`, which wraps the underlying error and classifies it into types like `ErrorTypeNetwork`, `ErrorTypeRateLimit`, or `ErrorTypeNotFound`.

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

## Conclusion

Building go-nepse was a fun exercise in replicating browser behavior server-side. Because it uses wazero to run the original `css.wasm`, the library is more robust than a pure reverse-engineered version could be.

With automatic retries, token management, and Go's strong typing on top, it should be a solid base for anyone building financial tools for the Nepali market.

The code is open source and on GitHub. [View the repository](https://github.com/voidarchive/go-nepse)
