import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import LLM from './llm.js';

// Get the current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LLM_instance = new LLM();

// Load environment variables from .env file
dotenv.config();

// Read the private key from the specified path
const privateKey = fs.readFileSync(path.join(__dirname, 'config', 'rettlbot.private-key.pem'), 'utf8'); // Update with your actual private key filename

/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Probot} app
 */
export default (app) => {
  app.log.info("Yay, the app was loaded!");

  // Function to respond to comments in discussions using the GraphQL API
  const respondToDiscussionComment = async (commentBody, context, discussionId) => {
    // Get the response from your LLM instance
    const response = await LLM_instance.answerQuestion(commentBody);

    // Define the GraphQL mutation for adding a discussion comment
    const query = `
      mutation($discussionId: ID!, $body: String!) {
        addDiscussionComment(input: {discussionId: $discussionId, body: $body}) {
          comment {
            url
          }
        }
      }
    `;

    // Use the GraphQL API to post the comment
    await context.octokit.graphql(query, {
      discussionId,
      body: response,
    });
    app.log.info("Responded to discussion comment.");
  };

  // Listen for discussion comments
  app.on("discussion_comment.created", async (context) => {
    const commentBody = context.payload.comment.body; // Get the comment body
    const discussionId = context.payload.discussion.node_id; // Get the discussion node ID
    app.log.info(`${commentBody}`);

    await respondToDiscussionComment(commentBody, context, discussionId);

    if (commentBody.includes("?")) {
      console.log("is a question");
    }
  });

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
};

