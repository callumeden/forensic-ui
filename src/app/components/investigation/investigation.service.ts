import { Injectable } from '@angular/core';
import { Address } from '../../bitcoin/model';
import { BehaviorSubject } from 'rxjs';
import { Node } from '../../d3/models';

@Injectable({
  providedIn: 'root'
})
export class InvestigationService {

	private addressData = new BehaviorSubject(null);
	currentAddressData = this.addressData.asObservable();


	provideAddressSearchResponse(response : Address) {
		this.addressData.next(response)
	} 

	expandNeighbours(node : Node) {
		debugger;
	}
}