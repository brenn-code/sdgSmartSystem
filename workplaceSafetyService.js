//Monitoring worker safety, tracking worker hours, 
//fatigue levels and alerts created.


class WorkplaceSafetyService{
    constructor(){
	this.workers = [];
    }
    addWorker(id, hoursWorked, taskCompleted, breaksTaken){
	//create worker object
	const worker = {
	    id, hoursWorked, taskCompleted, breaksTaken,
	    fatigueLevel: this.calculateFatigue(hoursWorked, breaksTaken)
	};
	this.workers.push(worker);

	return worker;
    }
    //Calculate Level of Fatigue for each worker
    calculateFatigue(hoursWorked, breaksTaken){

        if(hoursWorked > 10){
	    return "high";
	}
	if(hoursWorked > 8 && breaksTaken < 1){
	    return "medium";
	}
	if(hoursWorked > 6 ){
	    return "Low";
	}
	return "safe";

    }
    //Get the full array of workers status
    getStatus(){
	return this.workers;
    }
    //Generate the Alerts
    generateAlerts(){

	const alerts = [];

	//for loop to fill the  array with alerts
	for(let i =0; i < this.workers.length; i++){
	    const worker = this.workers[i];

	    if(worker.fatigueLevel === "high" ||
	       worker.fatigueLevel === "medium"){
	    	
		alerts.push(
		    "Alert: Worker " + 
		     worker.id + 
		     " has " + 
		     worker.fatigueLevel + 
		    " Fatigue  Risk ");
	    }
        }
	return alerts;
    }

 }
//Test cases
const service = new WorkplaceSafetyService();

service.addWorker("W1", 9, 12, 0);
service.addWorker("W2", 5, 6, 1);
service.addWorker("W3", 11, 15, 0);

console.log("Worker Status:");
console.log(service.getStatus());

console.log("\nALERTS:");
console.log(service.generateAlerts());










