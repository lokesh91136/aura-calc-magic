import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CalculatorButton } from '@/components/ui/calculator-button';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { useHistory } from '@/contexts/HistoryContext';

interface Transaction {
  id: number;
  type: 'add' | 'subtract';
  amount: number;
  description: string;
  timestamp: Date;
}

export function TallyCalculator() {
  const [balance, setBalance] = useState<number>(0);
  const [inputAmount, setInputAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { addToHistory } = useHistory();

  const addTransaction = (type: 'add' | 'subtract') => {
    const amount = parseFloat(inputAmount);
    if (isNaN(amount) || amount <= 0) return;

    const transaction: Transaction = {
      id: Date.now(),
      type,
      amount,
      description: description || `${type === 'add' ? 'Added' : 'Subtracted'} ${amount}`,
      timestamp: new Date()
    };

    const newBalance = type === 'add' ? balance + amount : balance - amount;
    
    setBalance(newBalance);
    setTransactions([transaction, ...transactions]);
    setInputAmount('');
    setDescription('');
    
    // Save to history
    addToHistory({
      type: 'tally',
      calculation: `${type === 'add' ? '+' : '-'}${amount} (${transaction.description})`,
      result: `Balance: ${newBalance.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}`,
      details: { transaction, newBalance, previousBalance: balance }
    });
  };

  const clearAll = () => {
    setBalance(0);
    setTransactions([]);
    setInputAmount('');
    setDescription('');
  };

  const removeTransaction = (id: number) => {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;

    const newBalance = transaction.type === 'add' 
      ? balance - transaction.amount 
      : balance + transaction.amount;
    
    setBalance(newBalance);
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-slide-up">
      <Card className="bg-gradient-card border-border/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Tally Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Balance */}
          <Card className={`border-0 ${balance >= 0 ? 'bg-gradient-equals' : 'bg-gradient-clear'}`}>
            <CardContent className="p-6 text-center">
              <div className="text-sm text-white/80">Current Balance</div>
              <div className="text-4xl font-bold text-white">
                {formatCurrency(balance)}
              </div>
            </CardContent>
          </Card>

          {/* Input Section */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount</label>
                <Input
                  type="number"
                  value={inputAmount}
                  onChange={(e) => setInputAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="bg-gradient-number border-border/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description (Optional)</label>
                <Input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add note..."
                  className="bg-gradient-number border-border/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <CalculatorButton
                variant="equals"
                onClick={() => addTransaction('add')}
                className="flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add
              </CalculatorButton>
              <CalculatorButton
                variant="operator"
                onClick={() => addTransaction('subtract')}
                className="flex items-center justify-center gap-2"
              >
                <Minus className="h-4 w-4" />
                Subtract
              </CalculatorButton>
              <CalculatorButton
                variant="clear"
                onClick={clearAll}
                className="flex items-center justify-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Clear
              </CalculatorButton>
            </div>
          </div>

          {/* Transaction History */}
          {transactions.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Transaction History</h3>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {transactions.map((transaction) => (
                  <Card key={transaction.id} className="bg-gradient-number border-border/10">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {transaction.type === 'add' ? (
                              <Plus className="h-4 w-4 text-success" />
                            ) : (
                              <Minus className="h-4 w-4 text-destructive" />
                            )}
                            <span className="font-medium">
                              {formatCurrency(transaction.amount)}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {transaction.description}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {transaction.timestamp.toLocaleString()}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTransaction(transaction.id)}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}