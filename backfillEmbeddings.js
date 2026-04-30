const dotenv = require("dotenv");
const mongoose = require("mongoose");
const OpenAI = require("openai");
const Product = require("../models/productModel");

dotenv.config({ path: "./.env" });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const BATCH_SIZE = 50; // Process 50 products at a time

const backfillEmbeddings = async () => {
  console.log("  Starting backfill process for product embeddings...");

  if (!process.env.MONGO_URI || !process.env.OPENAI_API_KEY) {
    console.error(
      " ERROR: MONGO_URI and OPENAI_API_KEY must be set in .env file.",
    );
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("  MongoDB connected.");

  const totalDocs = await Product.countDocuments({
    description_embedding: { $exists: false },
  });
  if (totalDocs === 0) {
    console.log(
      "  No products found needing embeddings. All documents are up to date.",
    );
    await mongoose.disconnect();
    return;
  }

  console.log(`ℹ️ Found ${totalDocs} products to process.`);

  let processedCount = 0;
  while (processedCount < totalDocs) {
    const productsToUpdate = await Product.find({
      description_embedding: { $exists: false },
    }).limit(BATCH_SIZE);

    if (productsToUpdate.length === 0) {
      break; // Should not happen if totalDocs > 0, but as a safeguard.
    }

    console.log(`- Processing batch of ${productsToUpdate.length} products...`);

    const descriptions = productsToUpdate.map((p) =>
      p.description.replace(/\n/g, " "),
    );

    try {
      const embeddingResponse = await openai.embeddings.create({
        model: process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small",
        input: descriptions,
        encoding_format: "float",
      });

      const bulkOps = productsToUpdate.map((product, index) => {
        return {
          updateOne: {
            filter: { _id: product._id },
            update: {
              $set: {
                description_embedding: embeddingResponse.data[index].embedding,
              },
            },
          },
        };
      });

      await Product.bulkWrite(bulkOps);
      processedCount += productsToUpdate.length;
      console.log(
        `    Batch successful. ${processedCount}/${totalDocs} products updated.`,
      );
    } catch (error) {
      console.error(" Error processing batch with OpenAI or database:", error);
      console.log("  Skipping this batch and continuing...");
      processedCount += productsToUpdate.length; // Skip to avoid infinite loop
    }
  }

  console.log("🎉 Backfill process completed successfully!");
  await mongoose.disconnect();
  console.log("🔌 MongoDB disconnected.");
};

backfillEmbeddings().catch((err) => {
  console.error(
    " An unexpected error occurred during the backfill process:",
    err,
  );
  mongoose.disconnect();
  process.exit(1);
});
