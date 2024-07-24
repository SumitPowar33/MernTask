const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();

app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://127.0.0.1:27017/mernChallenge', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Models
const ProductTransaction = mongoose.model('ProductTransaction', new mongoose.Schema({
    title: String,
    description: String,
    price: { type: Number, required: true }, 
    dateOfSale: Date,
    sold: Boolean,
    category: String
}));

const InitializationStatus = mongoose.model('InitializationStatus', new mongoose.Schema({
    initialized: { type: Boolean, default: false }
}));

// Helper function to get date range for a month and year
const getDateRangeForMonthYear = (year, month) => {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);
    return { start, end };
};

// Initialize Database
const initializeDatabase = async () => {
    try {
        console.log('Fetching data from external API...');
        const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');

        if (!response.data || !Array.isArray(response.data)) {
            throw new Error('Invalid data structure from external API');
        }

        const data = response.data;
        console.log('Data fetched:', data.length, 'records');
        console.log('Deleting existing records...');
        await ProductTransaction.deleteMany({});
        console.log('Inserting new records...');
        await ProductTransaction.insertMany(data);
        await InitializationStatus.updateOne({}, { initialized: true }, { upsert: true });
        console.log('Database initialized');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
};

// Check if the database is initialized on server start
const checkInitialization = async () => {
    const status = await InitializationStatus.findOne();
    if (!status || !status.initialized) {
        console.log('Database not initialized. Initializing now...');
        await initializeDatabase();
    } else {
        console.log('Database already initialized');
    }
};

checkInitialization();

// API Endpoints

// List All Transactions
app.get('/api/transactions', async (req, res) => {
    const { year, month, search = '', page = 1, perPage = 10 } = req.query;

    // Validate year and month
    if (!year || !month) {
        return res.status(400).send('Year and month query parameters are required');
    }

    const { start, end } = getDateRangeForMonthYear(parseInt(year), parseInt(month));

    // Build the query
    const query = {
        dateOfSale: { $gte: start, $lt: end },
        $or: [
            { title: new RegExp(search, 'i') },
            { description: new RegExp(search, 'i') }
        ]
    };

    // Attempt to parse the search parameter as a number
    const parsedPrice = parseFloat(search);
    if (!isNaN(parsedPrice)) {
        query.$or.push({ price: { $gte: parsedPrice - 0.01, $lte: parsedPrice + 0.01 } });
    }

    try {
        const transactions = await ProductTransaction.find(query)
            .skip((page - 1) * perPage)
            .limit(Number(perPage));

        const totalCount = await ProductTransaction.countDocuments(query);
        res.json({ transactions, totalCount });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).send('Error fetching transactions');
    }
});

// Statistics
app.get('/api/statistics', async (req, res) => {
    const { year, month } = req.query;

    if (!year || !month) {
        return res.status(400).send('Year and month query parameters are required');
    }

    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10);

    if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
        return res.status(400).send('Invalid year or month parameter');
    }

    const { start, end } = getDateRangeForMonthYear(yearNum, monthNum);

    try {
        const totalSalesResult = await ProductTransaction.aggregate([
            { $match: { dateOfSale: { $gte: start, $lt: end } } },
            { $group: { _id: null, totalAmount: { $sum: '$price' } } }
        ]).exec();

        const totalSales = totalSalesResult[0]?.totalAmount || 0;
        const soldItems = await ProductTransaction.countDocuments({ dateOfSale: { $gte: start, $lt: end }, sold: true }).exec();
        const unsoldItems = await ProductTransaction.countDocuments({ dateOfSale: { $gte: start, $lt: end }, sold: false }).exec();

        res.status(200).json({ totalSales, soldItems, unsoldItems });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).send('Error fetching statistics');
    }
});

// Bar Chart
app.get('/api/bar-chart', async (req, res) => {
    const { year, month } = req.query;

    const { start, end } = getDateRangeForMonthYear(parseInt(year), parseInt(month));

    const query = { dateOfSale: { $gte: start, $lt: end } };

    const priceRanges = [
        { range: '0-100', min: 0, max: 100 },
        { range: '101-200', min: 101, max: 200 },
        { range: '201-300', min: 201, max: 300 },
        { range: '301-400', min: 301, max: 400 },
        { range: '401-500', min: 401, max: 500 },
        { range: '501-600', min: 501, max: 600 },
        { range: '601-700', min: 601, max: 700 },
        { range: '701-800', min: 701, max: 800 },
        { range: '801-900', min: 801, max: 900 },
        { range: '901-above', min: 901, max: Infinity }
    ];

    try {
        const result = await Promise.all(priceRanges.map(async range => {
            const count = await ProductTransaction.countDocuments({
                ...query,
                price: { $gte: range.min, $lte: range.max === Infinity ? Number.MAX_VALUE : range.max }
            });
            return { range: range.range, count };
        }));

        res.json(result);
    } catch (error) {
        console.error('Error fetching bar chart data:', error);
        res.status(500).send('Error fetching bar chart data');
    }
});

// Pie Chart
app.get('/api/pie-chart', async (req, res) => {
    const { year, month } = req.query;

    const { start, end } = getDateRangeForMonthYear(parseInt(year), parseInt(month));

    const query = { dateOfSale: { $gte: start, $lt: end } };

    try {
        const categories = await ProductTransaction.aggregate([
            { $match: query },
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);

        res.json(categories.map(category => ({ category: category._id, count: category.count })));
    } catch (error) {
        console.error('Error fetching pie chart data:', error);
        res.status(500).send('Error fetching pie chart data');
    }
});

// Combined API
app.get('/api/combined', async (req, res) => {
    const { year, month } = req.query;

    const { start, end } = getDateRangeForMonthYear(parseInt(year), parseInt(month));

    const query = { dateOfSale: { $gte: start, $lt: end } };

    try {
        const [transactions, statistics, barChart, pieChart] = await Promise.all([
            ProductTransaction.find(query),
            ProductTransaction.aggregate([
                { $match: query },
                { $group: { _id: null, totalSales: { $sum: '$price' }, soldItems: { $sum: { $cond: ['$sold', 1, 0] } }, notSoldItems: { $sum: { $cond: ['$sold', 0, 1] } } } }
            ]),
            ProductTransaction.aggregate([
                { $match: query },
                { $bucket: { groupBy: '$price', boundaries: [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, Number.MAX_VALUE], default: '901-above', output: { count: { $sum: 1 } } } }
            ]),
            ProductTransaction.aggregate([
                { $match: query },
                { $group: { _id: '$category', count: { $sum: 1 } } }
            ])
        ]);

        res.json({
            transactions,
            statistics: statistics[0],
            barChart: barChart.map(bucket => ({ range: bucket._id, count: bucket.count })),
            pieChart: pieChart.map(category => ({ category: category._id, count: category.count }))
        });
    } catch (error) {
        console.error('Error fetching combined data:', error);
        res.status(500).send('Error fetching combined data');
    }
});

app.listen(5000, () => {
    console.log('Server running on port 5000'); 
});