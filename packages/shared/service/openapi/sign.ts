import { createHash } from 'crypto';

const sortParams = (params: Record<string, any>) => {
   const sortedKeys = Object.keys(params).sort();
   const sortedParams: string[] = [];
   for (const key of sortedKeys) {
      sortedParams.push(`${key}=${params[key]}`);
   }
   return sortedParams.join('&');
};

const sign = (signStr: string) => {
   const hash = createHash('sha256');
   hash.update(signStr);
   return hash.digest('hex');
};

export type GenerateOpenApiSignOptions = {
   path: string;
   params: Record<string, any>;
   timestamp: string | number;
   secret: string;
};

export const generateOpenApiSign = (options: GenerateOpenApiSignOptions) => {
   const { path, params, timestamp, secret } = options;

   const sortedParamString = sortParams(params);

   const signStr = `${path}?${sortedParamString}${timestamp}${secret}`;

   const signature = sign(signStr);

   return signature;
};

export type VerifyOpenApiSignOptions = {
   path: string;
   params: Record<string, any>;
   timestamp: string | number;
   secret: string;
   signature: string;
};

export const verifyOpenApiSign = (options: VerifyOpenApiSignOptions) => {
   const { path, params, timestamp, secret, signature } = options;

   const expectedSignature = generateOpenApiSign({
      path,
      params,
      timestamp,
      secret,
   });
   return expectedSignature === signature;
};
