const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.stack);

  if (err.code === '23505') {
    return res.status(400).json({ message: 'Duplicate entry. Resource already exists.' });
  }
  if (err.code === '23503') {
    return res.status(400).json({ message: 'Referenced resource not found.' });
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

const notFound = (req, res, next) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
};

module.exports = { errorHandler, notFound };
