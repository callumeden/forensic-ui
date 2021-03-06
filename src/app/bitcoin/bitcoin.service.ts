import { Injectable } from '@angular/core';
import { Block, Address, Output, Transaction, Entity, Coinbase} from './model'
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BitcoinService {

	readonly serviceDomain : string = 'http://localhost:8090';
  private dateFilters?;
  private priceFilters?;
  private inputClusteringEnabled : boolean;
  private nodeLimit: number;

  constructor(private http: HttpClient) { }

  private buildQueryParams() {
    let queryParams = "?";
    let atLeastOneFilter = false;

     if (this.dateFilters) {
      queryParams = queryParams + "startTime=" + this.dateFilters['start'] + "&endTime=" + this.dateFilters['end'];
      atLeastOneFilter = true;
    }

    if (this.priceFilters) {
      queryParams = queryParams + "&startPrice=" + this.priceFilters['start'] + "&endPrice=" + this.priceFilters['end'] + "&priceUnit=" + this.priceFilters['unit'];
      atLeastOneFilter = true;
    }

    if (this.inputClusteringEnabled) {
      queryParams = queryParams + "&inputClustering=true";
      atLeastOneFilter = true; 
    }

    if (this.nodeLimit > 0) {
      queryParams = queryParams + "&nodeLimit=" + this.nodeLimit;
      atLeastOneFilter = true; 
    } 

    return atLeastOneFilter? queryParams : "";

  }

  searchForAddress(address:string, inputClusteringEnabled: boolean, nodeLimit : number, dateFilters?, priceFilters?) {
    this.dateFilters = dateFilters;
    this.priceFilters = priceFilters;
    this.inputClusteringEnabled = inputClusteringEnabled;
    this.nodeLimit = nodeLimit;
    //first, we fetch the address without input clustering to see if its associated with an entity 

    return this.http.get<Address>(this.serviceDomain + "/bitcoin/address/" + address + this.buildQueryParams()); 
  }

  searchForEntity(entityName:string, inputClusteringEnabled: boolean, nodeLimit : number, dateFilters?, priceFilters?) {
    this.dateFilters = dateFilters;
    this.priceFilters = priceFilters;
    this.inputClusteringEnabled = inputClusteringEnabled;
    this.nodeLimit = nodeLimit;
    return this.http.get<Entity>(this.serviceDomain + "/bitcoin/entity/" + entityName + this.buildQueryParams())
  }

  findPath(startAddress:string, endAddress:string) {
    return this.http.get(this.serviceDomain + "/bitcoin/shortestPath/" + startAddress + "/" + endAddress);
  }

  getAddresses(addresses: string[]) : Observable<Address>[] {
  	let observables : Observable<Address>[] = [];
  	addresses.forEach(address => observables.push(this.getAddress(address)));
  	return observables;
  }

  getAddress(address: string) : Observable<Address> {
  	return this.http.get<Address>(this.serviceDomain + "/bitcoin/address/" + address + this.buildQueryParams()) 
  	.pipe(
  		tap(_ => console.info('got address')),
      catchError(this.handleError<Address>('getAddress'))
    );
  }

  getOutput(outputId : string) : Observable<Output> {
    return this.http.get<Output>(this.serviceDomain + "/bitcoin/output/" + outputId + this.buildQueryParams())
    .pipe(
      tap(_ => console.info('got output')),
      catchError(this.handleError<Output>('getOutput'))
    );
  }

  getTransaction(transactionId: string) : Observable<Transaction> {
    return this.http.get<Transaction>(this.serviceDomain + "/bitcoin/transaction/" + transactionId + this.buildQueryParams()) 
    .pipe(
      tap(_ => console.info('got transaction')),
      catchError(this.handleError<Transaction>('getTransaction'))
    );
  }

  getBlock(hash : string) : Observable<Block> {
  	return this.http.get<Block>(this.serviceDomain + "/bitcoin/block/" + hash + this.buildQueryParams()) 
  	.pipe(
  		tap(_ => console.info('success: fetched block')),
      catchError(this.handleError<Block>('getBlock'))
    );
  }

  getEntity(name : string) : Observable<Entity> {
    return this.http.get<Entity>(this.serviceDomain + "/bitcoin/entity/" + name + this.buildQueryParams())
    .pipe(
      tap(_ => console.info('success: fetched block')),
      catchError(this.handleError<Entity>('getEntity'))
    );
  }

  getCoinbase(coinbaseId: string) : Observable<Coinbase> {
    return this.http.get<Coinbase>(this.serviceDomain + "/bitcoin/coinbase/" + coinbaseId)
    .pipe(
      tap(_ => console.info('success: fetched block')),
      catchError(this.handleError<Coinbase>('getCoinbase'))
    );
  }

  private handleError<T> (operation = 'operation', result?: T) {
	  return (error: any): Observable<T> => {
	 
	    // TODO: send the error to remote logging infrastructure
	    console.error(error); // log to console instead
	 
	    // TODO: better job of transforming error for user consumption
	    console.log(`${operation} failed: ${error.message}`);
	 
	    // Let the app keep running by returning an empty result.
	    return of(result as T);
	  };
	}	
}
