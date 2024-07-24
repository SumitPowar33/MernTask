// src/components/PieChart.js

import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import axios from 'axios';

Chart.register(...registerables); // Register all necessary components

const PieChart = ({ month, year }) => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchPieChartData = async () => {
            const response = await axios.get(`http://localhost:5000/api/pie-chart?month=${month}&year=${year}`);
            setData(response.data);
        };
        fetchPieChartData();
    }, [month, year]);

    const chartData = {
        labels: data.map(item => item.category),
        datasets: [
            {
                data: data.map(item => item.count),
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF',
                ],
            },
        ],
    };

    return (
        <div className="bg-blue-100 p-4 rounded-lg shadow-md mb-4">
            <h2 className="text-xl font-semibold">Pie Chart of Categories</h2>
            <Pie data={chartData} />
        </div>
    );
};

export default PieChart;