import { Component, OnInit, Inject } from '@angular/core';
import { AppService } from '../../../app.service';
import { InvestigationService } from '../../../components/investigation/investigation.service';
import { MatSnackBar, MatSnackBarRef, MAT_SNACK_BAR_DATA} from '@angular/material';
import { NodeType, CustomNodeType } from '../../../bitcoin/model';
import { AddLinkService } from '../../../components/add-node/add-link.service';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';

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

    this.dataService.currentDismissMessage.subscribe(dismissMessage => {
      if (dismissMessage) {
        this.nodeInfoSnackBar.dismiss();
      }
    })
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
        break;

      case NodeType.ENTITY:
        this.nodeInfoSnackBar.openFromComponent(EntityNodeSnackbarComponent, {
          data: nodeItems,
          panelClass: 'node-snackbar'
        })
        break;
      case NodeType.SUPERNODE:
        this.nodeInfoSnackBar.openFromComponent(SuperNodeSnackbarComponent, {
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
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any,
    private snackbarRef: MatSnackBarRef<AddressNodeSnackbarComponent>) { }
  private faTimesCircle = faTimesCircle;

  dismiss() {
    this.snackbarRef.dismiss();
  }
}

@Component({
  selector: 'entity-node-snack-bar',
  templateUrl: './snack-bar-templates/entity.html',
  styleUrls: ['./snack-bar-customisation.css']
})
export class EntityNodeSnackbarComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any,
    private snackbarRef: MatSnackBarRef<EntityNodeSnackbarComponent>) {}
  private faTimesCircle = faTimesCircle;

  dismiss() {
    this.snackbarRef.dismiss();
  }
}

@Component({
	selector: 'output-node-snack-bar',
	templateUrl: './snack-bar-templates/output.html',
	styleUrls: ['./snack-bar-customisation.css']
})
export class OutputNodeSnackbarComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any,
    private snackbarRef: MatSnackBarRef<OutputNodeSnackbarComponent>) { }
  private faTimesCircle = faTimesCircle;

  dismiss() {
    this.snackbarRef.dismiss();
  }
}

@Component({
	selector: 'transaction-node-snack-bar',
	templateUrl: './snack-bar-templates/transaction.html',
	styleUrls: ['./snack-bar-customisation.css']
})
export class TransactionNodeSnackbarComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any,
    private snackbarRef: MatSnackBarRef<TransactionNodeSnackbarComponent>) { }
  private faTimesCircle = faTimesCircle;

  dismiss() {
    this.snackbarRef.dismiss();
  }
}

@Component({
	selector: 'block-node-snack-bar',
	templateUrl: './snack-bar-templates/block.html',
	styleUrls: ['./snack-bar-customisation.css']
})
export class BlockNodeSnackbarComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any,
    private snackbarRef: MatSnackBarRef<BlockNodeSnackbarComponent>) { }
  private faTimesCircle = faTimesCircle;

  dismiss() {
    this.snackbarRef.dismiss();
  }
}

@Component({
  selector: 'block-node-snack-bar',
  templateUrl: './snack-bar-templates/supernode.html',
  styleUrls: ['./snack-bar-customisation.css']
})
export class SuperNodeSnackbarComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any,
    private snackbarRef: MatSnackBarRef<SuperNodeSnackbarComponent>) { 
 }
  private faTimesCircle = faTimesCircle;

  dismiss() {
    this.snackbarRef.dismiss();
  }
}

@Component({
  selector: 'custom-node-snack-bar',
  templateUrl: './snack-bar-templates/custom.html',
  styleUrls: ['./snack-bar-customisation.css']
})
export class CustomNodeSnackbarComponent implements OnInit {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any,  
    private snackbarRef: MatSnackBarRef<CustomNodeSnackbarComponent>,
    private dataService : AddLinkService,
    private appService : AppService,
    private investigationService: InvestigationService) { }

  public CustomNodeType = CustomNodeType;  
  readonly uploadHost : string = "http://localhost:3000/uploads/";
  private photoIdSrc: string;
  private faTimesCircle = faTimesCircle;
  
  createCustomLink() {
    this.snackbarRef.dismiss();
    this.dataService.newLinkRequest(this.data);
  }

  ngOnInit() {
    if (this.data.nodeType == CustomNodeType.PHOTO_ID) {
      this.setPhotoIdSrc();
    }
  }

  setPhotoIdSrc() {
    let file = this.data.photoIdModel.file;
    this.photoIdSrc = this.uploadHost + file.alias + "-" + file.file.name;
  }

  dismiss() {
    this.snackbarRef.dismiss();
  }

  removeNode() {
    this.investigationService.newDeleteNodeRequest(this.data);
  }
}

