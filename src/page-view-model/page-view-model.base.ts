import { AnyViewModel, ViewModelBase, ViewModelParams } from 'mobx-view-model';

import { RawQueryParams } from '../query-params';
import { RouteDeclaration, RouterStore } from '../router';
import { AnyObject, EmptyObject } from '../utils/types';

import { PageViewModel } from './page-view-model';

export class PageViewModelBase<
    Params extends AnyObject = EmptyObject,
    ParentViewModel extends AnyViewModel | null = null,
  >
  extends ViewModelBase<any, ParentViewModel>
  implements PageViewModel<Params, ParentViewModel>
{
  protected router: RouterStore;

  private routeDeclaration: RouteDeclaration;

  constructor(
    routeDeclaration: RouteDeclaration,
    router: RouterStore,
    config: ViewModelParams<Params, ParentViewModel>,
  ) {
    super(config);

    this.routeDeclaration = routeDeclaration;
    this.router = router;
  }

  protected get routeMatch() {
    return (
      this.router.matches.find(
        (match) => match.id === this.routeDeclaration.id!,
      ) ?? null
    );
  }

  get pathParams(): Params {
    return (this.routeMatch?.params ?? {}) as Params;
  }

  get queryParams(): RawQueryParams {
    return this.router.queryParams.data;
  }
}
