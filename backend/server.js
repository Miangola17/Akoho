const express = require('express');
const cors = require('cors');
require('dotenv').config();

const racesRouter = require('./routes/races');
const lotsRouter = require('./routes/lots');
const statistiquesRouter = require('./routes/statistiques');
const oeufsRouter = require('./routes/oeufs');
const bilanRouter = require('./routes/bilan');
const mortsRouter = require('./routes/morts');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/races', racesRouter);
app.use('/api/lots', lotsRouter);
app.use('/api/statistiques', statistiquesRouter);
app.use('/api/oeufs', oeufsRouter);
app.use('/api/bilan', bilanRouter);
app.use('/api/morts', mortsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`Akoho Backend running on http://localhost:${PORT}`);
});
