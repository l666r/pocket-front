import React, { useState } from 'react';

export default function BudgetTrackerView({ currentCity = 'Kochi', currencySymbol = '₹', showToast }) {
  const [totalBudget, setTotalBudget] = useState(6000);
  const [expenses, setExpenses] = useState([
    { id: 'e1', title: 'Breakfast & Artisan Filter Coffee', category: 'Food', amount: 240, paidBy: 'You' },
    { id: 'e2', title: 'Water Metro Ferry Passes (2 Adults)', category: 'Transit', amount: 60, paidBy: 'You' },
    { id: 'e3', title: 'Museum & Heritage Entry Tickets', category: 'Tickets', amount: 200, paidBy: 'Rahul' },
    { id: 'e4', title: 'Waterfront Sunset Dining', category: 'Food', amount: 850, paidBy: 'You' },
  ]);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState('Food');
  const [newPaidBy, setNewPaidBy] = useState('You');

  // Split with friends
  const [friendNames, setFriendNames] = useState(['You', 'Rahul', 'Priya']);
  const [newFriendInput, setNewFriendInput] = useState('');

  const totalSpent = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const remainingBudget = totalBudget - totalSpent;
  const perPersonShare = friendNames.length > 0 ? (totalSpent / friendNames.length).toFixed(0) : totalSpent;

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAmount) return;

    const newExp = {
      id: 'exp_' + Date.now(),
      title: newTitle.trim(),
      category: newCategory,
      amount: Number(newAmount),
      paidBy: newPaidBy,
    };

    setExpenses([newExp, ...expenses]);
    setNewTitle('');
    setNewAmount('');
    showToast(`Logged "${newExp.title}" (${currencySymbol}${newExp.amount})`, 'success');
  };

  const handleAddFriend = (e) => {
    e.preventDefault();
    if (!newFriendInput.trim() || friendNames.includes(newFriendInput.trim())) return;
    setFriendNames([...friendNames, newFriendInput.trim()]);
    setNewFriendInput('');
    showToast(`Added friend to split bill group`, 'info');
  };

  return (
    <div className="budget-tracker-layout animate-fade-in">
      {/* Top Budget Summary Card */}
      <div className="card-box budget-summary-card">
        <div className="bsc-top">
          <div>
            <div className="verified-pill">
              <span className="pulsing-green-dot"></span>
              <span>LIVE EXPENSE ENGINE</span>
            </div>
            <h2 className="bsc-title">💳 {currentCity} Budget & Split Manager</h2>
          </div>
          <div className="bsc-gauge-stat">
            <span className="bgs-label">Remaining:</span>
            <span className="bgs-val" style={{ color: remainingBudget >= 0 ? '#E5A93C' : '#EF4444' }}>
              {currencySymbol}{remainingBudget.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="budget-bar-track">
          <div
            className="budget-bar-fill"
            style={{ width: `${Math.min(100, (totalSpent / totalBudget) * 100)}%` }}
          ></div>
        </div>

        <div className="bsc-metrics-row">
          <div className="bm-item">
            <span className="bm-label">Allocated Budget</span>
            <span className="bm-val">{currencySymbol}{totalBudget.toLocaleString()}</span>
          </div>
          <div className="bm-item">
            <span className="bm-label">Total Spent So Far</span>
            <span className="bm-val">{currencySymbol}{totalSpent.toLocaleString()}</span>
          </div>
          <div className="bm-item">
            <span className="bm-label">Per Person Split ({friendNames.length} pax)</span>
            <span className="bm-val">{currencySymbol}{perPersonShare} each</span>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Log Expense & Split Bill */}
      <div className="budget-two-col-grid">
        {/* Left: Log Expense Form & History */}
        <div className="card-box budget-log-box">
          <div className="budget-subbox-header">
            <h3 className="subbox-title">➕ Quick Log Expense</h3>
            <p className="subbox-desc">Record purchases, meals & transit to keep budgets balanced.</p>
          </div>
          <form onSubmit={handleAddExpense} className="expense-form">
            <div className="ef-row">
              <input
                type="text"
                placeholder="What was this spend for? (e.g. Ferry tickets)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                className="input-field"
              />
              <input
                type="number"
                placeholder={`Amount (${currencySymbol})`}
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                required
                className="input-field"
                style={{ maxWidth: '140px' }}
              />
            </div>

            <div className="ef-row">
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="input-field"
              >
                <option value="Food">☕ Food & Dining</option>
                <option value="Transit">⛴️ Public Transit</option>
                <option value="Tickets">🎟️ Entry Tickets</option>
                <option value="Stay">🏨 Hotel / Stay</option>
              </select>

              <select
                value={newPaidBy}
                onChange={(e) => setNewPaidBy(e.target.value)}
                className="input-field"
              >
                {friendNames.map((name) => (
                  <option key={name} value={name}>Paid by: {name}</option>
                ))}
              </select>

              <button type="submit" className="btn-prime" style={{ whiteSpace: 'nowrap' }}>
                Add Spend
              </button>
            </div>
          </form>

          {/* Recent Spends List */}
          <div className="expenses-history-list">
            <h4 className="ehl-title">Recent Transactions ({expenses.length})</h4>
            {expenses.map((exp) => (
              <div key={exp.id} className="expense-item-row">
                <div className="eir-left">
                  <span className="eir-cat">
                    {exp.category === 'Food' ? '☕' : exp.category === 'Transit' ? '⛴️' : '🎟️'}
                  </span>
                  <div>
                    <div className="eir-name">{exp.title}</div>
                    <div className="eir-meta">{exp.category} • Paid by {exp.paidBy}</div>
                  </div>
                </div>
                <div className="eir-amount">{currencySymbol}{exp.amount}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Split Bill with Friends Calculator */}
        <div className="card-box budget-split-box">
          <div className="budget-subbox-header">
            <h3 className="subbox-title">👥 Split with Friends Calculator</h3>
            <p className="subbox-desc">Add group travelers to calculate fair splits and settlement balances.</p>
          </div>

          <form onSubmit={handleAddFriend} className="add-friend-form">
            <input
              type="text"
              placeholder="Friend's Name (e.g. Priya)"
              value={newFriendInput}
              onChange={(e) => setNewFriendInput(e.target.value)}
              className="input-field"
            />
            <button type="submit" className="btn-subtle" style={{ whiteSpace: 'nowrap' }}>
              + Add Traveler
            </button>
          </form>

          <div className="travelers-chip-list">
            {friendNames.map((name) => (
              <span key={name} className="traveler-chip">
                <span>👤</span>
                <span>{name}</span>
              </span>
            ))}
          </div>

          <div className="settlement-preview-box">
            <h4 className="spb-title">Fair Settlement Breakdown</h4>
            <div className="spb-card">
              <div className="spb-line">
                <span>Total Group Pool:</span>
                <b>{currencySymbol}{totalSpent.toLocaleString()}</b>
              </div>
              <div className="spb-line">
                <span>Each Person's Share:</span>
                <b style={{ color: '#E5A93C' }}>{currencySymbol}{perPersonShare}</b>
              </div>
              <div className="spb-tip">
                💡 Tip: PocketRoute automatically tallies receipts so everyone pays an equal share before trip completion.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
