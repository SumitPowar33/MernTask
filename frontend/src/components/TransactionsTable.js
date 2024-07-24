import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TransactionsTable = ({ month, year }) => {
    const [transactions, setTransactions] = useState([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchTransactions();
    }, [month, year, search, page]);

    const fetchTransactions = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/transactions`, {
                params: { month, year, search, page, perPage: 10 }
            });
            setTransactions(response.data.transactions);
            setTotalPages(Math.ceil(response.data.totalCount / 10));
        } catch (error) {
            console.error('Error fetching transactions:', error);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Transactions Table</h2>
            <input 
                type="text" 
                placeholder="Search..." 
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1); // Reset to the first page when search changes
                }}
                className="border rounded p-2 mb-4 shadow-md"
            />
            <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border border-gray-300 p-2">ID</th>
                        <th className="border border-gray-300 p-2">Title</th>
                        <th className="border border-gray-300 p-2">Description</th>
                        <th className="border border-gray-300 p-2">Price</th>
                        <th className="border border-gray-300 p-2">Date of Sale</th>
                        <th className="border border-gray-300 p-2">Category</th>
                        <th className="border border-gray-300 p-2">Sold</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map(transaction => (
                        <tr key={transaction._id}>
                            <td className="border border-gray-300 p-2">{transaction._id}</td>
                            <td className="border border-gray-300 p-2">{transaction.title}</td>
                            <td className="border border-gray-300 p-2">{transaction.description}</td>
                            <td className="border border-gray-300 p-2">{transaction.price.toFixed(2)}</td>
                            <td className="border border-gray-300 p-2">{new Date(transaction.dateOfSale).toLocaleDateString()}</td>
                            <td className="border border-gray-300 p-2">{transaction.category}</td>
                            <td className="border border-gray-300 p-2">{transaction.sold ? 'Yes' : 'No'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="flex justify-between mt-4">
                <button 
                    onClick={() => setPage(page - 1)} 
                    disabled={page === 1} 
                    className="bg-blue-500 text-white p-2 rounded shadow-md"
                >
                    Previous
                </button>
                <button 
                    onClick={() => setPage(page + 1)} 
                    disabled={page === totalPages} 
                    className="bg-blue-500 text-white p-2 rounded shadow-md"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default TransactionsTable;