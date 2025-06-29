import { ChromaClient, Collection } from "chromadb";
import { MockAdDB, Physician } from "@/app/data/mockdb";
import OpenAI from "openai";
import { PHYSICIAN_COLLECTION_NAME } from "@/lib/utils";

let physicianCollection: Collection | null = null;

const client = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

async function getResources() {
  if (physicianCollection) {
    return { physicianCollection };
  }

  const client = new ChromaClient();
  physicianCollection = await client.getCollection({
    name: PHYSICIAN_COLLECTION_NAME,
  });

  return { physicianCollection };
}

export async function Matcher(adId: string) {
  try {
    const ad = MockAdDB.listAds().find((a) => a.id === adId);
    if (!ad || ad.categoryIds.length === 0) {
      return null;
    }
    const primaryCategoryId = ad.categoryIds[0];
    const category = MockAdDB.listCategories().find(
      (c) => c.id === primaryCategoryId
    );
    if (!category) {
      return null;
    }
    const textToEmbed = category.label;

    const { physicianCollection } = await getResources();

    const embedding = await client.embeddings.create({
      model: "text-embedding-3-small",
      input: textToEmbed,
    });

    const results = await physicianCollection.query({
      queryEmbeddings: [embedding.data[0].embedding],
      nResults: 3,
      include: ["distances"],
    });

    if (!results.ids?.[0] || !results.distances?.[0]) {
      return {};
    }

    const matchedPhysicianIds = results.ids[0];
    const matchedDistances = results.distances[0];

    const matchedPhysicians = matchedPhysicianIds
      .map((id, index) => {
        const physician = MockAdDB.getPhysicianById(id);
        if (!physician) return null;

        // if there is no match found then don't show an ad (meaning similarity is 0)
        const l2Distance = matchedDistances[index];
        let similarity = 0;

        if (l2Distance) {
          const cosineSimilarity = 1 - Math.pow(l2Distance, 2) / 2;
          similarity = (cosineSimilarity + 1) / 2;
        }

        return { physician, similarity };
      })
      .filter(
        (p): p is { physician: Physician; similarity: number } => p !== null
      );

    return { matchedPhysicians };
  } catch (error) {
    console.error("Audience matching error:", error);
  }
}
