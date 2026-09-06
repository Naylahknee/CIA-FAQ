# GitHub and Cloudflare setup

This repository is a full-stack Vinext application for Cloudflare Workers. It includes a D1 database for wall submissions and correction requests, plus an R2 bucket for uploaded images.

## 1. Create the GitHub repository

1. In GitHub, create an empty repository named `my-village-auntie-cia`.
2. Do not add a README, license, or `.gitignore` during creation.
3. Upload this project or push it from your computer.
4. Use `main` as the default branch.

Claude can then connect to that repository and edit the normal project source.

## 2. Create the Cloudflare resources

In the Cloudflare dashboard, create:

- A D1 database named `my-village-auntie-cia`
- An R2 bucket named `my-village-auntie-cia-media`

Save the D1 database ID shown by Cloudflare.

## 3. Configure GitHub

In the GitHub repository, open **Settings → Secrets and variables → Actions**.

Add these repository secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_D1_DATABASE_ID`

Add these repository variables:

- `CLOUDFLARE_D1_DATABASE_NAME` = `my-village-auntie-cia`
- `CLOUDFLARE_R2_BUCKET_NAME` = `my-village-auntie-cia-media`

The Cloudflare API token needs permission to deploy Workers and manage the selected D1 and R2 resources.

## 4. Create the database tables

After the first successful build, run this once from a local checkout authenticated with Cloudflare:

```bash
npm ci
npm run build
npm run db:migrate:cloudflare
```

The migration in `drizzle/` creates the tables used by the community walls and correction form.

## 5. Deploy

Every push to `main` triggers `.github/workflows/deploy-cloudflare.yml`. GitHub builds the application and deploys it to Cloudflare Workers.

For a manual deployment from an authenticated computer:

```bash
npm ci
npm run deploy:cloudflare
```

## Important

- Do not commit Cloudflare tokens, account IDs, or the real D1 database ID into the repository.
- The `.openai/hosting.json` file is used only by the existing ChatGPT-hosted copy. Cloudflare deployment reads the generated `dist/server/wrangler.json` file.
- Once the Cloudflare site is working, the ChatGPT-hosted copy can remain as a backup or be retired.
