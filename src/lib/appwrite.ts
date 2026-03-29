import { Client, Databases, Account } from 'appwrite';
import config from './appwrite_config.json';

const client = new Client()
    .setEndpoint('https://sfo.cloud.appwrite.io/v1')
    .setProject('69c8758900283c9071bb');

export const databases = new Databases(client);
export const account = new Account(client);

export const APPWRITE_CONFIG = config;

// Helper to map Supabase-like queries to Appwrite
export const collections = config.collections;
export const databaseId = config.databaseId;
