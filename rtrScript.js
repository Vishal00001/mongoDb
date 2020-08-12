var valueToBePrinted = ["bankName","accountNumber","source","loanType","loanAmount","pos","tenure","roi","emi"];
var printable;
 
var docs = db.camDetails.count({_id:{$in:[/PL/]}})
docs.forEach(function(doc){
      printRTR(doc._id, doc.rtrDetailList, valueToBePrinted);
  })
  function printRTR(refId, rtr, valueToBePrinted){
    
    var applicantId, applicantName; 
      
    if(rtr == null)
        return;
        
      rtr.forEach(function(r){
          
          applicantId = r.applicantId;
          applicantName = r.applicantName.firstName;
          printTransactions(refId, applicantId, applicantName, r.rtrTransactions, valueToBePrinted);
          
      })      
  }
  
  function printTransactions(refId, applicantId, applicantName, transactions, valueToBePrinted){
      
      var starter = refId+","+applicantId+","+applicantName;
      
      
      if(transactions == null)
        return;
        
      transactions.forEach(function(t){
          
         printable = starter;
         valueToBePrinted.forEach(function(value){
             
             value = String(t[value]);
             
             if(value == "")
               value = "N/A";
               
            printable = printable +","+ value;
       
       })
       
       print(printable);
       printable = "";
    })
  }
