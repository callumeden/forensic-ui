import { Injectable } from '@angular/core';
import { Block, Address, Output, Transaction, Entity, Coinbase } from '../../bitcoin/model';
import { Observable, BehaviorSubject } from 'rxjs';
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

	private inputClusteringRequests = new BehaviorSubject(null);
	currentInputClusteringRequest = this.inputClusteringRequests.asObservable();

	investigationActive : boolean = false;

	private inputClusteringEnabled : boolean = false;
	private neighbourLimit: number = 25;
	private btcConversionCurrency : string = 'gbp';

	provideAddressSearchResponse(response : Address, inputClustering : boolean, neighbourLimit: number, btcConversionCurrency : string) {
		this.investigationActive = true;
		this.neighbourLimit = neighbourLimit;
		this.inputClusteringEnabled = inputClustering;
		this.btcConversionCurrency = btcConversionCurrency;
		this.addressData.next({'response': response, 'inputClustering': inputClustering, 'neighbourLimit': neighbourLimit, 'btcConversionCurrency': btcConversionCurrency});
	} 

	provideNewCustomNodeData(customNodeData) {
		this.customNodeData.next(customNodeData);
	}

	provideNewBlockNode(blockData) {
		this.blockData.next(blockData);
	}

	provideNewTransactionNode(transactionData) {
		this.transactionData.next(transactionData);
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
		this.inputClusteringRequests.next(null);
	}

	expandNeighbours(node : Node) : Observable<any> {

		if (node instanceof TransactionNode) {
			return this.expandTransactionNodeNeighbours(node);
		}

		if (node instanceof OutputNode) {
			return this.expandOutputNodeNeighbours(node);
		}

		if (node instanceof EntityNode) {
			return this.expandEntityNodeNeighbours(node);
		}

		if (node instanceof AddressNode) {
			return this.expandAddressNodeNeighbours(node);
		}

		if (node instanceof BlockNode) {
			return this.expandBlockNodeNeighbours(node);
		}

		if (node instanceof CoinbaseNode) {
			return this.expandCoinbaseNodeNeighbours(node);
		}

		return null;

	}

	private expandTransactionNodeNeighbours(node : TransactionNode) : Observable<Transaction> {
		let observable : Observable<Transaction> = this.bitcoinService.getTransaction(node.modelData.transactionId);
		
		observable.subscribe(transaction => {
			if (transaction) {
				this.transactionData.next(transaction);
			}
		})

		return observable;

	}

	private expandOutputNodeNeighbours(node : OutputNode) : Observable<Output> {
		let observable : Observable<Output> = this.bitcoinService.getOutput(node.modelData.outputId);

		observable.subscribe(output => {
			if (output) {
				this.outputData.next(output);
			}
		});

		return observable;
	}

	private expandEntityNodeNeighbours(node : EntityNode) : Observable<Entity> {
		let observable : Observable<Entity> = this.bitcoinService.getEntity(node.modelData.name);
		
		observable.subscribe(entity => {
			if (entity) {
				this.entityData.next(entity);
			}
		})

		return observable;
	}

	private expandAddressNodeNeighbours(node : AddressNode) : Observable<Address> {
		let observable : Observable<Address> = this.bitcoinService.getAddress(node.modelData.address);
		
		observable.subscribe(address => {
			if (address) {
				this.addressData.next({'response': address, 'inputClustering' : this.inputClusteringEnabled, 'neighbourLimit': this.neighbourLimit, 'btcConversionCurrency': this.btcConversionCurrency});
			}
		})

		return observable;
	}

	private expandBlockNodeNeighbours(node : BlockNode) : Observable<Block> {
		let observable  : Observable<Block> = this.bitcoinService.getBlock(node.modelData.hash);
		
		observable.subscribe(block => {
			if (block) {
				this.blockData.next(block);
			}
		})

		return observable;
	}

	private expandCoinbaseNodeNeighbours(node : CoinbaseNode) : Observable<Coinbase> {
		let observable : Observable<Coinbase> = this.bitcoinService.getCoinbase(node.modelData.coinbaseId);
		
		observable.subscribe(coinbase => {
			if (coinbase) {
				this.coinbaseData.next(coinbase);
			}
		})

		return observable;
	}

}