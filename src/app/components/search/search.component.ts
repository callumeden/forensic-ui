import { Component } from "@angular/core";
import { NgForm } from '@angular/forms';
import { BitcoinService } from '../../bitcoin/bitcoin.service'
import { InvestigationService } from '../investigation/investigation.service'
import { Router } from '@angular/router';
import { Address } from '../../bitcoin/model';

@Component({
  selector: 'search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {

	constructor(private router: Router, 
							private bitcoinService :  BitcoinService, 
							private investigationService: InvestigationService) {

	}

	private waitingOnResponse : Boolean = false;
	invalidAddress : boolean = false;
	errorMessage : string;
	inputHeuristicEnabled : boolean = false;

	onAddressSearch(form : NgForm) {
		if (form.valid) {
			this.waitingOnResponse = true;
			console.info('fetching address data', form.value.address)
			this.bitcoinService.searchForAddress(form.value.address).subscribe(

				(response : Address) => {
					this.investigationService.provideAddressSearchResponse(response, this.inputHeuristicEnabled);
					this.router.navigateByUrl('/investigation');
					this.waitingOnResponse = false;
				},

				error => {
					this.invalidAddress = true;
					let errorText = typeof(error.error) == 'string' ? error.error : error.statusText;
					this.errorMessage = "Something went wrong... Status : " + error.status + ", " + errorText;
					console.error('address search got error', error);
					this.waitingOnResponse = false;
				}


			)
			return;
		}
		console.error('bad form input')
		
	}	

}
