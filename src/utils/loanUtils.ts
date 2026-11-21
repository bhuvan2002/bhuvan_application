import { differenceInMonths, parseISO, isSameMonth } from 'date-fns';
import type { Account, Expense } from '../types';

/**
 * Returns how much EMI was paid this month for a given loan account.
 */
export const getThisMonthEMIPaid = (loan: Account, expenses: Expense[]): number => {
    const now = new Date();
    let paid = 0;
    expenses.forEach(e => {
        const isEmiPayment =
            (e.toAccountId === loan.id && e.type === 'TRANSFER') ||
            (e.accountId === loan.id && e.type === 'CREDIT');
        if (isEmiPayment && isSameMonth(parseISO(e.date), now)) {
            paid += Number(e.amount);
        }
    });
    return paid;
};

export const getLoanDetails = (loan: Account, expenses: Expense[]) => {
    const emi = loan.emiAmount || 0;
    const originalAmount = loan.balance || 0;
    const end = loan.loanEndDate ? parseISO(loan.loanEndDate) : new Date();
    const created = loan.createdAt ? parseISO(loan.createdAt) : new Date();

    // Calculate how many EMIs have been paid based on expenses in the app
    let totalPaid = 0;
    expenses.forEach(e => {
        if ((e.toAccountId === loan.id && e.type === 'TRANSFER') || (e.accountId === loan.id && e.type === 'CREDIT')) {
            totalPaid += e.amount;
        }
    });

    const successfullyPaidEMIs = emi > 0 ? Math.floor(totalPaid / emi) : 0;

    // The scheduled EMIs within the context of the app is the months between when the loan was tracked and its end date.
    // +1 because inclusive of the start month.
    let scheduledEMIs = differenceInMonths(end, created) + 1;
    if (scheduledEMIs < 0) scheduledEMIs = 0;

    // Remaining EMIs
    const remainingEMIs = Math.max(0, scheduledEMIs - successfullyPaidEMIs);
    
    // Remaining Balance
    const remainingBalance = remainingEMIs * emi;

    return {
        originalAmount,
        emi,
        scheduledEMIs,
        successfullyPaidEMIs,
        remainingEMIs,
        remainingBalance
    };
};
