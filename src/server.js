const express = require('express');
const env = require('./config/env');
const apiRouter = require('./routes/api');

const app = express();

app.use(express.json());
app.use('/api/v1', apiRouter);

app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'Unexpected server error',
      details: err.details || []
    }
  });
});

app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`API server listening on port ${env.port}`);
});
