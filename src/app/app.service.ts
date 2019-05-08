import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppService {

	private messageSource = new BehaviorSubject({});
	currentMessage = this.messageSource.asObservable();

	private dismissSource = new BehaviorSubject(null);
	currentDismissMessage = this.dismissSource.asObservable();

	constructor() { }

	changeMessage(nodeName: string, items : {}) {
    this.messageSource.next([nodeName, items])
  }

  dismissInvestigationViews() {
  	this.dismissSource.next(true);
  }

}