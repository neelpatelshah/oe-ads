import { NextResponse } from "next/server";
import { ChromaClient, Collection } from "chromadb";
import { MockAdDB, Physician } from "../../../data/mockdb";
import { FeatureExtractionPipeline } from "@xenova/transformers";

let embedder: FeatureExtractionPipeline | null = null;
let physicianCollection: Collection | null = null;

// Caching function for ML resources
async function getResources() {
  if (embedder && physicianCollection) {
    return { embedder, physicianCollection };
  }
  const { pipeline } = await import("@xenova/transformers");
  embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");

  const client = new ChromaClient();
  physicianCollection = await client.getCollection({
    name: "physician_profiles",
  });

  return { embedder, physicianCollection };
}

export async function POST(request: Request) {
  try {
    const { adId } = await request.json();
    if (!adId) {
      return NextResponse.json({ error: "adId is required" }, { status: 400 });
    }

    // 1. Find the ad and its primary target category label
    const ad = MockAdDB.listAds().find((a) => a.id === adId);
    if (!ad || ad.categoryIds.length === 0) {
      return NextResponse.json(
        { error: "Ad not found or has no categories" },
        { status: 404 }
      );
    }
    const primaryCategoryId = ad.categoryIds[0];
    const category = MockAdDB.listCategories().find(
      (c) => c.id === primaryCategoryId
    );
    if (!category) {
      return NextResponse.json(
        { error: "Category not found for ad" },
        { status: 404 }
      );
    }
    const textToEmbed = category.label; // e.g., "Breast Cancer"

    // 2. Get ML resources
    const { embedder, physicianCollection } = await getResources();

    // 3. Create an embedding for the ad's TARGET CATEGORY
    const queryEmbeddingOutput = await embedder(textToEmbed, {
      pooling: "mean",
      normalize: true,
    });
    const queryEmbedding = Array.from(queryEmbeddingOutput.data);

    // 4. Query the PHYSICIAN collection to find the top 3 most similar doctors
    const results = await physicianCollection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: 3,
    });

    // 5. Look up the full physician profiles using the IDs from the search results
    const matchedPhysicianIds = results.ids[0];
    const matchedPhysicians = matchedPhysicianIds
      .map((id) => MockAdDB.getPhysicianById(id))
      .filter((p): p is Physician => p !== undefined); // Type guard to remove undefined

    return NextResponse.json(matchedPhysicians);
  } catch (error) {
    console.error("Audience matching error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
