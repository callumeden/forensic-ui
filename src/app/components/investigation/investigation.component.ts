import { Component, OnInit } from '@angular/core';
import APP_CONFIG from '../../app.config';
import { Node, Link, BlockNode, AddressNode, OutputNode, EntityNode, TransactionNode, CoinbaseNode } from '../../d3';
import { BitcoinService } from '../../bitcoin/bitcoin.service'
import { InvestigationService } from './investigation.service';
import { Block, Address, Output, Entity, Transaction, Coinbase } from '../../bitcoin/model'
import { Observable, of, forkJoin} from 'rxjs';
import { Router } from '@angular/router';

enum LinkLabel {
  CHAINED_FROM="CHAINED_FROM",
  COINBASE="COINBASE",
  HAS_ENTITY="HAS_ENTITY",
  INPUTS="INPUTS",
  LOCKED_TO="LOCKED_TO",
  MINED_IN="MINED_IN",
  OUTPUTS="OUTPUTS"
}


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
  linksBegin : Set<String> = new Set();
  linksEnd : Set<String> = new Set();
  changes: number = 0;
  subscriptions = [];

  constructor(private bitcoinService : BitcoinService, 
              private investigationService: InvestigationService,
              private router: Router) {
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    this.investigationService.cleanData();
  }

  ngOnInit() {
    this.createNewDataSubscriptions();
  }

  createNewDataSubscriptions() {
    const addressSubscription = this.investigationService.currentAddressData.subscribe(addressData => {
      if (addressData) {
        this.createOutputNodes(addressData.outputs);
        this.createEntityNode(addressData.entity);
        this.createAddressNodes([addressData]);
        this.changes++;
      }
    });

    const outputSubscription = this.investigationService.currentOutputData.subscribe(outputData => {
      if (outputData){
        this.createTransactionNode(outputData.producedByTransaction);
        this.createAddressNodes([outputData.lockedToAddress]);
        this.createOutputNodes([outputData]);
        this.changes++;
      }
    });


    const transactionSubscription = this.investigationService.currentTransactionData.subscribe(transactionData => {
      if (transactionData) {
        this.createCoinbaseNode(transactionData.coinbaseInput);
        this.createOutputNodes(transactionData.inputs);
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

    const coinbaseSubscription = this.investigationService.currentCoinbaseData.subscribe(coinbaseData => {
      if (coinbaseData) {
        this.createBlockNode(coinbaseData.block);
        this.createCoinbaseNode(coinbaseData);
        this.changes++;
      }
    })

    this.subscriptions.push(addressSubscription);
    this.subscriptions.push(outputSubscription);
    this.subscriptions.push(transactionSubscription);
    this.subscriptions.push(entitySubscription);
    this.subscriptions.push(blockSubscription);
    this.subscriptions.push(coinbaseSubscription);
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
          this.createNewLink(output.outputId, data.address, LinkLabel.LOCKED_TO);
        }, this)

      }

      if (data.entity) {
        this.createNewLink(data.address, data.entity.name, LinkLabel.HAS_ENTITY);
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
        this.createNewLink(data.producedByTransaction.transactionId, data.outputId, LinkLabel.OUTPUTS);
      }

      if (data.lockedToAddress) {
        this.createNewLink(data.outputId, data.lockedToAddress.address, LinkLabel.LOCKED_TO);
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
      this.createNewLink(transactionData.transactionId, transactionData.minedInBlock.hash, LinkLabel.MINED_IN);
    }

    if (transactionData.inputs) {
      transactionData.inputs.forEach(input => {
        this.createNewLink(transactionData.transactionId, input.outputId, LinkLabel.INPUTS);
      })
    }

    if (transactionData.coinbaseInput) {
      this.createNewLink(transactionData.coinbaseInput.coinbaseId, transactionData.transactionId,  LinkLabel.INPUTS);
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
        this.createNewLink(address.address, entityData.name, LinkLabel.HAS_ENTITY);
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
      this.createNewLink(blockData.child.hash, blockData.hash, LinkLabel.CHAINED_FROM);
    }

    if (blockData.parent) {
      this.createNewLink(blockData.hash, blockData.parent.hash, LinkLabel.CHAINED_FROM);
    }

    if (blockData.minedTransactions) {
      blockData.minedTransactions.forEach(transaction => {
        this.createNewLink(transaction.transactionId, blockData.hash, LinkLabel.MINED_IN);
      })
    }

    if (blockData.coinbase) {
      this.createNewLink(blockData.hash, blockData.coinbase.coinbaseId, LinkLabel.COINBASE);
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

    if (coinbaseData.block) {
      this.createNewLink(coinbaseData.block.hash, coinbaseData.coinbaseId, LinkLabel.COINBASE);
    }
  }

  private createNewLink(sourceId : string, targetId: string, label : LinkLabel) {
    if (this.linksBegin.has(sourceId) && this.linksEnd.has(targetId)) {
      console.info('dupe detected');
      return;
    }
    this.links.push(new Link(sourceId, targetId, label));
    this.linksBegin.add(sourceId);
    this.linksEnd.add(targetId);
  }
  
}
