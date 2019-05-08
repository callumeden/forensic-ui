import { Component, OnInit, Inject } from '@angular/core';
import { AppService } from '../../../app.service';
import { MatSnackBar, MatSnackBarRef, MAT_SNACK_BAR_DATA} from '@angular/material';
import { NodeType } from '../../../bitcoin/model';
import { AddLinkService } from '../../../components/add-node/add-link.service';

@Component({
  selector: 'nodeDataVisual',
  template: '',
  styleUrls: ['./node-data-visual.component.css']
})
export class NodeDataVisualComponent implements OnInit {

	private nodeItems: {};
	private nodeName: string;

	constructor(private dataService: AppService, private nodeInfoSnackBar: MatSnackBar) {
	}

	ngOnInit() {
		this.dataService.currentMessage.subscribe(updatedData => {
			this.nodeInfoSnackBar.dismiss();
			let nodeName = updatedData[0]; 
			let nodeItems = updatedData[1]

			if (nodeItems) {
				this.openSnackBar(nodeName, nodeItems);
			}

		});
	}

  openSnackBar(name: string, nodeItems: any) {
  	switch (name) {
  		case NodeType.ADDRESS:
  			this.nodeInfoSnackBar.openFromComponent(AddressNodeSnackbarComponent, {
  				data: nodeItems,
  				panelClass: 'node-snackbar'
   			});
  			break;

  		case NodeType.OUTPUT:
  			this.nodeInfoSnackBar.openFromComponent(OutputNodeSnackbarComponent, {
  				data: nodeItems,
  				panelClass: 'node-snackbar'
   			});
   			break;

   		case NodeType.TRANSACTION:
   			this.nodeInfoSnackBar.openFromComponent(TransactionNodeSnackbarComponent, {
   				data: nodeItems,
   				panelClass: 'node-snackbar'
   			});
  			break;

  		case NodeType.BLOCK:
  			this.nodeInfoSnackBar.openFromComponent(BlockNodeSnackbarComponent, {
  				data: nodeItems,
  				panelClass: 'node-snackbar'
  			});
  			break;

      case NodeType.CUSTOM:
        this.nodeInfoSnackBar.openFromComponent(CustomNodeSnackbarComponent, {
          data: nodeItems,
          panelClass: 'node-snackbar'
        })
  	}

  }

}

@Component({
	selector: 'address-node-snack-bar',
	templateUrl: './snack-bar-templates/address.html',
	styleUrls: ['./snack-bar-customisation.css']
})
export class AddressNodeSnackbarComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) { }
}

@Component({
	selector: 'output-node-snack-bar',
	templateUrl: './snack-bar-templates/output.html',
	styleUrls: ['./snack-bar-customisation.css']
})
export class OutputNodeSnackbarComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) { }
}

@Component({
	selector: 'transaction-node-snack-bar',
	templateUrl: './snack-bar-templates/transaction.html',
	styleUrls: ['./snack-bar-customisation.css']
})
export class TransactionNodeSnackbarComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) { }
}

@Component({
	selector: 'block-node-snack-bar',
	templateUrl: './snack-bar-templates/block.html',
	styleUrls: ['./snack-bar-customisation.css']
})
export class BlockNodeSnackbarComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) { }
}

@Component({
  selector: 'custom-node-snack-bar',
  templateUrl: './snack-bar-templates/custom.html',
  styleUrls: ['./snack-bar-customisation.css']
})
export class CustomNodeSnackbarComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any,  
    private snackbarRef: MatSnackBarRef<CustomNodeSnackbarComponent>,
    private dataService : AddLinkService) { }

  createCustomLink() {
    this.snackbarRef.dismiss();
    this.dataService.newLinkRequest(this.data);
  }
}

