import { ActionM  } from '../../../../../../../src/app/api/action';
import { Request  } from '../../../../../../../src/app/api/request';
import {  show } from '../../../../../../../src/app/api/action/show';

export const generate = (_: Request): ActionM<undefined> =>
    (show('reports'));
