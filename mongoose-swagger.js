const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

//////////////////////////////////////////////////
// 🔥 CONFIG
//////////////////////////////////////////////////

const BASE_URL = "http://localhost:5000/api";

const swagger = {
  openapi: "3.0.0",
  info: {
    title: "E-Commerce API",
    version: "1.0.0",
    description: "Enterprise Auto Generated Swagger",
  },
  servers: [{ url: BASE_URL }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {},
  },
  security: [{ bearerAuth: [] }],
  paths: {},
};

//////////////////////////////////////////////////
// 🔥 LOAD MODELS (SAFE)
//////////////////////////////////////////////////

const loadModels = () => {
  const modelsDir = path.join(__dirname, "models");
  const files = fs.readdirSync(modelsDir);

  files.forEach((file) => {
    const modelPath = path.join(modelsDir, file);
    const imported = require(modelPath);
    const model = imported.default || imported;

    if (!model || !model.schema) {
      console.warn(`  Skipped invalid model: ${file}`);
      return;
    }

    const schemaName = model.modelName || file.replace(".js", "");
    swagger.components.schemas[schemaName] = convertSchema(model.schema);
  });
};

//////////////////////////////////////////////////
// 🔥 MONGOOSE → SWAGGER
//////////////////////////////////////////////////

const convertSchema = (schema) => {
  const properties = {};
  const required = [];

  schema.eachPath((key, value) => {
    let field = {};

    if (value.instance === "String") field.type = "string";
    else if (value.instance === "Number") field.type = "number";
    else if (value.instance === "Boolean") field.type = "boolean";
    else if (value.instance === "Date") field.type = "string";
    else if (value.instance === "ObjectID") {
      field.type = "string";
      field.format = "uuid";
    } else if (value.instance === "Array") {
      field.type = "array";
      field.items = { type: "string" };
    } else {
      field.type = "string";
    }

    if (value.options?.ref) {
      field.$ref = `#/components/schemas/${value.options.ref}`;
    }

    properties[key] = field;

    if (value.isRequired) required.push(key);
  });

  return {
    type: "object",
    properties,
    required,
  };
};

//////////////////////////////////////////////////
// 🔥 PARSE ROUTES (SMART)
//////////////////////////////////////////////////

const parseRoutes = () => {
  const routesDir = path.join(__dirname, "routes");
  const files = fs.readdirSync(routesDir);

  files.forEach((file) => {
    const content = fs.readFileSync(path.join(routesDir, file), "utf-8");

    const matches = content.match(
      /router\.(get|post|put|patch|delete)\(["'`](.*?)["'`]/g,
    );

    if (!matches) return;

    matches.forEach((m) => {
      const method = m.match(/router\.(\w+)/)[1];
      const route = m.match(/\(["'`](.*?)["'`]/)[1];

      const fullPath = `/api${route}`;

      if (!swagger.paths[fullPath]) swagger.paths[fullPath] = {};

      swagger.paths[fullPath][method] = {
        tags: [file.replace("Routes.js", "")],
        summary: `${method.toUpperCase()} ${route}`,
        security:
          route.includes("login") || route.includes("register")
            ? []
            : [{ bearerAuth: [] }],
        responses: {
          200: { description: "Success" },
          400: { description: "Bad Request" },
          401: { description: "Unauthorized" },
          404: { description: "Not Found" },
        },
      };

      if (method === "post" || method === "put" || method === "patch") {
        swagger.paths[fullPath][method].requestBody = {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object" },
            },
          },
        };
      }
    });
  });
};

//////////////////////////////////////////////////
// 🔥 AUTO LINK MODELS TO ROUTES
//////////////////////////////////////////////////

const enhanceSchemas = () => {
  Object.keys(swagger.paths).forEach((route) => {
    const parts = route.split("/");
    const name = parts[2]; // products, orders, etc

    const schemaName = Object.keys(swagger.components.schemas).find((s) =>
      s.toLowerCase().includes(name.slice(0, -1)),
    );

    if (!schemaName) return;

    Object.keys(swagger.paths[route]).forEach((method) => {
      const endpoint = swagger.paths[route][method];

      if (endpoint.requestBody) {
        endpoint.requestBody.content["application/json"].schema = {
          $ref: `#/components/schemas/${schemaName}`,
        };
      }

      endpoint.responses[200].content = {
        "application/json": {
          schema: {
            $ref: `#/components/schemas/${schemaName}`,
          },
        },
      };
    });
  });
};

//////////////////////////////////////////////////
//   BUILD SWAGGER
//////////////////////////////////////////////////

loadModels();
parseRoutes();
enhanceSchemas();

fs.writeFileSync(
  path.join(__dirname, "swagger-enterprise.json"),
  JSON.stringify(swagger, null, 2),
);

console.log("  Enterprise Swagger Generated!");
