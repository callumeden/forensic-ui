import { Component } from "@angular/core";
import { NgForm } from '@angular/forms';
import { BitcoinService } from '../../bitcoin/bitcoin.service'
import { InvestigationService } from '../investigation/investigation.service'
import { Router } from '@angular/router';
import { Address } from '../../bitcoin/model';
import { forkJoin } from 'rxjs';

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
	truncateNeighboursCount: number = 10;
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

  waitingOnPathFindingResponse = false;
  badPathFindForm = false;
  badPathFindMessage;
 	pathFound = false;

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

			searchSubscription = this.bitcoinService.searchForAddress(
				form.value.address, 
				this.inputHeuristicEnabled, 
				this.neighbourTruncationEnabled? this.truncateNeighboursCount : -1,
				dateFilters, 
				priceFilters);

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

	onFindPath(form : NgForm) {
		debugger;
		if (!form.valid) {
			return;
		}

		this.waitingOnPathFindingResponse = true;
		let startAddress = form.value.startAddress;
		let endAddress = form.value.endAddress;
		let pathExists = false;
		this.bitcoinService.findPath(startAddress, endAddress).subscribe(

			(result : any[]) => {
				//handle error response
				if (result == null || result.length == 0) { 
					this.badPathFindForm = true;
					this.badPathFindMessage = 'No path found between addresses';
					this.waitingOnPathFindingResponse = false;
					return;
				}

				this.pathFound = true;
				//handle when a path is found
				this.badPathFindForm = false;
				this.parsePath(result[0]);
				this.router.navigateByUrl('/investigation');
		},

		error => {
					this.badPathFindForm = true;
					let errorText = typeof(error.error) == 'string' ? error.error : error.statusText;
					this.badPathFindMessage = "Something went wrong... Status : " + error.status + ", " + errorText;
					this.waitingOnPathFindingResponse = false;
				}
		);
	}

	parsePath(result: any) {
		let startAddressShell : Address = result.startNode;
		let endAddressShell: Address = result.endNode;
		let requests = [];

		let intermediateNodes : any[] = result.intermediateNodes;
		let relationships : any[] = result.rels;
		this.investigationService.highlightRelationships(relationships);
		let nodeIds : Set<string> = new Set();

		intermediateNodes.forEach(nodeData => {

			if (nodeData.address) {
				nodeIds.add(nodeData.address);
				requests.push(this.bitcoinService.getAddress(nodeData.address));
				return;
			}
			if (nodeData.outputId) {
				nodeIds.add(nodeData.outputId);
				requests.push(this.bitcoinService.getOutput(nodeData.outputId));
				return;
			}

			if (nodeData.transactionId) {
				nodeIds.add(nodeData.transactionId);
				requests.push(this.bitcoinService.getTransaction(nodeData.transactionId));
				return;
			}

		});


		this.investigationService.providePathNodeIds(nodeIds);

		forkJoin(requests).subscribe((allResponses: any[]) => {

			allResponses.forEach((response: any) => {

				if (!response) {
					console.error('got an error');
					return;
				}

				this.investigationService.highlightRelationships(relationships);

				if (response.address) {
					this.investigationService.provideAddressData(response);
					return;
				}

				if (response.outputId) {
					this.investigationService.provideOutputData(response);
					return;
				}

				if (response.transactionId) {
					this.investigationService.provideNewTransactionNode(response);
					return;
				}

			});

			this.investigationService.providePathNodeIds(null);
			this.waitingOnPathFindingResponse = false;

		})


		this.investigationService.activateInvestigation();

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
