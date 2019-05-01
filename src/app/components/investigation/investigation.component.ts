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
          this.links.push(new Link(data.address, output.outputId, LinkLabel.LOCKED_TO));
        }, this)

      }

      if (data.entity) {
        this.links.push(new Link(data.address, data.entity.name, LinkLabel.HAS_ENTITY));
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
        this.links.push(new Link(data.outputId, data.producedByTransaction.transactionId, LinkLabel.OUTPUTS));
      }

      if (data.lockedToAddress) {
        this.links.push(new Link(data.outputId, data.lockedToAddress.address, LinkLabel.LOCKED_TO));
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
      this.links.push(new Link(transactionData.transactionId, transactionData.minedInBlock.hash, LinkLabel.MINED_IN));
    }

    if (transactionData.inputs) {
      transactionData.inputs.forEach(input => {
        this.links.push(new Link(transactionData.transactionId, input.outputId, LinkLabel.INPUTS));
      })
    }

    if (transactionData.coinbaseInput) {
      this.links.push(new Link(transactionData.transactionId, transactionData.coinbaseInput.coinbaseId, LinkLabel.INPUTS));
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
        this.links.push(new Link(entityData.name, address.address, LinkLabel.HAS_ENTITY));
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
      this.links.push(new Link(blockData.hash, blockData.child.hash, LinkLabel.CHAINED_FROM));
    }

    if (blockData.parent) {
      this.links.push(new Link(blockData.hash, blockData.parent.hash, LinkLabel.CHAINED_FROM));
    }

    if (blockData.minedTransactions) {
      blockData.minedTransactions.forEach(transaction => {
        this.links.push(new Link(blockData.hash, transaction.transactionId, LinkLabel.MINED_IN));
      })
    }

    if (blockData.coinbase) {
      this.links.push(new Link(blockData.hash, blockData.coinbase.coinbaseId, LinkLabel.COINBASE));
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
      this.links.push(new Link(coinbaseData.coinbaseId, coinbaseData.block.hash, LinkLabel.COINBASE));
    }
  }
  
}
