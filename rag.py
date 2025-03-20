import sys
import os
import dspy
import json
from dotenv import load_dotenv
load_dotenv()

gpt = dspy.LM('openai/gpt-4o-mini')
dspy.settings.configure(lm=gpt)

def load_json() -> list[str]:
    file_path = os.path.join(os.path.dirname(__file__), "q_data.json") 
    with open(file_path, "r", encoding="utf-8") as file:
        data = json.load(file)  
    results = []
    for entry in data:  
        if isinstance(entry, dict):  
            for key, value in entry.items():
                if value:  
                    results.append(str(value))  
    return results

class RAG(dspy.Module):
    def __init__(self):
        self.respond = dspy.Predict('context, question -> response')

    def forward(self, question):
        return self.respond(context=load_json(),question=question)

def ragAnswer(input):
    quest = f"""Based on the information answer this question:{input}"""
    rep = RAG()
    return rep(question=quest).response

if __name__ == '__main__':
    print(ragAnswer(sys.argv[1]))
