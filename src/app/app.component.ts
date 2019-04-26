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

  constructor(private bitcoinService : BitcoinService) {
    const N = APP_CONFIG.N,
          getIndex = number => number - 1;

    /** constructing the nodes array */
    for (let i = 1; i <= N; i++) {
      this.nodes.push(new Node(i));
    }

    for (let i = 1; i <= N; i++) {
      for (let m = 2; i * m <= N; m++) {
        /** increasing connections toll on connecting nodes */
        this.nodes[getIndex(i)].linkCount++;
        this.nodes[getIndex(i * m)].linkCount++;

        /** connecting the nodes before starting the simulation */
        this.links.push(new Link(i, i * m));
      }
    }
  }

  ngOnInit() {
    this.getBlock();
  }

  getBlock(): void {
    this.bitcoinService
      .getBlock("0000000067a97a2a37b8f190a17f0221e9c3f4fa824ddffdc2e205eae834c8d7")
      .subscribe((blockData : Block) => {
        this.blockData = blockData;
      });
  }
}
