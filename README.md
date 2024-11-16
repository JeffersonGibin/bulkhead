# Bulkhead


<p align="center">
  <img src="https://github.com/user-attachments/assets/0075c872-c3b7-4d09-ad84-820c6d38b362" alt="bulkhead" />
</p>



* [Introduction](#introduction)
* [What is it?](#what-is-it)
* [Analogy](#analogy)
* [When can I use it?](#when-can-i-use-it)
* [What are the advantages of using this pattern?](#what-are-the-advantages-of-using-this-pattern)
* [What are the disadvantages of using this pattern?](#what-are-the-disadvantages-of-using-this-pattern)
* [Examples of Architecture](#examples-of-architecture)

### Introduction

This project was created to illustrate the Bulkhead pattern. Currently, it doesn’t contain any functional code, but it provides an opportunity to learn a bit about the pattern.

### What is it?

The Bulkhead is a pattern used to prevent a service from overloading the server and causing downtime. The pattern is inspired by the concept of a bulkhead, which is a compartment in a ship.

## Analogy

A simple analogy between a ship and the Bulkhead is:

Imagine a ship in a storm. If it has no walls inside to block the water (Bulkheads), the water can spread everywhere and sink the ship. But if the ship has Bulkheads, the water stays in one area, and the rest of the ship is safe. In software, the Bulkhead pattern does the same thing. It separates parts of the system so that if one part has a problem, the rest can keep working.

## When can I use it?

You can use it when your service has high processing demands and needs to isolate parts to avoid overloading the entire system. In this project, you can find an example of using this pattern in a very simple form. The code includes an asynchronous task pool where tasks are added to a queue and processed five at a time. The objective is to return an "unavailable" status when the endpoint "bulkhead" is executed five times concurrently. However, other system endpoints remain unaffected, ensuring no downtime for the rest of the system. Do you remember the analogy? Here, we are isolating only one part of the ship. This part can be overloaded without affecting the rest, keeping the service UP and running!

## What are the advantages of using this pattern?

- Improved system resilience: Isolates failures to prevent cascading issues across the system.
- Avoids complete downtime: Keeps unaffected services running while others recover.
- Better resource management: Allocates resources to components to prevent monopolization.
- Supports scalability: Allows scaling specific parts independently based on demand.

## What are the disadvantages of using this pattern?

- Added complexity: Implementing resource isolation increases the complexity of design and code.
- Inefficient resource usage: Resources allocated to one part may remain underutilized while others are overloaded.
- Difficult configuration: Determining the optimal size for pools or limits can be challenging and may require constant adjustments.
- More maintenance required: The system might need frequent monitoring and maintenance to adjust resource allocations.

## Examples of Architecture


![bulkhead](https://github.com/user-attachments/assets/541f28fa-6e46-4a59-b24e-32056efd3587)

If we look at the image, we can imagine that each endpoint is like a compartment in a ship, and the service is the ship itself. 
This way, if one compartment fills with water, it won't sink the whole ship.

## You can execute the project with:

```shell
  docker compose up
```

## Endpoints:

- `http://localhost:3000/bulkhead` :  Simulates the Bulkhead pattern. You need to execute it multiple times to reach the limit.
- `http://localhost:3000/other`: When the /bulkhead endpoint is unavailable, this endpoint continues to work.
