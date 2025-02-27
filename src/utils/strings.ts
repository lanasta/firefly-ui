// Copyright © 2022 Kaleido, Inc.

import { IBlockchainCategory } from '../interfaces';

export const getShortHash = (hash: string): string => {
  return hash?.length >= 10 ? `${hash.slice(0, 5)}...${hash.slice(-5)}` : hash;
};

export const jsNumberForAddress = (address: string): number => {
  const addr = address.slice(2, 10);
  const seed = parseInt(addr, 16);
  return seed;
};

export const makeMultipleQueryParams = (
  map: { [key: string]: IBlockchainCategory },
  key: string,
  queryKey: string
) => {
  const str = Object.keys(map)
    .filter((k) => map[k]?.category === key)
    .toString();
  return `&${queryKey}=${str.replaceAll(',', `&${queryKey}=`)}`;
};

export const isValidUUID = (str: string | undefined | null): boolean => {
  return str
    ? /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi.test(
        str
      )
    : false;
};
