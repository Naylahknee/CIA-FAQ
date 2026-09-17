# Deploy CIA-FAQ to Cloudflare

This project deploys from GitHub Actions to Cloudflare Workers. It uses:

- Cloudflare D1 for accounts, posts, comments, reactions, and moderation data
- Cloudflare R2 for uploaded photos
- GitHub Actions for automatic deployment after every push to `main`

You do **not** need to install the Cloudflare ChatGPT plugin.

## Before deployment: restore the PDF resources

The original project contains eight PDFs that could not be transferred through the GitHub connector. Upload these files to `public/resources/` in this repository before the final deployment:

- `allergies-brochure.pdf`
- `baking-pastry-kit.pdf`
- `culinary-kit.pdf`
- `freshman-meal-plan.pdf`
- `health-care-directory.pdf`
- `hyde-park-calendar-2026-27.pdf`
- `ordering-textbooks.pdf`
- `proxy-setup.pdf`

In GitHub, open the repository, open `public`, choose **Add file → Upload files**, create/select the `resources` folder, upload the files, and commit directly to `main`.

## 1. Create the Cloudflare D1 database

1. Sign in at https://dash.cloudflare.com/.
2. Select the Cloudflare account you want to use.
3. In the left sidebar, open **Storage & databases → D1 SQL Database**.
4. Select **Create database**.
5. Enter this exact database name: `cia-guide`
6. Select **Create**.
7. Open the database's **Settings** page.
8. Copy the **Database ID**. It is a UUID similar to `00000000-0000-0000-0000-000000000000`. Save it temporarily; GitHub needs it in step 5.

Do not create tables manually. The GitHub deployment workflow applies the migrations automatically.

## 2. Create the Cloudflare R2 bucket

1. In the Cloudflare sidebar, open **Storage & databases → R2 object storage → Overview**.
2. If Cloudflare displays an R2 checkout/activation screen, complete it. Cloudflare may require billing details even when your usage remains inside the included free allowance.
3. Select **Create bucket**.
4. Enter this exact bucket name: `cia-media`
5. Leave the location on **Automatic** unless you have a specific data-location requirement.
6. Select **Create bucket**.

Do not enable public bucket access. The application reads and writes through its Worker binding.

## 3. Copy the Cloudflare Account ID

1. In Cloudflare, open **Workers & Pages**.
2. Find **Account Details**.
3. Use the copy button beside **Account ID**.
4. Save the value temporarily.

The Account ID is not your email, account name, zone ID, or website/domain ID.

## 4. Create a Cloudflare API token

1. In Cloudflare, open **My Profile → API Tokens**.
2. Select **Create Token**.
3. Start with **Create Custom Token**. Name it `GitHub CIA-FAQ deploy`.
4. Add these account permissions:
   - **Workers Scripts — Edit**
   - **D1 — Edit**
   - **Workers R2 Storage — Edit**
5. Under **Account Resources**, select **Include → Specific account →** the account containing the D1 database and R2 bucket.
6. No Zone permissions are required unless you later attach a custom domain.
7. Select **Continue to summary → Create Token**.
8. Copy the token immediately. Cloudflare will not display the full token again.

Do not put this token in a repository file.

## 5. Add GitHub secrets

Open:

https://github.com/Naylahknee/CIA-FAQ/settings/secrets/actions

Under **Repository secrets**, select **New repository secret** for each value and add:

| Secret name | Value |
|---|---|
| `CLOUDFLARE_API_TOKEN` | The API token copied in step 4 |
| `CLOUDFLARE_ACCOUNT_ID` | The Account ID copied in step 3 |
| `CLOUDFLARE_D1_DATABASE_ID` | The D1 Database ID copied in step 1 |
| `AUTH_ENCRYPTION_KEY` | A private 64-character hexadecimal key used to encrypt two-factor secrets |
| `RESEND_API_KEY` | A Resend API key for verification and password-reset messages |
| `ADMIN_EMAIL` | The email address of the verified guide account allowed to review and publish submissions |
| `GROUPME_WEBHOOK_SECRET` | A private random value used only in the GroupMe callback URL |
| `GROUPME_GROUP_ID` | The numeric ID of the one GroupMe group the bot may read |

Generate `AUTH_ENCRYPTION_KEY` once with `openssl rand -hex 32`, or another cryptographically secure 32-byte generator. Never reuse a password or publish this value. Create `RESEND_API_KEY` only after verifying the sending domain in Resend.

Paste only the value—no quotation marks and no extra spaces.

GitHub hides secret values after saving. That is expected.

For `GROUPME_WEBHOOK_SECRET`, generate a random value with `openssl rand -hex 32` or a trusted password generator. It is not a normal password and should not be reused anywhere else.

## 6. Add GitHub variables

On the same **Settings → Secrets and variables → Actions** screen, select the **Variables** tab.

Under **Repository variables**, add:

| Variable name | Exact value |
|---|---|
| `CLOUDFLARE_D1_DATABASE_NAME` | `cia-guide` |
| `CLOUDFLARE_R2_BUCKET_NAME` | `cia-media` |
| `APP_ORIGIN` | The exact public site origin, such as `https://cia-guide.madincrease.workers.dev` |
| `AUTH_EMAIL_FROM` | The verified sender, such as `CIA Family Guide <accounts@yourdomain.com>` |
| `SUPPORT_PAYMENT_URL` | Your HTTPS coffee/tip payment page; leave unset until ready |
| `SUPPORT_GOAL_CENTS` | Optional support goal in cents |
| `SUPPORT_CONFIRMED_TOTAL_CENTS` | Owner-verified total in cents; leave unset until verified |

These are variables, not secrets.

## 7. Run the deployment

1. Open https://github.com/Naylahknee/CIA-FAQ/actions
2. In the left column, select **Deploy to Cloudflare Workers**.
3. Select **Run workflow**.
4. Confirm the branch is **main**.
5. Select the green **Run workflow** button.
6. Open the new workflow run and wait for the `deploy` job to finish.

The workflow performs these steps:

1. Install dependencies
2. Build the app
3. Apply the D1 database migrations
4. Deploy the Worker and static assets

A green check means deployment completed. Open Cloudflare **Workers & Pages**, select the newly created Worker, and use its `workers.dev` URL.

## Connect the GroupMe FAQ bot

Complete this only after the site deploys successfully and both GroupMe secrets have been added in GitHub.

1. Sign in at https://dev.groupme.com/ with the GroupMe account that belongs to the group.
2. Open **Bots**, choose **Create Bot**, and select the parent/student group.
3. Enter a name such as `CIA FAQ Helper`.
4. For the callback URL, enter `https://ciaquestions.com/api/groupme/callback?key=YOUR_SECRET` and replace `YOUR_SECRET` with the exact `GROUPME_WEBHOOK_SECRET` value saved in GitHub.
5. Save the bot. Do not add an avatar unless you want one displayed in GroupMe.
6. If you need the numeric group ID, use the GroupMe developer API's groups or bots list with your developer access token, then copy the selected group's `group_id`. Save that exact number as the GitHub secret `GROUPME_GROUP_ID` and run the deployment again.
7. Post a test question in the group, such as `Where can students buy replacement kitchen shoes?`
8. Sign in to the guide with the verified owner account and open `https://ciaquestions.com/admin#faq-suggestions`.
9. Review the de-identified suggestion, write and verify the answer, add an official source URL when available, and select **Publish to FAQ**.

The bot does not copy the whole conversation. It ignores bot and system messages, stores only likely FAQ candidates, removes common email addresses, phone numbers, links, mentions, long account numbers, and the sender's display name, and never stores GroupMe user IDs, avatars, photos, or attachments. Similar questions are marked as possible duplicates. No answer is published automatically.

## 8. Verify the live site

Test all of the following on the Cloudflare URL:

1. Open the home page and resource links.
2. Open the community page.
3. Create a basic user account.
4. Sign out and sign back in.
5. Verify the account email and request a password-reset message.
6. Enable two-factor authentication, save the recovery codes, and sign in with an authenticator code.
7. Download an account export, then inspect it without sharing the file.
8. Create a text post.
9. Add a comment and reaction.
10. Upload a small JPG or PNG and confirm it displays.
11. Refresh the page and confirm the content remains.
12. Check a PDF resource link after the PDFs have been uploaded to GitHub.

## If the GitHub Action fails

Open the failed run, expand the red step, and use the message below:

- **Authentication error / code 10000:** recreate `CLOUDFLARE_API_TOKEN` and verify the token is scoped to the correct account.
- **Database not found:** verify `CLOUDFLARE_D1_DATABASE_ID` is the database UUID, and verify the database name variable exactly matches `cia-guide`.
- **R2 bucket not found:** verify R2 is activated and the bucket variable exactly matches `cia-media`.
- **Missing permissions:** add Workers Scripts Edit, D1 Edit, and Workers R2 Storage Edit to the token.
- **A secret is empty:** return to GitHub repository secrets and recreate that secret; GitHub will not reveal its saved value.
- **PDF returns 404:** upload the eight PDFs to `public/resources/` and rerun the workflow.

## After deployment

Every future push to `main` automatically rebuilds and redeploys the Cloudflare site. The independent Cloudflare site does not depend on ChatGPT being online. The existing ChatGPT-hosted copy can remain as a temporary backup until the Cloudflare URL passes all verification checks.

## Support the Guide

`/support` accepts optional support for the creator’s time and guide costs. `/scholarship` redirects there. The chef’s hat uses the owner-verified total; no payment webhook is connected. Reconcile confirmed payments and refunds before updating the total, then redeploy. Historical scholarship records are preserved and are not reused as creator tips. No drawing or scholarship award is attached to support.
