import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { InvestigationService} from './investigation.service';

@Injectable({
  providedIn: 'root'
})
export class InvestigationGuard implements CanActivate {

	private investigationActive;

	constructor(private investigationService: InvestigationService, private router: Router){}

	canActivate() : boolean {
		if (!this.investigationService.investigationActive) {
			this.router.navigate(['search'])
			return false;
		}

		return true;
	}
}