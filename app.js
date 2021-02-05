const express=require("express");
const { WebhookClient }=require("dialogflow-fulfillment");
const { welcome,defaultFallback }=require("./intents/welcomeExit");
const app=express();
app.post("/dialogflow",express.json(),(req,res)=>{
    const agent=new WebhookClient({request:req,response:res});
    let intentMap=new Map();
        module.exports = { welcome: welcome, defaultFallback: defaultFallback };
    intentMap.set("Default Welcome Intent",welcome);
    intentMap.set("Default Fallback Intent",defaultFallback);
    agent.handleRequest(intentMap);
});
app.listen(process.env.PORT || 8080);
