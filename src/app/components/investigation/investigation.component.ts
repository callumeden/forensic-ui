import { Component, OnInit } from '@angular/core';
import APP_CONFIG from '../../app.config';
import { Node, Link, BlockNode, AddressNode, OutputNode, EntityNode, TransactionNode, CoinbaseNode, CustomNode } from '../../d3';
import { BitcoinService } from '../../bitcoin/bitcoin.service'
import { InvestigationService } from './investigation.service';
import { Block, Address, Output, Entity, Transaction, Coinbase } from '../../bitcoin/model'
import { Observable, of, forkJoin} from 'rxjs';

enum LinkLabel {
  CHAINED_FROM="CHAINED_FROM",
  COINBASE="COINBASE",
  HAS_ENTITY="HAS_ENTITY",
  INPUTS="INPUTS",
  LOCKED_TO="LOCKED_TO",
  MINED_IN="MINED_IN",
  OUTPUTS="OUTPUTS",
  CUSTOM="CUSTOM"
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

  linksUnique: Set<String> = new Set();
  customNodeIds: Set<String> = new Set();
  nodeLookup : Map<String, Node>  = new Map();
  changes: number = 0;
  pendingLinkUpdates: Map<string, number> = new Map();
  subscriptions = [];
  totalLinkCount: number = 0;

  constructor(private bitcoinService : BitcoinService, 
              private investigationService: InvestigationService) {
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
        this.finaliseUpdate();
      }
    });

    const outputSubscription = this.investigationService.currentOutputData.subscribe(outputData => {
      if (outputData){
        this.createTransactionNode(outputData.producedByTransaction);
        this.createTransactionNode(outputData.inputsTransaction);
        this.createAddressNodes([outputData.lockedToAddress]);
        this.createOutputNodes([outputData]);
        this.finaliseUpdate();
      }
    });


    const transactionSubscription = this.investigationService.currentTransactionData.subscribe(transactionData => {
      if (transactionData) {
        this.createCoinbaseNode(transactionData.coinbaseInput);
        this.createOutputNodes(transactionData.inputs);
        this.createBlockNode(transactionData.minedInBlock);
        this.createTransactionNode(transactionData);
        this.finaliseUpdate();
      }
    });

    const entitySubscription = this.investigationService.currentEntityData.subscribe(entityData => {
      if (entityData) {
        this.createAddressNodes(entityData.usesAddresses);
        this.createEntityNode(entityData);
        this.finaliseUpdate();
      }
    });

    const blockSubscription = this.investigationService.currentBlockData.subscribe(blockData => {
      if (blockData) {
        this.createTransactionNodes(blockData.minedTransactions);
        this.createCoinbaseNode(blockData.coinbase);
        this.createBlockNode(blockData.parent);
        this.createBlockNode(blockData.child);
        this.createBlockNode(blockData);
        this.finaliseUpdate();
      }
    });

    const coinbaseSubscription = this.investigationService.currentCoinbaseData.subscribe(coinbaseData => {
      if (coinbaseData) {
        this.createBlockNode(coinbaseData.block);
        this.createCoinbaseNode(coinbaseData);
        this.finaliseUpdate();
      }
    })

    const customNodeSubscription = this.investigationService.currentCustomNodeData.subscribe(customNodeData => {
      if (customNodeData) {
        this.createCustomNode(customNodeData);
        this.finaliseUpdate();
      }
    })


    const customLinkSubscription = this.investigationService.currentCustomLinkData.subscribe(customLinkData => {
      if (customLinkData) {
        this.createCustomLink(customLinkData);
        this.finaliseUpdate();
      }
    })

    const removeNodeSubscription = this.investigationService.currentDeleteNodeRequests.subscribe(nodeToDelete => {
      if (nodeToDelete) {
        this.handleNodeDeletion(nodeToDelete);
        this.finaliseUpdate();
      }
    })

    this.subscriptions.push(addressSubscription);
    this.subscriptions.push(outputSubscription);
    this.subscriptions.push(transactionSubscription);
    this.subscriptions.push(entitySubscription);
    this.subscriptions.push(blockSubscription);
    this.subscriptions.push(coinbaseSubscription);
    this.subscriptions.push(customNodeSubscription);
    this.subscriptions.push(customLinkSubscription);
  }

  private finaliseUpdate() {
    let map = this.pendingLinkUpdates.keys()
    this.pendingLinkUpdates.forEach((count:number, id:string) => {
      let nodeToUpdate = this.nodeLookup.get(id);
      nodeToUpdate.linkCount = nodeToUpdate.linkCount + count;
      this.totalLinkCount += count;
    });

    this.pendingLinkUpdates = new Map();

    this.nodeLookup.forEach((node: Node, id: string) => {
      //the total link count is always double the real link count as its the sum of link 
      //counts for src and dest node, but too much work to keep track, so div 2 will do it. 
      node.totalLinksInGraph = this.totalLinkCount / 2;
    });

    this.changes++;
  }

  createAddressNodes(allAddressData : Address[]) {

    allAddressData.forEach(data => {
      if (!this.addressIds.has(data.address)) {
        this.addressIds.add(data.address);
        console.info('pushing address', data);
        let newAddressNode = new AddressNode(data.address, data)
        this.nodes.push(newAddressNode);
        this.nodeLookup.set(data.address, newAddressNode);
        this.investigationService.registerId(data.address);
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
        this.outputIds.add(data.outputId);
        let newOutputNode = new OutputNode(data)
        this.nodes.push(newOutputNode)
        this.nodeLookup.set(data.outputId, newOutputNode);
        this.investigationService.registerId(data.outputId);
      }

      if (data.producedByTransaction) {
        this.createNewLink(data.producedByTransaction.transactionId, data.outputId, LinkLabel.OUTPUTS);
      }

      if (data.lockedToAddress) {
        this.createNewLink(data.outputId, data.lockedToAddress.address, LinkLabel.LOCKED_TO);
      }

      if (data.inputsTransaction) {
        this.createNewLink(data.outputId, data.inputsTransaction.transactionId, LinkLabel.INPUTS);
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
      let newTransactionNode = new TransactionNode(transactionData)
      this.nodes.push(newTransactionNode);
      this.transactionIds.add(transactionData.transactionId);
      this.nodeLookup.set(transactionData.transactionId, newTransactionNode);
      this.investigationService.registerId(transactionData.transactionId);
    }

    if (transactionData.minedInBlock) {
      this.createNewLink(transactionData.transactionId, transactionData.minedInBlock.hash, LinkLabel.MINED_IN);
    }

    if (transactionData.inputs) {
      transactionData.inputs.forEach(input => {
        this.createNewLink(input.outputId, transactionData.transactionId, LinkLabel.INPUTS);
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
      let newEntityNode = new EntityNode(entityData)
      this.nodes.push(newEntityNode);
      this.entityIds.add(entityData.name);
      this.nodeLookup.set(entityData.name, newEntityNode);
      this.investigationService.registerId(entityData.name);
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
      let newBlockNode = new BlockNode(blockData)
      this.nodes.push(newBlockNode);
      this.blockHashes.add(blockData.hash);
      this.nodeLookup.set(blockData.hash, newBlockNode);
      this.investigationService.registerId(blockData.hash);
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
      let newCoinbaseNode = new CoinbaseNode(coinbaseData)
      this.nodes.push(newCoinbaseNode);
      this.coinbaseIds.add(coinbaseData.coinbaseId);
      this.nodeLookup.set(coinbaseData.coinbaseId, newCoinbaseNode);
      this.investigationService.registerId(coinbaseData.coinbaseId);
    }

    if (coinbaseData.block) {
      this.createNewLink(coinbaseData.block.hash, coinbaseData.coinbaseId, LinkLabel.COINBASE);
    }

    if (coinbaseData.inputsTransaction) {
      this.createNewLink(coinbaseData.coinbaseId, coinbaseData.inputsTransaction.transactionId, LinkLabel.INPUTS);
    }
  }

  createCustomNode(customNodeData) {
    if (!this.customNodeIds.has(customNodeData.name)) {
      let newCustomNode = new CustomNode(customNodeData)
      this.nodes.push(newCustomNode);
      this.customNodeIds.add(customNodeData.name);
      this.nodeLookup.set(customNodeData.name, newCustomNode);
      this.investigationService.registerId(customNodeData.name);
    }
  }

  handleNodeDeletion(node) {
    console.info('todo : delete a node???');
  }

  createCustomLink(customLinkData) {
    this.createNewLink(customLinkData.src, customLinkData.target, customLinkData.label);
  }

  private createNewLink(sourceId : string, targetId: string, label) {
    if (this.linksUnique.has(this.buildLinkString(sourceId, targetId, label))) {
      return;
    }
    this.links.push(new Link(sourceId, targetId, label));
    this.linksUnique.add(this.buildLinkString(sourceId, targetId, label));
    this.updateLinkCounts(sourceId);
    this.updateLinkCounts(targetId);
  }

  private updateLinkCounts(id:string) {
    if (this.pendingLinkUpdates.has(id)) {
      let currentCount = this.pendingLinkUpdates.get(id);
      this.pendingLinkUpdates.set(id, currentCount + 1);
    } else {
      this.pendingLinkUpdates.set(id, 1);
    }
  }

  private buildLinkString(sourceId : string, targetId : string, label: LinkLabel) {
    return sourceId + "->" + label.toString() + "->" + targetId;
  }
  
}
