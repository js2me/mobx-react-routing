import { Router } from '@remix-run/router';
import { action, observable, runInAction } from 'mobx';
import { Disposer } from 'mobx-disposer-util';

import { QueryParams } from './query-params';
import { RawQueryParams } from './query-params.types';

export class QueryParamsImpl implements QueryParams {
  private disposer = new Disposer();

  @observable.struct
  accessor data: RawQueryParams;

  constructor(private router: Router) {
    this.data = this.getSearchParamsData();

    this.disposer.add(
      this.router.subscribe(() => {
        runInAction(() => {
          this.data = this.getSearchParamsData();
        });
      }),
    );
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

    return urlSearchParams.size ? `?${urlSearchParams}` : '';
  }

  buildUrl(queryParams: AnyObject) {
    const search = this.buildSearchString(queryParams);
    return `${location.pathname}${search}`;
  }

  @action
  set = async (queryParams: AnyObject, replace: boolean = false) => {
    const nextUrl = this.buildUrl(queryParams);
    await this.router.navigate(nextUrl, {
      replace,
    });
  };

  @action
  update = async (queryParams: AnyObject, replace: boolean = false) => {
    await this.set(
      {
        ...this.data,
        ...queryParams,
      },
      replace,
    );
  };

  dispose() {
    this.disposer.dispose();
  }
}
