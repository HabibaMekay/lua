export interface Employee {
  id: string;
  name: string;
  email: string;
  country: 'KSA' | 'UAE' | 'Egypt' | 'Jordan';
  managerId: string;
  hireDate: string;
  annualLeaveBalance: number;
  sickLeaveBalance: number;
}

export interface Manager {
  id: string;
  name: string;
  email: string;
}

export interface LeaveRequest {
  employeeId: string;
  type: 'annual' | 'sick' | 'emergency';
  startDate: string;
  endDate: string;
  days: number;
  reason?: string;
}

const employees: Employee[] = [
  {
    id: 'EMP001',
    name: 'Ahmad Ali',
    email: 'ahmad@example.com',
    country: 'KSA',
    managerId: 'MGR001',
    hireDate: '2022-03-15',
    annualLeaveBalance: 24,
    sickLeaveBalance: 30,
  },

  {
    id: 'EMP002',
    name: 'Sara Hassan',
    email: 'sara@example.com',
    country: 'Egypt',
    managerId: 'MGR002',
    hireDate: '2025-01-10',
    annualLeaveBalance: 21,
    sickLeaveBalance: 14,
  },

  {
    id: '8bb5aff0-b23e-49b6-92de-5f682cdbf1eb',
    name: 'Habiba Mekay',
    email: 'habibamekay@gmail.com',
    country: 'Egypt',
    managerId: 'MGR002',
    hireDate: '2026-06-01',
    annualLeaveBalance: 21,
    sickLeaveBalance: 14,
  },
];

const managers: Manager[] = [
  {
    id: 'MGR001',
    name: 'Omar Hassan',
    email: 'omar.hassan@example.com',
  },
  {
    id: 'MGR002',
    name: 'Mona Adel',
    email: 'mona.adel@example.com',
  },
];

export async function getEmployee(
  employeeId: string,
): Promise<Employee | null> {
  return (
    employees.find(
      (employee) => employee.id === employeeId,
    ) ?? null
  );
}

export async function getEmployeeByEmail(
  email: string,
): Promise<Employee | null> {
  const normalizedEmail = email.trim().toLowerCase();

  return (
    employees.find(
      (employee) =>
        employee.email.trim().toLowerCase() === normalizedEmail,
    ) ?? null
  );
}

export async function getLeaveBalance(
  employeeId: string,
  leaveType: LeaveRequest['type'],
): Promise<number> {
  const employee = await getEmployee(employeeId);

  if (!employee) {
    throw new Error(
      `Employee ${employeeId} was not found.`,
    );
  }

  switch (leaveType) {
    case 'annual':
      return employee.annualLeaveBalance;

    case 'sick':
      return employee.sickLeaveBalance;

    case 'emergency':
      return 0;

    default:
      throw new Error(
        `Unsupported leave type: ${leaveType}`,
      );
  }
}

export async function submitLeaveRequest(
  request: LeaveRequest,
): Promise<{
  status: 'pending';
  managerName: string;
}> {
  const employee = await getEmployee(request.employeeId);

  if (!employee) {
    throw new Error('Employee not found.');
  }

  const manager = managers.find(
    (manager) => manager.id === employee.managerId,
  );

  if (!manager) {
    throw new Error(
      'Approving manager could not be found.',
    );
  }

  return {
    status: 'pending',
    managerName: manager.name,
  };
}