const fs = require("fs");
const path = require("path");

const MODELS_DIR = path.join(__dirname, "models");
const ROUTES_DIR = path.join(__dirname, "routes");

const swagger = {
  openapi: "3.0.0",
  info: {
    title: "E-Commerce API",
    version: "1.0.0",
  },
  servers: [{ url: "http://localhost:5000/api" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
      },
    },
    schemas: {},
  },
  paths: {},
};

//////////////////////////////////////////////////
// 🧠 CLEAN FILES
//////////////////////////////////////////////////

const validModelFile = (file) => file.endsWith("Model.js");

//////////////////////////////////////////////////
// 🧠 TYPE DETECTION
//////////////////////////////////////////////////

const detectType = (text) => {
  if (text.includes("String")) return "string";
  if (text.includes("Number")) return "number";
  if (text.includes("Boolean")) return "boolean";
  if (text.includes("Date")) return "string";
  return "string";
};

//////////////////////////////////////////////////
// 🧠 PARSE MODELS (ADVANCED)
//////////////////////////////////////////////////

const parseModels = () => {
  const files = fs.readdirSync(MODELS_DIR);

  files.filter(validModelFile).forEach((file) => {
    const content = fs.readFileSync(path.join(MODELS_DIR, file), "utf-8");

    const name = file.replace("Model.js", "");

    const schema = {
      type: "object",
      properties: {},
    };

    // 🧠 detect fields (better regex)
    const regex = /(\w+):\s*({[^}]+}|\[[^\]]+\])/g;

    let match;
    while ((match = regex.exec(content))) {
      const field = match[1];
      const value = match[2];

      // 🔥 ARRAY
      if (value.startsWith("[")) {
        schema.properties[field] = {
          type: "array",
          items: { type: "object" },
        };
        continue;
      }

      // 🔥 RELATION
      if (value.includes("ref")) {
        const ref = value.match(/ref:\s*["'`](\w+)["'`]/);
        if (ref) {
          schema.properties[field] = {
            $ref: `#/components/schemas/${ref[1]}`,
          };
          continue;
        }
      }

      // 🔥 NORMAL TYPE
      schema.properties[field] = {
        type: detectType(value),
      };
    }

    swagger.components.schemas[name] = schema;
  });
};

//////////////////////////////////////////////////
// 🧠 PARSE ROUTES
//////////////////////////////////////////////////

const parseRoutes = () => {
  const files = fs.readdirSync(ROUTES_DIR);

  files.forEach((file) => {
    const content = fs.readFileSync(path.join(ROUTES_DIR, file), "utf-8");

    const base = file.replace("Routes.js", "");

    const regex = /router\.(get|post|put|patch|delete)\(["'`](.*?)["'`]/g;

    let match;
    while ((match = regex.exec(content))) {
      const method = match[1];
      const route = match[2];

      const pathUrl =
        "/api/" + base.toLowerCase() + (route === "/" ? "" : route);

      if (!swagger.paths[pathUrl]) {
        swagger.paths[pathUrl] = {};
      }

      const secure =
        content.includes("protect") || content.includes("authorize");

      swagger.paths[pathUrl][method] = {
        tags: [base],
        summary: `${method.toUpperCase()} ${base}`,
        security: secure ? [{ bearerAuth: [] }] : [],
        parameters: route.includes(":id")
          ? [
              {
                name: "id",
                in: "path",
                required: true,
                schema: { type: "string" },
              },
            ]
          : [],
        requestBody:
          method !== "get"
            ? {
                content: {
                  "application/json": {
                    schema: {
                      $ref: `#/components/schemas/${base}`,
                    },
                  },
                },
              }
            : undefined,
        responses: {
          200: {
            description: "Success",
          },
        },
      };
    }
  });
};

//////////////////////////////////////////////////
//   RUN
//////////////////////////////////////////////////

parseModels();
parseRoutes();

fs.writeFileSync("swagger-fixed.json", JSON.stringify(swagger, null, 2));

console.log("  Fixed Swagger Generated");
