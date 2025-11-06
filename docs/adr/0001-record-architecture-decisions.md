---
title: "0001. Record Architecture Decisions"
tags:
  - type/docs
created: 2025-11-05
updated: 2025-11-05
lifecycle: active
---

# 0001. Record Architecture Decisions

**Date**: 2025-11-05
**Status**: Accepted
**Deciders**: Solo Developer + Claude AI

## Context

As a solo developer working with AI assistance, we need a way to:
- Record significant architectural and technical decisions
- Understand the reasoning behind past choices
- Maintain continuity across development sessions
- Provide context for future maintenance

Without documentation, important decisions are lost over time, leading to:
- Repeated discussions about the same topics
- Inconsistent architectural patterns
- Difficulty onboarding (self or others)
- Poor understanding of trade-offs made

## Decision Drivers

- **Context Preservation**: AI collaboration requires explicit context across sessions
- **Knowledge Transfer**: Solo dev needs to remember decisions months later
- **Industry Standards**: Align with professional development practices
- **Minimal Overhead**: Keep documentation lightweight for solo development
- **Search ability**: Easy to find relevant decisions

## Considered Options

- **Option 1**: No formal documentation (status quo)
- **Option 2**: ADRs (Architecture Decision Records) - MADR format
- **Option 3**: Comprehensive RFC process (Request for Comments)
- **Option 4**: Wiki-based documentation

## Decision Outcome

**Chosen**: Option 2 - ADRs using MADR format

We will record architecturally significant decisions using Architecture Decision Records (ADRs) in Markdown format, stored in `docs/adr/`.

### Positive Consequences

- Lightweight format suitable for solo development
- Version controlled with code
- Searchable and linkable
- Industry-standard practice (Spotify, GitHub, Microsoft use ADRs)
- Works well with AI pair programming
- Clear decision history

### Negative Consequences

- Requires discipline to write ADRs
- Another documentation system to maintain
- May feel like overhead for simple decisions

## Pros and Cons of the Options

### Option 1: No formal documentation

- ✅ Good, because zero overhead
- ✅ Good, because fast decision-making
- ❌ Bad, because decisions are forgotten
- ❌ Bad, because context is lost
- ❌ Bad, because poor knowledge transfer
- ❌ Bad, because inconsistent patterns

### Option 2: ADRs (MADR format)

- ✅ Good, because lightweight and fast to write
- ✅ Good, because version controlled
- ✅ Good, because industry standard
- ✅ Good, because AI-friendly (structured format)
- ✅ Good, because searchable
- ❌ Bad, because requires discipline
- ❌ Bad, because slight overhead

### Option 3: RFC process

- ✅ Good, because thorough discussion
- ✅ Good, because community input (if open source)
- ❌ Bad, because heavy process for solo dev
- ❌ Bad, because significant overhead
- ❌ Bad, because overkill for small project

### Option 4: Wiki-based

- ✅ Good, because easy to edit
- ✅ Good, because visual interface
- ❌ Bad, because not version controlled with code
- ❌ Bad, because harder to review changes
- ❌ Bad, because can become stale
- ❌ Bad, because [GitHub Wiki is an anti-pattern](https://michaelheap.com/the-github-wiki-anti-pattern)

## Implementation Notes

### ADR Format

We use **MADR (Markdown ADR)** format because:
- Simple, readable Markdown
- Flexible structure
- Widely adopted (Spotify, SAP, many OSS projects)

### Naming Convention

```
docs/adr/
├── TEMPLATE.md
├── INDEX.md
├── 0001-record-architecture-decisions.md
├── 0002-use-supabase-for-backend.md
├── 0003-hybrid-authentication-system.md
└── 0004-scss-over-tailwind-for-templates.md
```

- Four-digit numbering: `0001`, `0002`, etc.
- Kebab-case titles
- Descriptive but concise names

### When to Write an ADR

Write an ADR when making decisions about:

✅ **DO write ADRs for**:
- Database or backend service selection
- Framework or library choices
- Authentication/authorization approaches
- Architectural patterns (e.g., folder structure)
- Technology stack changes
- Security-related decisions
- Performance trade-offs affecting architecture

❌ **DON'T write ADRs for**:
- Simple implementation details
- Naming conventions for single files
- Bug fixes
- Minor refactoring
- UI component choices (unless architectural)

### Workflow Integration

```
Issue → [RFC Discussion?] → Work Plan → Code → ADR (if major) → Library Doc → PR
                ↓                         ↓           ↓              ↓
           [If major]               [Develop]  [Document Why]  [Document How]
```

**ADR vs Library**:
- **ADR**: Records **WHY** decisions were made (architecture, trade-offs)
- **Library**: Records **HOW** features work (implementation, usage)
- Both: Permanent documentation, versioned with code

### Status Lifecycle

1. **Proposed**: Under discussion
2. **Accepted**: Decision made and implemented
3. **Deprecated**: No longer recommended but still in use
4. **Superseded**: Replaced by a newer ADR

## Links

- MADR Template: https://github.com/adr/madr
- ADR GitHub Org: https://adr.github.io/
- Spotify on ADRs: https://engineering.atspotify.com/2020/04/when-should-i-write-an-architecture-decision-record
- Michael Nygard's ADR: https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions
- Work Plan: [../work-plans/workflow-improvement.md](../work-plans/workflow-improvement.md)
- Issue: #49

---

## Metadata

**Status Changes**:
- 2025-11-05: Proposed
- 2025-11-05: Accepted (immediate implementation)

**Related Decisions**:
- First ADR in project
- Part of Workflow Improvement initiative
- Complements Library documentation system
