import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppService {

	private messageSource = new BehaviorSubject({});
	currentMessage = this.messageSource.asObservable();

	constructor() { }

	changeMessage(nodeName: string, items : {}) {
    this.messageSource.next([nodeName, items])
  }

}