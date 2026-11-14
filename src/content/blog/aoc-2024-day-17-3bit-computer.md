---
title: 'Advent of Code 2024 Day 17: Virtual Machine Implementation and Quine Generation'
slug: 'aoc-2024-day-17-3bit-computer'
description: 'A 3-bit virtual machine written in Go, with minimax search for generating a self-replicating program.'
date: '2025-06-11'
published: true
tags: ['adventofcode', 'quine', 'go']
---

# Advent of Code 2024 Day 17: virtual machine implementation

## 3-bit computer architecture

The puzzle describes a minimal virtual machine with three general-purpose registers and eight instructions. It works on unlimited-precision integers, and some operations encode their operand in 3 bits.

The solution needs three things:

1. A virtual machine execution engine that handles the instruction cycle properly
2. A way to resolve combo operands
3. A search for a self-replicating program, done by reverse engineering

## Virtual machine data structure

The machine state is three integer registers plus the program execution context:

```go
// Computer represents the virtual machine state
type Computer struct {
    A, B, C int   // General-purpose registers
    program []int // Instruction memory
    ip      int   // Instruction pointer
    output  []int // Output buffer
}
```

The fields:

- A, B, C: unlimited-precision integer registers for computation
- program: the instruction sequence, stored as an integer array
- ip: the program counter, tracking the current execution position
- output: accumulated output from OUT instructions

## Instruction set architecture

The machine has eight operations, encoded as opcode-operand pairs. Each instruction takes two consecutive program values.

| Opcode | Mnemonic | Operation                         |
| ------ | -------- | --------------------------------- |
| 0      | adv      | A = A / 2^combo(operand)          |
| 1      | bxl      | B = B XOR operand                 |
| 2      | bst      | B = combo(operand) % 8            |
| 3      | jnz      | if A ≠ 0 then IP = operand        |
| 4      | bxc      | B = B XOR C                       |
| 5      | out      | output.append(combo(operand) % 8) |
| 6      | bdv      | B = A / 2^combo(operand)          |
| 7      | cdv      | C = A / 2^combo(operand)          |

The implementation:

```go
switch opcode {
case 0: // adv - Division with power-of-2 denominator
    denominator := 1 << c.getComboValue(operand)
    c.A /= denominator

case 1: // bxl - Bitwise XOR with literal operand
    c.B ^= operand

case 2: // bst - Store combo value modulo 8
    c.B = c.getComboValue(operand) % 8

case 3: // jnz - Conditional jump instruction
    if c.A != 0 {
        c.ip = operand
        continue // Skip standard increment
    }

case 4: // bxc - Register B XOR register C
    c.B ^= c.C

case 5: // out - Append to output buffer
    c.output = append(c.output, c.getComboValue(operand)%8)

case 6: // bdv - Division storing result in B
    denominator := 1 << c.getComboValue(operand)
    c.B /= denominator

case 7: // cdv - Division storing result in C
    denominator := 1 << c.getComboValue(operand)
    c.C /= denominator
}
```

### Combo operand resolution

An operand is read in one of two modes: literal values (0-3) and register references (4-6).

```go
func (c *Computer) getComboValue(operand int) int {
    switch operand {
    case 0, 1, 2, 3:
        return operand          // Literal value
    case 4:
        return c.A              // Register A contents
    case 5:
        return c.B              // Register B contents
    case 6:
        return c.C              // Register C contents
    default:
        panic("Invalid combo operand 7")
    }
}
```

## Execution engine

```go
func (c *Computer) Execute() {
    for c.ip < len(c.program) {
        if c.ip+1 >= len(c.program) {
            break // Incomplete instruction pair
        }

        opcode := c.program[c.ip]
        operand := c.program[c.ip+1]

        // performOperation(opcode, operand)

        c.ip += 2 // Advance to next instruction
    }
}
```

This is the standard fetch-decode-execute cycle:

1. Fetch the opcode and operand from program memory
2. Decode the instruction type and how to interpret the operand
3. Execute the operation, modifying registers or memory as needed
4. Increment the instruction pointer by 2, unless a jump occurred

It continues until the instruction pointer goes past the end of the program.

## Quine generation algorithm

Part 2 asks for an initial value of register A that makes the program output its own instruction sequence. That makes it a self-replicating program, or quine.

### Reverse engineering approach

The program divides register A by 8 (a right shift by 3 bits) on each iteration, and the output depends on the current value of A modulo 8. So each 3-bit chunk of the initial A value maps directly to one output digit.

That means the required A value can be built from right to left, validating each 3-bit segment along the way.

```go
type candidate int

func findQuineValue(program []int) int {
    candidates := []candidate{0} // Initialize with zero base

    // Process program from final to initial position
    for pos := len(program) - 1; pos >= 0; pos-- {
        var next []candidate
        for _, tail := range candidates {
            for digit := 0; digit < 8; digit++ { // Test all 3-bit values
                head := int(tail)*8 + digit // Append digit to left side

                cpu := NewComputer(head, 0, 0, program)
                cpu.Execute()
                if len(cpu.output) >= len(program)-pos && cpu.output[0] == program[pos] {
                    next = append(next, candidate(head))
                }
            }
        }
        candidates = next
    }

    // Return minimum valid candidate
    sort.Slice(candidates, func(i, j int) bool { return candidates[i] < candidates[j] })
    return int(candidates[0])
}
```

The search builds candidate values by appending 3-bit segments from right to left and checks the output at each step. The predictable bit shifting is what lets it avoid an exhaustive search.

## Implementation analysis

Example program: `[2,4,1,3,7,5,0,3,1,4,4,7,5,5,3,0]`

How the algorithm runs on it:

1. The final output digit must be `0`. Test the 3-bit candidates `000`-`111` and retain the matches.
2. Append the next 3-bit segment on the left side and validate output digit `3`.
3. Continue until the complete program output matches.

Building the value in reverse reduces the search space from exponential to linear in program length.

## Summary

What the solution contains:

- A minimal virtual machine with an 8-instruction set and 3 registers
- Efficient combo operand resolution supporting both interpretation modes
- A reverse-engineering quine search that exploits the predictable bit patterns
- A complete solution that avoids brute-force search by generating candidates in a structured way

The virtual machine shows that a constrained instruction set can still do complex computation, self-replication included. The reverse-engineering approach is a problem-specific optimization, and here it beats a general search strategy.
