import { Action  } from '../../../../../../../src/app/api';
import { Request  } from '../../../../../../../src/app/api/request';
import {  show } from '../../../../../../../src/app/api/action/response';

export const generate = (_: Request): Action<undefined> =>
    (show('reports'));
