import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { InvestigationService } from '../investigation/investigation.service';
import { FileUploader, FileSelectDirective, FileItem } from 'ng2-file-upload/ng2-file-upload';
import { Custom, CustomNodeType } from '../../bitcoin/model';

export interface CustomNodeOptions {
  value: CustomNodeType;
  viewValue: string;
}
const URL = 'http://localhost:3000/api/upload';

@Component({
  selector: 'add-node-sheet',
  templateUrl: './add-node-dialog.component.html',
  styleUrls: ['./add-link.component.css']
})
export class AddNodeDialog implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, 
  						private investigationService: InvestigationService,
  						private dialogRef: MatDialogRef<AddNodeDialog>) { }


  nodeTypes : CustomNodeOptions[] = [
    {value: CustomNodeType.PHOTO_ID, viewValue: "Photographic ID"}, 
    {value: CustomNodeType.DELIVERY, viewValue: "Delivery Information"}, 
    {value: CustomNodeType.INVOICE, viewValue: "Invoice"}, 
    {value: CustomNodeType.OTHER, viewValue: "Other"}
  ]
  
  private uploading : boolean = false;
  private uploadSuccess: boolean = false;
  private uploadedFile : FileItem;
  public uploader: FileUploader = new FileUploader({url: URL, itemAlias: "photo"});
  private selectedFileName : string;
  private customFieldCount: number = 0;
  private counter = Array;
  private CustomNodeType = CustomNodeType;

  ngOnInit() {
    this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };
    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
         console.log('ImageUpload:uploaded:', item, status, response);
         this.uploading = false;
         this.uploadSuccess = true;
         this.uploadedFile = item;
     };
  }

  fileEvent(event) {
    this.selectedFileName = event.target.files[0].name;
  }

  addCustomNode(selected, form) {
    if (!form.valid) {
      return;
    }
    
    switch (selected.value) {
      case CustomNodeType.PHOTO_ID:
        this.addPhotoIdNode(selected, form);
        break;

      default:
        this.addOtherCustomNode(selected, form);
        break;
    };
  }

  addPhotoIdNode(selected, form) {
  	if (this.uploadSuccess) {
      let photoIdModel = {file: this.uploadedFile}

      let userProperties = this.retrieveUserProps(form);
      let model : Custom = {name: form.value.name, nodeType: selected.value, userProps: userProperties, photoIdModel: photoIdModel};
      
  		this.investigationService.provideNewCustomNodeData(model);
  		this.dialogRef.close();
  	}

  }

  addOtherCustomNode(selected, form) {
    let model : Custom = {name: form.value.name, nodeType: selected.value, userProps: this.retrieveUserProps(form)};
    this.investigationService.provideNewCustomNodeData(model);
    this.dialogRef.close();
  }

  retrieveUserProps(form) {
   let userProperties = {};
    if (this.customFieldCount > 0) {

      for (let i = 0; i < this.customFieldCount; i ++) {
        let propNameField = 'prop-name-' + i;
        let propValField = 'prop-val-' + i;
        userProperties[form.value[propNameField]] = form.value[propValField];
      }
    }

    return userProperties;
  }

  saveImage(photoId) {
    this.uploading = true;
    this.uploader.uploadAll()
  }
}