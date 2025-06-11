---
title: 'Advent of Code 2024: Day 17 — The 3-Bit Computer: A Feynman Explanation'
slug: 'aoc-2024-day-17-3bit-computer'
description: 'Solving the Day 17 puzzle by building a 3-bit computer, then making it self-replicate like a smug little quine.'
date: '2025-06-11'
published: true
tags: ['adventofcode', 'quine', 'go']
---

# Advent of Code 2024 — Day 17 
## The 3-Bit Computer: A Feynman Explanation

> *If you can't explain it to a six-year-old, you probably haven't bribed them with enough cookies.* — (Totally) Richard Feynman

Welcome to Day 17 of Advent of Code 2024, where Santa decided that a normal CPU was too *mainstream* and instead handed us a glorified toaster with three registers. In this post we'll:

1. Build that 3-bit computer in Go 
2. Make it do back-flips (a.k.a execute instructions)
3. Coerce it into printing its **own source code** — the programming equivalent of taking a selfie in the bathroom mirror.

Strap in. Bring snacks. This ride is only eight opcodes long.

---

## What Are We Building?

Imagine a computer that has the same amount of RAM as your bathroom scale. Three glorious slots — **A**, **B**, and **C** — each capable of storing a whole number from 0 to infinity (because integers in Go are indulgent like that).

```go
// 1:23 (but not really) computer.go

// Computer is the reason the IT department drinks.
type Computer struct {
    A, B, C int   // Three registers (aka snack boxes)
    program []int // The instruction list Santa left us
    ip      int   // Instruction pointer – where our confused CPU is staring
    output  []int // Everything the CPU blurts out loud
}
```

Think of it like this:

* **A, B, C** – three breakfast cereal boxes you shove numbers into.
* **program** – a TODO list written on the fridge.
* **ip** – the magnet pointing at the current line on that list.
* **output** – the notes you stick on Twitter afterwards.

---

## The Instruction Set (8 Tiny Friends)

Each instruction is a pair: `[opcode, operand]`. There are only eight opcodes (0-7) because powers of two are aesthetic.

<details>
<summary aria-label="Toggle opcode table" class="flex items-center gap-2 cursor-pointer hover:text-primary-red">
    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1.5 12s4.5-7 10.5-7 10.5 7 10.5 7-4.5 7-10.5 7S1.5 12 1.5 12z" />
        <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" />
    </svg>
</summary>

| Opcode | Mnemonic | What It Does |
| ------ | -------- | ------------ |
| 0 | adv | Divide A by 2^operand (a.k.a A >>= operand) |
| 1 | bxl | B = B XOR operand |
| 2 | bst | B = value(operand) & 0b111 (keep 3 bits) |
| 3 | jnz | If A ≠ 0 jump to operand |
| 4 | bxc | B = B XOR C (operand ignored, sorry operand) |
| 5 | out | Push value(operand) & 0b111 to output |
| 6 | bdv | Same as opcode 0 but for B |
| 7 | cdv | Same again but for C |

</details>

Below is an annotated decoder ring for each:

```go
switch opcode {
case 0: // adv – Advanced division, fancy name for shifting right
    denominator := 1 << c.getComboValue(operand) // 2^operand
    c.A /= denominator

case 1: // bxl – Box XOR Literal (the letter "x" because edginess)
    c.B ^= operand

case 2: // bst – Box Store Truncated (kids, mod 8 is basically &7)
    c.B = c.getComboValue(operand) % 8

case 3: // jnz – Jump if Not Zero (parkour!)
    if c.A != 0 {
        c.ip = operand
        continue // Skip usual ip+=2 dance
    }

case 4: // bxc – Box XOR C, operand is just here for moral support
    c.B ^= c.C

case 5: // out – Tell the world
    c.output = append(c.output, c.getComboValue(operand)%8)

case 6: // bdv – B Divide (same as adv but starring B)
    denominator := 1 << c.getComboValue(operand)
    c.B /= denominator

case 7: // cdv – C Divide (featuring C in the lead role)
    denominator := 1 << c.getComboValue(operand)
    c.C /= denominator
}
```

### The Combo-Meal Operands 🍔

Sometimes the operand is a literal (0-3), sometimes it's a reference to a box (4-6). Think drive-through menu numbers:

```go
func (c *Computer) getComboValue(operand int) int {
    switch operand {
    case 0, 1, 2, 3:
        return operand          // Literal nuggets
    case 4:
        return c.A              // Value Meal A
    case 5:
        return c.B              // Value Meal B
    case 6:
        return c.C              // Value Meal C
    default:
        panic("Combo #7 is discontinued, sorry")
    }
}
```

---

## Main Execution Loop — The Groundhog Day

```go
func (c *Computer) Execute() {
    for c.ip < len(c.program) {
        if c.ip+1 >= len(c.program) {
            break // Half an instruction — go home, Santa, you're drunk
        }

        opcode := c.program[c.ip]
        operand := c.program[c.ip+1]

        // performOperation(opcode, operand) – see giant switch above

        c.ip += 2 // Next dance move
    }
}
```

It's the same 4-step we all learned in CS101:

1. Read instruction
2. Panic quietly
3. Do the thing
4. Shuffle two to the right

Repeat until either the program ends or the ancient prophecy triggers.

---

## Part 2: The **Quine** Quest 🪞

A *quine* is a program that prints itself. Basically, narcissism as code. The puzzle asks: *What starting value for register A makes our 3-bit diva recite its own opcodes?*

### The Backwards Brainstorm

Key observation: every lap through the loop chops **A**'s *last three bits* off (thanks to that division by 8). Those three bits *also* influence what gets printed. So the output is generated from right to left, one 3-bit chunk at a time. Solution: work in reverse.

```go
type candidate int // (for semantic smugness)

func findQuineValue(program []int) int {
    candidates := []candidate{0} // Start with empty tail

    // Traverse program from last to first
    for pos := len(program) - 1; pos >= 0; pos-- {
        var next []candidate
        for _, tail := range candidates {
            for digit := 0; digit < 8; digit++ { // 3-bit possibilities
                head := int(tail)*8 + digit // Glue new bits on the left

                cpu := NewComputer(head, 0, 0, program)
                cpu.Execute()
                if len(cpu.output) >= len(program)-pos && cpu.output[0] == program[pos] {
                    next = append(next, candidate(head))
                }
            }
        }
        candidates = next
    }

    // Smallest narcissist wins
    sort.Slice(candidates, func(i, j int) bool { return candidates[i] < candidates[j] })
    return int(candidates[0])
}
```

The algorithm is basically: *grow a number from right to left while gate-checking at each step*. Kinda like Wordle but for binary and with less rage-quitting.

---

## Mini Walkthrough (With Bad Jokes™)

Given program: `[2,4,1,3,7,5,0,3,1,4,4,7,5,5,3,0]`

1. We need the final output digit to be `0`. Try `000`, `001`, …, `111`. Keep the ones that spit out `0`.
2. Slap another chunk to the **left** (shift-add), test again for digit `3`.
3. Rinse & repeat while your coffee cools.

After a few iterations you'll find the holy grail value for **A**. Spoiler: it's not 42 — Doug Adams is disappointed.

---

## TL;DR

* 3-bit computer = tiny, adorable, and disturbingly capable of self-reflection.
* Eight opcodes is plenty when you're clever (or sadistic).
* Working **backwards** with bit-chunks avoids the brutish search space.
* Every quine is a mirror. Try not to stare too long, or you'll start seeing Segmentation Faults.

---

*PS: All mistakes are my compiler's fault.* 