import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Statistics = ({ month, year }) => {
    const [statistics, setStatistics] = useState({ totalSales: 0, soldItems: 0, unsoldItems: 0 });

    useEffect(() => {
        const fetchStatistics = async () => {
            const response = await axios.get(`http://localhost:5000/api/statistics?month=${month}&year=${year}`);
            setStatistics(response.data);
        };
        fetchStatistics();
    }, [month, year]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Statistics for {new Date(year, month - 1).toLocaleString('default', { month: 'long' })} {year}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg shadow">
                    <h3 className="font-bold">Total Sales Amount</h3>
                    <p className="text-xl">{statistics.totalSales}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg shadow">
                    <h3 className="font-bold">Total Sold Items</h3>
                    <p className="text-xl">{statistics.soldItems}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg shadow">
                    <h3 className="font-bold">Total Not Sold Items</h3>
                    <p className="text-xl">{statistics.unsoldItems}</p>
                </div>
            </div>
        </div>
    );
};

export default Statistics;