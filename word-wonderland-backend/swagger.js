const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Word Wonderland API',
      version: '1.0.0',
      description: 'A comprehensive vocabulary learning system API with JSON file storage',
      contact: {
        name: 'API Support'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    tags: [
      { name: 'Words', description: 'Word management endpoints' },
      { name: 'Parts of Speech', description: 'Part of speech management endpoints' },
      { name: 'Phrases', description: 'Phrase management endpoints' },
      { name: 'Sentences', description: 'Sentence management endpoints' },
      { name: 'Sentence Patterns', description: 'Sentence pattern management endpoints' },
      { name: 'Topics', description: 'Topic management endpoints' }
    ]
  },
  apis: ['./routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

