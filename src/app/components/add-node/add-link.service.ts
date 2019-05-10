import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AddLinkService {

	private newLinkRequests = new BehaviorSubject(null);
	currentNewLinkRequest = this.newLinkRequests.asObservable();

	newLinkRequest(sourceData) {
		this.newLinkRequests.next(sourceData)
	}

	clearLinkRequests() {
		this.newLinkRequests.next(null);
	}
}