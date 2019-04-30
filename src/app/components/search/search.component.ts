import { Component } from "@angular/core";
import { NgForm } from '@angular/forms';
import { BitcoinService } from '../../bitcoin/bitcoin.service'
import { InvestigationService } from '../investigation/investigation.service'
import {Router} from '@angular/router';

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

	private waitingOnResponse : Boolean;

	onAddressSearch(form : NgForm) {
		if (form.valid) {
			this.waitingOnResponse = true;
			console.info('fetching address data', form.value.address)
			this.bitcoinService.searchForAddress(form.value.address).subscribe(response => {
				this.investigationService.provideAddressSearchResponse(response);
				this.router.navigateByUrl('/investigation');
				this.waitingOnResponse = false;
			})
			return;
		}
		console.error('bad form input')
		
	}	
}
