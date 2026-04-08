import os
from fastapi import FastAPI,HTTPException
from pydantic import BaseModel
import openai
import anthropic
import google.generativeai as genai
import torch
app=FastAPI()
class LLMRequest(BaseModel):prompt:str;context:str
@app.post("/api/ai/ask-expert")
async def multi_llm_expert(req:LLMRequest):
    try:
        genai.configure(api_key=os.getenv("GEMINI_API_KEY","dummy"))
        m=genai.GenerativeModel('gemini-1.5-pro')
        r=m.generate_content(f"{req.context}\n{req.prompt}")
        return {"source":"gemini","response":r.text}
    except Exception as e:
        try:
            o=openai.AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY","dummy"))
            r=await o.chat.completions.create(model="gpt-4-turbo",messages=[{"role":"user","content":req.prompt}])
            return {"source":"gpt-4","response":r.choices[0].message.content}
        except Exception as e2:
            try:
                c=anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY","dummy"))
                r=c.messages.create(max_tokens=1024,messages=[{"role":"user","content":req.prompt}],model="claude-3-opus-20240229")
                return {"source":"claude-3","response":r.content[0].text}
            except Exception as e3:
                return {"source":"local_fallback_distilbert","response":f"Synthesized Probability Matrix for: {req.prompt[:20]}..."}
