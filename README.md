# Node.js Hello World

Simple Node.js + Vercel example that returns a "Hello World" response.

## How to Use

You can choose from one of the following two methods to use this repository:

### One-Click Deploy

Deploy the example using [Vercel](https://vercel.com?utm_source=github&utm_medium=readme&utm_campaign=vercel-examples):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https://github.com/vercel/examples/tree/main/solutions/node-hello-world&project-name=node-hello-world&repository-name=node-hello-world)

### Clone and Deploy

```bash
git clone https://github.com/vercel/examples/tree/main/solutions/node-hello-world
```

Install the Vercel CLI:

```bash
npm i -g vercel
```

Then run the app at the root of the repository:

```bash
vercel dev
```

whenever upgrading the gpt, you need to:
1. delete the existing OAuth app
2. create a new one
3. copy over the client id, secret, and links to the gpt authentication modal
4. hit 'update' on the gpt
5. a new callback url will be created. make a PATCH request to the OAuth clerk app to update the callback url
6. enjoy