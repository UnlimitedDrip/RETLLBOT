import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Get the current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config();

// Read the private key from the specified path
const privateKey = fs.readFileSync(path.join(__dirname, 'config', 'rettlbot.2024-10-01.private-key.pem'), 'utf8'); // Update with your actual private key filename

/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Probot} app
 */
export default (app) => {
  app.log.info("Yay, the app was loaded!");

  // Function to respond to comments in discussions
  const respondToDiscussionComment = async (context, discussionId, body) => {
    const query = `
      mutation ($discussionId: ID!, $body: String!) {
        addDiscussionComment(input: {discussionId: $discussionId, body: $body}) {
          comment {
            url
          }
        }
      }
    `;

    await context.octokit.graphql(query, {
      discussionId: discussionId,
      body: body,
    });

    app.log.info("Responded to discussion comment.");
  };

  // Listen for discussion comments
  app.on("discussion_comment.created", async (context) => {
    const commentBody = context.payload.comment.body; // Get the comment body
    const discussionId = context.payload.discussion.node_id; // Get the discussion node ID

    // Check if the comment includes a question mark
    if (commentBody.includes("?")) {
      await respondToDiscussionComment(context, discussionId, "Hi"); 
    }
  });

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
};
