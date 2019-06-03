import { Component, OnInit } from '@angular/core';
import APP_CONFIG from '../../app.config';
import { Node, Link, BlockNode, AddressNode, OutputNode, EntityNode, TransactionNode, CoinbaseNode, CustomNode, SuperNode } from '../../d3';
import { BitcoinService } from '../../bitcoin/bitcoin.service'
import { InvestigationService } from './investigation.service';
import { Block, Address, Output, Entity, Transaction, Coinbase, LockedToRelation, InputRelation, OutputRelation, SuperNodeModel } from '../../bitcoin/model'
import { Observable, of, forkJoin} from 'rxjs';
import * as uuid from 'uuid';

enum LinkLabel {
  CHAINED_FROM="CHAINED_FROM",
  COINBASE="COINBASE",
  HAS_ENTITY="HAS_ENTITY",
  INPUTS="INPUTS",
  LOCKED_TO="LOCKED_TO",
  MINED_IN="MINED_IN",
  OUTPUTS="OUTPUTS",
  CUSTOM="CUSTOM",
  INPUT_HEURISTIC_LINKED_ADDRESS="INPUT_HEURISTIC_LINKED_ADDRESS"
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
  addressIds: Set<string> = new Set();
  transactionIds: Set<string> = new Set();
  blockHashes: Set<string> = new Set();
  entityIds: Set<string> = new Set();
  coinbaseIds: Set<string> = new Set();
  clusteredAddressStore : Map<string, string> = new Map();
  entityNodeMappings: Map<string, string> = new Map();
  pathLinks: Set<string> = new Set();
  pathNodeIds: Set<string>;

  linksUnique: Set<string> = new Set();
  customNodeIds: Set<string> = new Set();
  nodeLookup : Map<string, Node>  = new Map();
  changes: number = 0;
  pendingLinkUpdates: Map<string, number> = new Map();
  subscriptions = [];
  totalLinkCount: number = 0;
  neighbourLimit: number = 25;
  graphReady: boolean = false;

  inputClusteringEnabled: boolean = false;
  btcConversionCurrency: string = 'gbp';

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

  truncateNeighbours<T>(list : T[]) : T[] {
    if (list) {
      if (this.neighbourLimit <0) {
        return list;
      }
      return list.slice(0, this.neighbourLimit);
    }

    return [];
  }

 
  createNewDataSubscriptions() {
    const addressSubscription = this.investigationService.currentAddressData.subscribe(data => {

      if (data) {

        this.inputClusteringEnabled = data.inputClustering;
        this.neighbourLimit = data.neighbourLimit;
        this.btcConversionCurrency = data.btcConversionCurrency;
        let addressData : Address = data.response;

        this.handleNewAddressMessage(addressData);
        this.finaliseUpdate();
      }
    });

    const outputSubscription = this.investigationService.currentOutputData.subscribe((outputData : Output) => {
      if (outputData){
        this.handleNewOutputMessage(outputData);
        this.finaliseUpdate();
      }
    });

    const transactionSubscription = this.investigationService.currentTransactionData.subscribe((transactionData : Transaction) => {
      if (transactionData) {
        this.handleNewTransactionMessage(transactionData);
        this.finaliseUpdate();
      }
    });

    const entitySubscription = this.investigationService.currentEntityData.subscribe(data => {
      if (data) {
        this.inputClusteringEnabled = data.inputClustering;
        this.neighbourLimit = data.neighbourLimit;
        this.btcConversionCurrency = data.btcConversionCurrency;

        let entityData : Entity= data.response;

        if (entityData.usesAddresses) {
          entityData.usesAddresses = this.truncateNeighbours(entityData.usesAddresses);
        }

        if (this.inputClusteringEnabled) {
          this.createEntitySuperNodeWithAddresses(entityData.usesAddresses, entityData);
        } else {
          if (entityData.usesAddresses) {
            entityData.usesAddresses.forEach((address : Address) => this.handleNewAddressMessage(address));
          }
          this.createEntityNode(entityData);
        }
        
        this.finaliseUpdate();
      }
    });

    const blockSubscription = this.investigationService.currentBlockData.subscribe((blockData : Block) => {
      if (blockData) {
        this.handleNewBlockMessage(blockData);
        this.finaliseUpdate();
      }
    });

    const coinbaseSubscription = this.investigationService.currentCoinbaseData.subscribe((coinbaseData : Coinbase) => {
      if (coinbaseData) {
        this.createBlockNode(coinbaseData.block);
        this.createCoinbaseNode(coinbaseData);
        this.finaliseUpdate();
      }
    })

    const customNodeSubscription = this.investigationService.currentCustomNodeData.subscribe((customNodeData: CustomNode) => {
      if (customNodeData) {
        this.createCustomNode(customNodeData);
        this.finaliseUpdate();
      }
    });

    const customLinkSubscription = this.investigationService.currentCustomLinkData.subscribe(customLinkData => {
      if (customLinkData) {
        this.createCustomLink(customLinkData);
        this.finaliseUpdate();
      }
    });

    const removeNodeSubscription = this.investigationService.currentDeleteNodeRequests.subscribe(nodeToDelete => {
      if (nodeToDelete) {
        this.handleNodeDeletion(nodeToDelete);
        this.finaliseUpdate();
      }
    });

    const pathLinksSubscription = this.investigationService.currentHighlightedLinks.subscribe((linkData :Set<string>)=> {
      if (linkData) {
        linkData.forEach(pathLink => this.pathLinks.add(pathLink));
      }
    });

    const graphReadySubscription = this.investigationService.currentGraphReady.subscribe((graphReady: boolean) => {
      if (graphReady) {
        this.graphReady = graphReady;
      }
    })


    const pathNodeIdsSubscription = this.investigationService.currentPathNodeIds.subscribe((pathNodeIds: Set<string>) => {
      this.pathNodeIds = pathNodeIds;
    });

    this.subscriptions.push(addressSubscription);
    this.subscriptions.push(outputSubscription);
    this.subscriptions.push(transactionSubscription);
    this.subscriptions.push(entitySubscription);
    this.subscriptions.push(blockSubscription);
    this.subscriptions.push(coinbaseSubscription);
    this.subscriptions.push(customNodeSubscription);
    this.subscriptions.push(customLinkSubscription);
    this.subscriptions.push(removeNodeSubscription);
    this.subscriptions.push(pathLinksSubscription);
    this.subscriptions.push(pathNodeIdsSubscription);
    this.subscriptions.push(graphReadySubscription);
  }

  private finaliseUpdate() {
    let map = this.pendingLinkUpdates.keys()
    this.pendingLinkUpdates.forEach((count:number, id:string) => {
      let nodeToUpdate = this.nodeLookup.get(id);
      if (nodeToUpdate == null) {
        console.info('trying to get id', id);
      }
      nodeToUpdate.linkCount = nodeToUpdate.linkCount + count;
      this.totalLinkCount += count;
    });

    this.pendingLinkUpdates = new Map();

    this.nodeLookup.forEach((node: Node, id: string) => {
      //the total link count is always double the real link count as its the sum of link 
      //counts for src and dest node, but too much work to keep track, so div 2 will do it. 
      node.totalLinksInGraph = this.totalLinkCount > 1 ? this.totalLinkCount / 2 : 1;
    }, this);

    this.changes++;
  }

  handleNewAddressMessage(addressData : Address) {
    if (this.inputClusteringEnabled) {

      if (addressData.entity) {
        this.bitcoinService.getEntity(addressData.entity.name).subscribe((loadedEntity : Entity) => {
          this.createEntitySuperNode(addressData, loadedEntity);
          this.finaliseUpdate();
        });

        return;
      }

      if (addressData.inputHeuristicLinkedAddresses && addressData.inputHeuristicLinkedAddresses.length > 0) {
        this.createSuperNode(addressData);
        this.finaliseUpdate();
        return;
      }

    }

    if (addressData.outputs) {
      addressData.outputs = this.truncateNeighbours(addressData.outputs);
      addressData.outputs.forEach((outputRelation : LockedToRelation) => this.handleNewOutputMessage(outputRelation.output));
    }

    this.createEntityNode(addressData.entity);
    this.createAddressNode(addressData, true);
  }

  private handleNewTransactionMessage(transactionData : Transaction) {
    this.createCoinbaseNode(transactionData.coinbaseInput);

    if (transactionData.inputs) {
      transactionData.inputs = this.truncateNeighbours(transactionData.inputs);
      transactionData.inputs.forEach((inputRelation : InputRelation) => this.createOutputNode(inputRelation.input));
    }

    if (transactionData.outputs) {
      transactionData.outputs = this.truncateNeighbours(transactionData.outputs);
      transactionData.outputs.forEach((outputRelation : OutputRelation) => this.createOutputNode(outputRelation.output));
    }

    this.createBlockNode(transactionData.minedInBlock);
    this.createTransactionNode(transactionData);
  }

  private handleNewBlockMessage(blockData : Block) {
    blockData.minedTransactions = this.truncateNeighbours(blockData.minedTransactions);
    blockData.minedTransactions.forEach(tx => this.createTransactionNode(tx));
    this.createCoinbaseNode(blockData.coinbase);
    this.createBlockNode(blockData.parent);
    this.createBlockNode(blockData.child);
    this.createBlockNode(blockData);
  }

  private handleNewOutputMessage(outputData : Output) {

    if (outputData.lockedToAddress) {
      this.createAddressNode(outputData.lockedToAddress.address);
    }

    this.createOutputNode(outputData);

    if (outputData.producedByTransaction) {
      this.createTransactionNodeOnly(outputData.producedByTransaction.transaction);
    }
    if (outputData.inputsTransaction) {
      this.createTransactionNodeOnly(outputData.inputsTransaction.transaction);
    }
  }

  private createEntitySuperNodeWithAddresses(addressData: Address[], entityData: Entity) {
    let supernodeId = this.createSuperNodeOnly(addressData[0], addressData, [entityData.name]);

    this.entityNodeMappings.set(entityData.name, supernodeId);

  }
  private createEntitySuperNode(addressData: Address, entityData: Entity) {
    //address data and entity data are fully feteched
    //create the entity super node 
    if (this.entityNodeMappings.has(entityData.name)) {
      return;
    }

    if (!entityData.usesAddresses) {
      console.info('entity data not here...reloading info')
       this.bitcoinService.getEntity(addressData.entity.name).subscribe((loadedEntity : Entity) => {
          this.createEntitySuperNode(addressData, loadedEntity);
          this.finaliseUpdate();
        });
       return;
    }

    let superNodeAddresses: Address[] = [];
    let knownEntities: string[] = [];

    if (entityData && entityData.usesAddresses) {
      entityData.usesAddresses.forEach(address => superNodeAddresses.push(address));
      knownEntities.push(entityData.name);
    }


    let supernodeId = this.createSuperNodeOnly(addressData, superNodeAddresses, knownEntities);

    this.entityNodeMappings.set(entityData.name, supernodeId);
  }

  private createSuperNodeOnly(addressData, superNodeAddresses, knownEntities?) {
  
    let superNodeData : SuperNodeModel = {addresses: superNodeAddresses, knownEntities: knownEntities};
    

    let supernodeId = uuid.v4();
    let newSuperNode = new SuperNode(supernodeId, superNodeData);
    this.clusteredAddressStore.set(addressData.address, supernodeId);
    this.nodes.push(newSuperNode);
    this.nodeLookup.set(supernodeId, newSuperNode);
    this.investigationService.registerId(supernodeId);

    superNodeData.addresses.forEach((address: Address) => {
      this.clusteredAddressStore.set(address.address, supernodeId);
      if (address.outputs) {
        let truncatedOutputs = this.truncateNeighbours(address.outputs);
        truncatedOutputs.forEach((outputRelation : LockedToRelation) => {
          let output = outputRelation.output;

          this.createOutputNodeOnly(output);

          if (output.producedByTransaction) {
            this.createNewLink(output.outputId, supernodeId, LinkLabel.LOCKED_TO, {
              'btc': output.value,
              'gbp': output.producedByTransaction.gbpValue,
              'usd': output.producedByTransaction.usdValue,
              'eur': output.producedByTransaction.eurValue,
              'currency': this.btcConversionCurrency,
              'timestamp': output.producedByTransaction.timestamp
            });
          } else {
             this.createNewLink(output.outputId, supernodeId, LinkLabel.LOCKED_TO);
          }

        }, this)
      }
    });

    return supernodeId;
  }

  private createSuperNode(addressData : Address, entityData? : Entity, fetchedBefore?) {
    if (!addressData || this.clusteredAddressStore.has(addressData.address)) {
      return;
    }

    if (fetchedBefore && !addressData.inputHeuristicLinkedAddresses) {
      console.error('something very wrong here... fetching infinite recursion');
      return;
    }

    if (!addressData.inputHeuristicLinkedAddresses && !fetchedBefore) {

      console.info('super node stuff needs refetching....');
      this.bitcoinService.getAddress(addressData.address).subscribe((fullAddress: Address) => {
          this.createSuperNode(fullAddress, null, true);
          this.finaliseUpdate();
      });

      return;
    }

    let superNodeAddresses: Address[] = [];
    let knownEntities: string[] = [];
    if (addressData.inputHeuristicLinkedAddresses) {
      addressData.inputHeuristicLinkedAddresses.forEach(address => superNodeAddresses.push(address));
    }

    return this.createSuperNodeOnly(addressData, superNodeAddresses);
  }

  createOutputLockedToAddressLink(output: Output, address: Address) {
     if (output.producedByTransaction) {
           this.createNewLink(output.outputId, address.address, LinkLabel.LOCKED_TO, {
             'btc': output.value,
             'gbp': output.producedByTransaction.gbpValue,
             'usd': output.producedByTransaction.usdValue,
             'eur': output.producedByTransaction.eurValue,
             'currency': this.btcConversionCurrency,
             'timestamp': output.producedByTransaction.timestamp
           });
        } else {
          this.createNewLink(output.outputId, address.address, LinkLabel.LOCKED_TO);
      }
  }

  private isPathActivatedButNodeRedundant(id) : boolean {
    if (!this.pathNodeIds) {
      return false;
    }

    return !this.pathNodeIds.has(id);
  }


  createAddressNode(data : Address, isExpanded? : boolean) {
    if (!data || this.clusteredAddressStore.has(data.address) || this.isPathActivatedButNodeRedundant(data.address)) {
      return;
    }


    if (this.inputClusteringEnabled && (data.hasLinkedAddresses || data.entity)) {

      if (data.entity) {
        this.createEntitySuperNode(data, data.entity);
        return;
      }

      this.createSuperNode(data);
      return;
    }

    if (!this.addressIds.has(data.address)) {
      this.addressIds.add(data.address);
      console.info('pushing address', data);
      let newAddressNode = new AddressNode(data.address, data, isExpanded)
      this.nodes.push(newAddressNode);
      this.nodeLookup.set(data.address, newAddressNode);
      this.investigationService.registerId(data.address);
    }

    if (data.outputs) {
      data.outputs = this.truncateNeighbours(data.outputs);
      data.outputs.forEach(outputRelation => this.createOutputLockedToAddressLink(outputRelation.output, data));
    }

    if (data.entity) {
      this.createNewLink(data.address, data.entity.name, LinkLabel.HAS_ENTITY);
    }

    if (this.inputClusteringEnabled && data.inputHeuristicLinkedAddresses && data.inputHeuristicLinkedAddresses.length > 0) {
      data.inputHeuristicLinkedAddresses = this.truncateNeighbours(data.inputHeuristicLinkedAddresses);
      data.inputHeuristicLinkedAddresses.forEach((linkedAddress : Address) => {
        this.createNewLink(data.address, linkedAddress.address, LinkLabel.INPUT_HEURISTIC_LINKED_ADDRESS)
      });
    }
  }

  private createOutputNodeOnly(data : Output) {
    if (!this.outputIds.has(data.outputId)){
        this.outputIds.add(data.outputId);
        let newOutputNode = new OutputNode(data)
        this.nodes.push(newOutputNode)
        this.nodeLookup.set(data.outputId, newOutputNode);
        this.investigationService.registerId(data.outputId);
      }
  }


  figureOutTheAddressId(address : Address)  : string {
    let addressNodeId;

    if (this.inputClusteringEnabled) {

      if (this.clusteredAddressStore.has(address.address)) {
        return this.clusteredAddressStore.get(address.address);
      } 

      if (address.entity && this.entityNodeMappings.has(address.entity.name)) {
        return this.entityNodeMappings.get(address.entity.name);
      }

      if (address.hasLinkedAddresses) {
        return null;
      }

    } 

    return address.address;
  }


  createOutputNode(data : Output) {
    if (!data || this.isPathActivatedButNodeRedundant(data.outputId)) {
      return;
    }

    this.createOutputNodeOnly(data);

    if (data.producedByTransaction && data.producedByTransaction.transaction) {
      this.createNewLink(data.producedByTransaction.transaction.transactionId, data.outputId, LinkLabel.OUTPUTS, {
        'btc': data.value,
        'gbp': data.producedByTransaction.gbpValue,
        'usd': data.producedByTransaction.usdValue,
        'eur': data.producedByTransaction.eurValue,
        'currency': this.btcConversionCurrency,
        'timestamp': data.producedByTransaction.timestamp
      });
    }

    if (data.lockedToAddress) {
      //we need to see if the address is contained in a supernode, and if so, find the ID of the supernode 
      //instead 

      let addressNodeId = this.figureOutTheAddressId(data.lockedToAddress.address);

      if (addressNodeId != null) {
        this.createNewLink(data.outputId, addressNodeId, LinkLabel.LOCKED_TO, {
          'btc': data.value,
          'gbp': data.producedByTransaction.gbpValue,
          'usd': data.producedByTransaction.usdValue,
          'eur': data.producedByTransaction.eurValue,
          'currency': this.btcConversionCurrency,
          'timestamp': data.producedByTransaction.timestamp
        });
      }
    }

    if (data.inputsTransaction && data.inputsTransaction.transaction) {
      this.createNewLink(data.outputId, data.inputsTransaction.transaction.transactionId, LinkLabel.INPUTS, {
        'btc': data.value,
        'gbp': data.inputsTransaction.gbpValue,
        'usd': data.inputsTransaction.usdValue,
        'eur': data.inputsTransaction.eurValue,
        'currency': this.btcConversionCurrency,
        'timestamp': data.inputsTransaction.timestamp
      });
    }
  }

  createTransactionNodeOnly(transactionData : Transaction) {
     if (!transactionData || this.isPathActivatedButNodeRedundant(transactionData.transactionId)) {
      return;
    }

    if (!this.transactionIds.has(transactionData.transactionId)) {
      let newTransactionNode = new TransactionNode(transactionData)
      this.nodes.push(newTransactionNode);
      this.transactionIds.add(transactionData.transactionId);
      this.nodeLookup.set(transactionData.transactionId, newTransactionNode);
      this.investigationService.registerId(transactionData.transactionId);
    }

  }

  createTransactionNode(transactionData : Transaction) {

    if (!transactionData || this.isPathActivatedButNodeRedundant(transactionData.transactionId)) {
      return;
    }

    this.createTransactionNodeOnly(transactionData);

    if (transactionData.minedInBlock) {
      this.createNewLink(transactionData.transactionId, transactionData.minedInBlock.hash, LinkLabel.MINED_IN);
    }

    if (transactionData.inputs) {
      transactionData.inputs = this.truncateNeighbours(transactionData.inputs);
      transactionData.inputs.forEach((relation: InputRelation) => {
        this.createNewLink(relation.input.outputId, transactionData.transactionId, LinkLabel.INPUTS, {
          'btc': relation.input.value,
          'gbp': relation.gbpValue,
          'usd': relation.usdValue,
          'eur': relation.eurValue,
          'currency': this.btcConversionCurrency,
          'timestamp': relation.timestamp
        });
      })
    }

    if (transactionData.outputs) {
      transactionData.outputs = this.truncateNeighbours(transactionData.outputs);
      transactionData.outputs.forEach((relation : OutputRelation) => {
        this.createNewLink(transactionData.transactionId, relation.output.outputId, LinkLabel.OUTPUTS, {
          'btc': relation.output.value,
          'gbp': relation.gbpValue,
          'usd': relation.usdValue,
          'eur': relation.eurValue,
          'currency': this.btcConversionCurrency,
          'timestamp': relation.timestamp
        });
      });
    }

    if (transactionData.coinbaseInput) {
      this.createNewLink(transactionData.coinbaseInput.coinbaseId, transactionData.transactionId,  LinkLabel.INPUTS);
    }
  }

  createEntityNode(entityData: Entity) {
    if (!entityData || this.isPathActivatedButNodeRedundant(entityData.name)) {
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
      entityData.usesAddresses = this.truncateNeighbours(entityData.usesAddresses);
      entityData.usesAddresses.forEach(address => {
        this.createNewLink(address.address, entityData.name, LinkLabel.HAS_ENTITY);
      });
    }
  }

  createBlockNode(blockData : Block) {
    if (!blockData || this.isPathActivatedButNodeRedundant(blockData.hash)) {
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
      blockData.minedTransactions = this.truncateNeighbours(blockData.minedTransactions);
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

  private createNewLink(sourceId : string, targetId: string, label, metadata?) {
    if (this.linksUnique.has(this.buildLinkString(sourceId, targetId, label)) || sourceId == targetId || this.isPathActivatedButNodeRedundant(sourceId) || this.isPathActivatedButNodeRedundant(targetId)) {
      return;
    }

    let pathLink = false;

    if (this.isPathLink(sourceId, targetId)) {
      pathLink = true;
    }

    this.links.push(new Link(sourceId, targetId, label, pathLink, metadata));
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

  private isPathLink(id1: string, id2:string) {
    return this.pathLinks.has(id1 + '/' + id2) || this.pathLinks.has(id2 + '/' + id1);
  }

  private buildLinkString(sourceId : string, targetId : string, label: LinkLabel) {
    return sourceId + "->" + label.toString() + "->" + targetId;
  }
  
}
