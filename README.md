# ChatGPT Server with Clerk OAuth

An AI-powered chat application using GPT models.

## Description

This project is a chat application that leverages GPTs to provide intelligent responses. It's designed to be easily deployable on Vercel and integrates with ChatGPT's OAuth for authentication and personalized user experience.

## Setup

1. Clone the repository:
   ```
   git clone https://github.com/jaafarskafi1/thesidekickapp-chatgpt-server.git
   cd thesidekickapp-chatgpt-server
   ```

2. Install dependencies:
   ```
   pnpm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following:
   ```
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
    CLERK_SECRET_KEY=
    POSTGRES_URL=
    POSTGRES_PRISMA_URL=
    POSTGRES_URL_NO_SSL=
    POSTGRES_URL_NON_POOLING=
    POSTGRES_USER=
    POSTGRES_HOST=
    POSTGRES_PASSWORD=
    POSTGRES_DATABASE=
    CLERK_BASE_URL=
    SENTRY_DSN=
   ```

4. Run the development server:
   ```
   pnpm run dev
   ```

## Deployment

This project is designed to be deployed on Vercel. Follow these steps:

1. Install the Vercel CLI:
   ```
   npm i -g vercel
   ```

2. Deploy the project:
   ```
   vercel
   ```

## Upgrading GPT

When upgrading the GPT model, follow these steps:

1. Make sure this server is deployed. You can do this by running `vercel` and following the prompts.
2. If you haven't aleady, create a new openapi spec for your endpoints. See `openApiSpec.example.json` for an example.
3. Create a new OAuth app in the Clerk dashboard or your command line
4. Copy the new client ID, secret, and authentication links to the GPT authentication modal.
5. Update the GPT settings.
6. A new callback URL will be generated. Make a PATCH request to your OAuth app (that you created in step 2) to update the callback URL.
7. Test the new GPT by asking it to perform any CRUD operation. It will prompt you to authenticate.
8. The auth flow will hit Clerk's auth service then redirect to the callback URL you set in step 6.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit them: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Submit a pull request.

Please ensure your code adheres to the project's coding standards and include tests for new features.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.