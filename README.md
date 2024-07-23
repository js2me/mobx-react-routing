[![npm](https://img.shields.io/npm/v/mobx-react-routing)](https://www.npmjs.com/package/mobx-react-routing) 
[![license](https://img.shields.io/npm/l/mobx-react-routing)](https://github.com/js2me/mobx-react-routing/blob/master/LICENSE)  


> [!WARNING]  
> It's fine if you use this library from NPM package with a **static versioning** in case you
> want it for some pet-project or to test it's capabilities.
>
> But for production use it's **strongly recommended** to create a fork, because I do not write
> Changelogs and may break / add some functionality without notice.  

# mobx-react-routing  



## Usage (with using `rootStore`)  

> requires `mobx-vm-entities` package usage  


### 1. Create `PageViewModelImpl` class  

This class you will needed for creating your own view model classes  
You can implement your own solution based on `PageViewModel<Params, ParentViewModel>` interface, but `AbstractPageViewModel` has a lot of ready solutions like `queryParams` or `pathParams`  
Only one thing that you should implement is the `getParentViewModel` and `constructor` because it requires (in most cases) `RootStore`  


```tsx  
import { RouteDeclaration, AbstractPageViewModel } from 'mobx-react-routing';
import { AbstractViewModelParams, ViewModel } from 'mobx-vm-entities';

export class PageViewModelImpl<
  Params extends AnyObject = EmptyObject,
  ParentViewModel extends ViewModel<any, any> = ViewModel<any, any>,
> extends AbstractPageViewModel<Params, ParentViewModel> {
  constructor(
    protected rootStore: RootStore,
    routeDeclaration: RouteDeclaration,
    config: AbstractViewModelParams<EmptyObject>,
  ) {
    super(routeDeclaration, rootStore.router, config);
  }

  protected getParentViewModel(
    parentViewModelId: Maybe<string>,
  ): ParentViewModel | null {
    return this.rootStore.viewModels.get<ParentViewModel>(parentViewModelId);
  }
}
```

### 2. Create `RouterStoreImpl` Class  

This class will contains info about all routing and will have all router utilities based on `react-router-dom`.  
You can implement your own solution based on `RouterStore` interface, but `AbstractRouterStore` has a lot of ready solutions like `navigate`, `blockRoutingIf`, `blockRouting` etc.  

```tsx  
import {
  AbstractRouterStore,
  AbstractRouterStoreParams,
  RouteDeclaration,
  createRoute,
} from 'mobx-react-routing';
import { RouteObject } from 'react-router-dom';

import { PageViewModelImpl } from './page-view-model';

export class RouterStoreImpl extends AbstractRouterStore {
  constructor(
    protected rootStore: RootStore,
    params: AbstractRouterStoreParams,
  ) {
    super(params);
  }

  // this method is abstract in `AbstractRouterStore` because the creating view model instances requires the `rootStore`
  createRoute(routeDeclaration: RouteDeclaration): RouteObject {
    return createRoute(routeDeclaration, this, (config) => {
      const VM = config.VM as unknown as typeof PageViewModelImpl;

      return new VM(this.rootStore, routeDeclaration, config);
    });
  }
}
```  

### 3. Attach your `RouterStore` to `rootStore`  

```tsx
import { Outlet } from "react-router-dom"

const Layout = () => {

  return (
    <div>
      <Outlet />
    </div>
  )
}

rootStore.router = new RouterStoreImpl(rootStore, {
  routes: [
    {
      path: '/',
      element: <Layout />,
      children: [
        {
          index: true,
          async loader() {
            const { HomePage, HomePageModel } = await import('@/pages/home');
            return {
              Component: HomePage,
              Model: HomePageModel,
            };
          },
        },
        {
          path: '/my-page',
          async loader() {
            const { MyPagePage, MyPagePageModel } = await import('@/pages/my-page');
            return {
              Component: MyPagePage,
              Model: MyPagePageModel,
            };
          },
        }
      ]
    },
    {
      path: '/login',
      async loader() {
        const { LoginPage, LoginPageModel } = await import('@/pages/login');
        return {
          Component: LoginPage,
          Model: LoginPageModel,
        };
      },
    },
    {
      path: '*',
      Model: NotFoundPageModel,
    },
  ],
  fallbackComponent: () => null,
  errorBoundaryComponent: () => null,
});
```
