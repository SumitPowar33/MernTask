// src/components/BarChart.js

import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import axios from 'axios';

Chart.register(...registerables); // Register all necessary components

const BarChart = ({ month, year }) => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchBarChartData = async () => {
            const response = await axios.get(`http://localhost:5000/api/bar-chart?month=${month}&year=${year}`);
            setData(response.data);
        };
        fetchBarChartData();
    }, [month, year]);

    const chartData = {
        labels: data.map(item => item.range),
        datasets: [
            {
                label: 'Number of Items',
                data: data.map(item => item.count),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
            },
        ],
    };

    return (
        <div className="bg-blue-100 p-4 rounded-lg shadow-md mb-4">
            <h2 className="text-xl font-semibold">Bar Chart of Price Ranges</h2>
            <Bar data={chartData} />
        </div>
    );

};

export default BarChart;