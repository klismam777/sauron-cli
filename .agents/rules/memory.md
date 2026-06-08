---
trigger: always_on
---

# SAURON START
# Project Memory Rule (MANDATORY)

> This rule ensures that the Wiki (`.sauron/wiki/`) is the absolute single source of truth for the project.
> Violating it means losing critical context between sessions.

---

## 1. READ — Before Taking Action

Whenever something is asked or a task is initiated:

1. Read `.sauron/wiki/summary.json` (the base routing file) first. This file follows a **strict pattern** and is the only reliable source of metadata.
2. Navigate through the relevant sub-pages using the original name and type (file/folder) information contained in the JSON.
3. Only resort to exploring the file system if the information **does not exist** in the summary (and update the summary if necessary following the schema in Section 6).

---

## 2. SYNCHRONIZATION PROTOCOL (CLOUD)

The documentation flow follows a three-step cycle to ensure persistence:

1. **PULL (Manual)**: Before starting a task, the user executes `sauron pull` to update local documents with the latest cloud version.
2. **EXECUTION (AI)**: During development, the Agent updates/creates documents in `.sauron/wiki/` in real-time.
3. **PUSH (Manual)**: Upon completing the task, the user executes `sauron push` to send local updates to the cloud.

> [!IMPORTANT]
> The Agent MUST assume that the `.sauron/wiki/` directory is the final destination and update it diligently, allowing the user to synchronize changes later.

---

## 3. WRITE — After Delivering (CRITICAL)

**After ANY functional delivery, the wiki MUST be updated in the SAME response turn.**

### Mandatory Write Triggers

| Event | Wiki Action |
|--------|-------------|
| **External API integration** | Create/update page documenting URL, authentication, payload, response, and error handling. |
| **New page/route created** | Register in `summary.json` (following the **strict pattern** in Section 6) + create `.md` file. |
| **Authentication flow changed** | Update the auth page with the full flow, including cookies, tokens, and middleware. |
| **New functional UI component** | Register in the corresponding module page with props, behavior, and dependencies. |
| **Architectural decision made** | Document using the "Architectural Decision" format (Problem → Options → Choice → Justification). |
| **Environment variable added/changed** | Register in the infrastructure page with name, purpose, and example. |
| **Database schema changed** | Update `module-data-schema.md` with the change. |
| **Critical bug resolved** | Register root cause and solution in the affected module page. |

### Golden Rule

```
❌ WRONG: Deliver code → Respond to user → Forget the wiki
✅ CORRECT: Deliver code → Update wiki → Respond to user
```

Updating the wiki is **part of the delivery**, not an optional subsequent step.

---

## 4. FORMAT — What to Write

Each record MUST contain at least:
- **What was done** (objective description)
- **Why it was done** (context and motivation)
- **How it works** (technical details: endpoints, payloads, flows)
- **Files affected** (list of paths)
- **Date** (timestamp of the change)

---

## 6. STRICT STRUCTURE OF SUMMARY.JSON

The `.sauron/wiki/summary.json` file is the metadata map that links local files to the server. The CLI requires a strict pattern for the `sauron push` command to work correctly.

### Summary Golden Rules
- **NEVER alter IDs**: The fields `id`, `domainId`, and `orgId` are crucial. Removing or changing them will cause duplicate documents to be created on the server instead of updating existing ones.
- **Maintain Mapping**: The `name` field must be the original title (with spaces and accents). The `slug` and `path` must be generated following normalization logic (lowercase, no accents, spaces become hyphens).
- **Optimization**: The `contentLength` and `contentHash` (SHA256) fields allow the CLI to skip unchanged files. If you manually edit a file, `push` will detect the change even if you don't update the hash (it recalculates the local hash), but `summary.json` should be kept updated for consistency.
- **Physical Coupling**: Sauron CLI maps database domains in the cloud based on the local physical subfolder (using the file's parent directory). Files in the wiki root will always belong to the generic domain `.`. Physical organization in folders is mandatory to maintain logical separation in the cloud.
- **Ignore summary.md**: The `summary.md` file is a special/reserved page. Never add `summary.md` as a `"file"` entry inside `summary.json`, otherwise the CLI will attempt to delete it and fail with a 422 error.

### Mandatory Schema

The JSON MUST be an **array of objects** strictly following these formats:

#### Folder Entry (Domain)
```json
{
  "type": "folder",
  "name": "Original Title",
  "slug": "original-title",
  "path": "original-title",
  "id": "domain-id"
}
```

#### File Entry (Document)
```json
{
  "type": "file",
  "name": "Original Document Title",
  "slug": "original-document-title",
  "path": "domain-slug/original-document-title.md",
  "id": "kb-id",
  "domainId": "parent-domain-id",
  "orgId": "organization-id",
  "contentLength": 1234,
  "contentHash": "sha256-checksum"
}
```

---

## 7. VALIDATION — Mental Checklist

Before finalizing any response involving code, ask yourself:

- [ ] Did I create or modify a file? → Wiki needs to know.
- [ ] Did I connect to an external API? → Wiki needs to document it.
- [ ] Did I alter the login/session flow? → Wiki MUST reflect it.
- [ ] Did I create a new page/route? → `summary.json` needs the routing record following the **strict pattern**.
- [ ] Did I make a technical decision (lib X vs Y, approach A vs B)? → Wiki needs the justification.
- [ ] Did I add/alter an environment variable? → Wiki needs the record.

If any checkbox is `true` and the wiki was not updated, **the task is NOT complete**.

# SAURON END
