import { ChromaClient } from "chromadb";
import { MockAdDB } from "../app/data/mockdb";
import { pipeline } from "@xenova/transformers";

const client = new ChromaClient();
const COLLECTION_NAME = "mock_ad_cat_data";

async function seedDatabase() {
  console.log("Starting DB seed process...");

  const embedder = await pipeline(
    "feature-extraction",
    "Xenova/all-MiniLM-L6-v2"
  );

  // 1. Reset the collection if it exists to ensure a clean slate
  try {
    await client.deleteCollection({ name: COLLECTION_NAME });
    console.log(`Collection '${COLLECTION_NAME}' deleted.`);
  } catch (error) {
    console.log(
      `Collection '${COLLECTION_NAME}' did not exist, creating new one.`
    );
  }

  const collection = await client.createCollection({ name: COLLECTION_NAME });

  // 2. Get the categories and their associated ads
  const categories = MockAdDB.listCategories();
  const documents = [];
  const embeddings = [];
  const metadatas = [];
  const ids = [];

  for (const category of categories) {
    console.log(`Processing category: ${category.label}`);

    // We will embed the category's human-readable label. This is our "evidence".
    const textToEmbed = category.label;

    // 3. Generate the embedding
    const output = await embedder(textToEmbed, {
      pooling: "mean",
      normalize: true,
    });
    const embedding = Array.from(output.data);

    // 4. Prepare the data for ChromaDB
    // For each category, we create one document in the vector DB.
    // The metadata will help us link back to our original data.
    documents.push(textToEmbed);
    embeddings.push(embedding);
    metadatas.push({ categoryId: category.id });
    ids.push(category.id);
  }

  // 5. Add all the data to the collection in one batch
  await collection.add({
    ids: ids,
    embeddings: embeddings,
    metadatas: metadatas,
    documents: documents,
  });

  console.log("✅ Database seeded successfully!");
  console.log(
    `Added ${await collection.count()} documents to the '${COLLECTION_NAME}' collection.`
  );
}

seedDatabase().catch(console.error);
