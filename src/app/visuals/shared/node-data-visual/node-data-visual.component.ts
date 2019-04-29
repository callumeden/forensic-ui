import { Component, OnInit } from '@angular/core';
import { AppService } from '../../../app.service';

@Component({
  selector: 'nodeDataVisual',
  templateUrl: './node-data-visual.component.html',
  styleUrls: ['./node-data-visual.component.css']
})
export class NodeDataVisualComponent implements OnInit {

	private nodeData: {};

	constructor(private dataService: AppService) {
	}

	ngOnInit() {
		this.dataService.currentMessage.subscribe(updatedData => {this.nodeData = updatedData});
	}

	keys() : Array<string> {
    return Object.keys(this.nodeData.items);
  }

}
