import { NextResponse } from 'next/server';
export const dynamic = "force-dynamic";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

export async function POST(request: Request) {
  try {
    const { domain, diff } = await request.json();
    
    // In actual production, this validates against a real API Key.
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
         q: `[PROCEDURAL AI FALLBACK]: In the context of ${domain}, what is the resulting theoretical paradigm at complexity ${diff}? [Seed: ${Math.random().toString(36).substr(2, 9)}]`,
         options: [`Variant A-${Math.floor(Math.random()*100)}`, "Algorithmic Constant 20", "Data Structure Node X", "Standard Architecture Model"],
         ans: Math.floor(Math.random() * 4), diff: "PROCEDURAL"
      });
    }

    // Instantiating Langchain Model Architecture
    const model = new ChatGoogleGenerativeAI({
      model: "gemini-1.5-pro",
      maxOutputTokens: 1024,
      temperature: 0.8,
    });

    // Zero-Shot Chain-of-Thought (CoT) Prompt Engineering Strategy
    const template = `SYSTEM ROLE: You are an absolute master in ${domain} creating assessment questions for top 0.1% engineers.
    
    INSTRUCTIONS:
    1. Utilize "Chain-of-Thought" reasoning before outputting. Think step-by-step why the false options are plausible but exactly wrong (Distractor Analysis).
    2. The difficulty should be evaluated as: '${diff}'.
    3. Final output MUST STRICTLY follow this JSON structure, completely raw without markdown blocks:
    { "q": "Question here", "options": ["Opt1", "Opt2", "Opt3", "Opt4"], "ans": 0 }
    
    FEW-SHOT EXAMPLE PROMPT:
    Domain: Quantum Mechanics
    Thought: Let's test the observer effect with a deep paradox. Option A will be the Copenhagen interpretation (true), Option B will be Many Worlds (distractor).
    { "q": "Which quantum theorem explicitly proves that wave-function collapse is triggered by consciousness?", "options": ["Von Neumann-Wigner", "Everett Relative State", "Bohmian Mechanics", "None, it is undefined"], "ans": 0 }
    
    Your Domain: {targetDomain}
    Generate your JSON response now:
    `;

    const prompt = PromptTemplate.fromTemplate(template);
    const parser = new StringOutputParser();

    // Executing the Langchain Runnable Sequence
    const chain = prompt.pipe(model).pipe(parser);
    const responseText = await chain.invoke({ targetDomain: domain });
    
    // Safety cleaner for JSON from LLMs
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return NextResponse.json(JSON.parse(cleanJson));

  } catch (error) {
    return NextResponse.json({
       q: `[LANGCHAIN PIPELINE FAILOVER]: Calculate the unique hash sum of the isolated ${Math.random().toString(36)} vector module.`,
       options: ["O(N log N)", "O(1)", "O(N^2)", "Omega Variant"],
       ans: 1, diff: "FAILOVER"
    });
  }
}
