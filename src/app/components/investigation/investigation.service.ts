import { Injectable } from '@angular/core';
import { Address } from '../../bitcoin/model';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InvestigationService {

	private addressData = new BehaviorSubject(null);
	currentAddressData = this.addressData.asObservable();


	provideAddressSearchResponse(response : Address) {
		this.addressData.next(response)
	} 
}