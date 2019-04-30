import { Component, OnInit } from '@angular/core';
import APP_CONFIG from '../../app.config';
import { Node, Link, BlockNode, AddressNode, OutputNode, EntityNode, TransactionNode, CoinbaseNode } from '../../d3';
import { BitcoinService } from '../../bitcoin/bitcoin.service'
import { InvestigationService } from './investigation.service';
import { Block, Address, Output, Entity, Transaction, Coinbase } from '../../bitcoin/model'
import { Observable, of, forkJoin} from 'rxjs';

@Component({
  selector: 'investigation',
  templateUrl: './investigation.component.html',
  styleUrls: ['./investigation.component.css']
})

export class InvestigationComponent implements OnInit {

  nodes: Node[] = [];
  links: Link[] = [];
  outputIds: Set<string> = new Set();
  addressIds: Set<String> = new Set();
  transactionIds: Set<String> = new Set();
  blockHashes: Set<String> = new Set();
  entityIds: Set<String> = new Set();
  coinbaseIds: Set<String> = new Set();
  changes: number = 0;
  blockData: Block;
  nodesReady : boolean = false;
  subscriptions = [];

  constructor(private bitcoinService : BitcoinService, 
              private investigationService: InvestigationService) {
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  ngOnInit() {
    this.listenForData();
  }

  listenForData() {
    const addressSubscription = this.investigationService.currentAddressData.subscribe(addressData => {
      if (addressData) {
        this.createOutputNodes(addressData.outputs);
        this.createEntityNode(addressData.entity);
        this.createAddressNodes([addressData]);
        this.changes++;
        this.nodesReady = true;
      }
    });

    const outputSubscription = this.investigationService.currentOutputData.subscribe(outputData => {
      if (outputData){
        this.createTransactionNode(outputData.producedByTransaction);
        this.createOutputNodes([outputData]);
        this.changes++;
      }
    });


    const transactionSubscription = this.investigationService.currentTransactionData.subscribe(transactionData => {
      if (transactionData) {
        this.createBlockNode(transactionData.minedInBlock);
        this.createTransactionNode(transactionData);
        this.changes++;
      }
    });

    const entitySubscription = this.investigationService.currentEntityData.subscribe(entityData => {
      if (entityData) {
        this.createAddressNodes(entityData.usesAddresses);
        this.createEntityNode(entityData);
        this.changes ++;
      }
    });

    const blockSubscription = this.investigationService.currentBlockData.subscribe(blockData => {
      if (blockData) {
        this.createTransactionNodes(blockData.minedTransactions);
        this.createCoinbaseNode(blockData.coinbase);
        this.createBlockNode(blockData);
        this.createBlockNode(blockData.parent);
        this.createBlockNode(blockData.child);
        this.changes++;
      }
    });

    this.subscriptions.push(addressSubscription);
    this.subscriptions.push(outputSubscription);
    this.subscriptions.push(transactionSubscription);
    this.subscriptions.push(entitySubscription);
    this.subscriptions.push(blockSubscription);
  }

  getAddresses() : void {
    let addressObservables : Observable<Address>[] = 
      this.bitcoinService.getAddresses(["1DEwdHYmo8q6AhSHG7UgxEjttNMFdw9e7u", "1AQ2m6GH78oLgZYCdueUb4Zjxg1L6BkHZM", "1KzvBTUbdwNBXiTkzr1msFUtPf7Vu2zLiu"])

    const addressObservablesSubscription = forkJoin(addressObservables).subscribe(allAddressData => {
      console.info('success')
      this.createAddressNodes(allAddressData);
    });

    this.subscriptions.push(addressObservablesSubscription);
  }

  createAddressNodes(allAddressData : Address[]) {
    allAddressData.forEach(data => {

      if (!this.addressIds.has(data.address)) {
        this.addressIds.add(data.address);
        console.info('pushing address', data);
        this.nodes.push(new AddressNode(data.address, data));
      }

      if (data.outputs) {
        data.outputs.forEach(output => {
          this.links.push(new Link(data.address, output.outputId));
        }, this)

      }

      if (data.entity) {
        this.links.push(new Link(data.address, data.entity.name));
      }

    }, this);
  }

  createOutputNodes(outputData : Output[]) {
    if (!outputData) {
      return;
    }
    outputData.forEach(data => {
      if (!this.outputIds.has(data.outputId)){
        console.info('pushing output data', data);
        this.outputIds.add(data.outputId);
        this.nodes.push(new OutputNode(data))
      }

      if (data.producedByTransaction) {
        this.links.push(new Link(data.outputId, data.producedByTransaction.transactionId));
      }

    }, this);

  }

  createTransactionNodes(transactionDataArray : Transaction[]) {
    if (transactionDataArray) {
      transactionDataArray.forEach(transaction => this.createTransactionNode(transaction));
    }
  }

  createTransactionNode(transactionData : Transaction) {
    if (!transactionData ) {
      return;
    }

    if (!this.transactionIds.has(transactionData.transactionId)) {
      this.nodes.push(new TransactionNode(transactionData));
      this.transactionIds.add(transactionData.transactionId);
    }

    if (transactionData.minedInBlock) {
      this.links.push(new Link(transactionData.transactionId, transactionData.minedInBlock.hash));
    }
  }

  createEntityNode(entityData: Entity) {
    if (!entityData) {
      return;
    }

    if (!this.entityIds.has(entityData.name)) {
      this.nodes.push(new EntityNode(entityData));
      this.entityIds.add(entityData.name);
    }

    if (entityData.usesAddresses) {
      entityData.usesAddresses.forEach(address => {
        this.links.push(new Link(entityData.name, address.address));
      });
    }
    
  }

  createBlockNode(blockData : Block) {
    if (!blockData) {
      return;
    }

    if (!this.blockHashes.has(blockData.hash)) {
      this.nodes.push(new BlockNode(blockData));
      this.blockHashes.add(blockData.hash);
    }

    if (blockData.child) {
      this.links.push(new Link(blockData.hash, blockData.child.hash));
    }

    if (blockData.parent) {
      this.links.push(new Link(blockData.hash, blockData.parent.hash));
    }

    if (blockData.minedTransactions) {
      blockData.minedTransactions.forEach(transaction => {
        this.links.push(new Link(blockData.hash, transaction.transactionId));
      })
    }

    if (blockData.coinbase) {
      this.links.push(new Link(blockData.hash, blockData.coinbase.coinbaseId));
    }
    
  }

  createCoinbaseNode(coinbaseData : Coinbase) {
    if (!coinbaseData) {
      return;
    }

    if (!this.coinbaseIds.has(coinbaseData.coinbaseId)) {
      this.nodes.push(new CoinbaseNode(coinbaseData));
      this.coinbaseIds.add(coinbaseData.coinbaseId);
    }

  }

  

 
  
}
