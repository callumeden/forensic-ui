import { Component, OnInit } from '@angular/core';
import APP_CONFIG from '../../app.config';
import { Node, Link, BlockNode, AddressNode, OutputNode, EntityNode } from '../../d3';
import { BitcoinService } from '../../bitcoin/bitcoin.service'
import { InvestigationService } from './investigation.service';
import { Block, Address, Output, Entity } from '../../bitcoin/model'
import { Observable, of, forkJoin} from 'rxjs';
import { Router, Event, NavigationStart, NavigationEnd, NavigationError } from '@angular/router';

@Component({
  selector: 'investigation',
  templateUrl: './investigation.component.html',
  styleUrls: ['./investigation.component.css']
})

export class InvestigationComponent implements OnInit {

  nodes: Node[] = [];
  links: Link[] = [];
  changes: number = 0;
  blockData: Block;
  nodesReady : boolean = false;
  subscriptions = [];

  constructor(private router : Router,
              private bitcoinService : BitcoinService, 
              private investigationService: InvestigationService) {
    this.listenForData();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  ngOnInit() {
    // this.getBlocks()
    // this.getAddresses()
    const routerEventsSubscription = this.router.events.subscribe(this.handleRouterEvent);
    this.subscriptions.push(routerEventsSubscription);
  }

  handleRouterEvent(event : Event) {
    console.info('investigation component: nav event', event);
    if (event instanceof NavigationStart) {
      if (event.url != '/investigation') {
        this.nodes = [];
        this.links = [];

      }
      
    }
  }

  listenForData() {
    const addressSubscription = this.investigationService.currentAddressData.subscribe(addressData => {
      if (addressData) {
        this.createOutputNodes(addressData.outputs);
        this.createEntityNodes(addressData.entities);
        this.createAddressNodes([addressData]);
        this.nodesReady = true;
      }
    });
    this.subscriptions.push(addressSubscription);
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
       console.info('pushing address', data);
       this.nodes.push(new AddressNode(data.address, data));

       if (data.outputs) {
         data.outputs.forEach(output => {
           this.links.push(new Link(data.address, output.outputId));
         }, this)

       }

       if (data.entities) {
         data.entities.forEach(entity => {
           this.links.push(new Link(data.address, entity.name));
         })
       }

       this.changes ++;
    }, this);
  }

  createOutputNodes(outputData : Output[]) {
    if (!outputData) {
      return;
    }
    outputData.forEach(data => {
      console.info('pushing output data', data);
      this.nodes.push(new OutputNode(data))
      this.changes ++;
    }, this);
  }

  createEntityNodes(entityData: Entity[]) {
    if (!entityData) {
      return;
    }
    entityData.forEach(data => {
      this.nodes.push(new EntityNode(data));
      this.changes ++;
    }, this);
  }

  getBlocks(): void {
    let blockObservables : Observable<Block>[] = this.bitcoinService.getBlocks([
      "0000000067a97a2a37b8f190a17f0221e9c3f4fa824ddffdc2e205eae834c8d7",
      "00000000fb5b44edc7a1aa105075564a179d65506e2bd25f55f1629251d0f6b0",
      "00000000b2f01f399bf503e55f25a1aa51067056d2eb81915cb91976968b69aa",
      "00000000ad2b48c7032b6d7d4f2e19e54d79b1c159f5599056492f2cd7bb528b",
      "000000005665d506f6c3ccb5fd98624f9816a8a169f1d2327d1d4d6d3262ad12"])

    const blockObservablesSubscription = forkJoin(blockObservables).subscribe(allBlocksData => {
      console.log('fetched all block data', allBlocksData);
      this.createBlockNodes(allBlocksData);
      this.createBlockLinks(allBlocksData)
      this.nodesReady = true;
    });

    this.subscriptions.push(blockObservablesSubscription);
  }

  getBlock(hash : string) : Observable<Block> {
    return this.bitcoinService.getBlock(hash);
  }

  createBlockNodes(allBlocksData : Block[]) {
    allBlocksData.forEach(function (blockData) {
        this.nodes.push(new BlockNode(blockData.hash, blockData));
    }, this)
  }

  createBlockLinks(allBlocksData : Block[]) {
    let all_hashes = new Set(allBlocksData.map(blockData => blockData.hash))
    allBlocksData.forEach(function(data) {
      if (all_hashes.has(data.prevBlockHash)) {
        this.links.push(new Link(data.hash, data.prevBlockHash));
      }
    }, this)

  }
}
