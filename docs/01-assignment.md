# Full-Stack Developer Technical Assessment

## Overview

This assessment evaluates both frontend and backend capabilities as a Full-Stack Engineer.

The objective is to demonstrate the ability to design, implement, test, and deploy a complete application while making sound architectural and engineering decisions.

The focus of the assessment is not feature quantity, but rather:

* Clean architecture
* Well-reasoned implementation
* Maintainable code
* Correct functionality
* Meaningful testing
* Clear documentation

If time becomes a constraint, it is preferable to reduce scope and deliver a smaller, well-polished solution rather than attempt too many features.

---

# Selected Assignment

## Assignment A — Dynamic Form Builder Engine

### Goal

Build a configuration-driven engine capable of:

* Defining dynamic forms
* Validating dynamic forms
* Storing form configurations
* Storing form submissions
* Rendering forms dynamically through a user interface

The system should demonstrate how forms can be configured without requiring application code changes.

---

## Core Objectives

The solution must provide three key capabilities:

### 1. Form Configuration

Store dynamic form definitions including:

* Form structure
* Field definitions
* Validation rules
* Display configuration

---

### 2. Dynamic Validation

Validate form submissions using configuration-driven rules.

Validation logic should be derived from stored configuration rather than hardcoded business rules.

Examples include:

* Required fields
* Minimum length
* Maximum length
* Numeric ranges
* Email validation

---

### 3. Submission Storage

Store submitted responses independently from form definitions.

Submissions should remain associated with the form configuration that generated them.

---

# Technical Expectations

The project should demonstrate:

* Frontend development skills
* Backend development skills
* API design
* Data modeling
* Validation strategies
* Error handling
* Testing practices
* Documentation quality

---

# Evaluation Philosophy

The assessment prioritizes:

```text
Correctness
    >
Feature Count
```

Reviewers value:

* Clean code
* Good architecture
* Clear reasoning
* Reliable functionality
* Thoughtful trade-offs

More features do not necessarily result in a stronger submission.

---

# Use of AI Tools

AI-assisted development is permitted and encouraged.

Examples include:

* ChatGPT
* Claude
* GitHub Copilot
* Cursor
* Codex
* Other AI-assisted development tools

The assessment itself was created with the assistance of AI, and candidates are welcome to leverage similar tools during development.

---

# AI Usage Transparency Requirements

The final README must document:

## Tools Used

List all AI tools used during development.

Example:

* ChatGPT
* Claude Code
* GitHub Copilot

---

## How AI Was Used

Examples:

* Project scaffolding
* Architecture design
* Code generation
* Documentation generation
* Test generation
* Debugging assistance
* Code review assistance

---

## Manual Verification

Candidates must verify and understand all submitted code.

You should be able to explain:

* System architecture
* Design decisions
* Generated code
* Validation strategy
* Database design
* API behavior

All AI-generated output should be reviewed and validated before submission.

---

# Submission Requirements

## 1. Git Repository

The solution must be submitted as a Git repository.

Options:

* Public repository
* Private repository with reviewer access

---

## 2. Hosted Application

The application must be deployed and accessible online.

The reviewer should be able to use the application without running it locally.

The README should include:

* Live application URL
* Any required credentials (if applicable)

---

## 3. README

The repository must contain a top-level:

```text
README.md
```

---

# README Requirements

The README must include the following sections.

---

## Local Setup Instructions

Explain how to run:

* Database
* Backend
* Frontend

The instructions should be sufficient for a reviewer to reproduce the environment locally.

---

## Data Model

Document:

* Database tables
* Relationships
* Storage strategy
* Versioning strategy

Explain the reasoning behind the chosen design.

---

## Key Design Decisions

Document architectural decisions such as:

* Database choice
* Validation strategy
* Versioning approach
* API structure
* Rendering strategy

Explain why each decision was made.

---

## Trade-Off Analysis

Document:

* Simplifications made
* Features intentionally excluded
* Known limitations
* Future improvements

Explain what would be added with more time.

---

## AI Usage Disclosure

Document:

### Tools Used

Example:

* ChatGPT
* Claude Code

### Usage

Example:

* Architecture planning
* API design
* Documentation drafting
* Code generation assistance

### Verification

Describe how generated output was reviewed and validated.

---

# Success Criteria

A successful submission should demonstrate:

* Dynamic form configuration
* Dynamic validation
* Dynamic rendering
* Submission persistence
* Clean architecture
* Maintainable code
* Clear documentation
* Thoughtful trade-offs
* Production deployment

The final project should be easy to understand, easy to run, and clearly communicate the reasoning behind all technical decisions.
