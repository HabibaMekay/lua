import { LuaTool, User } from 'lua-cli';
import { z } from 'zod';

import { getEmployee } from '../../../integrations/bamboohr';
import {
  calculateLeaveEntitlement,
  Country,
} from './../calculateLeaveEntitlement';

export default class CalculateLeaveEntitlementTool
  implements LuaTool
{
  name = 'calculate_leave_entitlement';

  description =
  'REQUIRED TOOL for PERSONAL annual leave entitlement questions. ' +
  'Use this tool whenever an employee asks how many annual leave days THEY personally are entitled to. ' +
  'Do NOT answer personal entitlement questions from the knowledge base. ' +
  'The tool retrieves the authenticated employee HR record and deterministically calculates their entitlement. ' +
  'Never ask the employee for their employee ID, country, or hire date.';
  
  inputSchema = z.object({
    currentDate: z
      .string()
      .describe(
        'Date to calculate entitlement as of, in YYYY-MM-DD format',
      ),
  });

  async execute(
    input: z.infer<typeof this.inputSchema>,
  ) {
    // Get the authenticated Lua user.
    const user = await User.get();

    if (!user?.userId) {
      throw new Error(
        'Unable to identify the authenticated user.',
      );
    }

    // Match the Lua user to the HR employee record.
    const employee = await getEmployee(user.userId);

    if (!employee) {
      throw new Error(
        'Your authenticated account is not associated with an HR employee record.',
      );
    }

    // Calculate entitlement using deterministic rules.
    const result = calculateLeaveEntitlement({
      country: employee.country as Country,
      hireDate: employee.hireDate,
      currentDate: input.currentDate,
    });

    return {
      employeeName: employee.name,
      country: employee.country,
      hireDate: employee.hireDate,
      currentDate: input.currentDate,
      annualEntitlement: result.annualEntitlement,
      basis: result.basis,
      requiresHRReview: result.requiresHRReview,
    };
  }
}