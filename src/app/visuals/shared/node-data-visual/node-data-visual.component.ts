import { Component, OnInit } from '@angular/core';
import { AppService } from '../../../app.service';

@Component({
  selector: 'nodeDataVisual',
  templateUrl: './node-data-visual.component.html',
  styleUrls: ['./node-data-visual.component.css']
})
export class NodeDataVisualComponent implements OnInit {

	private nodeItems: {};
	private nodeName: string;

	constructor(private dataService: AppService) {
	}

	ngOnInit() {
		this.dataService.currentMessage.subscribe(updatedData => {
			this.nodeName = updatedData[0]; 
			this.nodeItems = updatedData[1]});
	}

	keys() : Array<string> {
		if (this.nodeItems && this.nodeItems != '{}') {
    	return Object.keys(this.nodeItems);
		}
		return [];
  }

}
