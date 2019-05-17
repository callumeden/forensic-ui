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
	truncateNeighboursCount: number = 25;
	neighbourTruncationEnabled: boolean = true;
	btcConversionCurrency: string = 'gbp';

	minDate = new Date(2000, 0, 1);
  maxDate = new Date(2020, 0, 1);

	onAddressSearch(form : NgForm) {
		if (form.valid) {

			this.waitingOnResponse = true;
			console.info('fetching address data', form.value.address)
			this.bitcoinService.searchForAddress(form.value.address).subscribe(
				(response : Address) => {
					console.info(response)
					this.investigationService.provideAddressSearchResponse(
						response, 
						this.inputHeuristicEnabled, 
						this.neighbourTruncationEnabled? this.truncateNeighboursCount : -1,
						this.btcConversionCurrency);
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

	formatLabel(value : number | null) {
		if (!value) {
      return 0;
    }

    if (value >= 100) {
      return "No Limit";
    }

    return value;
	}

}
