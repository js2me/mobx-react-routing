import { ComponentType } from 'react';
import { useParams } from 'react-router-dom';

import { Maybe } from '../utils/types';

export const VMPayloadTransferHOC = (Component: Maybe<ComponentType<any>>) => {
  if (!Component || !(Component as any).withViewModel) return Component;

  return (props: any) => {
    // eslint-disable-next-line sonarjs/rules-of-hooks
    const params = useParams();

    return <Component {...props} payload={params} />;
  };
};
