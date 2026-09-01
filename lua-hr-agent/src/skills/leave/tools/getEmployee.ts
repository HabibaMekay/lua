import { LuaTool, User } from 'lua-cli';
import { z } from 'zod';

import { getEmployee } from '../../../integrations/bamboohr';

export default class GetEmployeeTool implements LuaTool {
  name = 'get_current_employee';

  description =
    'Retrieve the HR record for the currently authenticated employee. Always use this tool to identify the employee before accessing employee-specific HR information.';

  inputSchema = z.object({});

  async execute() {
    const user = await User.get();

    if (!user || !user.userId) {
      throw new Error(
        'Unable to identify the currently authenticated user.',
      );
    }

    const employee = await getEmployee(user.userId);

    if (!employee) {
      throw new Error(
        'Your authenticated Lua account could not be matched to an HR employee record.',
      );
    }

    return {
      employeeId: employee.id,
      name: employee.name,
      email: employee.email,
      country: employee.country,
      hireDate: employee.hireDate,
      managerId: employee.managerId,
    };
  }
}