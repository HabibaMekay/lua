# Lua HR Agent

An AI-powered HR assistant built with the Lua platform for employees across **KSA, UAE, Egypt, and Jordan**.

The agent provides bilingual HR support, handles employee leave workflows, answers HR policy/SOP questions, and integrates with BambooHR for employee-specific information.

## What It Demonstrates

### 🧑‍💼 HR Leave Management

* Check personal leave balances through BambooHR
* Calculate annual leave entitlement using deterministic, country-specific rules
* Submit annual, sick, and emergency leave requests
* Calculate requested leave duration from dates
* Validate requests against the employee's available leave balance
* Route requests through the employee's approval workflow
* Support both **English and Arabic**

### 📋 HR SOP Knowledge Base

The agent is backed by a mock HR knowledge base containing procedures for:

* Salary certificate requests
* Employee transfers
* Housing allowance
* Saudi exit/re-entry visas
* Emergency leave
* Other HR procedures

When an employee asks about an unavailable procedure, the agent does **not invent an answer**. Instead, it:

1. Identifies the authenticated employee
2. Logs the missing SOP request
3. Escalates the knowledge gap to HR
4. Returns a reference number

### 🔐 Employee Data Protection

The agent uses the authenticated Lua user as the source of identity and retrieves employee information from BambooHR.

It is designed to prevent employees from accessing another employee's:

* Salary information
* Bank information
* National ID / Iqama information
* Contact information
* Leave balance
* Performance information

Employee IDs and internal system identifiers are not exposed to the user.

## Architecture

```text
                         ┌─────────────────────┐
                         │      Employee       │
                         │  English / Arabic   │
                         └──────────┬──────────┘
                                    │
                         Web / WhatsApp channels
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │     Lua AI Agent    │
                         └──────────┬──────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
       Leave Management       SOP Knowledge Base      HR Tools
              │                     │                     │
              ▼                     ▼                     ▼
         BambooHR             Mock HR Policies       BambooHR
              │                                          
              ▼
       Employee-specific
        HR information
```

## Key Tools

### Leave Management

* `calculate_leave_days`

  * Calculates the number of leave days requested.

* `calculate_leave_entitlement`

  * Determines annual entitlement from the employee's HR country, hire date, and applicable rules.

* `get_leave_balance`

  * Retrieves the employee's current available leave balance from BambooHR.

* `get_employee`

  * Retrieves the authenticated employee's HR record.

* `request_leave`

  * Submits a leave request for the authenticated employee.

### SOP Management

* `log_sop_gap`

  * Records requests for HR procedures that are not available in the knowledge base and escalates them to HR.

## Country-Specific Leave Rules

The entitlement calculator currently supports:

| Country | Rules implemented                                                                                 |
| ------- | ------------------------------------------------------------------------------------------------- |
| KSA     | 21 days, increasing to 30 after 5 years                                                           |
| UAE     | 30 days after 1 year; accrual rules for qualifying shorter service                                |
| Egypt   | 15 days in the first year, 21 days from the second year, and 30 days after qualifying service/age |
| Jordan  | Escalates cases requiring contract/policy-specific review                                         |

The deterministic calculation is intentionally separated from the AI agent so that personal entitlement questions are based on employee data and explicit rules rather than an LLM-generated answer.

## Bilingual Support

The agent responds in the language used by the employee:

**English**

> What is my annual leave entitlement?

**Arabic**

> كام يوم إجازة سنوية أقدر أخد؟

The same HR workflow is used regardless of language.

## Example Workflows

### Personal Leave Entitlement

```text
Employee
   │
   │ "How many annual leave days am I personally entitled to?"
   ▼
Authenticated Lua User
   │
   ▼
BambooHR employee record
   │
   ├── Country
   └── Hire date
   │
   ▼
calculate_leave_entitlement
   │
   ▼
Deterministic entitlement result
```

### Leave Request

```text
Employee
   │
   │ "I want annual leave from Sept 10 to Sept 14"
   ▼
calculate_leave_days
   │
   ▼
get_leave_balance
   │
   ├── Sufficient balance ──► request_leave
   │                              │
   │                              ▼
   │                         Pending approval
   │
   └── Insufficient balance ─► Request rejected
```

### Missing SOP

```text
Employee
   │
   │ "How do I request a parking permit?"
   ▼
Knowledge Base
   │
   └── No matching SOP
            │
            ▼
      log_sop_gap
            │
            ▼
       HR escalation
            │
            ▼
      Reference number
```

## Repository Structure

```text
lua-hr-agent/
├── src/
│   ├── skills/
│   │   ├── leave-management/
│   │   │   ├── tools/
│   │   │   └── calculateLeaveEntitlement.ts
│   │   │
│   │   └── sop/
│   │       └── tools/
│   │
│   └── integrations/
│       └── bamboohr/
│
├── knowledge/
│   └── hr-sops/
│
├── package.json
├── tsconfig.json
└── README.md
```

## Tech Stack

* **Lua** — AI agent and skill framework
* **TypeScript** — Tool and skill implementation
* **Zod** — Tool input validation
* **BambooHR** — Employee and leave data
* **Lua Knowledge Base** — HR policies and SOP retrieval

## Design Principles

The implementation prioritizes:

* **Authenticated identity** over user-provided identity
* **HRIS data** over conversational assumptions
* **Deterministic calculations** for employee-specific entitlements
* **Knowledge-base retrieval** for general HR policies
* **Escalation instead of hallucination** when information is unavailable
* **Bilingual employee interactions**
* **Least-privilege access to employee data**

## Testing

Tools can be tested individually using the Lua CLI:

```bash
lua test skill --name calculate_leave_entitlement
lua test skill --name get_leave_balance
lua test skill --name calculate_leave_days
lua test skill --name request_leave
lua test skill --name log_sop_gap
```

The complete agent can be tested through:

```bash
lua chat -e sandbox
```

