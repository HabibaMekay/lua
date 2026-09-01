import { LuaTool, User } from 'lua-cli';
import { z } from 'zod';

import {
  getEmployee,
  getLeaveBalance,
} from '../../../integrations/bamboohr';

export default class GetLeaveBalanceTool implements LuaTool {
  name = 'get_leave_balance';

  description =
    'Check the leave balance of the currently authenticated employee. ' +
    'Use the authenticated Lua user identity. Never ask the employee for their employee ID or country.';

  inputSchema = z.object({
    leaveType: z
      .enum(['annual', 'sick', 'emergency'])
      .describe('Type of leave'),
  });

  async execute(
    input: z.infer<typeof this.inputSchema>,
  ) {
    const user = await User.get();

    if (!user?.userId) {
      throw new Error(
        'Unable to identify the authenticated user.',
      );
    }

    const employee = await getEmployee(user.userId);

    if (!employee) {
      throw new Error(
        'Your authenticated account is not associated with an HR employee record.',
      );
    }

    const balance = await getLeaveBalance(
      employee.id,
      input.leaveType,
    );

    return {
      employeeName: employee.name,
      country: employee.country,
      leaveType: input.leaveType,
      balance,
    };
  }
}