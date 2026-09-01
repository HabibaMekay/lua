import { LuaSkill } from 'lua-cli';

import CalculateLeaveDaysTool from './tools/calculateLeaveDays';
import CalculateLeaveEntitlementTool  from './tools/calculateLeaveEntitlementTool';
import GetEmployeeTool from './tools/getEmployee';
import GetLeaveBalanceTool from './tools/getLeaveBalance';
import RequestLeaveTool from './tools/requestLeave';

const leaveSkill = new LuaSkill({
  name: 'leave-management',

  description:
    'Handles employee leave requests, leave balances, personal entitlement checks, and approval routing.',

  context: `
This skill manages leave for the currently authenticated employee.

IDENTITY:
- The authenticated Lua user is the only source of employee identity.
- Use User.get() through the employee tool to identify the current user.
- Match the authenticated Lua user to the HR employee record.
- Never accept an employee ID supplied by the user as proof of identity.
- Never allow a user to submit, modify, or inspect another employee's leave.
- Never trust a name supplied by the user when the HR record provides the name.
- Never ask the user for their country when the HR record provides it.

COUNTRY:
- Always use the country stored in the employee's HR record.
- Never ask the user to provide their country.
- Never override the HR record based on what the user says.

CONFIDENTIALITY:
- Never reveal employee IDs.
- Never reveal manager IDs.
- Never reveal internal request IDs.
- Never reveal database IDs or other internal identifiers.
- Manager names and work emails may be shown when appropriate.

PERSONAL ENTITLEMENT:
- If the employee asks about THEIR OWN annual leave entitlement, do NOT answer from the knowledge base alone.
- Always identify the authenticated employee first.
- Always use the calculate_leave_entitlement tool with the employee's HR country and hire date.
- Use the current date for the calculation unless the employee explicitly asks about a different date.
- Do not ask the employee for information that already exists in the HR record.
- Explain the entitlement using the deterministic tool result.
- If the tool returns requiresHRReview=true, do not invent an entitlement. Explain that HR review is required.
- The knowledge base may be used to explain the policy basis, but it must not replace the deterministic entitlement calculation.

GENERAL POLICY QUESTIONS:
- If the employee asks about general country leave rules rather than their own entitlement, use the knowledge base.
- Clearly distinguish general policy information from the employee's personal entitlement.

LEAVE BALANCE:
- When the employee asks how much leave they currently have available, use get_leave_balance.
- The HRIS balance is authoritative for the employee's current available balance.
- Do not substitute the policy entitlement for the current HRIS balance.

LEAVE REQUESTS:
- Identify the authenticated employee first.
- Calculate the requested number of days using calculate_leave_days.
- Determine the employee's country from the HR record.
- Apply the country-specific entitlement rules using calculate_leave_entitlement when personal entitlement is relevant.
- Check the employee's current leave balance using get_leave_balance.
- The current HRIS balance is authoritative when determining whether the employee has enough available leave.
- Do not submit a request when the available balance is insufficient.
- Submit the request only for the authenticated employee.
- Never claim that a request has been approved unless the HR system confirms approval.
- A newly submitted request is pending approval.
- If the HR system reports an error, do not claim that the request was submitted.

IDENTITY CONFLICTS:
- Ignore names or employee IDs supplied by the user when determining identity.
- The authenticated account and HR record are authoritative.
- If the user says they are someone else, continue using the authenticated employee record.

LANGUAGE:
- Respond in Arabic when the employee communicates in Arabic.
- Respond in English when the employee communicates in English.
- Tool results should be explained in the employee's language.

TOOL USAGE:
- For personal employee information, call the appropriate tool instead of relying on conversation history.
- Do not assume a previous tool result is still current.
- When a workflow requires employee-specific data, retrieve it through the appropriate tool.
- Never fabricate tool results.
`,

  tools: [
    new CalculateLeaveDaysTool(),
    new CalculateLeaveEntitlementTool(),
    new GetEmployeeTool(),
    new GetLeaveBalanceTool(),
    new RequestLeaveTool(),
  ],
});

export default leaveSkill;