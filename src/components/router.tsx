import { observer } from 'mobx-react-lite';
import { RouterProvider } from 'react-router-dom';

import { RouterStore } from '../router/index.js';

interface RouterProps {
  router: RouterStore;
}

export const Router = observer(({ router }: RouterProps) => {
  const FallbackComponent = router.fallbackComponent;

  return (
    <RouterProvider
      {...({
        router: router.getInstance(),
        fallbackElement: FallbackComponent && <FallbackComponent />,
      } as any)}
    />
  );
});
