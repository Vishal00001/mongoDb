var MongoClient = require('mongodb').MongoClient;
var uri = "mongodb://admin:password@localhost:27010/gonogo_sme?authSource=admin";
const client = new MongoClient(uri,{poolSize: 10, bufferMaxEntries: 0, reconnectTries: 5000, useNewUrlParser: true,useUnifiedTopology: true});
client.connect();

MongoClient.connect(uri, function(err, db) {

 try{
  console.log("Database is connected: ",isConnected());

  var dbo = db.db("gonogo_sme")

  var result;

  var docs = dbo.collection("goNoGoCustomerApplication").find({
    $and :[{"applicationRequest.header.institutionId":"4032"},
    {"applicationRequest.header.product":"PL"},
    {$or: [{"applicationRequest.request.applicant.experianScore":false},
            {"applicationRequest.request.applicant.experianScore":null},
            {"applicationRequest.request.applicant.experianScore":""}] }]});

/*
  docs.toArray(function(err, result) {

    if (err) throw err; 

    this.result = result;   

    console.log(result.length);


  });*/

  docs.forEach(doc => {

    var instiId = doc.applicationRequest.header.institutionId;
    var refId = doc._id;
    console.info(instiId);
    console.info(refId);

     console.info("=============================",'caseId:',refId,"=============================");

     var log = dbo.collection("powerCurveCallLog").findOne({"refId": refId, "institutionId":instiId});

     console.info(log.sequence);

    });

}catch(err){
  console.info(err);
}
finally{
  db.close();
}

});

/*var mongoclient = new MongoClient(new Server("localhost", 27010), {native_parser: true});

  // Open the connection to the server
  mongoclient.open(function(err, mongoclient) {
    print(err);*/

 //db = db.getSiblingDB('gonogo_sme');

//db = db.getSiblingDB('gonogo_sme');
function isConnected() {
  return !!client && !!client.topology && client.topology.isConnected();
}
/*function listDatabases(client){
    databasesList = client.db().admin().listDatabases();
 
    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};
client.close();
var docs = db.goNoGoCustomerApplication.find({
    $and :[{"applicationRequest.header.institutionId":"4032"},
    {"applicationRequest.header.product":"PL"},
    {$or: [{"applicationRequest.request.applicant.experianScore":false},
            {"applicationRequest.request.applicant.experianScore":null},
            {"applicationRequest.request.applicant.experianScore":""}] }]});
                      
if(docs.count() > 0){
  docs.forEach(function(doc){
    
    var instiId = doc.applicationRequest.header.institutionId;
    var refId = doc._id;
    print("=============================",'caseId:',refId,"=============================");
  try{
    var log = db.powerCurveCallLog.findOne({"refId": refId, "institutionId":instiId});
    
   if(log != null){
       
      var seq = new Map(Object.entries(log.sequence)).get("ABPLBSC");
      
      if(seq != undefined){
          
         var ackId = getAckId(log.sequence);
         var mapData = getCallLog(log, ackId);
         print("Created map data is: ", mapData);
         doc.applicationRequest.request.applicant = setScoreInApplicant(doc.applicationRequest.request.applicant, mapData);
         doc.applicationRequest.request.coApplicants = setScoreInCoApplicant(doc.applicationRequest.request.coApplicant, mapData);
         
         db.goNoGoCustomerApplication.save(doc);
         print("Document saved in GonogoCustomerApplication.")
         
      }else{
        print("Bureau score not trigger");
      }
    
    }else{
      print("Log not present");
    }
  }catch(e){
    print("Exception occurred: ",e.message);
  }

  finally {
    client.close();
   }
})
}else{
    print("No gonogo found pertaining to given filter.")
}

function setScoreInApplicant(applicant, mapData){
  try
  {
    print("Set data in applicant...");
    
    var experianScore = mapData.get(parseInt(applicant.applicantId));
    
    if(experianScore != undefined){
      applicant.experianScore = String(experianScore);
    }else{
        applicant.experianScore = '';
    }
    
  }catch(e){
    throw new Error(e);
  }
    return applicant;
}

function setScoreInCoApplicant(coApplicant, mapData){
    
  try
  {
    var coApplicantList = [];
    print("Set data in co-applicant. Count: ",coApplicant.length);
    
    coApplicant.forEach(function(coApp){
        
    var experianScore = mapData.get(parseInt(coApp.applicantId));
    
    if(experianScore != undefined){
        
      print(experianScore)
      coApp.experianScore = String(experianScore);
      
    }else{
        coApp.experianScore = '';
        print("Found undefined experianScore in co-app Id:", coApp.applicantId);
    }
    
    coApplicantList.push(coApp);
    })

   }catch(e){
    throw new Error(e);
  }    
    return coApplicantList;
}

function getAckId(s){
    var ackId = "ABPLBSC" +"~"+ new Map(Object.entries(s)).get("ABPLBSC");
    print("Created acknowledgementId: ",ackId);
    return ackId;
}

function getCallLog(log, ackId){
  try
  {
    print("fetching log on the basis of acknowledgementId...");
    var chunk = new Map(Object.entries(log.callLog)).get("ABPLBSC");
    var logData = new Map(Object.entries(chunk)).get(ackId);
    var responseString = logData.responseString;
    var parsedResponse = JSON.parse(responseString);
    
  }catch(e){
    throw new Error(e);
}    
    return pickScoreValueApplicantWise(parsedResponse.applicantOut);    
}

function pickScoreValueApplicantWise(applicantOutList){

    var result = new Map();
    try{
    
    applicantOutList.forEach(function(applicantOut){
    var value = applicantOut.applicantoutdummy1.charAt(applicantOut.applicantoutdummy1.length - 1);
    var key = parseInt(value) - 1;
    
    if(key != -1){
        result.set(key, applicantOut.applicantoutdummy9);
    }

    });
    }catch(e){
    throw new Error(e);
  }  
    return result;

}/*
});*/