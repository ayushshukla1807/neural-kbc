const express=require("express");const{createServer}=require("http");const{Server}=require("socket.io");
const app=express();const httpServer=createServer(app);
const io=new Server(httpServer,{cors:{origin:"*",methods:["GET","POST"]}});
app.use(express.json());
app.post("/api/wallet/credit",async(req,res)=>{res.json({success:true,balance:10000});});
io.on("connection",(socket)=>{
socket.on("join_match",async(userId)=>{socket.join("global_match");io.to("global_match").emit("player_joined",{userId});});
socket.on("submit_answer",async({userId,timeTaken,scoreDelta})=>{socket.emit("answer_ack",{status:"processed"});});
socket.on("disconnect",()=>{});
});
const PORT=process.env.PORT||3001;httpServer.listen(PORT,()=>{console.log(`P${PORT}`);});
