**Setup**

```bash
pnpm ready
```

This will do package installation and start the ChromaDB dev container, which is what I'm using as a lightweight solution for storing and quering embeddings. You'll need a new terminal window after ChromaDB is up and running.

You will need the `OPENAI_API_KEY` environment variable. It's suggested that you place is in an env file, but if you want to just run everything with the OpenAI key in tow that's fine too. It will be needed for the remaining steps.

```bash
pnpm seed
```

This will generate mock seed data embeddings via OpenAI for us to use later.

**Run**

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

**Hi OE Team!**

Thanks for taking the time to look at this submission. Let me give you a rundown of what I did, what choices I made, and how I arrived at what I felt was an "awesome" solution.

I wanted to build a psuedo full-stack app that demonstrated several facets of a well-rounded ad offering that goes beyond the prompt, and to structure it in a way that creates clear areas for reasonable upgrades to help this become a core business offering.

I allocated about 10 hours to this over a few days, and I wanted to showcase varied product thinking and execution. My goal was to deliver:

- a nice looking app
- an ad placement strategy similar to what we might do in a production setting
- create a sort of ad success scoring as a proof of concept.

**App Improvements**

The two largest changes to the look and feel I made were:

- making use of shad & tailwind
- using the Vercel AI SDK to be able to stream text responses rather than waiting for a completion from the OpenAI API. This also gives us nice things like generation status and custom appendings to the message stream, creating a more flexible and responsive app.

I also generated a mocked database and service layer that was suitable for my needs even if not perfect, because the actual implementation didn't seem completely relevant to the problem statement.

**Ad Placement**

I wanted to have an ad placement solution that better mirrored something OpenEvidence might actually build. I settled on creating embeddings for each category in a vectorized database and then querying against those with the user's question to get results, and using cosine similarity to determine if an ad should be shown or not.

I chose ChromaDB as a very light and easy solution to do this, fitting quite neatly into a NextJS environment without too much effort. Ultimately, I used enough pieces to make this work, but the level-ups here In the real world are straightforward:

- I imagine OpenEvidence has much stronger and more bespoque infra that this could be built on top of, including using a better tuned embedding model than somthing out of the box from OpenAI.
- With some testing, I imagine a mixture of scoring would be used to match ads to queries rather than just a single distance measurement with an arbitrarily low threshold to make sure ads show up consistently for this demo.
- In practice, the extra info (plus other factors like spend from companies) will help surface "winners" for ads that have competition in each category.

You should be able to ask a number of questions per category, such as `What is arthritis?`, `What are the types of arthritis?`, etc and get relevant ads.

I added an additional piece as well, which takes the response from the model and the ad headline (drug name and marketing tagline, essentially) and sends it off to a model to create a quick blurb about how the drug could apply to the situation the user is asking about. This tailors each ad to the user and their situation with the intention of more time spent on the ad and a higher click-through rate. Again, the level-ups here are straightforward, as in practice there will be more detail and information surrounding each ad/drug and the model that performs this application analysis will be better tuned to medical and pharmaceutical queries than an out of the box OpenAI model.

And as one last extra piece, I added a very simple concept of "sponsored questions" that can show before the user has asked a question. This will naturally cause the ad for that company to show up due to the similarity process. This isn't exactly related to the problem statement but was a realistic addition that could boost ad revenue, and it helped fill out the home page.

**Ad Performance Analysis**

I created a very barebones dashboard to show off common ad performance metrics that are entirely simulated, as that metric collection implementation is quite common and would be better done through something like Mixpanel or PostHog anyways.

The second section on the dashboard shows a match scoring per ad and then the same scoring applied to "converted" physicians.

- Advertisers can compare how an their ads are performing in a given category against successful sales.
- Advertisers identify their own "Dollar Accuracy" thresholds, which shows how tailored ad reach needs to be in order to increase the likelihood of a sale.

These percentages are calculated similar to the ad-query matching. Physicians are embedded and seeded into our dev DB, and then given an ad category, the cosine similarity that is calculated is meant to show how applicable an ad in that category would be to that physician. Improvements on this method (beyond what I've said about embeddings infra and models before) would be:

- have a running (but still compliant) profile for each physician that helps categorize them.
- combine these calculated scores with traditional metrics like CTR and ROAS to try and provide comprehensive analysis on what the exact yield per ad is.

**Other notes**

In addition to the improvements I mentioned above, I want to make note of a few more things:

- The physician matching functionality (along with the rest of the embeddings and querying) would realistically be hosted elsewhere, meaning there's some API layer that I can't perfectly replicate in a take home demo.
- User profiles would factor into ad placement, not just the query and ad info.
- The Vercel AI SDK could still be used since you can supply custom models to it, its one example of many modular choices throughout the project.
- There's a bunch of console warnings from a dependency of ChromaDB that isn't resolved properly. It's not needed so I just left it alone rather than toying too much with ESM stuff.

To me, this shows multiple areas of a mature ad offering covered in a realistic and upgradeable way. Between core ingredients (like vector search for ad placement) and bits of sugar (how does this drug apply to the model response?), I think this demoes a product that advertisers would see immediate value in, with the ability to improve their ads and buy back into the system.

Thank you for your time!
