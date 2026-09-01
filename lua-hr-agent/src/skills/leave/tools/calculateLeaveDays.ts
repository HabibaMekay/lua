import { LuaTool } from 'lua-cli';
import { z } from 'zod';

export const calculateLeaveDaysInput = z.object({
  startDate: z.string().describe('Leave start date in YYYY-MM-DD format'),
  endDate: z.string().describe('Leave end date in YYYY-MM-DD format'),
});

export function calculateLeaveDays(
  input: z.infer<typeof calculateLeaveDaysInput>,
) {
  const start = new Date(`${input.startDate}T00:00:00Z`);
  const end = new Date(`${input.endDate}T00:00:00Z`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error('Dates must use YYYY-MM-DD format.');
  }

  if (end < start) {
    throw new Error('End date cannot be before start date.');
  }

  const millisecondsPerDay = 24 * 60 * 60 * 1000;

  const days =
    Math.floor(
      (end.getTime() - start.getTime()) / millisecondsPerDay,
    ) + 1;

  return {
    startDate: input.startDate,
    endDate: input.endDate,
    days,
  };
}

export default class CalculateLeaveDaysTool implements LuaTool {
  name = 'calculate_leave_days';

  description =
    'Calculate the number of calendar days between a leave start and end date, inclusive.';

  inputSchema = calculateLeaveDaysInput;

  async execute(
    input: z.infer<typeof calculateLeaveDaysInput>,
  ) {
    return calculateLeaveDays(input);
  }
}