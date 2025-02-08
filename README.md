# mobx-react-routing  

## Usage (with using `rootStore`)  

> requires `mobx-view-model` package usage  


### 1. Create `PageViewModelImpl` class  

This class you will needed for creating your own view model classes  
You can implement your own solution based on `PageViewModel<Params, ParentViewModel>` interface, but `AbstractPageViewModel` has a lot of ready solutions like `queryParams` or `pathParams`  
Only one thing that you should implement is the `getParentViewModel` and `constructor` because it requires (in most cases) `RootStore`  


```tsx  
import { PageViewModelImpl as PageViewModelBaseImpl, RouteDeclaration, RouterStore } from 'mobx-react-routing';
import { ViewModel } from 'mobx-view-model';

export class PageViewModelImpl<
    Params extends AnyObject = EmptyObject,
    ParentViewModel extends ViewModel<any, any> | null = null,
  >
  extends PageViewModelBaseImpl<Params, ParentViewModel>
{
  protected router: RouterStore;

  constructor(
    protected rootStore: RootStore,
    routeDeclaration: RouteDeclaration,
    config: ViewModelParams<Params, ParentViewModel>,  
  ) {
    super(routeDeclaration, rootStore.router, config);
    this.router = rootStore.router;
  }

  yourMethodForAllVMs() {
    console.info('log') 
  }
} 
```

### 2. Create `RouterStoreImpl` Class  

This class will contains info about all routing and will have all router utilities based on `react-router-dom`.  
You can implement your own solution based on `RouterStore` interface, but `AbstractRouterStore` has a lot of ready solutions like `navigate`, `blockRoutingIf`, `blockRouting` etc.  

```tsx  
import {
  RouterStoreImpl as RouterStoreBaseImpl,
  RouterStoreParams,
  RouteDeclaration,
  createRoute,
} from 'mobx-react-routing';
import { RouteObject } from 'react-router-dom';

import { PageViewModelImpl } from './page-view-model';

export class RouterStoreImpl extends RouterStoreBaseImpl {
  constructor(
    protected rootStore: RootStore,
    params: RouterStoreParams,
  ) {
    super(params);
  }

  // override this method because we need to send rootStore to our view models
  // but default `RouterStoreBaseImpl` this method implementation don't know about RootStore
  createRoute(routeDeclaration: RouteDeclaration): RouteObject {
    return createRoute(routeDeclaration, this, (config) => {
      const VM = config.VM as unknown as typeof PageViewModelImpl;
      return new VM(this.rootStore, routeDeclaration, config);
    });
  }
}
```  

### 3. create instance of your `RouterStore` implementation

```tsx
import { Outlet } from "react-router-dom"

const routerStore = new RouterStoreImpl(rootStore, {
  routes: [
    {
      path: '/',
      element: () => <Outlet />,
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


### 4. Attach instance to rootStore   

```ts
rootStore.router = routerStore;
```

### 5. Create Page view model and view   

```tsx
export class HomePageVM extends PageViewModelImpl<{ bar?: string }> {
  mount(): void {
    super.mount();
  }

  unmount(): void {
    super.unmount();
  }

  didUnmount(): void {
    // cleanup here
  }
}

export const HomePageView = observer(({ model }: ViewModelProps<HomePageVM>) => {
  return (
    <div>
      {`foo query param - ${model.queryParams.foo}`}
      {`bar path param - ${model.pathParams.bar}`}
    </div>
  )
})
```


### About path params  

Path params should be declared in route declaration firstly   

```ts
import { RouteDeclaration } from 'mobx-react-routing';
const routeDeclaration: RouteDeclaration =  {
  errorBoundary: ErrorBoundary,
  fallback: GlobalLoader,
  path: '/my-page/:barId',
  async loader() {
    const { HomePageModel } = await import('@/pages/home');
    return {
      Model: HomePageModel,
    };
  },
}
```

Here is `:barId` is string path param with key `barId`. Then in your VM you can declare it using generic  

```ts
export class HomePageVM extends PageViewModelImpl<{ barId: string }> {
  bars = [
    {
      id: 'kek',
      name: 'Kek',
    },
    {
      id: 'pek',
      name: 'Pek',
    },
  ]

  get barData(){
    return this.bars.find(it => it.id === this.pathParams.barId)
  }
}
```