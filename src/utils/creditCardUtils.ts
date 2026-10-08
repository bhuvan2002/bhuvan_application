import { parseISO, isBefore, isAfter, isEqual, startOfDay, format } from 'date-fns';
import type { Account, Expense } from '../types';

export interface CreditCardCycleDetails {
    currentCycleStart: Date;
    currentCycleEnd: Date;
    previousCycleStart: Date;
    previousCycleEnd: Date;
    nextCycleStart: Date;
    
    currentCycleSpent: number;
    currentCyclePaid: number;
    
    previousStatementAmount: number;
    previousStatementPaid: number;
    
    outstandingStatementAmount: number;
    totalOutstandingBalance: number;
}

export function getCreditCardCycleDetails(
    account: Account,
    expenses: Expense[],
    currentDate: Date = new Date()
): CreditCardCycleDetails | null {
    if (account.type !== 'CREDIT_CARD') return null;

    const cycleDay = account.billingCycle || 1; 

    // Handle shorter months gracefully (e.g. if cycleDay is 31, and we are in Feb)
    const getSafeCycleDate = (year: number, month: number, day: number) => {
        let d = new Date(year, month, day);
        // If the month rolled over (e.g. Feb 31 -> Mar 3), clamp it to the last day of the intended month
        if (d.getMonth() !== (month % 12 + 12) % 12) {
            d = new Date(year, month + 1, 0); // Last day of intended month
        }
        return startOfDay(d);
    };

    let currentCycleStart = getSafeCycleDate(currentDate.getFullYear(), currentDate.getMonth(), cycleDay);
    
    if (isAfter(currentCycleStart, currentDate)) {
        currentCycleStart = getSafeCycleDate(currentDate.getFullYear(), currentDate.getMonth() - 1, cycleDay);
    }
    
    const currentCycleEnd = getSafeCycleDate(currentCycleStart.getFullYear(), currentCycleStart.getMonth() + 1, cycleDay);
    const previousCycleStart = getSafeCycleDate(currentCycleStart.getFullYear(), currentCycleStart.getMonth() - 1, cycleDay);
    const previousCycleEnd = currentCycleStart;
    const nextCycleStart = currentCycleEnd;

    let currentCycleSpent = 0;
    let currentCyclePaid = 0;
    let previousStatementAmount = 0;
    let previousStatementPaid = 0; // Payments made AFTER previous cycle closed, up to now

    expenses.forEach(e => {
        const d = startOfDay(parseISO(e.date));
        const amount = Number(e.amount);

        const isSpent = (e.accountId === account.id && (e.type === 'DEBIT' || !e.type || e.type === 'TRANSFER'));
        const isPaid = (e.accountId === account.id && e.type === 'CREDIT') || 
                       (e.toAccountId === account.id && e.type === 'TRANSFER');

        // Belonging to previous cycle?
        if ((isEqual(d, previousCycleStart) || isAfter(d, previousCycleStart)) && isBefore(d, previousCycleEnd)) {
            if (isSpent) previousStatementAmount += amount;
            // (If they pay during the previous cycle itself, it reduces the amount owed for that cycle)
            if (isPaid) previousStatementAmount -= amount; 
        }
        
        // Belonging to current cycle?
        if ((isEqual(d, currentCycleStart) || isAfter(d, currentCycleStart)) && isBefore(d, currentCycleEnd)) {
            if (isSpent) currentCycleSpent += amount;
            if (isPaid) {
                currentCyclePaid += amount;
                previousStatementPaid += amount; // We count payments in current cycle towards paying off previous statement
            }
        }
    });

    // Ensure statement amount isn't negative if they overpaid in previous cycle
    previousStatementAmount = Math.max(0, previousStatementAmount);
    
    // Remaining bill to pay for previous statement
    const outstandingStatementAmount = Math.max(0, previousStatementAmount - previousStatementPaid);

    return {
        currentCycleStart,
        currentCycleEnd,
        previousCycleStart,
        previousCycleEnd,
        nextCycleStart,
        currentCycleSpent,
        currentCyclePaid,
        previousStatementAmount,
        previousStatementPaid,
        outstandingStatementAmount,
        totalOutstandingBalance: account.balance // As tracked by the backend, representing total current liability
    };
}

export function getExpenseCycleLabel(account: Account, dateIso: string): string {
    if (account.type !== 'CREDIT_CARD' || !account.billingCycle) return '';
    const cycleDay = account.billingCycle;
    const d = parseISO(dateIso);
    
    // Handle shorter months gracefully
    const getSafeCycleDate = (year: number, month: number, day: number) => {
        let date = new Date(year, month, day);
        if (date.getMonth() !== (month % 12 + 12) % 12) {
            date = new Date(year, month + 1, 0); 
        }
        return startOfDay(date);
    };
    
    let cycleStart = getSafeCycleDate(d.getFullYear(), d.getMonth(), cycleDay);
    if (isAfter(cycleStart, d)) {
        cycleStart = getSafeCycleDate(d.getFullYear(), d.getMonth() - 1, cycleDay);
    }
    const cycleEnd = getSafeCycleDate(cycleStart.getFullYear(), cycleStart.getMonth() + 1, cycleDay);

    return `${format(cycleStart, 'dd MMM yyyy')} → ${format(cycleEnd, 'dd MMM yyyy')} Statement`;
}
