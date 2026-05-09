//Monitoring worker safety, tracking worker hours, 
//fatigue levels and alerts created.


class WorkplaceSafetyService{
	constructor(){
		this.workers[];

	}
	addWorker(id, hoursWorked, taskCompleted, breakTaken){
		const worker = {

			id: id, 
			hoursWorked: hoursWorked,
			taskCompleted: taskCompleted,
			breaksTaken: breaksTaken,
			fatigueLevel: this.calculateFatigue(hoursWorked, breaksTaken)};
			this.workers.push(worker);
	
			return worker;

		}

	}

}