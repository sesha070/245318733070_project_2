const express = require("express");
const { WebhookClient } = require("dialogflow-fulfillment");
const { Payload } =require("dialogflow-fulfillment");
const app = express();

const MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
var randomstring = require("randomstring"); 
var user_name="";
app.post("/dialogflow", express.json(), (req, res) => {
    const agent = new WebhookClient({ 
		request: req, response: res 
		});
async function identify_user(agent)
{
  const acct_num = agent.parameters.acct_num;
  const client = new MongoClient(url);
  await client.connect();
  const snap = await client.db("SBC").collection("user_table").findOne({acct_num: acct_num});
  
  if(snap==null){
	  await agent.add("User Not found, Would you like to register it");

  }
  else
  {
  user_name=snap.name;
  await agent.add("Welcome  "+user_name+"!!  \n How can I help you");}
}
function add_user(agent)
{
    const name=agent.parameters.name;
    const ph=agent.parameters.acct_num;
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("SBC");
          
          var u_name = name;         
          var myobj = { acct_num:ph,name:u_name};
      
          dbo.collection("user_table").insertOne(myobj, function(err, res) {
          if (err) throw err;
          db.close();    
        });
       });
       agent.add("user successfully registered!! \n How can I help you");
    }

    function report_issue(agent)
    {
     
      var issue_vals={1:"Internet Down",2:"Slow Internet",3:"Buffering problem",4:"No connectivity"};
      
      const intent_val=agent.parameters.issue_num;
      
      var val=issue_vals[intent_val];
      
      var trouble_ticket=randomstring.generate(7);
    
      //Generating trouble ticket and storing it in Mongodb
      //Using random module
      MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("SBC");
        
        var u_name = user_name;    
        var issue_val=  val; 
        var status="pending";
    
        let ts = Date.now();
        let date_ob = new Date(ts);
        let date = date_ob.getDate();
        let month = date_ob.getMonth() + 1;
        let year = date_ob.getFullYear();
    
        var time_date=year + "-" + month + "-" + date;
    
        var myobj = { username:u_name, issue:issue_val,status:status,time_date:time_date,trouble_ticket:trouble_ticket };
    
        dbo.collection("issue").insertOne(myobj, function(err, res) {
        if (err) throw err;
        db.close();    
      });
     });
     agent.add("The issue reported is: "+ val +"\nThe ticket number is: "+trouble_ticket);
    }

var intentMap = new Map();
intentMap.set("identify", identify_user);
intentMap.set("identify - custom - custom", report_issue);
intentMap.set("identify - yes - custom", add_user);
intentMap.set("identify - yes - custom - custom - custom", report_issue);



agent.handleRequest(intentMap);

});//Closing tag of app.post

app.listen(process.env.PORT || 8080);