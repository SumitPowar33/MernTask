import React, { useState } from 'react';
import TransactionsTable from './components/TransactionsTable';
import Statistics from './components/Statistics';
import BarChart from './components/BarChart';
import PieChart from './components/PieChart';

const App = () => {
    const [month, setMonth] = useState(3); // Default to March
    const [year, setYear] = useState(2022); // Default to 2022

    const handleMonthChange = (e) => {
        setMonth(e.target.value);
    };

    const handleYearChange = (e) => {
        setYear(e.target.value);
    };

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gray-50">
            <h1 className="text-3xl sm:text-4xl font-bold text-center mb-6 text-gray-800">Transactions Dashboard</h1>
            <div className="flex flex-col sm:flex-row justify-center mb-6">
                <select value={month} onChange={handleMonthChange} className="border rounded p-2 mr-2 mb-2 sm:mb-0 shadow-md">
                    {Array.from({ length: 12 }, (_, i) => (
                        <option key={i} value={i + 1}>
                            {new Date(0, i).toLocaleString('default', { month: 'long' })}
                        </option>
                    ))}
                </select>
                <select value={year} onChange={handleYearChange} className="border rounded p-2 shadow-md">
                    {Array.from({ length: 10 }, (_, i) => (
                        <option key={i} value={new Date().getFullYear() - i}>
                            {new Date().getFullYear() - i}
                        </option>
                    ))}
                </select>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg mb-8">
                <TransactionsTable month={month} year={year} />
            </div>

            <div className="mb-8">
                <Statistics month={month} year={year} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <BarChart month={month} year={year} />
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <PieChart month={month} year={year} />
                </div>
            </div>
        </div>
    );
};

export default App;