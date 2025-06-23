## Setup

```bash
pnpm ready
```

This will do package installation and start the ChromaDB dev container, which is what I'm using as a lightweight solution for storing and quering embeddings.

You will need the `OPENAI_API_KEY` environment variable. It's suggested that you place is in an env file, but if you want to just run everything with the OpenAI key in tow that's fine too. It will be needed for the remaining steps.

```bash
pnpm seed
```

This will generate mock seed data embeddings via OpenAI for us to use later.

## Run

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
