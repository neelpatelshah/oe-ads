import { NextResponse } from "next/server";
import { ChromaClient, Collection } from "chromadb";
import { MockAdDB } from "../../../../data/mockdb";
import OpenAI from "openai";
import { AD_COLLECTION_NAME } from "@/lib/utils";

const client = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

let collection: Collection | null = null;

async function getCollection() {
  if (collection) {
    return { collection };
  }

  const client = new ChromaClient();
  collection = await client.getCollection({ name: AD_COLLECTION_NAME });

  return { collection };
}

// this would absolutely be higher in production given time to do better testing, embedding, and scoring
const SIMILARITY_THRESHOLD = 0.1;

export async function POST(request: Request) {
  try {
    const { question } = await request.json();

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    const { collection } = await getCollection();

    const embedding = await client.embeddings.create({
      model: "text-embedding-3-small",
      input: question,
    });

    const results = await collection.query({
      queryEmbeddings: [embedding.data[0].embedding],
      nResults: 1,
    });

    if (results.ids.length === 0 || results.ids[0].length === 0) {
      console.log(`No category match found for question: "${question}"`);
      return NextResponse.json(null);
    }

    const bestMatch = {
      id: results.ids[0][0],
      distance: results.distances[0][0],
      categoryId: results.metadatas[0][0]?.categoryId,
    };

    // if there is no match found then don't show an ad (meaning similarity is 0)
    const l2Distance = bestMatch.distance;
    let similarity = 0;

    if (l2Distance) {
      const cosineSimilarity = 1 - Math.pow(l2Distance, 2);
      similarity = (cosineSimilarity + 1) / 2;
    }

    console.log(
      `Query: "${question}" | Best Match: ${
        bestMatch.id
      } | Similarity: ${similarity.toFixed(4)}`
    );

    if (similarity < SIMILARITY_THRESHOLD) {
      console.log(
        `Match found, but similarity is below threshold. Not showing ad.`
      );
      return NextResponse.json(null);
    }

    const adsForCategory = MockAdDB.listAds({
      categoryId: bestMatch.categoryId as any,
    });

    if (adsForCategory.length === 0) {
      console.warn(
        `Category match found (${bestMatch.categoryId}), but no ads are configured.`
      );
      return NextResponse.json(null);
    }

    const adToShow = adsForCategory[0];
    const companyName = MockAdDB.listCompanies().find(
      (c) => c.id === adToShow.companyId
    )?.name;

    MockAdDB.recordImpression(adToShow.id);

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const answer = searchParams.get("answer");
  const ad = searchParams.get("ad");

  if (!answer || !ad) {
    return NextResponse.json(
      { error: "Missing 'answer' or 'ad' parameter" },
      { status: 400 }
    );
  }

  const req = { answer, ad };

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "Given the answer to some question asked by a physician and the name of a drug in a pharma ad, return a short blurb that explains how the drug might apply to the situation the physician is asking about. Only return text and use no markdown.",
        },
        { role: "user", content: JSON.stringify(req) },
      ],
      max_tokens: 200,
    });

    const answer = response.choices[0].message.content;

    if (!answer) {
      return NextResponse.json(
        { error: "No answer generated" },
        { status: 500 }
      );
    }

    return NextResponse.json({ answer: answer.trim() });
  } catch (error) {
    console.error("Error fetching connection:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
