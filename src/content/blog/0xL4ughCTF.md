---
title: '0xL4ughCTF v5 - Invisible Ink'
description: 'have fun'
pubDate: 'jan 27 2026'
cover: /images/0xL4ugh.png
categories: ['misc', 'web']
tags: ['misc', 'web']
---

I played 0xL4ugh CTF V5 with my team THEM?!. I wasn’t very active during the competition, but I still solved three challenges, including this one. It was an amazing CTF with creative challenges, and I’m really looking forward to the next 0xL4ugh CTF v6 edition

## 1) 0xL4ugh CTF V5 — Invisible Ink

**Category: Misc**

**Difficulty: Easy**

**solves: 17**

## 2) Executive Summary

**The Invisible Ink challenge hides its payload inside Unicode Tag Characters (Plane 14), which are invisible when rendered. These characters encode a custom hexadecimal stream. The extracted data is then:**

>Converted from a custom hex mapping

>Reassembled from three interleaved byte streams

>Decompressed using zlib

>Decoded from Ascii85

Final flag:

```python
0xL4ugh{hiding_in_unicode_codepoint!!}
```

## 3) Challenge Description

We are provided with a sentence that visually appears normal:

```python
No files needed, here is your flag 👀
```

However, inspecting the raw text reveals a large amount of invisible Unicode characters embedded between visible letters.

## 4) Technical Analysis

Dumping codepoints of the string reveals characters in the range:

```python
U+E0000 → U+E01FF
```

These belong to the Unicode Tag block (Plane 14). They are not displayed but remain in the underlying string.

Each visible character is followed by a small group of these tag characters. Those groups form the hidden payload.


## 5) Solution Breakdown
### Step 1 — Extraction of Unicode Tag Characters

We iterate over the string and extract only characters whose codepoint satisfies:

```python
0xE0000 <= ord(c) <= 0xE01FF
```

Each tag is normalized:

```python
value = ord(c) - 0xE0100
```

The tags are grouped by visible separators.

### Step 2 — Custom Hex Decoding

The extracted values fall into two controlled ranges:

| Range         | Mapping |
| ------------- | ------- |
| `0x20 – 0x29` | `0 – 9` |
| `0x51 – 0x56` | `A – F` |

Which gives a valid hexadecimal alphabet.

Two nibbles → one byte:

```python
byte = (hi << 4) | lo
```

This produces a raw byte stream.

### Step 3 —  De-interleaving & Zlib Reconstruction

The byte stream initially appears high-entropy. However, observing repeating offsets of 78 9C reveals a zlib header every third byte.

This implies 3-way interleaving.

We reconstruct:

```python
stream1 = data[0::3]
stream2 = data[1::3]
stream3 = data[2::3]
payload = stream1 + stream2 + stream3
```

The resulting buffer begins with a valid zlib signature.

### Step 4 — Decompression and Final Encoding

Decompressing:

```python
zlib.decompress(payload)
```

Produces:

```python
0R-8JF_>B7BPD!kDJ*<jDI7O(Bk)'lARAqcA7]^uBl8#9+aj
```

The character set matches Ascii85 encoding.

Final decode:

```python
base64.a85decode(data)
```
Which reveals the flag.

```python
import base64

s = b"0R-8JF_>B7BPD!kDJ*<jDI7O(Bk)'lARAqcA7]^uBl8#9+aj"
print(base64.a85decode(s))
```