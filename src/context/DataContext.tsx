import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Trade, Account, Expense, Todo, Note } from '../types';
import { useAuth } from './AuthContext';
import apiService from '../services/apiService';

interface DataContextType {
    trades: Trade[];
    accounts: Account[];
    expenses: Expense[];
    todos: Todo[];
    notes: Note[];
    fetchTrades: () => Promise<void>;
    fetchAccounts: () => Promise<void>;
    fetchExpenses: () => Promise<void>;
    fetchTodos: () => Promise<void>;
    fetchNotes: () => Promise<void>;
    addTrade: (trade: Trade) => void;
    deleteTrade: (id: string) => void;
    addAccount: (account: Account) => void;
    updateAccount: (account: Account) => void;
    deleteAccount: (id: string) => void;
    addExpense: (expense: Expense) => void;
    addBulkExpenses: (expenses: Partial<Expense>[]) => Promise<void>;
    addTodo: (todo: Todo) => void;
    toggleTodo: (id: string) => void;
    deleteTodo: (id: string) => void;
    updateTodo: (todo: Todo) => void;
    addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateNote: (note: Note) => Promise<void>;
    deleteNote: (id: string) => Promise<void>;
    isGlobalLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
    const { token } = useAuth();
    const [trades, setTrades] = useState<Trade[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [todos, setTodos] = useState<Todo[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [isGlobalLoading, setIsGlobalLoading] = useState(true);
    const [initialFetchDone, setInitialFetchDone] = useState(false);

    const logout = () => {
        setTrades([]);
        setAccounts([]);
        setExpenses([]);
        setTodos([]);
        setNotes([]);
        setInitialFetchDone(false);
        setIsGlobalLoading(false); // don't load when logged out
    };

    const fetchTrades = async () => {
        if (!token) return;
        try {
            const res = await apiService.get('/trades');
            setTrades(res.data);
        } catch (error) {
            console.error('Failed to fetch trades:', error);
        }
    };

    const fetchAccounts = async () => {
        if (!token) return;
        try {
            const res = await apiService.get('/accounts');
            setAccounts(res.data);
        } catch (error) {
            console.error('Failed to fetch accounts:', error);
        }
    };

    const fetchExpenses = async () => {
        if (!token) return;
        try {
            const res = await apiService.get('/expenses');
            setExpenses(res.data);
        } catch (error) {
            console.error('Failed to fetch expenses:', error);
        }
    };

    const fetchTodos = async () => {
        if (!token) return;
        try {
            const res = await apiService.get('/todos');
            setTodos(res.data);
        } catch (error) {
            console.error('Failed to fetch todos:', error);
        }
    };

    const fetchNotes = async () => {
        if (!token) return;
        try {
            const res = await apiService.get('/notes');
            setNotes(res.data);
        } catch (error) {
            console.error('Failed to fetch notes:', error);
        }
    };

    useEffect(() => {
        if (!token) {
            logout();
        } else if (!initialFetchDone) {
            const loadAllData = async () => {
                setIsGlobalLoading(true);
                await Promise.all([
                    fetchTrades(),
                    fetchAccounts(),
                    fetchExpenses(),
                    fetchTodos(),
                    fetchNotes()
                ]);
                setInitialFetchDone(true);
                setIsGlobalLoading(false);
            };
            loadAllData();
        }
    }, [token, initialFetchDone]);

    const addTrade = async (trade: Trade) => {
        try {
            const res = await apiService.post('/trades', trade);
            if (res.status === 200 || res.status === 201) {
                setTrades(prev => [res.data, ...prev]);
            }
        } catch (error) {
            console.error('Failed to add trade:', error);
        }
    };

    const deleteTrade = async (id: string) => {
        try {
            const res = await apiService.delete(`/trades/${id}`);
            if (res.status === 200 || res.status === 204) {
                setTrades(prev => prev.filter(t => t.id !== id));
            }
        } catch (error) {
            console.error('Failed to delete trade:', error);
        }
    };

    const addAccount = async (account: Account) => {
        try {
            const res = await apiService.post('/accounts', account);
            if (res.status === 200 || res.status === 201) {
                setAccounts(prev => [...prev, res.data]);
            }
        } catch (error) {
            console.error('Failed to add account:', error);
        }
    };

    const updateAccount = async (account: Account) => {
        try {
            const res = await apiService.put(`/accounts/${account.id}`, account);
            if (res.status === 200) {
                setAccounts(prev => prev.map(a => a.id === account.id ? res.data : a));
            }
        } catch (error) {
            console.error('Failed to update account:', error);
        }
    };

    const deleteAccount = async (id: string) => {
        try {
            const res = await apiService.delete(`/accounts/${id}`);
            if (res.status === 200 || res.status === 204) {
                setAccounts(prev => prev.filter(a => a.id !== id));
            }
        } catch (error) {
            console.error('Failed to delete account:', error);
        }
    };

    const addExpense = async (expense: Expense) => {
        try {
            const res = await apiService.post('/expenses', expense);
            if (res.status === 200 || res.status === 201) {
                setExpenses(prev => [res.data, ...prev]);

                // Refresh accounts to get updated balance
                const accountsRes = await apiService.get('/accounts');
                if (accountsRes.status === 200) setAccounts(accountsRes.data);
            }
        } catch (error) {
            console.error('Failed to add expense:', error);
        }
    };

    const addBulkExpenses = async (expensesData: Partial<Expense>[]) => {
        try {
            const res = await apiService.post('/expenses/bulk', { expenses: expensesData });
            if (res.status === 200 || res.status === 201) {
                // Refresh expenses and accounts entirely since bulk adds many
                await fetchExpenses();
                await fetchAccounts();
            }
        } catch (error) {
            console.error('Failed to add bulk expenses:', error);
            throw error; // Rethrow to let the UI handle the error state
        }
    };

    const addTodo = async (todo: Todo) => {
        try {
            const res = await apiService.post('/todos', todo);
            if (res.status === 200 || res.status === 201) {
                setTodos(prev => [res.data, ...prev]);
            }
        } catch (error) {
            console.error('Failed to add todo:', error);
        }
    };

    const toggleTodo = async (id: string) => {
        const todo = todos.find(t => t.id === id);
        if (!todo) return;
        try {
            const res = await apiService.patch(`/todos/${id}`, { isComplete: !todo.isComplete });
            if (res.status === 200) {
                setTodos(prev => prev.map(t => t.id === id ? res.data : t));
            }
        } catch (error) {
            console.error('Failed to toggle todo:', error);
        }
    };

    const deleteTodo = async (id: string) => {
        try {
            const res = await apiService.delete(`/todos/${id}`);
            if (res.status === 200 || res.status === 204) {
                setTodos(prev => prev.filter(t => t.id !== id));
            }
        } catch (error) {
            console.error('Failed to delete todo:', error);
        }
    };

    const updateTodo = async (updated: Todo) => {
        try {
            const res = await apiService.patch(`/todos/${updated.id}`, updated);
            if (res.status === 200) {
                setTodos(prev => prev.map(t => t.id === updated.id ? res.data : t));
            }
        } catch (error) {
            console.error('Failed to update todo:', error);
        }
    };

    const addNote = async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            const res = await apiService.post('/notes', note);
            if (res.status === 200 || res.status === 201) {
                setNotes(prev => [res.data, ...prev]);
            }
        } catch (error) {
            console.error('Failed to add note:', error);
        }
    };

    const updateNote = async (updated: Note) => {
        try {
            const res = await apiService.put(`/notes/${updated.id}`, updated);
            if (res.status === 200) {
                setNotes(prev => prev.map(n => n.id === updated.id ? res.data : n));
            }
        } catch (error) {
            console.error('Failed to update note:', error);
        }
    };

    const deleteNote = async (id: string) => {
        try {
            const res = await apiService.delete(`/notes/${id}`);
            if (res.status === 200 || res.status === 204) {
                setNotes(prev => prev.filter(n => n.id !== id));
            }
        } catch (error) {
            console.error('Failed to delete note:', error);
        }
    };

    return (
        <DataContext.Provider value={{
            trades, accounts, expenses, todos, notes,
            fetchTrades, fetchAccounts, fetchExpenses, fetchTodos, fetchNotes,
            addTrade, deleteTrade,
            addAccount, updateAccount, deleteAccount, addExpense, addBulkExpenses,
            addTodo, toggleTodo, deleteTodo, updateTodo,
            addNote, updateNote, deleteNote,
            isGlobalLoading
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
