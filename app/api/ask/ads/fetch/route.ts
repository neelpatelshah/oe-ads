import { NextResponse } from "next/server";
import { ChromaClient, Collection } from "chromadb";
import { MockAdDB, Ad } from "../../../../data/mockdb"; // Use alias for clean imports
import { DefaultEmbeddingFunction } from "@chroma-core/default-embed";

// We'll cache the model and Chroma client instance to avoid reloading on every request.
// This is a simple but effective optimization for serverless environments.
const embedder = new DefaultEmbeddingFunction();
let collection: Collection | null = null;

async function getModelAndCollection() {
  if (embedder && collection) {
    return { embedder, collection };
  }

  const client = new ChromaClient();
  collection = await client.getCollection({ name: "ad_categories" });

  return { embedder, collection };
}

// This is a crucial parameter. It prevents us from showing ads that are a poor match.
// You'll need to tune this value. 0.5 is a reasonable starting point.
// (1 = perfect match, 0 = no relation)
const SIMILARITY_THRESHOLD = 0.5;

export async function POST(request: Request) {
  try {
    const { question } = await request.json();

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    // 1. Get our ML resources
    const { embedder, collection } = await getModelAndCollection();

    // 2. Generate an embedding for the user's question
    const queryEmbeddings = await embedder.generate([question]);

    // 3. Query Chroma to find the most similar ad category
    const results = await collection.query({
      queryEmbeddings,
      nResults: 1, // We only care about the single best match
    });

    // 4. Check if we found any result
    if (results.ids.length === 0 || results.ids[0].length === 0) {
      console.log(`No category match found for question: "${question}"`);
      return NextResponse.json(null); // Return null to indicate no ad
    }

    const bestMatch = {
      id: results.ids[0][0],
      distance: results.distances[0][0],
      categoryId: results.metadatas[0][0]?.categoryId,
    };

    // if there is no match found then don't show an ad (meaning similarity is 0)
    const similarity = 1 - (bestMatch.distance ?? 1);
    console.log(
      `Query: "${question}" | Best Match: ${
        bestMatch.id
      } | Similarity: ${similarity.toFixed(4)}`
    );

    // 6. Enforce our quality threshold
    if (similarity < SIMILARITY_THRESHOLD) {
      console.log(
        `Match found, but similarity is below threshold. Not showing ad.`
      );
      return NextResponse.json(null);
    }

    // 7. We have a winner! Find an ad for this category.
    const adsForCategory = MockAdDB.listAds({
      categoryId: bestMatch.categoryId as any,
    });

    if (adsForCategory.length === 0) {
      console.warn(
        `Category match found (${bestMatch.categoryId}), but no ads are configured.`
      );
      return NextResponse.json(null);
    }

    // Simple logic: pick the first available ad.
    // A more advanced system could A/B test or round-robin here.
    const adToShow = adsForCategory[0];
    const companyName = MockAdDB.listCompanies().find(
      (c) => c.id === adToShow.companyId
    )?.name;

    // 8. IMPORTANT: Record the impression on the backend.
    MockAdDB.recordImpression(adToShow.id);

    // 9. Return the ad data, including company name for easier display on the frontend.
    return NextResponse.json({
      ...adToShow,
      companyName: companyName || adToShow.companyId,
    });
  } catch (error) {
    console.error("Error fetching ad:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
