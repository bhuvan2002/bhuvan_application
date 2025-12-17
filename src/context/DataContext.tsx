import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Trade, Account, Expense, Todo } from '../types';
import { useAuth } from './AuthContext';

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
    const { token } = useAuth();
    const [trades, setTrades] = useState<Trade[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [todos, setTodos] = useState<Todo[]>([]);

    const API_URL = 'http://localhost:3000/api';

    const getHeaders = (authToken: string | null = token) => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    });

    const logout = () => {
        // Clear data on logout keying off dependency
        setTrades([]);
        setAccounts([]);
        setExpenses([]);
        setTodos([]);
    };

    const fetchData = async (authToken: string | null = token) => {
        if (!authToken) {
            logout(); // Clear data if no token
            return;
        }
        try {
            const [tradesRes, accountsRes, expensesRes, todosRes] = await Promise.all([
                fetch(`${API_URL}/trades`, { headers: getHeaders(authToken) }),
                fetch(`${API_URL}/accounts`, { headers: getHeaders(authToken) }),
                fetch(`${API_URL}/expenses`, { headers: getHeaders(authToken) }),
                fetch(`${API_URL}/todos`, { headers: getHeaders(authToken) })
            ]);

            if (tradesRes.ok) setTrades(await tradesRes.json());
            if (accountsRes.ok) setAccounts(await accountsRes.json());
            if (expensesRes.ok) setExpenses(await expensesRes.json());
            if (todosRes.ok) setTodos(await todosRes.json());
        } catch (error) {
            console.error('Failed to fetch data:', error);
            if (String(error).includes('403') || String(error).includes('401')) {
                // authLogout(); // Let AuthContext handle logout state, we just react to token change? 
                // Currently AuthContext doesn't expose a way to force logout from here unless we use useAuth().logout
                // But if token is invalid, we will eventually get a 401.
            }
        }
    };

    useEffect(() => {
        if (token) {
            fetchData(token);
        } else {
            logout();
        }
    }, [token]);

    const addTrade = async (trade: Trade) => {
        try {
            const res = await fetch(`${API_URL}/trades`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(trade)
            });
            if (res.ok) {
                const newTrade = await res.json();
                setTrades(prev => [newTrade, ...prev]);
            }
        } catch (error) {
            console.error('Failed to add trade:', error);
        }
    };

    const deleteTrade = async (id: string) => {
        try {
            const res = await fetch(`${API_URL}/trades/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            if (res.ok) {
                setTrades(prev => prev.filter(t => t.id !== id));
            }
        } catch (error) {
            console.error('Failed to delete trade:', error);
        }
    };

    const addAccount = async (account: Account) => {
        try {
            const res = await fetch(`${API_URL}/accounts`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(account)
            });
            if (res.ok) {
                const newAccount = await res.json();
                setAccounts(prev => [...prev, newAccount]);
            }
        } catch (error) {
            console.error('Failed to add account:', error);
        }
    };

    const addExpense = async (expense: Expense) => {
        try {
            const res = await fetch(`${API_URL}/expenses`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(expense)
            });
            if (res.ok) {
                const newExpense = await res.json();
                setExpenses(prev => [newExpense, ...prev]);

                // Refresh accounts to get updated balance
                const accountsRes = await fetch(`${API_URL}/accounts`, { headers: getHeaders() });
                if (accountsRes.ok) setAccounts(await accountsRes.json());
            }
        } catch (error) {
            console.error('Failed to add expense:', error);
        }
    };

    const addTodo = async (todo: Todo) => {
        try {
            const res = await fetch(`${API_URL}/todos`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(todo)
            });
            if (res.ok) {
                const newTodo = await res.json();
                setTodos(prev => [newTodo, ...prev]);
            }
        } catch (error) {
            console.error('Failed to add todo:', error);
        }
    };

    const toggleTodo = async (id: string) => {
        const todo = todos.find(t => t.id === id);
        if (!todo) return;
        try {
            const res = await fetch(`${API_URL}/todos/${id}`, {
                method: 'PATCH',
                headers: getHeaders(),
                body: JSON.stringify({ isComplete: !todo.isComplete })
            });
            if (res.ok) {
                const updated = await res.json();
                setTodos(prev => prev.map(t => t.id === id ? updated : t));
            }
        } catch (error) {
            console.error('Failed to toggle todo:', error);
        }
    };

    const deleteTodo = async (id: string) => {
        try {
            const res = await fetch(`${API_URL}/todos/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            if (res.ok) {
                setTodos(prev => prev.filter(t => t.id !== id));
            }
        } catch (error) {
            console.error('Failed to delete todo:', error);
        }
    };

    const updateTodo = async (updated: Todo) => {
        try {
            const res = await fetch(`${API_URL}/todos/${updated.id}`, {
                method: 'PATCH',
                headers: getHeaders(),
                body: JSON.stringify(updated)
            });
            if (res.ok) {
                const newTodo = await res.json();
                setTodos(prev => prev.map(t => t.id === updated.id ? newTodo : t));
            }
        } catch (error) {
            console.error('Failed to update todo:', error);
        }
    };

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
