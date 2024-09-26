import { exec } from 'child_process';
import fs from 'fs/promises'; // Import fs using the promise-based API

export default async (app) => {
  app.log.info("Yay, the app was loaded!");

  app.on("issue_comment", async (context) => {
    const commentBody = context.payload.comment.body;
    const hasSlash = commentBody.includes("/");
    const matches = commentBody.match(/\/([^ ]+)/);
    
    if (hasSlash && matches) {
      const command = matches[1];
      await processCommand(context, command);
    }
  });

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/

  let responseObj = null;

  try {
    const data = await fs.readFile('responses.json', 'utf8');
    responseObj = JSON.parse(data);
  } catch (err) {
    console.error('Error reading file:', err);
  }

  function getResponse(key) {
    return new Promise((resolve, reject) => {
      if (responseObj) {
        const response = responseObj.responses[key];
        if (response) {
          const replacedResponse = response.replace(/\{\{repoURL\}\}/g, responseObj.repoURL);
          resolve(replacedResponse);
        } else {
          resolve("Response not found.");
        }
      } else {
        reject(new Error("Response object not initialized."));
      }
    });
  }

  async function processCommand(context, command){
    const repoDetails = context.repo();
    const issueNumber = context.payload.issue.number; // Extract issue number
    const result = await commandMatcher(context, command, issueNumber); // Pass issue number to commandMatcher
    await context.octokit.issues.createComment({
      ...repoDetails,
      issue_number: issueNumber,
      body: result
    });
  }

  async function commandMatcher(context, command, issueNumber){
    let response = "That's not quite right";
    if(command == "newUser") {
      response = await getResponse("newUserResponse");
    } else if(command == "drop") {
      response = await getResponse("taskAbandoned");
    } else {
      response = await getResponse("repoURL");
    }
    //This is the code for all the 
    return response;
  }
};
