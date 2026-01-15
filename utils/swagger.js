import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Pharmadeal API",
      version: "1.0.0",
      description: "API documentation for Auth, Products, Payments",
    },
    servers: [
      {
        url: "http://localhost:8000",
      },
    ],
  },

  // 🔥 VERY IMPORTANT → path to your routes
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

export const swaggerUiServe = swaggerUi.serve;
export const swaggerUiSetup = swaggerUi.setup(swaggerSpec);
