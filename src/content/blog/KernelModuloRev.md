---
title: 'Win Kernel Modulo Reversing #1'
description: 'having fun'
pubDate: 'Jan 29 2026'
cover: /images/kernelrev.png
categories: ['Blog']
tags: ['rev']
---


Here’s something interesting I’ve been learning about lately. I’m still far from mastering it Windows kernel-mode reversing is honestly an ocean lmao. The deeper you go, the more you realize how much there is left to explore. This post is just a snapshot of what I’ve discovered so far while diving into kernel land











## Windows Kernel Modulo Reversing: A Deep Technical Introduction

`“User mode reversing teaches you how programs work. Kernel modulo reversing teaches you how the operating system really works.”`

## 1. Introduction — What is Kernel Modulo Reversing?

Windows kernel modulo reversing is the process of analyzing, understanding, and debugging code that runs in Ring 0, the most privileged execution level of the CPU.

Unlike classic reversing of .exe files, kernel reversing focuses on:

>Windows kernel (`ntoskrnl.exe`)

>Core subsystems (`win32k.sys`, `hal.dll`)

>Device drivers (`*.sys`)

>Security and anti-cheat drivers

>Rootkits and stealth malware

Kernel mode code has:

>No Win32 API

>Direct access to hardware, memory, processes, and the scheduler

>The power to fully control or compromise the system

A single bug in kernel mode is often enough to:

>Escalate privileges to NT AUTHORITY\SYSTEM

>Bypass security boundaries

>Hide processes, files, or network traffic

>Completely crash the OS (BSOD)

This is why kernel reversing is central in:

>Malware research

>EDR / anti-cheat analysis

>Windows exploit development

>Advanced CTF challenges


## 2. Windows Architecture Refresher

Windows is split into two main execution layers : 


```scss

User Mode (Ring 3)
  ├─ Applications
  ├─ services.exe
  ├─ browsers, games, malware.exe
  └─ ntdll.dll

Kernel Mode (Ring 0)
  ├─ ntoskrnl.exe  (core kernel)
  ├─ win32k.sys   (GUI subsystem)
  ├─ hal.dll      (hardware abstraction)
  └─ drivers (*.sys)
```

User-mode code cannot directly:

>Access physical memory

>Touch kernel structures

>Control hardware

>Manage scheduling

All sensitive operations transition into kernel mode via:

>`syscall / sysenter`

>Interrupts

>I/O requests (IRPs)

Reversing kernel mode means understanding what happens after this boundary.


## 3. What Is a Windows Driver Internally?

A Windows driver is just a PE file `(.sys)` loaded into kernel space.

Its entry point is not `main()` but:

```c

NTSTATUS DriverEntry(
    PDRIVER_OBJECT  DriverObject,
    PUNICODE_STRING RegistryPath
);


```

This function:

>Initializes the driver

>Registers callbacks

>Creates device objects

>Sets up IRP dispatch routines

Example skeleton:

```c

NTSTATUS DriverEntry(PDRIVER_OBJECT DriverObject, PUNICODE_STRING RegistryPath)
{
    UNREFERENCED_PARAMETER(RegistryPath);

    DriverObject->DriverUnload = DriverUnload;

    DriverObject->MajorFunction[IRP_MJ_CREATE]  = DispatchCreate;
    DriverObject->MajorFunction[IRP_MJ_CLOSE]   = DispatchClose;
    DriverObject->MajorFunction[IRP_MJ_DEVICE_CONTROL] = DispatchIoctl;

    return STATUS_SUCCESS;
}
```

From a reversing perspective, this function is your **main()**.


## 4. IRPs — How User Mode Talks to Kernel Mode

All communication is done using IRPs (I/O Request Packets).

Typical flow:

```bash

Userland app → DeviceIoControl()
               ↓
        I/O Manager
               ↓
        IRP_MJ_DEVICE_CONTROL
               ↓
        Driver Dispatch Routine
```

Example vulnerable handler:

```c
NTSTATUS DispatchIoctl(PDEVICE_OBJECT DeviceObject, PIRP Irp)
{
    PIO_STACK_LOCATION stack = IoGetCurrentIrpStackLocation(Irp);
    ULONG code = stack->Parameters.DeviceIoControl.IoControlCode;

    if (code == 0x222003)
    {
        char kernel_buf[0x100];
        memcpy(kernel_buf,
               Irp->AssociatedIrp.SystemBuffer,
               stack->Parameters.DeviceIoControl.InputBufferLength); //  bug
    }

    Irp->IoStatus.Status = STATUS_SUCCESS;
    IoCompleteRequest(Irp, IO_NO_INCREMENT);
    return STATUS_SUCCESS;
}
```


In reversing:

>You hunt for IRP_MJ_DEVICE_CONTROL

>Then rebuild the IOCTL protocol

>Then find bugs → exploitation → SYSTEM


## 5. What You Reverse in Practice

Kernel reversing usually targets:

### 1 Malware drivers

>Process hiding (DKOM)

>SSDT hooks

>Object callbacks

>Rootkits

### 2 Anti-cheat / EDR

>Syscall filtering

>Memory scanning

>Hypervisor interfaces

### 3 Vulnerable drivers

>Stack overflow

>Pool overflow

>Arbitrary R/W

>Privilege escalation

### 4 Windows internals

>Process manager

>Memory manager

>Object manager


## 6. Kernel Reversing Toolchain

Static analysis

>IDA Pro 

>Ghidra

>Binary Ninja

>and the best one is [dogbolt](https://dogbolt.org/)  ***lmaaaaaaaaao***

Load drivers with symbols:

```bash

srv*C:\symbols*https://msdl.microsoft.com/download/symbols

```


Symbols turn this:

```bash
sub_140003AF0
```

into this:

```bash
PsCreateProcessNotifyRoutine
```

**Which is gold in kernel reversing**.


### Dynamic analysis 

Kernel debugging is not optional.

Setup:

>VMware / Hyper-V

>Target VM: kernel debug enabled

>Host: WinDbg


```bash
bcdedit /debug on
bcdedit /set testsigning on
```

Then attach WinDbg kernel debugger.

Core commands:


```bash
lm            // list drivers
!drvobj       // inspect driver
!process 0 1  // active processes
dt _EPROCESS  // kernel structures
```

## 7. Core Kernel Concepts You Must Reverse

**Kernel objects**

>`_EPROCESS` (process)

>`_ETHREAD` (thread)

>`_DRIVER_OBJECT`

>`_DEVICE_OBJECT`

**Memory**

>NonPagedPool

>MDLs

>IRQL levels

>Page tables


**Callbacks**

```c
PsSetCreateProcessNotifyRoutine(...)
ObRegisterCallbacks(...)
CmRegisterCallback(...)
```

**Malware loves them , and yeah, I can’t lie… I love them too**


## 8. Typical Kernel Rootkit Techniques

| Technique        | Purpose                |
| ---------------- | ---------------------- |
| SSDT hooking     | syscall interception   |
| Inline hooks     | stealth monitoring     |
| DKOM             | hide processes/drivers |
| Callbacks        | monitor activity       |
| Filter drivers   | hide files/registry    |
| Hypervisor abuse | evade kernel itself    |

Kernel reversing is learning to recognize these patterns in assembly.

## 9. Reversing Methodology

1. Load .sys in IDA

2. Find DriverEntry

3. Rebuild DRIVER_OBJECT

4. Locate:

>Dispatch routines

>IOCTL switch

>Callbacks

5. Rename everything

6. Attach WinDbg

7. Trace IRPs

8. Observe kernel memory

9. Confirm behavior dynamically

This is where reversing becomes OS archaeology.

## 10. Conclusion

Windows kernel-mode reversing is where reverse engineering stops being about binaries — and becomes about operating system internals, security boundaries, and hardware control.

It’s the foundation of:

>Modern malware research

>Kernel exploit development

>EDR and anti-cheat analysis

>Advanced digital forensics

**Mastering it means understanding Windows not as a user but as the system itself**.
