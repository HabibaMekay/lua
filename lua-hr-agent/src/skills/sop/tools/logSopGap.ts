import { LuaTool, User, Data } from 'lua-cli';
import { z } from 'zod';

import {
  getEmployee,
} from '../../../integrations/bamboohr';

export default class LogSopGapTool implements LuaTool {
  name = 'log_sop_gap';

  description =
    'Log a request for an HR procedure that is not available in the knowledge base and escalate it to HR. Use this when no matching SOP exists.';

  inputSchema = z.object({
    request: z
      .string()
      .describe(
        'The HR procedure the employee is asking about',
      ),

    details: z
      .string()
      .optional()
      .describe(
        'Additional details about the employee request',
      ),
  });

  async execute(
    input: z.infer<typeof this.inputSchema>,
  ) {
    // Get authenticated user
    const user = await User.get();

    if (!user?.userId) {
  throw new Error(
    'Unable to identify the authenticated employee.',
  );
}

const employee = await getEmployee(user.userId);

    if (!employee) {
      throw new Error(
        'Your account could not be matched to an HR employee record.',
      );
    }

    // Generate unique reference number
    const referenceNumber =
      `SOP-GAP-${Date.now()}`;

    // Create persistent HR knowledge-gap record
    await Data.create(
      'sop_gaps',
      {
        referenceNumber,
        employeeName: employee.name,
        employeeEmail: employee.email,
        country: employee.country,
        request: input.request,
        details: input.details ?? null,
        status: 'ESCALATED_TO_HR',
        createdAt: new Date().toISOString(),
      },
      [
        'HR SOP knowledge gap',
        input.request,
        input.details ?? '',
        employee.country,
        'escalated to HR',
      ].join(' '),
    );

    return {
      escalated: true,
      referenceNumber,
      status: 'ESCALATED_TO_HR',
      message:
        'The missing SOP has been logged and escalated to HR.',
    };
  }
}