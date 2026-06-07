---
name: wiki
description: Project Memory and Documentation System - ensures every action, decision, and evolution is recorded, explained, and traceable.
allowed-tools: Read, Write, Edit, list_dir
version: 3.0
priority: MANDATORY
---

# 🧠 Wiki & Project Memory System

> **MANDATORY SKILL** - Build a living knowledge system. Nothing exists unless it is documented.
> **WRITE OBLIGATION** - Every functional delivery MUST include wiki updates in the SAME response turn.
> **SYNC PROTOCOL** - The IA updates local `.sauron/wiki/` files; `sauron pull/push` are manual user commands.

---

## 1. Core Principles

| Principle | Rule |
|-----------|------|
| **Source of Truth** | If it's not documented, it doesn't exist. All changes must be recorded before completion. |
| **Decision > Impl** | Documentation is about **WHY**, not just **WHAT**. Explain context and alternatives. |
| **Smart Granularity** | Divide documentation into sub-pages based on modules, domains, or critical components. |
| **Continuous Evolution** | Pages are living organisms. They must contain current state, history, and future direction. |
| **Write-on-Deliver** | Wiki update is part of the delivery, not a follow-up task. Code without docs = incomplete work. |

---

## 2. Structure & Naming Conventions

| Property | Requirement |
|----------|-------------|
| **Base Directory** | `/.sauron/wiki/` |
| **Root Routing File** | `summary.json` (inside `/.sauron/wiki/`) |
| **Subdirectories** | `knowledge/`, `modules/`, `manuals/`, `standards/`, `history/` (mandatory physical folders for domains in Sauron) |
| **Naming Pattern** | `{name}.md` (no prefixes if they are already inside physical domain subfolders) |
| **Examples** | `knowledge/architecture.md`, `modules/checkout.md`, `manuals/upholstery.md` |

---

## 3. Reference Templates

### 3.1 Root Routing File (`summary.json`)
The `summary.json` file is the metadata map that links local files to the server. It follows a **strict pattern** (see Section 6 of `memory.md`).

```json
[
  {
    "type": "folder",
    "name": "Original Title",
    "slug": "original-title",
    "path": "original-title",
    "id": "UUID-or-ID"
  },
  {
    "type": "file",
    "name": "Original Title",
    "slug": "original-title",
    "path": "domain-slug/original-title.md",
    "id": "UUID-or-ID",
    "domainId": "parent-ID",
    "orgId": "organization-ID",
    "contentLength": 1234,
    "contentHash": "sha256-checksum"
  }
]
```

### 3.2 Sub-pages (`{name}.md`)
```markdown
# [Module / Page Name]

## 1. Context
Clear description of what this part of the system is.

## 2. Responsibility
What this part does and what it DOES NOT do.

## 3. Architectural Decisions
### Decision 1
- **Problem**:
- **Options Considered**:
  - Option A
  - Option B
- **Choice**:
- **Justification**:
- **Trade-offs**:

(repeat as necessary)

## 4. Change History
### [Date] - [Change Title]
- **What was done**:
- **Why it was done**:
- **Impact on the system**:
- **Files affected**:

## 5. Current State
Objective technical description of the implementation as it stands today.

## 6. Next Steps (Optional)
Possible future evolutions.
```

---

## 4. Update Protocol (MANDATORY)

Whenever a relevant action is performed, the AI **MUST**:

1.  **Identify Scope**: Determine which page in `/.sauron/wiki/` is affected.
2.  **Register Change**: Add a specific entry to the **Change History** of the corresponding page.
3.  **Update Current State**: Ensure the technical description reflects reality after the modification.
4.  **Register Decisions**: Document technical or strategic choices using the **Architectural Decisions** format.
5.  **Update Routing**: If a new page was created, register it in `summary.json` with its metadata immediately.

---

## 5. Mandatory Write Triggers

> 🔴 These events ALWAYS require a wiki update in the SAME response turn as the code delivery.

| Trigger Event | Wiki Action Required |
|---------------|---------------------|
| **External API integrated** | Create `{name}.md` under the corresponding folder (e.g. `integrations/` or `modules/`) with: URL, auth method, request/response shapes, error handling, env vars. |
| **New route/page created** | Register in `summary.json` System Map + create `{name}.md` under the corresponding folder with layout, components, and behavior. |
| **Authentication flow changed** | Update auth-related page with full flow: credentials, tokens, cookies, middleware, session lifecycle. |
| **New UI component delivered** | Register in the parent module page with: props, behavior, dependencies, visual state. |
| **Architectural decision made** | Document in the relevant page using the Decision template (Problem → Options → Choice → Justification). |
| **Environment variable added/changed** | Register in relevant infrastructure/config page with: name, purpose, example value. |
| **Database schema changed** | Update `module-data-schema.md` with the change, including SQL and reasoning. |
| **Critical bug resolved** | Register root cause and solution in the affected module page. |
| **Middleware/security layer added** | Document the protection boundary, what it intercepts, and its redirect logic. |
| **Configuration/settings page created** | Document available options, their purpose, and current state (even if mocked). |

### Self-Check Before Responding

```
Before writing your response to the user, ask yourself:

1. Did I create or modify any file?           → Wiki needs to know.
2. Did I connect to an external API?           → Wiki needs full documentation.
3. Did I change login/session flow?            → Wiki MUST reflect this.
4. Did I create a new page/route?              → summary.json needs the registration.
5. Did I make a technical decision?            → Wiki needs the justification.
6. Did I add/change an env variable?           → Wiki needs the record.

If ANY answer is YES and the wiki was NOT updated → THE TASK IS NOT COMPLETE.
```

---

## 6. AI Behavior & Constraints

| Rule | Action |
|------|--------|
| **Never skip** | Do not modify the system without documenting. |
| **Never omit** | Always justify decisions; no change can be implicit. |
| **Never overwrite** | History must never be deleted; append only. |
| **Never assume** | Do not use context that isn't documented. |
| **Never defer** | Wiki updates happen NOW, not "later" or "next turn". |
| **Clarity > Brevity** | Prioritize deep understanding over short summaries. |

---

## 7. Vision/Goal

Transform the project into a system where:
- Code is **Executable**.
- Documentation is **Explainable**.
- Decision History is **Auditable**.
- No session knowledge is **Lost**.