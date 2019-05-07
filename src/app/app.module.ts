import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { HttpClientModule }    from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';

import { D3Service, D3_DIRECTIVES } from './d3';
import { MatListModule , MatCardModule, MatDividerModule, MatChipsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatProgressBarModule, MatSnackBarModule, MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { InvestigationComponent } from './components/investigation/investigation.component';
import { AppComponent } from './app.component' 
import { GraphComponent } from './visuals/graph/graph.component';
import { SearchComponent } from './components/search/search.component';
import { SHARED_VISUALS } from './visuals/shared';
import { InvestigationGuard } from './components/investigation/investigaiton-guard.service';
import { NodeDataVisualComponent, AddressNodeSnackbarComponent, OutputNodeSnackbarComponent, TransactionNodeSnackbarComponent, BlockNodeSnackbarComponent} from './visuals/shared/node-data-visual/node-data-visual.component';

const appRoutes: Routes = [
{path: 'investigation', component: InvestigationComponent, canActivate: [InvestigationGuard]},
{path: '**', redirectTo: '/search', pathMatch: 'full'},
{path: 'search', component: SearchComponent}
]

@NgModule({
  declarations: [
    InvestigationComponent,
    NodeDataVisualComponent,
    AddressNodeSnackbarComponent,
    OutputNodeSnackbarComponent,
    TransactionNodeSnackbarComponent,
    BlockNodeSnackbarComponent,
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
    MatInputModule,
    MatButtonModule,
    MatDividerModule,
    MatSnackBarModule,
    MatProgressBarModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(
      appRoutes
    )
  ],
  entryComponents: [NodeDataVisualComponent, AddressNodeSnackbarComponent, OutputNodeSnackbarComponent, TransactionNodeSnackbarComponent, BlockNodeSnackbarComponent],
  providers: [D3Service, 
    {provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {duration: 5000}}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
