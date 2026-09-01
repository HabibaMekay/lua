export type Country = 'KSA' | 'UAE' | 'Egypt' | 'Jordan';

export interface LeaveEntitlementInput {
  country: Country;
  hireDate: string;
  currentDate: string;
  age?: number;
  employmentEntity?: string;
}

export interface LeaveEntitlementResult {
  annualEntitlement: number | null;
  basis: string;
  requiresHRReview: boolean;
}

function calculateYearsOfService(
  hireDate: string,
  currentDate: string,
): number {
  const start = new Date(hireDate);
  const end = new Date(currentDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error('Invalid hire date or current date.');
  }

  if (end < start) {
    throw new Error('Current date cannot be before hire date.');
  }

  let years = end.getFullYear() - start.getFullYear();

  const anniversaryThisYear = new Date(
    end.getFullYear(),
    start.getMonth(),
    start.getDate(),
  );

  if (end < anniversaryThisYear) {
    years--;
  }

  return years;
}

function calculateMonthsOfService(
  hireDate: string,
  currentDate: string,
): number {
  const start = new Date(hireDate);
  const end = new Date(currentDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error('Invalid hire date or current date.');
  }

  if (end < start) {
    throw new Error('Current date cannot be before hire date.');
  }

  let months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());

  if (end.getDate() < start.getDate()) {
    months--;
  }

  return Math.max(months, 0);
}

export function calculateLeaveEntitlement(
  input: LeaveEntitlementInput,
): LeaveEntitlementResult {
  const {
    country,
    hireDate,
    currentDate,
    age,
  } = input;

  const yearsOfService = calculateYearsOfService(
    hireDate,
    currentDate,
  );

  switch (country) {
    case 'KSA': {
      if (yearsOfService >= 5) {
        return {
          annualEntitlement: 30,
          basis:
            'KSA policy: 30 days after completing 5 consecutive years of service.',
          requiresHRReview: false,
        };
      }

      return {
        annualEntitlement: 21,
        basis:
          'KSA policy: 21 days for employees with less than 5 years of service.',
        requiresHRReview: false,
      };
    }

    case 'UAE': {
      const monthsOfService = calculateMonthsOfService(
        hireDate,
        currentDate,
      );

      if (yearsOfService >= 1) {
        return {
          annualEntitlement: 30,
          basis:
            'UAE policy: 30 days for employees who have completed one year of service.',
          requiresHRReview: false,
        };
      }

      if (monthsOfService > 6) {
        const accrued = monthsOfService * 2;

        return {
          annualEntitlement: accrued,
          basis:
            `UAE policy: 2 days per month for employees with more than 6 months but less than 1 year of service (${monthsOfService} months).`,
          requiresHRReview: false,
        };
      }

      return {
        annualEntitlement: null,
        basis:
          'UAE policy: employee has not completed more than 6 months of service.',
        requiresHRReview: true,
      };
    }

    case 'Egypt': {
  const monthsOfService = calculateMonthsOfService(
    hireDate,
    currentDate,
  );

  if (age !== undefined && age >= 50) {
    return {
      annualEntitlement: 30,
      basis:
        'Egypt policy: 30 days after reaching age 50.',
      requiresHRReview: false,
    };
  }

  if (yearsOfService >= 10) {
    return {
      annualEntitlement: 30,
      basis:
        'Egypt policy: 30 days after 10 full years of service.',
      requiresHRReview: false,
    };
  }

  if (yearsOfService >= 1) {
    return {
      annualEntitlement: 21,
      basis:
        'Egypt policy: 21 days from the second year of service.',
      requiresHRReview: false,
    };
  }

  if (monthsOfService >= 6) {
    return {
      annualEntitlement: 15,
      basis:
        'Egypt policy: 15 days during the first year after completing at least 6 months of service.',
      requiresHRReview: false,
    };
  }

  return {
    annualEntitlement: null,
    basis:
      'Egypt policy: employee has less than 6 months of service and requires HR review.',
    requiresHRReview: true,
  };
}

    case 'Jordan': {
      return {
        annualEntitlement: null,
        basis:
          'Jordan policy: annual leave depends on the employee contract and applicable requirements.',
        requiresHRReview: true,
      };
    }

    default:
      return {
        annualEntitlement: null,
        basis: 'Country-specific entitlement could not be determined.',
        requiresHRReview: true,
      };
  }
}