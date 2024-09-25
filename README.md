This is a timed assessment platform for candidates. Companies can create challenges for candidates to complete and send them a link to the challenge. The candidate can start the challenge whenever they want and submit their answers within a fixed time limit.

This is a work in progress and is not yet ready for production.

## Getting Started

Running the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

For local development, set up Upstash and set your credentials in a `.env.local` file, copied from `.env.sample`.

## Work to do

- Note that users can't do two challenges - we require unique email address, and we use localStorage to cache the submission globally
