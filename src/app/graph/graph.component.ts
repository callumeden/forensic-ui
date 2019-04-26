import { Component, OnInit } from '@angular/core';
import { Block } from '../model/block'
import { BitcoinService } from '../bitcoin.service'

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.sass']
})
export class GraphComponent implements OnInit {

	block: {};

  constructor(private bitcoinService: BitcoinService) { }

  ngOnInit() {
  	this.getBlock();
  }

  getBlock(): void {
    this.bitcoinService
      .getBlock("0000000067a97a2a37b8f190a17f0221e9c3f4fa824ddffdc2e205eae834c8d7")
      .subscribe((block : Block) => {
        this.block = block;
      });
  }
  

}
