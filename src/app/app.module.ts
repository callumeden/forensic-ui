import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { HttpClientModule }    from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';

import { D3Service, D3_DIRECTIVES } from './d3';
import { MatListModule , MatCardModule, MatBottomSheetModule, MatDialogModule, MatSelectModule, MatAutocompleteModule, MatDividerModule, MatChipsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatProgressBarModule, MatSnackBarModule, MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { InvestigationComponent } from './components/investigation/investigation.component';
import { AddNodeComponent, AddLinkDialog } from './components/add-node/add-node.component';
import { AddNodeDialog } from './components/add-node/add-node-dialog.component';
import { AppComponent } from './app.component' 
import { GraphComponent } from './visuals/graph/graph.component';
import { SearchComponent } from './components/search/search.component';
import { SHARED_VISUALS } from './visuals/shared';
import { InvestigationGuard } from './components/investigation/investigaiton-guard.service';
import { NodeDataVisualComponent, AddressNodeSnackbarComponent, EntityNodeSnackbarComponent, OutputNodeSnackbarComponent, TransactionNodeSnackbarComponent, BlockNodeSnackbarComponent, CustomNodeSnackbarComponent} from './visuals/shared/node-data-visual/node-data-visual.component';
import { ClipboardModule } from 'ngx-clipboard';
import { FileSelectDirective } from 'ng2-file-upload';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
const appRoutes: Routes = [
{path: 'investigation', component: InvestigationComponent, canActivate: [InvestigationGuard]},
{path: '**', redirectTo: '/search', pathMatch: 'full'},
{path: 'search', component: SearchComponent}
]
@NgModule({
  declarations: [
    InvestigationComponent,
    AddNodeComponent, 
    NodeDataVisualComponent,
    AddressNodeSnackbarComponent,
    OutputNodeSnackbarComponent,
    EntityNodeSnackbarComponent,
    TransactionNodeSnackbarComponent,
    BlockNodeSnackbarComponent,
    CustomNodeSnackbarComponent,
    AddNodeDialog,
    AddLinkDialog,
    FileSelectDirective,
    GraphComponent,
    AppComponent,
    SearchComponent,
    ...SHARED_VISUALS,
    ...D3_DIRECTIVES
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatListModule,
    MatCardModule,
    MatFormFieldModule,
    MatChipsModule,
    MatBottomSheetModule,
    MatAutocompleteModule,
    MatInputModule,
    MatSelectModule,
    FontAwesomeModule,
    MatButtonModule,
    MatDividerModule,
    MatSnackBarModule,
    MatProgressBarModule,
    BrowserAnimationsModule,
    MatDialogModule,
    ClipboardModule,
    RouterModule.forRoot(
      appRoutes
    )
  ],
  entryComponents: [NodeDataVisualComponent, AddressNodeSnackbarComponent, OutputNodeSnackbarComponent, EntityNodeSnackbarComponent, TransactionNodeSnackbarComponent, BlockNodeSnackbarComponent, AddNodeDialog, AddLinkDialog, CustomNodeSnackbarComponent],
  providers: [D3Service, 
    {provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {duration: 500000}}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
