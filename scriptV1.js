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
          
         var ackId = "ABPLBSC" +"~"+ new Map(Object.entries(log.sequence)).get("ABPLBSC"); // 
         print("fetching log on the basis of acknowledgementId...");
         var chunk = new Map(Object.entries(log.callLog)).get("ABPLBSC");
         var logData = new Map(Object.entries(chunk)).get(ackId);
         var responseString = logData.responseString;
         var parsedResponse = JSON.parse(responseString);

         var mapData = new Map();
    
         print("applicantOutList available: ",parsedResponse.applicantOut!=null);
    
         parsedResponse.applicantOut.forEach(function(applicantOut){
            var value = applicantOut.applicantoutdummy1.charAt(applicantOut.applicantoutdummy1.length - 1);
            var key = parseInt(value) - 1;
    
            if(key != -1){
                mapData.set(key, applicantOut.applicantoutdummy9);
            }

         })

         print("Created map data is: ", mapData);

         var experianScore;

         var applicant = doc.applicationRequest.request.applicant; // Getting applicant from the gonogo
    
         experianScore =  = mapData.get(parseInt(applicant.applicantId));

         if(experianScore != undefined){
            applicant.experianScore = String(experianScore);
         }else{
          print("Found undefined experianScore in app Id:", applicant.applicantId);
         }

         doc.applicationRequest.request.applicant = applicant;

         var coApplicantList = []; // Defined an empty array(holds any object)

         var coApplicants = doc.applicationRequest.request.coApplicant; // Getting co-applicant list from the gonogo

         print("Set data in co-applicant. Count: ",coApplicant.length);
    
         coApplicants.forEach(function(coApp){
        
           experianScore = mapData.get(parseInt(coApp.applicantId)); // Fetching co-applicant score from the map
    
           if(experianScore != undefined){
        
           print(experianScore)
           coApp.experianScore = String(experianScore);
      
           }else{
           print("Found undefined experianScore in app Id:", coApp.applicantId);
       }
    
          coApplicantList.push(coApp);  // Pushing co-applicants in the array
    })
         doc.applicationRequest.request.coApplicants = coApplicantList;
         
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

    