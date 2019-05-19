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
	priceFilterEnabled: boolean = false;

	dateFilterEnabled = false;
	minDate = new Date(2009, 0, 3);
  maxDate = new Date();
  filterStartDate = this.minDate;
  filterEndDate = this.maxDate;
  startTime = 0;
  endTime = 0;

  priceFilterCurrencySelected='btc';

	onAddressSearch(form : NgForm) {
		if (form.valid) {

			this.waitingOnResponse = true;

			let searchSubscription, dateFilters;

			if (this.dateFilterEnabled) {
				let startHours = this.startTime % 1 == 0 ? 0 : 30;
				let endHours = this.endTime % 1 == 0 ? 0 : 30;

				let epochStartDate = this.filterStartDate.setHours(this.startTime, startHours, 0, 0);
				let epochEndDate= this.filterEndDate.setHours(this.endTime, endHours, 0, 0);
				dateFilters = {'start': epochStartDate, 'end': epochEndDate};
			}

			let priceFilters;

			if (this.priceFilterEnabled) {
				priceFilters = {'start': form.value.priceFilterFrom, 'end': form.value.priceFilterTo, 'unit': this.priceFilterCurrencySelected};
			}

			searchSubscription = this.bitcoinService.searchForAddress(form.value.address, dateFilters, priceFilters);

			searchSubscription.subscribe(
				(response : Address) => {
					this.investigationService.provideAddressSearchResponse(
						response, 
						this.inputHeuristicEnabled, 
						this.neighbourTruncationEnabled? this.truncateNeighboursCount : -1,
						this.btcConversionCurrency, 
						dateFilters
					);

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

	formatLabel(value: number | null) {
    if (!value) {
      return 0;
    }

    let decimalPart = +value.toString().replace(/^[^\.]+/,'0');
    let mm = decimalPart * 60;
    var mmPart = mm.toString().length == 1 ? mm.toString() + "0" : mm.toString();

    if (value >= 0) {
      let valueStr = value.toFixed(2);
      let strArr = valueStr.split(".");
      if(strArr[0].length == 1) {
        strArr[0] = "0" + strArr[0];
      }
      var hhPart = strArr[0];
      //console.log(strArr);
    }

    return hhPart + ":" + mmPart;
  }

}
