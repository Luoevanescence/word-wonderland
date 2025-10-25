module.exports = {
  port: process.env.PORT || 3000,
  dataDirectory: './data',
  apiPrefix: '/api',
  corsOptions: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }
};

