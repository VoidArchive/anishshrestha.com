---
title: 'Building a Unified Payment SDK for Nepal in Go'
slug: 'building-nepal-payment-sdk-go'
description: 'A type-safe Go SDK that puts eSewa, Khalti, ConnectIPS and FonePay behind one interface and handles their HMAC signatures and RSA certificates.'
date: '2026-01-14'
published: true
tags: ['go', 'payments', 'nepal', 'fintech', 'sdk', 'open-source']
series: 'system-design'
project: 'nepal-payment-go'
---

Integrating payment gateways in Nepal is painful because each provider has its own authentication scheme, callback format, and quirks. eSewa wants Form POST with HMAC-SHA256. Khalti uses API keys with JSON. ConnectIPS requires RSA-signed certificates. FonePay has HMAC-SHA512.

I built nepal-payment-go to deal with that. It is a single Go SDK with one interface for all major Nepali payment providers.

## The problem

Say you're building an e-commerce site and want to accept payments. Without a unified SDK, your code looks like this:

```go
// eSewa: Form POST with HMAC signature
signature := hmac.New(sha256.New, []byte(secret))
signature.Write([]byte(message))
formFields["signature"] = base64.StdEncoding.EncodeToString(signature.Sum(nil))
// POST form to eSewa...

// Khalti: JSON API with Bearer token
req.Header.Set("Authorization", "Key "+secretKey)
resp, _ := http.Post(khaltiURL, "application/json", jsonBody)
// Parse JSON response...

// ConnectIPS: RSA-SHA256 digital signature
hash := sha256.Sum256([]byte(message))
signature, _ := rsa.SignPKCS1v15(rand.Reader, privateKey, crypto.SHA256, hash[:])
// POST form with certificate...
```

That is three providers and three completely different implementations. You still have to add error handling, callback verification, and amount validation to each one, and then maintain all of it.

## The solution: one interface

nepal-payment-go puts all of this behind a single `Provider` interface:

```go
type Provider interface {
    InitiatePayment(ctx context.Context, req *PaymentRequest) (*PaymentResponse, error)
    VerifyPayment(ctx context.Context, req *VerifyRequest) (*VerifyResponse, error)
}
```

The calling code is then identical whichever provider you use:

```go
// Works for eSewa, Khalti, ConnectIPS, or FonePay
resp, err := provider.InitiatePayment(ctx, &core.PaymentRequest{
    Amount:      10000,
    OrderID:     "ORDER-123",
    Description: "Premium Subscription",
    CallbackURL: "https://yoursite.com/callback",
})

if resp.IsFormPOST {
    // Render HTML form with resp.FormFields
} else {
    // Redirect to resp.TargetURL
}
```

## Under the hood: handling each provider's quirks

### eSewa: HMAC-SHA256 signatures

eSewa uses a Form POST flow. You generate an HMAC-SHA256 signature of the payment parameters and submit a hidden form that auto-redirects the user.

```go
func (p *Provider) generateSignature(message string) string {
    mac := hmac.New(sha256.New, []byte(p.config.SecretKey))
    mac.Write([]byte(message))
    return base64.StdEncoding.EncodeToString(mac.Sum(nil))
}
```

The callback returns a Base64-encoded JSON payload. The SDK decodes it, verifies the signature, and returns a `VerifyResponse`.

### Khalti: REST API with JSON

Khalti is the simplest: a standard REST API with API key authentication. The SDK handles the HTTP requests, JSON marshaling, and status normalization.

```go
req.Header.Set("Authorization", "Key "+p.config.SecretKey)
req.Header.Set("Content-Type", "application/json")
```

Khalti also uses paisa (NPR × 100) for amounts, which the SDK handles for you.

### ConnectIPS: RSA certificates

ConnectIPS is the most complex. It requires a `.pfx` certificate file from NCHL (Nepal Clearing House) and uses RSA-SHA256 for signing.

```go
func (p *Provider) signMessage(message string) (string, error) {
    hash := sha256.Sum256([]byte(message))
    signature, err := rsa.SignPKCS1v15(rand.Reader, p.privateKey, crypto.SHA256, hash[:])
    return base64.StdEncoding.EncodeToString(signature), err
}
```

The SDK loads PFX/PEM certificates automatically and handles the NCHL-specific form fields like `TXNID`, `MERCHANTID`, and `TOKEN`.

### FonePay: HMAC-SHA512

FonePay uses a redirect flow with HMAC-SHA512 signature verification:

```go
func (p *Provider) generateHMAC(message string) string {
    mac := hmac.New(sha512.New, []byte(p.config.SecretKey))
    mac.Write([]byte(message))
    return hex.EncodeToString(mac.Sum(nil))
}
```

## Verification: the critical part

Payment verification is where most bugs happen. You have to confirm that the user actually paid, that the amount is correct, and that the callback was not tampered with.

The SDK handles all of this:

```go
result, err := provider.VerifyPayment(ctx, &core.VerifyRequest{
    EncodedParams:  callbackParams,
    ExpectedAmount: 10000,
})

if errors.Is(err, core.ErrAmountMismatch) {
    // Someone tried to pay less!
}
if errors.Is(err, core.ErrSignatureMismatch) {
    // Callback was tampered with
}

if result.Success {
    // Fulfill the order
}
```

Each provider has different callback formats, but the SDK normalizes them all to the same `VerifyResponse` struct.

## Status normalization

Each provider returns different status strings:

| Provider   | Success     | Pending   | Failed    |
| ---------- | ----------- | --------- | --------- |
| eSewa      | "COMPLETE"  | "PENDING" | "FAILURE" |
| Khalti     | "Completed" | "Pending" | "Expired" |
| ConnectIPS | "SUCCESS"   | "PENDING" | various   |
| FonePay    | "true"      | "pending" | "false"   |

The SDK maps these to one set of constants:

```go
const (
    StatusComplete  = "complete"
    StatusPending   = "pending"
    StatusFailed    = "failed"
    StatusCancelled = "cancelled"
)
```

## Zero external dependencies

The core package has zero external dependencies. The only exception is ConnectIPS, which uses `golang.org/x/crypto/pkcs12` for PFX certificate parsing.

Everything else (HMAC, SHA256, SHA512, RSA, Base64) uses Go's standard library.

## Testing

The SDK has table-driven tests for each provider:

```bash
$ go test ./...
ok  providers/connectips  0.257s
ok  providers/esewa       0.004s
ok  providers/fonepay     0.002s
ok  providers/khalti      0.007s
```

Each test covers configuration validation, payment initiation, callback verification, signature validation, and error handling.

## Getting started

```bash
go get github.com/voidarchive/nepal-payment-go
```

```go
import "github.com/voidarchive/nepal-payment-go/providers/esewa"

provider, _ := esewa.New(esewa.Config{
    SecretKey:   "8gBm/:&EnhH.1/q",  // Sandbox
    ProductCode: "EPAYTEST",
    Sandbox:     true,
})

resp, _ := provider.InitiatePayment(ctx, &core.PaymentRequest{
    Amount:      100,
    OrderID:     "TEST-001",
    CallbackURL: "http://localhost:8080/callback",
})
```

The repo also includes a combined demo server with all 4 providers:

```bash
go run ./examples/demo/
# Open http://localhost:8080
```

## What's next?

The SDK covers the major players: eSewa, Khalti, ConnectIPS, and FonePay. Counting the IME Pay + Khalti merger, that effectively covers the vast majority of digital payments in Nepal.

I could add CellPay and PrabhuPay later if their APIs become more accessible.

## Conclusion

The code is open source and on GitHub: [github.com/voidarchive/nepal-payment-go](https://github.com/voidarchive/nepal-payment-go)
