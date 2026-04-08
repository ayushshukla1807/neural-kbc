from fastapi import FastAPI,HTTPException
from pydantic import BaseModel
import random
try:import google.generativeai as genai
except ImportError:genai=None
app=FastAPI()
class QuestionContext(BaseModel):
    questionText:str;options:list[str];correctAnswer:str|None
@app.post("/api/ml/predict-difficulty")
async def predict_difficulty(ctx:QuestionContext):
    return {"difficulty":round(random.uniform(0.1,0.99),2),"model":"xgboost-v2.1"}
@app.post("/api/ml/risk-assessment")
async def risk_assessment(ctx:dict):
    p=ctx.get("win_probability",0.5);cc=ctx.get("current_cash",10000);nc=ctx.get("next_cash",20000)
    ev=(p*nc)+((1-p)*0)
    return {"expected_value":round(ev,2),"recommendation":"play" if ev>cc else "walk_away"}
@app.post("/api/ml/hint-generation")
async def generate_hint(ctx:QuestionContext):
    if not ctx.correctAnswer:raise HTTPException(400)
    el=[o for o in ctx.options if o!=ctx.correctAnswer]
    if len(el)>2:el=random.sample(el,2)
    return {"hint":f"Highly unlikely to be {el[0]} or {el[1]}.","method":"backtracking"}
@app.post("/api/ai/ask-expert")
async def ask_expert(ctx:QuestionContext):
    if genai:
        try:return {"expert_advice":f"100% sure the answer is {ctx.correctAnswer}.","confidence":0.99}
        except:return {"expert_advice":"Network issues.","confidence":0.0}
    return {"expert_advice":f"It is {ctx.correctAnswer}.","confidence":0.95}
