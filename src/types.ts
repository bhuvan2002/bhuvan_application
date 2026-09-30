export type Role = 'TRADER' | 'PARENT';

export interface User {
    username: string;
    role: Role;
}

export interface Account {
    id: string;
    name: string;
    bankName: string;
    accountNumber: string;
    ifsc?: string;
    mobileAppKey?: string;
    atmKey?: string;
    balance: number;
    type?: string;
    creditLimit?: number | null;
    dueDate?: number | null;
    loanEndDate?: string | null;
}

export interface Expense {
    id: string;
    date: string;
    amount: number;
    category: string;
    description: string;
    accountId: string;
    toAccountId?: string;
    type?: 'CREDIT' | 'DEBIT' | 'TRANSFER';
}

export interface Trade {
    id: string;
    date: string;
    symbol: string;
    type: 'BUY' | 'SELL';
    strategy: string;
    lotSize: number;
    entryPrice: number;
    exitPrice: number;
    pnl: number;
    notes: string;
}

export interface Todo {
    id: string;
    title: string;
    isComplete: boolean;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    dueDate: string;
}

export interface Plan {
    id: string;
    title: string;
    type: string;
    startTime: string;
    endTime: string;
    notes: string;
    date: string;
}

export interface Note {
    id: string;
    title: string;
    content: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface BankAccount {
    id: string;
    bankName: string;
    accountName: string;
    accountNumber?: string;
    accountType: string;
    balance: number;
    transactions?: BankTransaction[];
}

export interface BankTransaction {
    id: string;
    date: string;
    amount: number;
    type: 'CREDIT' | 'DEBIT';
    category: string;
    description: string;
    bankAccountId: string;
    creditCardPaymentId?: string;
    loanEmiPaymentId?: string;
}

export interface CreditCard {
    id: string;
    cardName: string;
    provider: string;
    last4Digits?: string;
    creditLimit: number;
    outstanding: number;
    billingCycle?: number;
    dueDate?: number;
    expenses?: CreditCardExpense[];
}

export interface CreditCardExpense {
    id: string;
    date: string;
    amount: number;
    category: string;
    description: string;
    creditCardId: string;
}

export interface Loan {
    id: string;
    loanName: string;
    provider: string;
    totalAmount: number;
    emiAmount: number;
    startDate: string;
    tenureMonths: number;
    emis?: LoanEMI[];
}

export interface LoanEMI {
    id: string;
    emiNumber: number;
    dueDate: string;
    amount: number;
    status: 'UPCOMING' | 'PAID';
    paymentDate?: string;
    loanId: string;
    bankAccountId?: string;
}
