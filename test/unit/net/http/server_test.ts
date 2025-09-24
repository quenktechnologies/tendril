import * as http from 'http';

import { noop } from '@quenk/noni/lib/data/function';

import { Handler, TendrilServer } from '../../../../lib/net/http/server';

const writeOk = (_: http.IncomingMessage, res: http.ServerResponse) => {
    res.write('ok');
    res.end();
};

const newServer = (handler: Handler = noop) =>
    TendrilServer.createInstance(
        { http: { port: 8888, host: 'localhost' } },
        handler
    );

let server: TendrilServer;

describe('server', () => {
    afterEach(async () => {
        if (server != null) await server.stop();
    });

    describe('start', () => {
        it('should work', async () => {
            server = newServer(writeOk);
            await server.start();

            let res = await fetch('http://localhost:8888');
            expect(await res.text()).toEqual('ok');
        });

        it('must queue sockets', async () => {
            server = newServer(writeOk);
            await server.start();
            await fetch('http://localhost:8888');
            expect(server.sockets.size).toEqual(1);
        });
    });

    describe('stop', () => {
        it('it must not wait on clients', async () => {
            let count = 0;
            server = newServer(() => {
                count++;
            });

            await server.start();

            setTimeout(() => {
                server.stop();
            }, 100);

            let errors: string[] = [];
            let onErr = (e: Error) => {
                errors.push(e.message);
            };
            await Promise.all([
                fetch('http://localhost:8888').catch(onErr),
                fetch('http://localhost:8888').catch(onErr),
                fetch('http://localhost:8888').catch(onErr)
            ]);

            expect(count).toEqual(3);
            expect(errors.length).toEqual(3);
        });
    });

    xdescribe('https', () => {
        it('should work', async () => {
            const key = `
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQD1OP0oqxmIu95N
ejc48ODuhU5WSrqvl1bmw5Tdz4Yi+mw90hZTi5sn14kxyG8RHnV+yVDs6+VG/oDA
tAj/Vmbk4b9CW24ka7mm0DZ49frOiRoE6mdtjs7zCjJtusIZiI6ucoKualcjfa0L
5UTyeR24xhE+sFScuhXiXqttKDtoCnpIzQdJu/98BtEHjWtZGYbabV0rJ96wPXjq
zYbAlO03c1BpbEjX3y53Vehn7pdTX9umA9e59nJgRY83VaYzRul1Gk6zKStIB1Ga
5qI6X9TW1kzEKm905sdH7ZfglkQkS5k2dE8qOrJSWQ5HigDcoQN7J1ctJUoRqLmL
rwJbUpw7AgMBAAECggEACv2hkG+6wT91Azv1uv5GK+qa9uXP4DbZlOuHLI80j99x
d9kxWaU+2wD0top+j+HcRPEjnhAkl+ioP1AnvGn+9UXjm0cbH1QaCg6i97ZD+3sh
nhQeIUbuokNUEfRLkXa8DmLg1eMQ7MJL6JCUuoQQf6Drp5z3mIlZRGrB0YP6xaWR
chQUPvyZC6AZFX0WWp/RB0b3IKd1Vdy/eMh7KLMX00OxY+GtdoI855WlNO8hqiFJ
pF2M7McbWbSdKlKl1AHCdTnOmvxYRE/4GKah45hGKBKTcDuFVrtDy+fFtDu3xbZs
Q0CkY+261b7bT1Uml47XLtvbHOYaagW/0rvAgX8lgQKBgQD9oUOL2TYrh8nQcZGc
4+N1GR5KPXbwsjxgDHZnABtXNHZMZHT0jiy8SB5lUzhRFklo5t6HwCqdxCO5Jwq7
amPddnDC1GqJL/mc/Zvj2M+FnDOYSBjUUFEDBq3enchR3FYZrT5dRVeqKp3iOHVI
F2VLDbPQOWWBWUv/vsRHCjqRawKBgQD3g5zrE/MsmWHkym9xwFKvpAaVsUV/tvAD
0XIWs38Ae4j8Yw6vfiG0nHW6onPtWRF4pS+ojbj+fTmGNQefBR37AEQdLHYR8Thu
9BeCG+JuHAKALhHRVKQwKmTioSfFxBtw+wNPgXZ83vSaB9YJH2ZcejOPBU5tfPeV
J1yQGIhEcQKBgQD4A7gfivpTuub4c/XmK1qDaVqbUlt6p3AupEEsG4igz+ZWcW2E
r3rDaup+PtC1SkviztAQgzOpLuGX7rup5TFeoLFHc5vyJv26LK1CMwNLLiGt6eKN
yzRM9z0SkcwPcJypYyW241YESsQ1MOxO4MHmkLGjDl1aDU4p+gvJRBFdnQKBgQCA
2o2oe/xOrZMfDpwx9dOWCKg86cqqkEwnULQ6STvGvok0C0Wr6tgVNJa9kLEVURcd
XbGP6Cf0pLB7w8Ox73IKJ7tODMVy1cdxS7WpUGbyt7Y9kL5J4eyP/qICsa8I7+zx
RlwU2esbWt6wCYBNw4EAh8WroTGRIkup5JH1mi/moQKBgBEvW7aWxHUwj7T+bNQY
tLPCN6rUps6QwFouwnqLQiCqjZ/yXy7qNzoZ5jYHK4cscezk595xIdt5CSvHi8hY
61kXrP157BQwgpTAyJR8GQXqh7AQq28s6tHBzi6GfQx5wQWyubQcsAVq7uyhD3Dn
CJ4Lg3FqFVrCCPHCwmxt8Nev
-----END PRIVATE KEY-----
`;

            const cert = `
-----BEGIN CERTIFICATE-----
MIIDCTCCAfGgAwIBAgIUfhx0jVFooWAHeuRefJLgIXP+pQYwDQYJKoZIhvcNAQEL
BQAwFDESMBAGA1UEAwwJbG9jYWxob3N0MB4XDTI1MDkyNDA0MzEyOVoXDTM1MDky
MjA0MzEyOVowFDESMBAGA1UEAwwJbG9jYWxob3N0MIIBIjANBgkqhkiG9w0BAQEF
AAOCAQ8AMIIBCgKCAQEA9Tj9KKsZiLveTXo3OPDg7oVOVkq6r5dW5sOU3c+GIvps
PdIWU4ubJ9eJMchvER51fslQ7OvlRv6AwLQI/1Zm5OG/QltuJGu5ptA2ePX6zoka
BOpnbY7O8woybbrCGYiOrnKCrmpXI32tC+VE8nkduMYRPrBUnLoV4l6rbSg7aAp6
SM0HSbv/fAbRB41rWRmG2m1dKyfesD146s2GwJTtN3NQaWxI198ud1XoZ+6XU1/b
pgPXufZyYEWPN1WmM0bpdRpOsykrSAdRmuaiOl/U1tZMxCpvdObHR+2X4JZEJEuZ
NnRPKjqyUlkOR4oA3KEDeydXLSVKEai5i68CW1KcOwIDAQABo1MwUTAdBgNVHQ4E
FgQU3vx1lEHTsKfKdi9yveiD/Mf6RF8wHwYDVR0jBBgwFoAU3vx1lEHTsKfKdi9y
veiD/Mf6RF8wDwYDVR0TAQH/BAUwAwEB/zANBgkqhkiG9w0BAQsFAAOCAQEA44jB
K6AOY7InoHKJkjJsXiJ0CtQ7mPi+YvhPF7RwT4owfl8Rq5lTmCdVYCDGNpD9/kL/
9XTR+Y16CDQXf5hjhwVkT7vOg/TMWhN/LA8aaWC154v0G+Vgm3yjjUJ2U5EITw/T
QhCTMvI0fGKcJXQMzb3KsqkxRfsH7vArgUKEc0tDqJuf0ppmPnHFu1SeFp+TUXy/
V8pWCpFIBQ8sn+DjVBbEC2SXJFDu9hzjDzfiCXKD9Ff8g0btNhV/JjFE19oQb147
FFR+SJL9LkzA3teH7a73rt+fNegU/AvKaPQSqmcsdeLq6pCxINkofpcDRmFWXtQc
rxXvfJC71E6eVEHM2A==
-----END CERTIFICATE-----
`;

            server = TendrilServer.createInstance(
                {
                    protocol: 'https',
                    https: { port: 8888, host: 'localhost', key, cert }
                },
                writeOk
            );

            await server.start();
            let res = await fetch('https://localhost:8888');
            expect(await res.text()).toEqual('ok');
        });
    });
});
