import { Router } from '@remix-run/router';
import { action, makeObservable, observable, runInAction } from 'mobx';
import { AnyObject } from 'yummies/utils/types';

import { QueryParams } from './query-params.js';
import { RawQueryParams } from './query-params.types.js';

export class QueryParamsBase implements QueryParams {
  data: RawQueryParams;

  private routerSubscription: VoidFunction;

  constructor(private router: Router) {
    this.data = this.getSearchParamsData();

    observable.struct(this, 'data');
    action(this, 'set');
    action(this, 'update');

    makeObservable(this);

    this.routerSubscription = this.router.subscribe(() => {
      runInAction(() => {
        this.data = this.getSearchParamsData();
      });
    });
  }

  getSearchParamsData(search: string = location.search) {
    return Object.fromEntries(new URLSearchParams(search).entries());
  }

  buildSearchString(data: AnyObject) {
    const fixedData: AnyObject = {};

    for (const [key, value] of Object.entries(data)) {
      if (value != null) {
        fixedData[key] = value;
      }
    }

    const urlSearchParams = new URLSearchParams(fixedData);

    return urlSearchParams.size > 0 ? `?${urlSearchParams}` : '';
  }

  buildUrl(queryParams: AnyObject) {
    const search = this.buildSearchString(queryParams);
    return `${location.pathname}${search}`;
  }

  set = async (queryParams: AnyObject, replace: boolean = false) => {
    const nextUrl = this.buildUrl(queryParams);
    await this.router.navigate(nextUrl, {
      replace,
    });
  };

  update = async (queryParams: AnyObject, replace: boolean = false) => {
    await this.set(
      {
        ...this.data,
        ...queryParams,
      },
      replace,
    );
  };

  destroy(): void {
    this.routerSubscription();
  }

  dispose() {
    this.destroy();
  }
}
