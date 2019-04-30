import { Injectable } from '@angular/core';
import { Address, Output } from '../../bitcoin/model';
import { BehaviorSubject } from 'rxjs';
import { Node, EntityNode, OutputNode } from '../../d3/models';
import {BitcoinService} from '../../bitcoin/bitcoin.service';

@Injectable({
  providedIn: 'root'
})
export class InvestigationService {

	private addressData = new BehaviorSubject(null);
	currentAddressData = this.addressData.asObservable();

	private outputData = new BehaviorSubject(null);
	currentOutputData = this.outputData.asObservable();

	constructor(private bitcoinService : BitcoinService) {}

	provideAddressSearchResponse(response : Address) {
		this.addressData.next(response)
	} 

	expandNeighbours(node : Node) {
		if (node instanceof EntityNode) {
			this.expandEntityNodeNeighbours(node);
		}

		if (node instanceof OutputNode) {
			this.expandOutputNodeNeighbours(node);
		}
	}

	private expandEntityNodeNeighbours(node : EntityNode) {

	}

	private expandOutputNodeNeighbours(node : OutputNode) {
		this.bitcoinService.getOutput(node.modelData.outputId).subscribe(output => {
			if (output) {
				this.outputData.next(output);
			}
		});
	}

}