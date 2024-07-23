import {
  AbstractViewModel,
  AbstractViewModelParams,
  ViewModel,
} from 'mobx-vm-entities';

import { RawQueryParams } from '../query-params';
import { RouteDeclaration, RouterStore } from '../router';

import { PageViewModel } from './page-view-model';

export abstract class AbstractPageViewModel<
    Params extends AnyObject = EmptyObject,
    ParentViewModel extends ViewModel<any, any> = ViewModel<any, any>,
  >
  extends AbstractViewModel<EmptyObject, ParentViewModel>
  implements PageViewModel<Params, ParentViewModel>
{
  protected router: RouterStore;

  private routeDeclaration: RouteDeclaration;

  constructor(
    routeDeclaration: RouteDeclaration,
    router: RouterStore,
    config: AbstractViewModelParams<EmptyObject>,
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
