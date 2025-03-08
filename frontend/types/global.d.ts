/* eslint-disable no-var */
// global.d.ts
import { Mongoose } from 'mongoose'
import { EthereumProvider } from '@metamask/providers';

declare global {
  // Extend globalThis to include mongoose
  var mongoose: { conn: Mongoose | null; promise: Promise<Mongoose> | null };
}

export {}


declare global {
  interface Window {
    ethereum: EthereumProvider;
  }
}

export {};