const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip || req.connection.remoteAddress;

  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`);

  // Логирование тела запроса для POST и PUT
  if (['POST', 'PUT'].includes(method) && req.body) {
    console.log('Тело запроса:', JSON.stringify(req.body, null, 2));
  }

  next();
};

module.exports = logger;