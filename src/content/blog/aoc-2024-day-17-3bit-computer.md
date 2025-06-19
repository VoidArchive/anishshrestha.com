---
title: 'Advent of Code 2024 Day 17: Virtual Machine Implementation and Quine Generation'
slug: 'aoc-2024-day-17-3bit-computer'
description: 'Technical implementation of a 3-bit virtual machine in Go with minimax search for self-replicating program generation.'
date: '2025-06-11'
published: true
tags: ['adventofcode', 'quine', 'go']
---

# Advent of Code 2024 Day 17: Virtual Machine Implementation

## 3-Bit Computer Architecture

The puzzle presents a minimalist virtual machine architecture featuring three general-purpose registers and an eight-instruction command set. The system operates on unlimited-precision integers with 3-bit operand encoding for specific operations.

Implementation requirements:

1. Virtual machine execution engine with proper instruction cycle handling
2. Combo operand resolution mechanism
3. Self-replicating program search algorithm utilizing reverse engineering approach

---

## Virtual Machine Data Structure

The virtual machine implementation requires a state container managing three integer registers and program execution context:

```go
// Computer represents the virtual machine state
type Computer struct {
    A, B, C int   // General-purpose registers
    program []int // Instruction memory
    ip      int   // Instruction pointer
    output  []int // Output buffer
}
```

Core components:

- **A, B, C**: Unlimited-precision integer registers for computation
- **program**: Instruction sequence stored as integer array
- **ip**: Program counter tracking current execution position
- **output**: Accumulated output from OUT instructions

---

## Instruction Set Architecture

The virtual machine implements eight distinct operations encoded as opcode-operand pairs. Each instruction consumes two consecutive program values for complete specification.

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

Implementation details:

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

### Combo Operand Resolution

The instruction set utilizes dual operand interpretation modes: literal values (0-3) and register references (4-6).

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

---

## Execution Engine

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

Standard fetch-decode-execute cycle:

1. Fetch opcode and operand from program memory
2. Decode instruction type and operand interpretation
3. Execute operation with appropriate register/memory modifications
4. Increment instruction pointer by 2 (unless jump occurred)

Process continues until instruction pointer exceeds program bounds.

---

## Quine Generation Algorithm

Part 2 requires finding an initial register A value that causes the program to output its own instruction sequence. This represents a self-replicating program or quine.

### Reverse Engineering Approach

Critical observation: the program systematically divides register A by 8 (right-shift by 3 bits) each iteration. The output depends on the current value of A modulo 8. This creates a direct mapping between 3-bit chunks of the initial A value and corresponding output digits.

Solution methodology: construct the required A value from right to left, validating each 3-bit segment.

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

Algorithm summary: systematically build candidate values by appending 3-bit segments from right to left, validating output correctness at each step. This approach exploits the predictable bit-shifting pattern to avoid exhaustive search.

---

## Implementation Analysis

Example program: `[2,4,1,3,7,5,0,3,1,4,4,7,5,5,3,0]`

Algorithm execution:

1. Target final output digit: `0`. Test 3-bit candidates `000`-`111`, retain matches.
2. Append next 3-bit segment to left side, validate output digit `3`.
3. Continue iteratively until complete program output matches.

The reverse construction approach reduces search space from exponential to linear in program length.

## Summary

Key implementation achievements:

- Minimal virtual machine with 8-instruction set and 3-register architecture
- Efficient combo operand resolution supporting dual interpretation modes
- Reverse-engineering quine search algorithm exploiting predictable bit patterns
- Complete solution avoiding brute-force search through structured candidate generation

The virtual machine demonstrates how constrained instruction sets can still achieve complex computational tasks including self-replication, while the reverse-engineering approach showcases problem-specific optimization over general search strategies.
