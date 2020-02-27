const request = require('request');
const logger = createLogger('jwksCert')

import { createLogger } from "../../utils/logger";

// based on https://auth0.com/blog/navigating-rs256-and-jwks/

export async function getJwks( uri: string): Promise<string> {
  return new Promise( async (resolve, reject) => {
    request({
      uri,
      strictSsl: true,
      json: true
    }, (err, res) => {
      if (err || res.statusCode < 200 || res.statusCode >= 300) {
        if (err) {
            reject(`Get jwks return error: ${err}`);
            return
        }     
        if (res) {
          reject(`Get jwks return status code ${res.statusCode}`);
          return
        }
      }
      
      var keys = res.body.keys;
      
      if (!keys || !keys.length) {
        reject('Get jwks: The JWKS endpoint did not contain any keys')
        return
      }
      
      keys.filter(key => key.use === 'sig' // JWK property `use` determines the JWK is for signing
        && key.kty === 'RSA' // We are only supporting RSA (RS256)
        && key.kid           // The `kid` must be present to be useful for later
        && ((key.x5c && key.x5c.length) || (key.n && key.e)) // Has useful public keys
      ).map(key => {
        var cert = { kid: key.kid, nbf: key.nbf, publicKey: certToPEM(key.x5c[0]) };

        logger.info('Get jwks: Got public key = ');
        logger.info( cert.publicKey );

        resolve( cert.publicKey );
      });
    });
  });
}

function certToPEM(cert) {
    cert = cert.match(/.{1,64}/g).join('\n');
    cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`;
    return cert;
}
