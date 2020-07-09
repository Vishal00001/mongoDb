db = db.getSiblingDB('gonogo_sme');

var docs = db.goNoGoCustomerApplication.find({
    $and :[{"applicationRequest.header.institutionId":"4032"},
    {"applicationRequest.header.product":"PL"},
    {$or: [{"applicationRequest.request.applicant.experianScore":false},
            {"applicationRequest.request.applicant.experianScore":null},
            {"applicationRequest.request.applicant.experianScore":""}] }]});
                      
print(docs.count());         

if(docs.count() > 0){
  docs.forEach(function(doc){
    
    var instiId = doc.applicationRequest.header.institutionId;
    var refId = doc._id;
    print("=============================",'caseId:',refId,"=============================");
  try{
    var log = db.powerCurveCallLog.findOne({"refId": refId, "institutionId":instiId});
    
   if(log != null){
       
       
      //var seqMap = o => Object.keys(log.sequence).map(k => [k, o[k]]);
       var seq = new Map(Object.entries(log.sequence));
       print(seq);
      //var seq = convertStringInMap(log.sequence).get("ABPLBSC");

      print("Sequence is: ", seq);

      if(seq != undefined){
          
         var ackId = getAckId(seq);
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
    var ackId = "ABPLBSC" +"~"+ s;
    print("Created acknowledgementId: ",ackId);
    return ackId;
}

function getCallLog(log, ackId){
  try
  {
    print("fetching log on the basis of acknowledgementId...");
    //var chunk = convertStringInMap(log.callLog).get("ABPLBSC");
    /*var seqObject = Object.keys(log.callLog).map(function(key) {
                    return  [ key,JSON.parse(log.callLog[key])];
                  });
  print(seqObject);*/



    var chunk = log.callLog.get("ABPLBSC");
    const dataString = JSON.parse(chunk);
    var logData = convertStringInMap(chunk).get(ackId);
    //var logData = convertInMap(chunk).get(ackId);
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

    })
    }catch(e){
    throw new Error(e);
  }  
    return result;

}

function convertStringInMap(o){
  var map = new Map();
  var seqObject = Object.keys(o).map(function(key) {
                    return  [ key,o[key]];
                  });

  seqObject.forEach(function(k){
          map.put(k.toString().split(',')[0], k.toString().split(',')[1]);
          });

  return map;
}
    
function convertObjectInMap(o){
  var map = new Map();
  var seqObject = Object.keys(o).map(function(key) {
                    return  [ key,o[key]];
                  });

  seqObject.forEach(function(k){
          map.put(k.toString().split(',')[0], k.toString().split(',')[1]);
          });

  return map;
}    

   Object.entries = function( obj ){
      var ownProps = Object.keys( obj ),
         i = ownProps.length,
         resArray = new Array(i); // preallocate the Array

      while (i--)
         resArray[i] = [ownProps[i], obj[ownProps[i]]];
      return resArray;
   };