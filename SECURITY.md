# Security Policy & Vulnerability Mitigation — FêteFlow AI

Security is a foundational pillar of the FêteFlow AI celebration planning architecture. This document outlines the security controls, data isolation policies, and responsible disclosure practices implemented across the platform.

---

## 1. Security Overview & Architecture

FêteFlow AI implements defense-in-depth security principles across every tier of the stack:

| Layer | Security Mechanism | Protection Goal |
|---|---|---|
| **Client Layer** | Zero hardcoded keys, scoped `localStorage` isolation, CSP compliant | Prevents secret exfiltration & XSS |
| **API & GenAI Layer** | Sanitized JSON parser, strict response schema validation | Mitigates prompt injection & malformed payload parsing |
| **Data Layer** | Supabase Row-Level Security (RLS), parameterized queries | Enforces strict multi-tenant isolation |
| **Repository Layer** | Automated git secret scanning, pre-commit sanitization | Zero credential leakage to public repositories |

---

## 2. Secrets Management & Credential Safety

- **No Hardcoded Credentials**: No production API keys, database connection strings, or service secrets are committed to version control.
- **Environment Isolation**: Production environments use `.env` configurations injected via platform hosting providers (e.g., Firebase, Vercel).
- **User-Supplied Keys**: Users providing personal Gemini API keys store them locally in `localStorage`, never transmitting them to intermediary servers.
- **GitHub Push Protection**: All git commits are audited to ensure 100% compliance with secret detection rules.

---

## 3. Row-Level Security (RLS) Policies

When backed by Supabase PostgreSQL, the `celebrations` table enforces strict row-level security:

```sql
-- Enable Row Level Security
ALTER TABLE celebrations ENABLE ROW LEVEL SECURITY;

-- Allow users to view only their own celebrations
CREATE POLICY "Users can view own celebrations"
ON celebrations FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to insert celebrations bound to their user_id
CREATE POLICY "Users can create own celebrations"
ON celebrations FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to update only their own celebrations
CREATE POLICY "Users can update own celebrations"
ON celebrations FOR UPDATE
USING (auth.uid() = user_id);

-- Allow users to delete only their own celebrations
CREATE POLICY "Users can delete own celebrations"
ON celebrations FOR DELETE
USING (auth.uid() = user_id);
```

---

## 4. Input Sanitization & XSS Prevention

- All dynamic text strings from users and AI responses are safely escaped via React's virtual DOM reconciliation before rendering into HTML.
- Markdown outputs in vendor briefs and checklists are stripped of script tags and inline event handlers.
- Input fields enforce strict boundary validations (e.g. positive numeric budgets, valid ISO date strings).

---

## 5. Reporting a Security Vulnerability

If you discover a security vulnerability within FêteFlow AI, please disclose it responsibly by opening a confidential security advisory on GitHub or emailing the repository maintainer.
All legitimate vulnerabilities will be triaged and addressed with high priority.
