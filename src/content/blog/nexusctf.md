---
title: 'NexusCTF writeup'
description: 'This challenge was first-blooded and only solved by me during the entire competition. Let’s dig deep and break down the reversing process step by step'
pubDate: 'Dec 13 2025'
cover: /images/nexusctf.png
categories: ['Blog', 'Writeup']
tags: ['rev', 'crypto']
---

This challenge was first-blooded and only solved by me during the entire competition , if you’re a reverse engineering enthusiast, this blog is for you. Let’s dive in and break down the reversing process step by step , have  fun, See you next year at NexHuntCTF


---
## 📎 Attachments
[eleonoras](/attatchement/nexusctf/eleonoras)


## 1) Overview

This challenge is a **high-quality VM-based reverse-engineering problem** combining:

- A custom bytecode virtual machine
- Heavy static linking and stripping
- Intentional decoy cryptography
- Multi-segment encrypted flag reconstruction

No patching, no brute force, no hooking — the solution requires **pure understanding of execution semantics**.

---

## 2) Binary Properties

- **Architecture:** x86_64  
- **Type:** ELF  
- **Statically linked**  
- **Stripped (no symbols)**  
- **No libc imports**  
- **Custom syscalls only**

This immediately rules out:
- LD_PRELOAD tricks
- Easy dynamic analysis
- Simple string extraction

---

## 4) Entry Point & Runtime Noise

Execution begins in `_start` and flows through a large amount of boilerplate:

- TLS initialization  
- `arch_prctl`  
- signal masking  
- stack guards  
- relocation fixups  

This stage exists purely to **hide real logic** and slow down analysis.

Eventually execution reaches: `sub_402620(...)`
which calls a function pointer resolved at runtime.
That pointer leads to:

*This is the **core of the challenge**.*

## 5) Identifying the Virtual Machine

### Function: `sub_401DE0`

This function contains:

- An infinite loop
- A bytecode pointer
- A program counter
- A massive `switch` on a single byte

This is a classic **Fetch-Decode-Execute VM loop**:
`FETCH → opcode = bytecode[pc]`
`DECODE → switch(opcode)`
`EXEC → handler`

### VM State

| Variable | Role |
|--------|-----|
| `qword_4CF360` | Program Counter |
| `qword_4CF378` | Instruction Counter |
| `qword_4CCB60` | VM Registers / Memory |
| `byte_4CCB20`  | Output Buffer (Flag) |

---

## 6) Opcode Analysis

The dispatcher contains **30+ opcode cases**.

Most opcodes:
- Modify VM memory
- Adjust the PC
- Exist purely as noise

Only **one opcode is relevant**.

---

## 7) Opcode 16 — Segment Controller

Opcode **16 (0x10)** is the only meaningful instruction.

Important observation:
> Opcode 16 does **not decrypt the flag directly**.

Instead, it:
1. Selects a **segment index (0–4)**
2. Chooses a **key address**
3. Chooses a **ciphertext address**
4. Calls a shared worker function

### Segment Routing

| Segment | Key Address | Cipher Address |
|-------|------------|----------------|
| 0 | `0x4A4080` | `0x4A4100` |
| 1 | `0x4A4040` | `0x4A40F0` |
| 2 | `0x4A4000` | `0x4A40E0` |
| 3 | `0x4A3FC0` | `0x4A40D0` |
| 4 | `0x4A3F80` | `0x4A40C0` |

Each segment is processed independently.

---

## 8) The Decoy Trap

The function called by opcode 16 (`sub_401C50`) appears to implement encryption logic using:

- XOR chains
- SIMD instructions
- Magic constants
- Rolling math

Running it *as written* produces a fake flag.

This logic is **intentionally misleading**.

The real cryptography must be reconstructed **semantically**, not by copying the C code.

---

## 9) Real Cryptographic Logic (Recovered)

Each flag segment is decrypted independently.

### Step 1 — Polynomial Unfolding

For byte index `i`:

`poly(i) = i² + 7i + 13`

Apply:

---

### Step 2 — Keystream Generation

Generate a keystream using:
```python3
HMAC-SHA512(
key = segment_key,
message = segment_key
)
```

Repeat or truncate to segment length.

---

### Step 3 — Dual Keystream XOR

Apply keystream twice:
```python
stage2[i] = stage1[i] XOR keystream[len-1-i]
plaintext[i] = stage2[i] XOR keystream[i]
```

---
## 10) Extracting Keys and Ciphertexts from .rodata
After identifying the VM dispatcher (sub_401DE0) and isolating opcode 16, the next critical step was extracting the static cryptographic material embedded in the binary.

Opcode *16* does not perform decryption itself.
Instead, it acts as a dispatcher that selects:

which flag segment to process,

which key to use,

and which ciphertext buffer to decrypt.

The actual decryption logic is delegated to a shared worker function.

## 11) Opcode 16 — Segment Dispatcher
Inside 'sub_401DE0', opcode *16* contains a nested switch that selects the segment index (0 → 4) and maps it to a key pointer and a ciphertext pointer.

Conceptually, the logic looks like this:
```python
case 16:
    switch (segment_id) {
        case 0: key = 0x4A4080; cipher = 0x4A4100; break;
        case 1: key = 0x4A4040; cipher = 0x4A40F0; break;
        case 2: key = 0x4A4000; cipher = 0x4A40E0; break;
        case 3: key = 0x4A3FC0; cipher = 0x4A40D0; break;
        case 4: key = 0x4A3F80; cipher = 0x4A40C0; break;
    }
```
## 12) Key Extraction
Each segment key is 64 bytes long, stored contiguously in .rodata.

**Example — Segment 0 key:**
>Address : 0x4A4080

>Length  : 64 bytes

**Hex dump:**
>c0e97a6b15beb64963e3d94e3cd05c3f
>
>7f030d57081f474d39417b0857216480
>
>e74a79069dadc385b8ca87cf46e8269a
>
>6c5f10b5195f6007e8d8821e18bedbf1

## 13) Ciphertext Extraction
Each ciphertext is a short fixed buffer (10–11 bytes), also stored in .rodata.

**Example — Segment 0 ciphertext:**
>Address : 0x4A4100

>Bytes   : 7c 02 d6 e9 77 16 7e aa 63 c0 d5

>Length  : 11 bytes
## 14) Final Mapping 
```python
KEYS = [
    KEY_0,  # @ 0x4A4080
    KEY_1,  # @ 0x4A4040
    KEY_2,  # @ 0x4A4000
    KEY_3,  # @ 0x4A3FC0
    KEY_4,  # @ 0x4A3F80
]

CIPHERS = [
    CIPHER_0,  # @ 0x4A4100
    CIPHER_1,  # @ 0x4A40F0
    CIPHER_2,  # @ 0x4A40E0
    CIPHER_3,  # @ 0x4A40D0
    CIPHER_4,  # @ 0x4A40C0
]
```
**At this stage:**

No patching was required

No brute-forcing was involved

All secrets were recovered statically
## 15) Final Trick — Deck-of-Cards Reassembly

The flag is **not concatenated**.

It is reconstructed using **modulo-5 interleaving**:
```
seg0[0], seg1[0], seg2[0], seg3[0], seg4[0],
seg0[1], seg1[1], ...
```
```python
import hmac, hashlib, struct

KEYS = [
    bytes.fromhex(
        "c0e97a6b15beb64963e3d94e3cd05c3f"
        "7f030d57081f474d39417b0857216480"
        "e74a79069dadc385b8ca87cf46e8269a"
        "6c5f10b5195f6007e8d8821e18bedbf1"
    ),
    bytes.fromhex(
        "bd849882bd87b854aa80dfd3c01a95d4"
        "14bd1c2b9057c67e966a1c90ad4d1a86"
        "89cbd5fd65fe8b739a4c131032b0ceb6"
        "b501130de0455d440ebd5ff2dd441090"
    ),
    bytes.fromhex(
        "514d7b0a3a05795b34a847346fe35674"
        "dd6dc53cdac7efb3b493b06bdb06a092"
        "4cb1e1a532bc1d4efb14b3a73db32c88"
        "e990733745afa0488e92fde58b79da4f"
    ),
    bytes.fromhex(
        "5652b6fee939b5ebae2ed5b29ee842d0"
        "d9408339a27a0ecd9b20c202ae0d6f96"
        "a014e94f539d03c627514209ef0a783c"
        "234e0cc680e1b96971947e91905871ff"
    ),
    bytes.fromhex(
        "9429d0e16d31e060849f7e7e1e086953"
        "9dde5d5e3dcc5d80d0da883e39a2bf06"
        "29bfd69fe102536a6455b0f9091b3b7a"
        "62984c217e7884ee290798e8b99f50ee"
    ),
]

CIPHERS = [
    bytes.fromhex("7c02d6e977167eaa63c0d5"),
    bytes.fromhex("e0451259cdba4262fe24"),
    bytes.fromhex("e7d180dba2d5f1a11661"),
    bytes.fromhex("de7e988ed4adfeb9f75c"),
    bytes.fromhex("ada457971978ce237e29"),
]

def poly(i):
    return (i*i + 7*i + 13) & 0xFF

def keystream(key, n, endian):
    out = b""
    c = 0
    while len(out) < n:
        if endian == "little":
            msg = c.to_bytes(8, "little")
        else:
            msg = struct.pack(">Q", c)
        out += hmac.new(key, msg, hashlib.sha512).digest()
        c += 1
    return out[:n]

def decrypt_one(key, ct, endian):
    n = len(ct)
    ks = keystream(key, n, endian)
    a = bytearray(n)
    for i in range(n):
        a[i] = ct[i] ^ poly(i)
    b = bytearray(n)
    for i in range(n):
        b[i] = a[i] ^ ks[n-1-i]
    c = bytearray(n)
    for i in range(n):
        c[i] = b[i] ^ ks[i]
    return bytes(c)

def assemble_mod5(segments):
    out = bytearray()
    m = max(len(s) for s in segments)
    for i in range(m):
        for s in segments:
            if i < len(s):
                out.append(s[i])
    return bytes(out)

def run(endian):
    segs = [decrypt_one(KEYS[i], CIPHERS[i], endian) for i in range(5)]
    raw = b"".join(segs)
    deck = assemble_mod5(segs)
    for cand in (raw, deck):
        if b"nexus{" in cand and cand.count(b"{") == 1 and cand.count(b"}") == 1:
            try:
                print(cand.decode())
                return True
            except:
                pass
    return False

if not run("little"):
    run("big")
```


> flag : nexus{t4k3_taa4t_4dv444nt_33ge_4nd_st000p_cry11ngg}

**would like to extend my sincere gratitude to N!L for designing this exceptional challenge. I look forward to participating again next year**

