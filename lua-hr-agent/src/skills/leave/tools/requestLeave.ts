import { LuaTool, User } from 'lua-cli';
import { z } from 'zod';

import {
  getEmployee,
  getLeaveBalance,
  submitLeaveRequest,
} from '../../../integrations/bamboohr';

import { calculateLeaveDays } from './calculateLeaveDays';
import { calculateLeaveEntitlement } from '../calculateLeaveEntitlement';
import { sendNotification } from '../../../integrations/notifications';

export default class RequestLeaveTool implements LuaTool {
  name = 'request_leave';

  description =
    'Submit annual, sick, or emergency leave for the currently authenticated employee. Always identify the authenticated employee, retrieve their HR record and balance, apply the country-specific entitlement rules, and only report submission when the HR workflow confirms it.';

  inputSchema = z.object({
    leaveType: z
      .enum(['annual', 'sick', 'emergency'])
      .describe('Type of leave'),

    startDate: z
      .string()
      .describe(
        'Leave start date in YYYY-MM-DD format',
      ),

    endDate: z
      .string()
      .describe(
        'Leave end date in YYYY-MM-DD format',
      ),

    reason: z
      .string()
      .optional()
      .describe(
        'Optional reason for the leave',
      ),
  });

  

  async execute(
    input: z.infer<typeof this.inputSchema>,
  ) {
    // --------------------------------------------------
    // 1. Identify authenticated Lua user
    // --------------------------------------------------

    const user = await User.get();

    if (!user || !user.userId) {
      throw new Error(
        'Unable to identify the currently authenticated user.',
      );
    }

    // --------------------------------------------------
    // 2. Match Lua user to HR employee
    // --------------------------------------------------

    const employee = await getEmployee(
      user.userId,
    );

    if (!employee) {
      throw new Error(
        'Your authenticated Lua account could not be matched to an HR employee record.',
      );
    }

    // --------------------------------------------------
    // 3. Calculate requested leave days
    // --------------------------------------------------

    const { days } = calculateLeaveDays({
      startDate: input.startDate,
      endDate: input.endDate,
    });

    if (days <= 0) {
      throw new Error(
        'The leave period must contain at least one day.',
      );
    }

    // --------------------------------------------------
    // 4. Get authoritative HRIS balance
    // --------------------------------------------------

    const balance = await getLeaveBalance(
      employee.id,
      input.leaveType,
    );

    // --------------------------------------------------
    // 5. Calculate country-specific entitlement
    //
    // Your existing calculateLeaveEntitlement.ts
    // handles this logic.
    // --------------------------------------------------

    const entitlement = calculateLeaveEntitlement({
  country: employee.country,
  hireDate: employee.hireDate,
  currentDate: new Date().toISOString().split('T')[0],
});

    // --------------------------------------------------
    // 6. Check balance
    //
    // BambooHR balance remains authoritative.
    // Entitlement is used to apply country rules.
    // --------------------------------------------------

    if (input.leaveType !== 'emergency') {
      if (days > balance) {
        return {
          submitted: false,
          reason: 'INSUFFICIENT_BALANCE',

          employeeName: employee.name,
          country: employee.country,

          requestedDays: days,
          availableBalance: balance,

          annualEntitlement:
            entitlement.annualEntitlement,
        };
      }
    }

    // --------------------------------------------------
    // 7. Submit to HR workflow
    // --------------------------------------------------

    const result = await submitLeaveRequest({
      employeeId: employee.id,
      type: input.leaveType,
      startDate: input.startDate,
      endDate: input.endDate,
      days,
      reason: input.reason,
    });

    
await sendNotification({
  employeeEmail: employee.email,
  channel: 'email',
  message:
    `Your ${input.leaveType} leave request for ${days} days ` +
    `from ${input.startDate} to ${input.endDate} ` +
    `has been submitted and is pending approval from ${result.managerName}.`,
});

    // --------------------------------------------------
    // 8. Return confirmed workflow result
    // --------------------------------------------------

    return {
      submitted: true,

      employeeName: employee.name,
      country: employee.country,

      status: result.status,
      managerName: result.managerName,

      requestedDays: days,

      annualEntitlement:
        entitlement.annualEntitlement,

      remainingBalance:
        input.leaveType === 'emergency'
          ? null
          : balance - days,
    };
  }

  
}