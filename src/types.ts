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
