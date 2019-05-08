import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import {MAT_BOTTOM_SHEET_DATA, MatBottomSheet, MatBottomSheetRef} from '@angular/material';
import { InvestigationService } from '../investigation/investigation.service';

@Component({
  selector: 'add-node',
  templateUrl: './add-node.component.html',
  styleUrls: ['./add-node.component.css']
})
export class AddNodeComponent {

	constructor (private router : Router, private bottomSheet: MatBottomSheet) {

	}

	addNewNode() {
		const bottomSheetRef = this.bottomSheet.open(AddNodeBottomSheet, {
  		data: { names: ['Frodo', 'Bilbo'] },
		});
	}

	navigateToSearch() {
		this.router.navigate(['search']);
	}
}

@Component({
  selector: 'add-node-sheet',
  templateUrl: './add-node-bottom-sheet.component.html'
})
export class AddNodeBottomSheet {
  constructor(@Inject(MAT_BOTTOM_SHEET_DATA) public data: any, 
  						private investigationService: InvestigationService,
  						private bottomSheetRef: MatBottomSheetRef<AddNodeBottomSheet>) { }

  onSubmitNewNodeForm(form) {

  	if (form.valid) {
  		this.investigationService.provideNewCustomNodeData(form.value);
  		this.bottomSheetRef.dismiss();
  	}

  }
}