import { observer } from 'mobx-react-lite';
import { ComponentType } from 'react';

import type { RouterStore } from '../router';

const DefaultFallback = () => null;

export function withRouteBlocker<P>(
  router: RouterStore,
  Component: ComponentType<P>,
  Fallback: ComponentType = DefaultFallback,
) {
  const WrappedComponent = observer((props: P) => {
    if (router.blocked) return <Fallback />;

    return <Component {...(props as any)} />;
  });

  if (process.env.NODE_ENV !== 'production') {
    Object.assign(WrappedComponent, {
      displayName: `WithRouteBlocker(${Component.name || 'Unknown'})`,
    });
  }

  return WrappedComponent;
}
