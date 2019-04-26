import { Component, OnInit } from '@angular/core';
import APP_CONFIG from './app.config';
import { Node, Link, BlockNode} from './d3';
import {BitcoinService} from './bitcoin/bitcoin.service'
import { Block } from './bitcoin/model/block'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {

  nodes: Node[] = [];
  links: Link[] = [];
  blockData: Block;
  nodesReady : boolean = false;

  constructor(private bitcoinService : BitcoinService) {
    

    /** constructing the nodes array */
    // for (let i = 1; i <= N; i++) {
    //   this.nodes.push(new BlockNode(i));
    // }

    // for (let i = 1; i <= N; i++) {
    //   for (let m = 2; i * m <= N; m++) {
    //     /** increasing connections toll on connecting nodes */
    //     this.nodes[getIndex(i)].linkCount++;
    //     this.nodes[getIndex(i * m)].linkCount++;

    //     /** connecting the nodes before starting the simulation */
    //     this.links.push(new Link(i, i * m));
    //   }
    // }
    // this.getBlock()
  }

  ngOnInit() {
    this.getBlock();
  }

  getBlock(): void {
    this.bitcoinService
      .getBlock("0000000067a97a2a37b8f190a17f0221e9c3f4fa824ddffdc2e205eae834c8d7")
      .subscribe((blockData : Block) => {
        this.blockData = blockData;
        // debugger;
        this.nodes.push(new BlockNode(blockData.hash))
        this.nodes.push(new BlockNode(2))
        this.nodes[0].linkCount ++;
        this.nodes[1].linkCount ++;
         this.links.push(new Link(blockData.hash, 2));

        this.nodesReady = true;

      });
  }
}
