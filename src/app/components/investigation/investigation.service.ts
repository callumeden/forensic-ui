import { Injectable } from '@angular/core';
import { Address, Output } from '../../bitcoin/model';
import { BehaviorSubject } from 'rxjs';
import { Node, TransactionNode, OutputNode } from '../../d3/models';
import {BitcoinService} from '../../bitcoin/bitcoin.service';

@Injectable({
  providedIn: 'root'
})
export class InvestigationService {

	private addressData = new BehaviorSubject(null);
	currentAddressData = this.addressData.asObservable();

	private outputData = new BehaviorSubject(null);
	currentOutputData = this.outputData.asObservable();

	private transactionData = new BehaviorSubject(null);
	currentTransactionData = this.transactionData.asObservable();

	constructor(private bitcoinService : BitcoinService) {}

	provideAddressSearchResponse(response : Address) {
		this.addressData.next(response)
	} 

	expandNeighbours(node : Node) {
		if (node instanceof TransactionNode) {
			this.expandTransactionNodeNeighbours(node);
		}

		if (node instanceof OutputNode) {
			this.expandOutputNodeNeighbours(node);
		}
	}

	private expandTransactionNodeNeighbours(node : TransactionNode) {
		this.bitcoinService.getTransaction(node.modelData.transactionId).subscribe(transaction => {
			if (transaction) {
				this.transactionData.next(transaction);
			}
		})
	}

	private expandOutputNodeNeighbours(node : OutputNode) {
		this.bitcoinService.getOutput(node.modelData.outputId).subscribe(output => {
			if (output) {
				this.outputData.next(output);
			}
		});
	}

}