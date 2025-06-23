import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env["OPENAI_API_KEY"] });

import { ChromaClient } from "chromadb";
import { MockAdDB } from "../app/data/mockdb";

const client = new ChromaClient();

async function seedDatabase() {
  console.log("Starting DB seed process...");

  const COLLECTION_NAME = "mock_ad_cat_data";
  const PHYSICIAN_COLLECTION_NAME = "mock_physician_profiles";

  try {
    await client.deleteCollection({ name: COLLECTION_NAME });
    console.log(`Collection '${COLLECTION_NAME}' deleted.`);

    await client.deleteCollection({ name: PHYSICIAN_COLLECTION_NAME });
    console.log(`Collection '${PHYSICIAN_COLLECTION_NAME}' deleted.`);
  } catch (error) {
    console.log(`One of the collections did not exist, creating new one.`);
  }

  try {
    const collection = await client.createCollection({ name: COLLECTION_NAME });

    const categories = MockAdDB.listCategories();
    const documents = [];
    const embeddings = [];
    const metadatas = [];
    const ids = [];

    for (const category of categories) {
      console.log(`Processing category: ${category.label}`);

      const textToEmbed = category.label;

      const embedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: textToEmbed,
      });

      documents.push(textToEmbed);
      embeddings.push(embedding.data[0].embedding);
      metadatas.push({ categoryId: category.id });
      ids.push(category.id);
    }

    await collection.add({
      ids,
      embeddings,
      metadatas,
      documents,
    });

    console.log("✅ Database seeded successfully!");
    console.log(
      `Added ${await collection.count()} documents to the '${COLLECTION_NAME}' collection.`
    );
  } catch (error) {
    console.error("Error during seeding ads:", error);
    return;
  }

  console.log(`\n--- Seeding '${PHYSICIAN_COLLECTION_NAME}' ---`);
  try {
    const physicianCollection = await client.createCollection({
      name: PHYSICIAN_COLLECTION_NAME,
    });

    const documents = [];
    const embeddings = [];
    const metadatas = [];
    const ids = [];

    const physicians = MockAdDB.listPhysicians();
    for (const physician of physicians) {
      console.log(`Embedding profile for: ${physician.name}`);
      const embedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: physician.description,
      });

      documents.push(physician.description);
      embeddings.push(embedding.data[0].embedding);
      metadatas.push({
        physicianId: physician.id,
      });
      ids.push(physician.id);
    }
    await physicianCollection.add({
      ids,
      embeddings,
      metadatas,
      documents,
    });
  } catch (error) {
    console.error("Error during seeding physicians:", error);
    return;
  }
}

seedDatabase().catch(console.error);
