const port = process.env.PORT;

export const options = {
  definition: {
    spyne: '1.0.0',
    info: {
      title: 'spyne docs',
      version: '1.0.0',
      description: 'API for managing users and their cars.',
    },
    servers: [
      {
        url: `http://localhost:${port}`,
      },
    ],
  },
  apis: ['./src/routes/**/*.ts'],
};
