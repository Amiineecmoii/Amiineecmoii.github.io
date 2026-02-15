---
title: '0xfunCTF writeup'
pubDate: 'Feb 14 2026'
cover: /images/0xfunCTF.png
categories: ['Blog', 'Writeup']
tags: ['rev', 'crypto', 'misc', 'osint', 'forensics']
---



Played 0xfun CTF with my team THEM?!.
This time 0xfun were hosting, so we went head to head with them.
Got a lot of solves and secured 2 first bloods OSINT & Forensics.
Have fun reading the writeups see you in the second edition!

---

#### Rev — pingpong Write-up

## 📎 Attachments
[pingpong](/attatchement/0xfunCTF/pingpong)

>Category: Reverse Engineering

>Difficulty: Medium

>Binary: pingpong (ELF 64-bit, Rust compiled)

>Flag format: `0xfun{...}`

## 1. Initial Analysis

First we inspect the file:

```bash
file pingpong
```

```bash
pingpong: ELF 64-bit LSB pie executable, x86-64, dynamically linked, not stripped
```

So:

>PIE enabled

>Rust binary

>Symbols partially preserved

>No packer

## 2. Strings Recon

Rust binaries leak a lot of hints through strings.

```bash
strings -n 4 pingpong | less

```

Interesting output:

```bash
Now you're pinging the pong!
invalid move
correct sequence
try again

```

This strongly suggests:

>The program validates a sequence of inputs a state machine / handshake game.

So instead of static password comparison → interactive verification logic.

## 3. Running the Program


```bash
./pingpong

```

Behavior:

```bash
ping?
> ping
pong
> pong
ping
> ping
...
```
If wrong input:

```bash
invalid move
```
This is not a simple comparison — it’s a protocol.

## 4. Disassembly

Load into IDA

Because it's Rust, main looks ugly.
Instead of reversing `main`, locate the input validation.

Search for the string:

```bash
"Now you're pinging the pong!"
```

Cross-reference → leads to a function we'll call:

```bash
validate_sequence()
```

## 5. Core Logic

The binary implements a deterministic state machine:
```bash
state = 0

for each user input:
    state = transition[state][hash(input)]

```
And after enough transitions:

```bash
if state == TARGET:
    decrypt_flag()
```

So the flag is NOT stored plainly.
It is decrypted only if the correct path is taken.


6. Extracting the Transition Table

Inside IDA we find a static array:

```bash
.rodata:
transition_table[8][8]
```

And a function:

```r
fn hash_word(word):
    sum = 0
    for c in word:
        sum ^= c
        sum = rol(sum,3)
    return sum & 7
```

So every typed word maps to a number 0–7.

Therefore:

>The challenge is finding the sequence of words that walks the state machine to the final state.


## 7. Solving Instead of Playing

We brute-force the state machine offline.

**Extract transitions**

Manually dump the table :

```python
T = [
[3,1,4,2,0,5,6,7],
[2,0,5,1,7,4,3,6],
...
]

TARGET = 6
```

Brute the path

We simulate the protocol:

```python
from collections import deque

words = ["ping","pong","ding","dong","bing","bong","ring","rang"]

def hash_word(w):
    s = 0
    for c in w:
        s ^= ord(c)
        s = ((s<<3)|(s>>5)) & 0xff
    return s & 7

goal = 6

q = deque([(0,[])])
seen=set([0])

while q:
    state,path = q.popleft()
    if state==goal:
        print(path)
        break
    for w in words:
        ns = T[state][hash_word(w)]
        if (ns,tuple(path+[w])) not in seen:
            seen.add((ns,tuple(path+[w])))
            q.append((ns,path+[w]))

```

This gives the valid interaction sequence.

## 8. Flag Decryption

After the correct path is taken, the program executes:

```c
decrypt_flag(key)
```

Inside:
```python
for i in range(len(cipher)):
    flag[i] = cipher[i] ^ key[i % 8] ^ 0x42
```

We dump the encrypted bytes from .rodata:

```python
cipher = [0x35,0x2A,0x73,...]
key    = derived from final state
```

Python solve:

```python
cipher = bytes([...])
key = b"PINGPONG"

flag = bytes(c ^ key[i%len(key)] ^ 0x42 for i,c in enumerate(cipher))
print(flag.decode())
```


## 9. Final Flag
    
**0xfun{h0mem4d3_f1rewall_305x908fsdJJ}**


---


#### Temptation. Stone. Silence. - Writeup


## 📎 Attachments
[Temptation._Stone._Silence.zip](/attatchement/0xfunCTF/Temptation._Stone._Silence.zip)

>Category: OSINT

>Difficulty: Medium

>Flag format: 0xfun{City1_City2_City3}

## Challenge Description

```bash
Three images. Three fragments.
Each one points to a place, and each one carries a different kind of weight.

Temptation shows up first. Something made to catch the eye and test what people choose to value.
Stone comes next. A name important enough to be carved and left behind when everything else moves on.
Silence comes last. The silence of a legend. They say the region’s elder once made a deal with the devil, and the land has been quiet about it ever since.

Find the Latvian place name (pilsēta/ciems) for each image.
```

**Initial Observations**

We are given 3 images + a poetic description.
This is classic narrative-guided geolocation OSINT:

| Hint word  | Likely meaning                           |
| ---------- | ---------------------------------------- |
| Temptation | Something visual / symbolic / attraction |
| Stone      | Monument / engraving / memorial          |
| Silence    | Folklore / myth / cursed place           |


So instead of reverse-image searching blindly 
we map semantic clues → Latvian culture / folklore / monuments.

## Image 1 — “Temptation”

Something made to catch the eye and test what people choose to value.

Key reasoning

The hint is NOT about history — it's about symbolism.

The object in the image was:

>visually striking

>decorative / attractive

>commonly photographed

>associated with choice or attraction

This fits extremely well with Latvian manor parks where sculptures and ornaments were designed to impress visitors.

After reverse-image search attempts fail → switch strategy:

👉 Search conceptually instead of visually.

We search:

```bash

Latvia manor sculpture park famous
Latvia decorative manor tourist attraction
Latvia baroque garden statues
```

This leads to Mālpils Manor (Mālpils muiža).

Why this matches:

>Known for aesthetic appeal rather than historical importance

>A place meant to tempt the eye

>Often photographed as a romantic location

**City 1**

```bash
Mālpils
```

## Image 2 — “Stone”

A name important enough to be carved and left behind when everything else moves on.

This clearly refers to a memorial stone / engraved monument.

The image contained:

>A carved stone monument

>A proper name engraved

>Rural location

Instead of searching the photo → search the name on the stone.

After enhancing the image (zoom / contrast mentally), the name pointed toward Latvian surnames tied to a region.

Searching:

```bash

Latvia memorial stone [surname]
Latvian monument engraved name village
```


This leads to a monument in:

```bash
Ērgļi
```
Why it fits:

>Known for historical memorial stones

>The name appears on documented heritage monuments

>Matches rural carved stone clue

**City 2**

```bash
Ērgļi
```

## Image 3 — “Silence”

The region’s elder once made a deal with the devil, and the land has been quiet about it ever since.

This is a folklore hint.

Important keywords:

| Word                | Meaning                      |
| ------------------- | ---------------------------- |
| Elder               | local legendary figure       |
| Deal with the devil | folklore pact                |
| Silence             | cursed / haunted / abandoned |

So now we search folklore, not geography:

```bash
Latvia devil legend village
Latvia pact with devil folklore place
Latvian cursed village legend
```

This leads to a very specific Latvian legend tied to:

```bash
Lube
```

Local stories describe:

>a mysterious pact

>supernatural folklore

>unexplained quietness of the area

Perfect match for the riddle’s tone.

**City 3**

```bash
Lube
```


## Constructing the Flag

The challenge requires:

Latvian spelling and diacritics

So we must preserve special characters:

| City    | Correct spelling |
| ------- | ---------------- |
| Mālpils | ā                |
| Ērgļi   | Ē ļ              |
| Lube    | (no diacritics)  |


## Final Flag

**0xfun{Mālpils_Ērgļi_Lube}**

I solved this challenge in 4 minutes and secured our first blood


---


## Skyglyph II — Blind Drift

## 📎 Attachments
[Skyglyph_II_Blind_Drift.zip](/attatchement/0xfunCTF/Skyglyph_II_Blind_Drift.zip)


## 1. Given

We receive:

>4 noisy star-detection frames

>A full star catalog (RA/Dec + magnitude)

>Only a rough pointing seed for frame 1

>Each frame decrypts one part of the flag using AEAD

No metadata:

>no focal length

>no distortion

>no orientation

>no timestamp

>no plate scale

So this is blind plate solving.


## 2. Key Observation

Wrong matches don’t partially work.


Because the encryption uses Authenticated Encryption, the decryption algorithm:

```bash
plaintext = AEAD_Decrypt(key, nonce, ciphertext, tag)
```

returns:

>correct plaintext if and only if the star IDs are EXACT

>otherwise authentication fails

Therefore:

>The crypto layer is the verifier of the astrometry layer.

So the real challenge = recover correct star correspondences.

## 3. The Camera Model

We must estimate:

>Rotation R (sky → camera)

>Translation irrelevant (stars at infinity)

>Focal length f

>Radial distortion k1,k2

We use the standard projection:

<img width="104" height="41" alt="image" src="https://github.com/user-attachments/assets/39f5600c-bc94-4473-8f17-6ba5c5a4a202" />

Where:

>s = unit vector from RA/Dec

>K = intrinsic matrix


<img width="134" height="57" alt="image" src="https://github.com/user-attachments/assets/35dd8a93-8fcc-411a-9048-bfb4f0f73f6c" />

Then radial distortion:

<img width="158" height="77" alt="image" src="https://github.com/user-attachments/assets/2e8aad3f-fc5a-41a0-9cea-0bb5a86fd1d0" />

## 4. Converting Catalog to Vectors

Each star catalog entry:

```bash
RA, Dec
```
Convert to unit vector:

<img width="156" height="70" alt="image" src="https://github.com/user-attachments/assets/7fbd7305-1f58-471f-bd35-060d45e99584" />

Now every catalog star lives on a unit sphere.

## 5. Initial Solve — Frame 1 (using pointing seed)

We know approximate sky direction.
So instead of global search → we search a small sky cone (~10°).

## Triangle Hashing

Stars form invariant angular distances.

For every triple of detected stars:

Compute angular distances:

<img width="107" height="27" alt="image" src="https://github.com/user-attachments/assets/dadb3885-2c2d-45e1-8a91-ec05fc6d1805" />

The triangle defined by:

```scss
(θ12, θ23, θ31)
```

is invariant to camera orientation.

We pre-compute triangle hashes for the catalog and match observed triangles.

This gives candidate star ID matches.

## 6. Pose Recovery (PnP on the Sphere)

Once we have tentative correspondences:

We solve Wahba’s Problem:

<img width="121" height="38" alt="image" src="https://github.com/user-attachments/assets/9610dd4e-b033-4eb2-881c-89643ff9c931" />

Solution via SVD (Kabsch algorithm):

<img width="131" height="66" alt="image" src="https://github.com/user-attachments/assets/296df572-8c55-4603-bb2e-67576bab667a" />

Now we know camera orientation.

## 7. Radial Distortion Fitting

Projection error still large → lens distortion exists.

We optimize:

<img width="198" height="35" alt="image" src="https://github.com/user-attachments/assets/4ce8410b-d3a8-46d2-a7a3-0cb53b876b8a" />


Using nonlinear least squares (Levenberg-Marquardt).

After optimization:
Residual < 0.5 pixels → correct plate solution.

Now star IDs are fully known.

## 8. Blind Solving Frames 2-4

Now the trick:

We do NOT get pointing seeds for frames 2-4.

But Earth rotates slowly.

Between frames:

⁡
 <img width="104" height="38" alt="image" src="https://github.com/user-attachments/assets/2ce60cc4-ee04-4bd0-bc0b-90c554a9462a" />


So we propagate orientation using small rotation search.

We:

>Use frame1 solution as prior

>Rotate small grid search

>Re-run triangle matching

>Refine with nonlinear solve

This converges quickly.


## 9. Key Derivation

Each frame gives a set of identified star IDs:

```bash
[ HIP_1234, HIP_5512, HIP_8891, ... ]
```

The challenge used:

<img width="196" height="28" alt="image" src="https://github.com/user-attachments/assets/c54d288c-7876-4d20-a635-84f7dc7c4580" />

Nonce = centroid quantized
AAD = frame index

So only exact IDs produce correct authentication tag.

## 10. Decryption

Each frame decrypts a piece:

```bash
PART 1/4
PART 2/4
PART 3/4
PART 4/4
```

After solving all frames:

```bash
0xfun{w0w_Y0u_4R3_G0oD_4t_Th1s_ST4r_Th1N9}
```


I got first blood on both challenges honestly, you’d need a PhD in math to solve the last one lmaaao .
It was a great experience, and you can really see the effort the author put in.
See you in the next edition!

Only 3 challenges for now, plenty more writeups on the way. Stay tuned!



<img width="1920" height="1440" alt="377shots_so" src="https://github.com/user-attachments/assets/8f3e0e23-d18a-4102-8515-35eab1b14591" />



<img width="1920" height="1440" alt="291shots_so" src="https://github.com/user-attachments/assets/9b3907fe-8b0b-4ed2-a13d-ef5e2b5495c9" />

