import { Injectable } from '@angular/core';
import { Address, Output } from '../../bitcoin/model';
import { BehaviorSubject } from 'rxjs';
import { Node, TransactionNode, OutputNode, EntityNode, AddressNode, BlockNode } from '../../d3/models';
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

	private entityData = new BehaviorSubject(null);
	currentEntityData = this.entityData.asObservable();
	
	private blockData = new BehaviorSubject(null);
	currentBlockData = this.blockData.asObservable();

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

		if (node instanceof EntityNode) {
			this.expandEntityNodeNeighbours(node);
		}

		if (node instanceof AddressNode) {
			this.expandAddressNodeNeighbours(node);
		}

		if (node instanceof BlockNode) {
			this.expandBlockNodeNeighbours(node);
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

	private expandEntityNodeNeighbours(node : EntityNode) {
		this.bitcoinService.getEntity(node.modelData.name).subscribe(entity => {
			if (entity) {
				this.entityData.next(entity);
			}
		})
	}

	private expandAddressNodeNeighbours(node : AddressNode) {
		this.bitcoinService.getAddress(node.modelData.address).subscribe(address => {
			if (address) {
				this.addressData.next(address);
			}
		})
	}

	private expandBlockNodeNeighbours(node : BlockNode) {
		this.bitcoinService.getBlock(node.modelData.hash).subscribe(block => {
			if (block) {
				this.blockData.next(block);
			}
		})
	}

}