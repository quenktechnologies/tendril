import * as http from 'http';

import { merge } from '@quenk/noni/lib/data/record';
import { Agent, defaultOptions } from '@quenk/jhr/lib/agent';
import { JSONTransform } from '@quenk/jhr/lib/agent/transform/json';
import { FormTransform } from '@quenk/jhr/lib/agent/transform/form';
import { NodeHTTPTransport } from '@quenk/jhr/lib/agent/transport/node';
import { MemoryContainer } from '@quenk/jhr/lib/cookie/container/memory';
import { JSONParser } from '@quenk/jhr/lib/agent/parser/json';
import { NoParser } from '@quenk/jhr/lib/agent/parser';
import { BufferToStringAdapter } from '@quenk/jhr/lib/agent/transport/node/parser';
import { TEST_PORT } from './port';

const opts = () => merge(defaultOptions, { port: TEST_PORT });
const newHTTPAgent = () => new http.Agent({ keepAlive: false });

export const HOST = 'localhost';

export const createAgent = (host: string = HOST) =>
    new Agent(
        host,
        new MemoryContainer(),
        opts(),
        new NodeHTTPTransport(
            new FormTransform(),
            new BufferToStringAdapter(new NoParser()),
            newHTTPAgent()
        ),
        []
    );

export const createJSONAgent = (host: string = HOST) =>
    new Agent(
        host,
        new MemoryContainer(),
        opts(),
        new NodeHTTPTransport(
            new JSONTransform(),
            new BufferToStringAdapter(new JSONParser({ lenient: true })),
            newHTTPAgent()
        ),
        []
    );
