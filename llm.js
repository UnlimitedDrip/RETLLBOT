import { exec } from 'child_process';

export default class LLM {  
  async answerQuestion(input) {
    return new Promise((resolve, reject) => {
      var command = `python3 ./rag.py "${input}"`;
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(error);
          return;
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`);
        }
        resolve(`${stdout.trim()}`);
      });
    });
  }
}

