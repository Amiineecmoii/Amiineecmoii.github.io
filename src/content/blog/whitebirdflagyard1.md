---
title: 'FlagY reversing Writeup'
description: 'White Bird'
pubDate: 'Dec 10 2025'
cover: /images/flagyard.png
categories: ['Blog']
tags: ['rev']
---

FlagYard is a competitive CTF platform that hosts a wide variety of challenges across multiple categories, including reverse engineering, cryptography, pwn, forensics, and web. It’s a solid environment to practice real technical skills, face non-trivial problems, and continuously sharpen your cybersecurity mindset

# 🐦 White Bird — Reverse Engineering Write-Up

**Category:** Reverse Engineering  
**Flag format:** `FlagY{...}`

---

## 1. Challenge Summary

The provided binary `White Bird.exe` is a Windows PE executable implementing a strict
character-by-character input validation routine.  
The validation logic uses arithmetic obfuscation inspired by FNV-1a hashing, but applied
incorrectly on single bytes.

The goal is to reverse the transformation logic, reconstruct the expected input, and recover
the hidden flag.

---

## 2. Binary Identification

```bash
$ file White\ Bird.exe
PE32 executable (GUI) Intel 80386, for MS Windows
```
**Observations:**

>No packer detected (UPX absent)

>Standard imports (kernel32.dll, msvcrt.dll)

>No symbols

>No anti-VM / anti-debug present

## 3. Control Flow Overview

Execution flow:
```css
entry → main → read_input → validate_input → success / failure
```
**The validation routine performs:**

>Fixed-length input check

>Loop over each input byte

>Early exit on mismatch

## 4. Input Length Determination

Static analysis (IDA) reveals a loop bounded by a constant:
```asm
cmp ecx, 28h
jl  validate_next_char
```

This indicates:
```python
Expected input length = 0x28 = 40 bytes
```

## 5. Core Validation Logic
**5.1 Decompiled Pseudocode**
```c
   for (int i = 0; i < 40; i++) {
    uint8_t b = input[i];

    uint32_t v = b;
    v ^= 0x811C9DC5;
    v *= 0x01000193;
    v &= 0xFFFFFFFF;
    v ^= 0x13333337;

    if (v != expected[i]) {
        exit(0);
    }
}
```

## 5.2 Key Properties

>Each character is validated independently

>No dependency between characters

>Immediate termination on failure

>Validation uses 32-bit arithmetic overflow

## 6. Obfuscation Analysis
**6.1 FNV-1a Constants**

| Constant     | Meaning          |
| ------------ | ---------------- |
| `0x811C9DC5` | FNV offset basis |
| `0x01000193` | FNV prime        |

However:

>FNV is meant for streams

>Here it is applied to a single byte

>No chaining → trivial inversion

## 6.2 Final XOR
```c
v ^= 0x13333337;
```

This step only obfuscates the output, it does not add cryptographic strength.

## 7. Target Comparison Table

The program compares each transformed byte against a hardcoded array of 40 DWORDs:
```c
uint32_t expected[40] = {
    0x8f8e2d72, 0x8f8e2d43, 0x8f8e2d43, 0x8f8e2d0a,
    0x8f8e2d5c, 0x8f8e2d44, 0x8f8e2d02, 0x8f8e2d0e,
    0x8f8e2d06, 0x8f8e2d44, 0x8f8e2d00, 0x8f8e2d02,
    0x8f8e2d5d, 0x8f8e2d5b, 0x8f8e2d5f, 0x8f8e2d02,
    0x8f8e2d0e, 0x8f8e2d04, 0x8f8e2d00, 0x8f8e2d5d,
    0x8f8e2d5c, 0x8f8e2d02, 0x8f8e2d04, 0x8f8e2d0e,
    0x8f8e2d5f, 0x8f8e2d04, 0x8f8e2d04, 0x8f8e2d5d,
    0x8f8e2d02, 0x8f8e2d00, 0x8f8e2d04, 0x8f8e2d5d,
    0x8f8e2d04, 0x8f8e2d5c, 0x8f8e2d00, 0x8f8e2d04,
    0x8f8e2d04, 0x8f8e2d00
};
```

## 8. Exploitation Strategy

Given:

>Input size = 40

>Each byte validated independently

>Input domain = [0x00..0xFF]

We brute-force each position individually.

**Complexity**
```bash
40 × 256 = 10,240 operations
```

## 9. Solver Implementation
```python
expected = [
    0x8f8e2d72, 0x8f8e2d43, 0x8f8e2d43, 0x8f8e2d0a,
    0x8f8e2d5c, 0x8f8e2d44, 0x8f8e2d02, 0x8f8e2d0e,
    0x8f8e2d06, 0x8f8e2d44, 0x8f8e2d00, 0x8f8e2d02,
    0x8f8e2d5d, 0x8f8e2d5b, 0x8f8e2d5f, 0x8f8e2d02,
    0x8f8e2d0e, 0x8f8e2d04, 0x8f8e2d00, 0x8f8e2d5d,
    0x8f8e2d5c, 0x8f8e2d02, 0x8f8e2d04, 0x8f8e2d0e,
    0x8f8e2d5f, 0x8f8e2d04, 0x8f8e2d04, 0x8f8e2d5d,
    0x8f8e2d02, 0x8f8e2d00, 0x8f8e2d04, 0x8f8e2d5d,
    0x8f8e2d04, 0x8f8e2d5c, 0x8f8e2d00, 0x8f8e2d04,
    0x8f8e2d04, 0x8f8e2d00
]

def transform(b):
    v = b
    v ^= 0x811C9DC5
    v = (v * 0x01000193) & 0xFFFFFFFF
    v ^= 0x13333337
    return v

flag = ""
for val in expected:
    for b in range(256):
        if transform(b) == val:
            flag += chr(b)
            break

print(flag)
```




> ⚠️ **Note on Responsible Disclosure**
>
> In respect of the **FlagYard platform rules** and the effort invested by its authors to provide **high-quality challenges**, I am **not sharing the flag directly** in this repository.


