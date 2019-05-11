import { Injectable } from '@angular/core';
import { Address, Output } from '../../bitcoin/model';
import { BehaviorSubject } from 'rxjs';
import { Node, TransactionNode, OutputNode, EntityNode, AddressNode, BlockNode, CoinbaseNode } from '../../d3/models';
import { BitcoinService } from '../../bitcoin/bitcoin.service';

@Injectable({
  providedIn: 'root'
})
export class InvestigationService {

	private allIds : Set<string> = new Set();

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

	private coinbaseData = new BehaviorSubject(null);
	currentCoinbaseData = this.coinbaseData.asObservable();

	private customNodeData = new BehaviorSubject(null);
	currentCustomNodeData = this.customNodeData.asObservable();

	private customLinkData = new BehaviorSubject(null);
	currentCustomLinkData = this.customLinkData.asObservable();

	private deleteNodeRequests = new BehaviorSubject(null);
	currentDeleteNodeRequests = this.deleteNodeRequests.asObservable();

	investigationActive : boolean = false;

	provideAddressSearchResponse(response : Address) {
		this.investigationActive = true;
		this.addressData.next(response)
	} 

	provideNewCustomNodeData(customNodeData) {
		this.customNodeData.next(customNodeData);
	}

	newDeleteNodeRequest(nodeData) {
		this.deleteNodeRequests.next(nodeData);
	} 

	createCustomLink(sourceNodeData, targetNodeData, linkLabel) {
		this.customLinkData.next({
			'src': sourceNodeData,
			'target': targetNodeData,
			'label': linkLabel
		});
	}

	registerId(id : string) {
		this.allIds.add(id);
	}

	isValidId(id : string) {
		return this.allIds.has(id);
	}

	getAllIds() {
		return Array.from(this.allIds)
	}

	constructor(private bitcoinService : BitcoinService) {}

	cleanData() {
		this.investigationActive = false;
		this.addressData.next(null);
		this.outputData.next(null);
		this.transactionData.next(null);
		this.entityData.next(null);
		this.blockData.next(null);
		this.coinbaseData.next(null)
		this.customNodeData.next(null);
		this.customLinkData.next(null);
		this.deleteNodeRequests.next(null);
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

		if (node instanceof CoinbaseNode) {
			this.expandCoinbaseNodeNeighbours(node);
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

	private expandCoinbaseNodeNeighbours(node : CoinbaseNode) {
		this.bitcoinService.getCoinbase(node.modelData.coinbaseId).subscribe(coinbase => {
			if (coinbase) {
				this.coinbaseData.next(coinbase);
			}
		})
	}

}