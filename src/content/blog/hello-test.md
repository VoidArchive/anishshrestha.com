---
title: 'Hello Test - My First Blog Post'
slug: 'hello-test'
description: 'Welcome to my blog! This is a test post to showcase the MDsvex integration.'
date: '2024-12-27'
published: true
tags: ['hello', 'test', 'mdsvex', 'sveltekit']
---

# Hello, World!

Welcome to my first blog post! This is a test to demonstrate how **MDsvex** works with SvelteKit.

## What is MDsvex?

MDsvex allows you to write Svelte components directly in your Markdown files. It's perfect for creating interactive blog posts with the simplicity of Markdown and the power of Svelte.

## Some Cool Features

- **Markdown syntax** for easy writing
- **Svelte components** for interactivity  
- **Syntax highlighting** for code blocks
- **Frontmatter** for metadata

### Code Example

Here's some Go code (my favorite language):

```go
package main

import "fmt"

func main() {
    fmt.Println("Hello from Go!")
    
    // Simple function
    result := add(5, 3)
    fmt.Printf("5 + 3 = %d\n", result)
}

func add(a, b int) int {
    return a + b
}
```

### Python Example

And some Python for data processing:

```python
def fibonacci(n):
    """Generate fibonacci sequence up to n terms."""
    if n <= 0:
        return []
    elif n == 1:
        return [0]
    
    sequence = [0, 1]
    for i in range(2, n):
        sequence.append(sequence[i-1] + sequence[i-2])
    
    return sequence

# Generate first 10 fibonacci numbers
fib_numbers = fibonacci(10)
print(f"First 10 fibonacci numbers: {fib_numbers}")
```

## My Philosophy

As mentioned in my bio, I believe most software is **overengineered**. I prioritize:

1. **Predictable performance** over clever abstractions
2. **Radical minimalism** in frontend development
3. **Go** for distributed systems
4. **Python** for data-heavy workloads

And yes, I use **vim** btw. 😄

## Markdown Test Playground

Below is an exhaustive collection of Markdown features so I can eyeball how each renders in the blog theme.

### Headings

# H1 Heading (should rarely be used inside a post)
## H2 Heading
### H3 Heading
#### H4 Heading
##### H5 Heading
###### H6 Heading

### Paragraphs & Line Breaks

This is a normal paragraph followed by two spaces  
which forces a line break.

### Emphasis

*Italic* or _italic_  
**Bold** or __bold__  
***Bold italic***  
~~Strikethrough~~  
<ins>Underline (HTML)</ins>

### Blockquotes

> Single-level blockquote
>
> > Nested blockquote

### Lists

Unordered list:

* First item
* Second item
  * Sub-item one
  * Sub-item two

Ordered list with nested unordered list:

1. First task
2. Second task
   * Sub task A
   * Sub task B
3. Third task

Checklist (GitHub Flavored):

- [x] Write code
- [ ] Ship

### Links

Standard link to [GitHub Pages](https://pages.github.com/).  
Auto-linked bare URL: <https://svelte.dev>

### Images

![Svelte Logo](https://raw.githubusercontent.com/sveltejs/branding/master/svelte-logo.svg)

### Tables

| Syntax | Description |
| ------ | ----------- |
| Header | Title       |
| Paragraph | Text    |

### Horizontal Rules

---

### Inline Code & Code Blocks

Inline `const answer = 42` example.

```js
// JavaScript fenced code block
function greet(name) {
  console.log(`Hello, ${name}!`);
}

export default greet;
```

### Definition List

Term  
: Definition of the term.

### Footnotes

Here is a statement that needs a footnote.[^1]

[^1]: This is the footnote content.


Thanks for reading! More technical deep-dives coming soon... 