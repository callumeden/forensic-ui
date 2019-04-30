import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { HttpClientModule }    from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';

import { D3Service, D3_DIRECTIVES } from './d3';
import { MatListModule , MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatProgressBarModule} from '@angular/material';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { InvestigationComponent } from './components/investigation/investigation.component';
import { AppComponent } from './app.component' 
import { GraphComponent } from './visuals/graph/graph.component';
import { SearchComponent } from './components/search/search.component';
import { SHARED_VISUALS } from './visuals/shared';

const appRoutes: Routes = [
{path: 'investigation', component: InvestigationComponent},
{path: '', redirectTo: '/investigation', pathMatch: 'full'},
{path: 'search', component: SearchComponent}
]

@NgModule({
  declarations: [
    InvestigationComponent,
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
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true } // <-- debugging purposes only
    )
  ],
  providers: [D3Service],
  bootstrap: [AppComponent]
})
export class AppModule { }
