import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Trade, Account, Expense, Todo } from '../types';

interface DataContextType {
    trades: Trade[];
    accounts: Account[];
    expenses: Expense[];
    todos: Todo[];
    addTrade: (trade: Trade) => void;
    deleteTrade: (id: string) => void;
    addAccount: (account: Account) => void;
    addExpense: (expense: Expense) => void;
    addTodo: (todo: Todo) => void;
    toggleTodo: (id: string) => void;
    deleteTodo: (id: string) => void;
    updateTodo: (todo: Todo) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
    // Load initial state from LocalStorage
    const [trades, setTrades] = useState<Trade[]>(() => JSON.parse(localStorage.getItem('trades') || '[]'));
    const [accounts, setAccounts] = useState<Account[]>(() => JSON.parse(localStorage.getItem('accounts') || '[]'));
    const [expenses, setExpenses] = useState<Expense[]>(() => JSON.parse(localStorage.getItem('expenses') || '[]'));
    const [todos, setTodos] = useState<Todo[]>(() => JSON.parse(localStorage.getItem('todos') || '[]'));

    // Sync with LocalStorage
    useEffect(() => localStorage.setItem('trades', JSON.stringify(trades)), [trades]);
    useEffect(() => localStorage.setItem('accounts', JSON.stringify(accounts)), [accounts]);
    useEffect(() => localStorage.setItem('expenses', JSON.stringify(expenses)), [expenses]);
    useEffect(() => localStorage.setItem('todos', JSON.stringify(todos)), [todos]);

    const addTrade = (trade: Trade) => setTrades(prev => [trade, ...prev]);
    const deleteTrade = (id: string) => setTrades(prev => prev.filter(t => t.id !== id));

    const addAccount = (account: Account) => setAccounts(prev => [...prev, account]);

    const addExpense = (expense: Expense) => {
        setExpenses(prev => [expense, ...prev]);
        // Deduct from account balance
        setAccounts(prev => prev.map(acc =>
            acc.id === expense.accountId
                ? { ...acc, balance: acc.balance - expense.amount }
                : acc
        ));
    };

    const addTodo = (todo: Todo) => setTodos(prev => [todo, ...prev]);
    const toggleTodo = (id: string) => setTodos(prev => prev.map(t => t.id === id ? { ...t, isComplete: !t.isComplete } : t));
    const deleteTodo = (id: string) => setTodos(prev => prev.filter(t => t.id !== id));
    const updateTodo = (updated: Todo) => setTodos(prev => prev.map(t => t.id === updated.id ? updated : t));

    return (
        <DataContext.Provider value={{
            trades, accounts, expenses, todos,
            addTrade, deleteTrade,
            addAccount, addExpense,
            addTodo, toggleTodo, deleteTodo, updateTodo
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error('useData must be used within a DataProvider');
    return context;
};
