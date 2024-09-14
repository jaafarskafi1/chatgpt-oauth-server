# ChatGPT Server with Clerk OAuth

A backend server for Sidekick, an AI-powered task management app, featuring task management and integration with Google Calendar and Gmail.

## Description

This project is a server application that leverages GPT models to provide intelligent responses and automate tasks. It includes:

- **Task Management**: Create, update, delete, and search tasks with support for subtasks and hierarchical relationships.
- **Google Calendar Integration**: Fetch upcoming calendar events for the authenticated user.
- **Gmail Integration**: Retrieve recent emails for the authenticated user.
- **Authentication**: User authentication and management using Clerk OAuth.
- **API Documentation**: OpenAPI specification available for API endpoints.
- **ChatGPT Integration**: Integration with OpenAI's ChatGPT app for intelligent responses and task automation.

Designed for easy deployment on Vercel, integrating seamlessly with Clerk for authentication and user management.

## Features

- **Task Management**: CRUD operations for tasks with support for subtasks.
- **Google Calendar & Gmail Integration**: Access calendar events and emails.
- **Authentication with Clerk**: Secure user authentication using Clerk OAuth.
- **OpenAPI Spec**: Detailed API documentation for integration.

## Setup

1. **Clone the repository**:

   ```bash
   git clone https://github.com/jeffskafi/thesidekickapp-chatgpt-server.git
   cd thesidekickapp-chatgpt-server
   ```

2. **Install dependencies**:

   ```bash
   pnpm install
   ```

3. **Set up environment variables**:

   Create a `.env` file in the root directory and add the following variables:

   ```env
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

   - Obtain your Clerk API keys from the [Clerk Dashboard](https://dashboard.clerk.com/).
   - Set up a PostgreSQL database and provide the connection details.
   - Ensure all environment variables are correctly set.

4. **Run database migrations (if applicable)**:

   If using migrations to set up your database schema, run them now.

5. **Run the development server**:

   ```bash
   pnpm run dev
   ```

   The server will start on `http://localhost:3000` (or as configured).

## API Endpoints

The server exposes the following API endpoints:

### **Tasks**

- `GET /api/tasks`: Retrieve all top-level tasks.
- `POST /api/tasks`: Create a new task.
- `PUT /api/tasks/:id`: Update an existing task.
- `DELETE /api/tasks/:id`: Delete a task and its subtasks.
- `GET /api/tasks/search`: Search tasks based on parameters.
- `GET /api/tasks/:id/subtasks`: Retrieve subtasks of a specific task.

### **Google Calendar**

- `GET /api/calendar/events`: Fetch Google Calendar events.

### **Gmail**

- `GET /api/gmail/messages`: Fetch Gmail messages.

Authentication is required for all endpoints. Include the `Authorization` header with a valid token.

## Deployment

This project is designed to be deployed on Vercel:

1. **Install the Vercel CLI**:

   ```bash
   npm i -g vercel
   ```

2. **Deploy the project**:

   ```bash
   vercel
   ```

   Follow the prompts to complete the deployment.

## Upgrading GPT

When upgrading the GPT model, follow these steps:

1. **Ensure the server is deployed**.

2. **Create or update the OpenAPI specification**:

   Create or update your OpenAPI spec for the endpoints. See `openApiSpec.example.json` for an example.

3. **Set up an OAuth application in Clerk**:

   - Create a new OAuth app in the Clerk dashboard or via the command line.
   - Copy the new client ID, secret, and authentication links to the GPT authentication modal.
   - Update the GPT settings accordingly.

4. **Update the Callback URL**:

   - A new callback URL will be generated.
   - Make a PATCH request to your OAuth app (created in step 3) to update the callback URL.

5. **Test the new GPT model**:

   - Perform a CRUD operation to trigger authentication.
   - Complete the auth flow via Clerk's auth service, which will redirect to your updated callback URL.

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**.

2. **Create a new branch**:

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes and commit them**:

   ```bash
   git commit -m 'Add some feature'
   ```

4. **Push to the branch**:

   ```bash
   git push origin feature/your-feature-name
   ```

5. **Submit a pull request**.

Please ensure your code adheres to the project's coding standards and includes tests for new features.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.