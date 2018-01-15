import {Observable} from 'rxjs/Observable';
import {Sort} from './sort';
import {ArrayInterface} from './array-interface';
import {HttpClient} from '@angular/common/http';
import {ResourceHelper} from './resource-helper';
import {Resource} from './resource';

export class ResourceArray<T> implements ArrayInterface<T> {

    public http: HttpClient;
    public observable: Observable<any>;
    public sortInfo: Sort[];

    public proxyUrl: string;
    public rootUrl: string;

    public self_uri: string;
    public next_uri: string;
    public prev_uri: string;
    public first_uri: string;
    public last_uri: string;

    public totalElements = 0;
    public totalPages = 1;
    public pageNumber = 1;
    public pageSize: number;

    public result: T[] = [];

    push = (el: T) => {
        this.result.push(el);
    };

    length = (): number => {
        return this.result.length;
    };

    init = <T extends Resource>(type: { new(): T }, response: any, sortInfo: Sort[]): ResourceArray<T> => {
        const result: ResourceArray<T> = ResourceHelper.createEmptyResult<T>(this.http);
        result.sortInfo = sortInfo;
        ResourceHelper.instantiateResourceCollection(type, response, result);
        return result;
    };

    private getURL(url:string): string {
        if(!this.proxyUrl)
            return url;
        return url.replace(this.rootUrl, this.proxyUrl);
    }

// Load next page
    next = <T extends Resource>(): Observable<ResourceArray<T>> => {
        if (this.next_uri) {
            let type: { new(): T };
            return this.http.get(this.getURL(this.next_uri), {headers: ResourceHelper.headers})
                .map(response => this.init(type, response, this.sortInfo))
                .catch(error => Observable.throw(error));
        }
        return Observable.throw("no next defined");
    };

    prev = <T extends Resource>(): Observable<ResourceArray<T>> => {
        if (this.prev_uri) {
            let type: { new(): T };
            return this.http.get(this.getURL(this.prev_uri), {headers: ResourceHelper.headers})
                .map(response => this.init(type, response, this.sortInfo))
                .catch(error => Observable.throw(error));
        }
        return Observable.throw("no prev defined");
    };

// Load first page

    first = <T extends Resource>(): Observable<ResourceArray<T>> => {
        if (this.first_uri) {
            let type: { new(): T };
            return this.http.get(this.getURL(this.first_uri), {headers: ResourceHelper.headers})
                .map(response => this.init(type, response, this.sortInfo))
                .catch(error => Observable.throw(error));
        }
        return Observable.throw("no first defined");
    };

// Load last page

    last = <T extends Resource>(): Observable<ResourceArray<T>> => {
        if (this.last_uri) {
            let type: { new(): T };
            return this.http.get(this.getURL(this.last_uri), {headers: ResourceHelper.headers})
                .map(response => this.init(type, response, this.sortInfo))
                .catch(error => Observable.throw(error));
        }
        return Observable.throw("no last defined");
    };

// Load page with given pageNumber

    page = <T extends Resource>(id: number): Observable<ResourceArray<T>> => {
        let type: { new(): T };
        const uri = this.getURL(this.self_uri).concat('?', 'size=', this.pageSize.toString(), '&page=', id.toString());
        for (const item of this.sortInfo) {
            uri.concat('&sort=', item.path, ',', item.order);
        }
        return this.http.get(uri, {headers: ResourceHelper.headers})
            .map(response => this.init(type, response, this.sortInfo))
            .catch(error => Observable.throw(error));
    };

// Sort collection based on given sort attribute


    sortElements = <T extends Resource>(...sort: Sort[]): Observable<ResourceArray<T>> => {
        let type: { new(): T };
        const uri = this.getURL(this.self_uri).concat('?', 'size=', this.pageSize.toString(), '&page=', this.pageNumber.toString());
        for (const item of sort) {
            uri.concat('&sort=', item.path, ',', item.order);
        }
        return this.http.get(uri, {headers: ResourceHelper.headers})
            .map(response => this.init(type, response, sort))
            .catch(error => Observable.throw(error));
    };

// Load page with given size

    size = <T extends Resource>(size: number): Observable<ResourceArray<T>> => {
        let type: { new(): T };
        const uri = this.getURL(this.self_uri).concat('?', 'size=', size.toString());
        for (const item of this.sortInfo) {
            uri.concat('&sort=', item.path, ',', item.order);
        }
        return this.http.get(uri, {headers: ResourceHelper.headers})
            .map(response => this.init(type, response, this.sortInfo))
            .catch(error => Observable.throw(error));
    };
}
