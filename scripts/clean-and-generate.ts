import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  country: string;
  payment_method: string;
  processor: string;
  status: string;
  decline_code: string | null;
  timestamp: string;
}

const COUNTRIES = ['Mexico', 'Colombia', 'Brazil'] as const;
const CURRENCIES: Record<string, string> = {
  'Mexico': 'MXN',
  'Colombia': 'COP',
  'Brazil': 'BRL'
};

const PAYMENT_METHODS: Record<string, string[]> = {
  'Mexico': ['credit_card', 'debit_card'],
  'Colombia': ['credit_card', 'debit_card', 'pse'],
  'Brazil': ['credit_card', 'debit_card', 'pix', 'boleto']
};

const PROCESSORS = ['PagosRapid', 'AcquireLocal', 'BrasilPay'] as const;
const DECLINE_CODES = [
  'invalid_card_number',
  'insufficient_funds',
  'card_expired',
  'suspected_fraud',
  'do_not_honor',
  'transaction_not_permitted',
  'processing_error',
  'lost_stolen_card'
] as const;

function generateTransactionId(existingIds: Set<string>): string {
  let id: string;
  let attempts = 0;
  const maxAttempts = 10000;

  do {
    const randomBytes = crypto.randomBytes(16);
    let idSuffix = '';

    for (let i = 0; i < 16; i++) {
      const byte = randomBytes[i];
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
      idSuffix += chars[byte % chars.length];
    }

    id = 'txn_' + idSuffix;
    attempts++;

    if (attempts >= maxAttempts) {
      throw new Error(`Failed to generate unique ID after ${maxAttempts} attempts`);
    }
  } while (existingIds.has(id));

  existingIds.add(id);
  return id;
}

function randomChoice<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateAmount(): number {
  const ranges = [
    { min: 89, max: 1000, weight: 0.4 },
    { min: 1000, max: 10000, weight: 0.35 },
    { min: 10000, max: 100000, weight: 0.15 },
    { min: 100000, max: 1234567, weight: 0.1 }
  ];

  const rand = Math.random();
  let cumulative = 0;

  for (const range of ranges) {
    cumulative += range.weight;
    if (rand <= cumulative) {
      const amount = Math.random() * (range.max - range.min) + range.min;
      return Math.round(amount * 100) / 100;
    }
  }

  return Math.round((Math.random() * 911 + 89) * 100) / 100;
}

function generateTransaction(existingIds: Set<string>, baseTimestamp: Date): Transaction {
  const id = generateTransactionId(existingIds);

  const country = randomChoice(COUNTRIES);
  const currency = CURRENCIES[country];
  const payment_method = randomChoice(PAYMENT_METHODS[country]);
  const processor = randomChoice(PROCESSORS);
  const isApproved = Math.random() < 0.72;
  const status = isApproved ? 'approved' : 'declined';
  const decline_code = isApproved ? null : randomChoice(DECLINE_CODES);
  const amount = generateAmount();

  const timestamp = new Date(baseTimestamp);
  timestamp.setMinutes(timestamp.getMinutes() + Math.floor(Math.random() * 30));
  timestamp.setSeconds(Math.floor(Math.random() * 60));

  return {
    id,
    amount,
    currency,
    country,
    payment_method,
    processor,
    status,
    decline_code,
    timestamp: timestamp.toISOString()
  };
}

function main() {
  const dataPath = path.join(__dirname, '../data/transactions.json');

  const allData = JSON.parse(fs.readFileSync(dataPath, 'utf-8')) as Transaction[];
  console.log(`Loaded ${allData.length} total transactions`);

  const seenIds = new Set<string>();
  const uniqueOriginalTransactions: Transaction[] = [];

  for (const transaction of allData) {
    if (!seenIds.has(transaction.id)) {
      uniqueOriginalTransactions.push(transaction);
      seenIds.add(transaction.id);
    }
  }

  console.log(`Found ${uniqueOriginalTransactions.length} unique original transactions (removed ${allData.length - uniqueOriginalTransactions.length} duplicates)`);

  let originalTransactions: Transaction[];
  if (uniqueOriginalTransactions.length >= 300) {
    originalTransactions = uniqueOriginalTransactions.slice(0, 300);
    console.log(`Using first 300 unique transactions as original data`);
  } else {
    originalTransactions = uniqueOriginalTransactions;
    console.log(`Using all ${uniqueOriginalTransactions.length} unique transactions as original data`);
  }

  const existingIds = new Set(originalTransactions.map(t => t.id));
  console.log(`Starting with ${existingIds.size} existing IDs`);

  const lastTransaction = originalTransactions[originalTransactions.length - 1];
  let baseTimestamp = new Date(lastTransaction.timestamp);
  baseTimestamp.setHours(baseTimestamp.getHours() + 1);

  const newCount = 600 - originalTransactions.length;
  const newTransactions: Transaction[] = [];

  console.log(`Generating ${newCount} new transactions with unique IDs...`);
  for (let i = 0; i < newCount; i++) {
    const transaction = generateTransaction(existingIds, baseTimestamp);
    newTransactions.push(transaction);
    baseTimestamp = new Date(transaction.timestamp);
    baseTimestamp.setMinutes(baseTimestamp.getMinutes() + Math.floor(Math.random() * 15) + 5);

    if ((i + 1) % 50 === 0) {
      console.log(`Generated ${i + 1}/${newCount} transactions...`);
    }
  }

  console.log(`Generated ${newTransactions.length} new unique transactions`);

  const allTransactions = [...originalTransactions, ...newTransactions];

  const allIds = new Set<string>();
  let duplicates = 0;
  allTransactions.forEach(t => {
    if (allIds.has(t.id)) {
      duplicates++;
      console.error(`Duplicate ID: ${t.id}`);
    }
    allIds.add(t.id);
  });

  if (duplicates > 0) {
    console.error(`ERROR: Still found ${duplicates} duplicate IDs!`);
    return;
  }

  console.log(`\nVerification: ${allTransactions.length} total transactions, ${allIds.size} unique IDs`);

  fs.writeFileSync(dataPath, JSON.stringify(allTransactions, null, 2));
  console.log(`Successfully wrote ${allTransactions.length} transactions to ${dataPath}`);

  const approvedCount = allTransactions.filter(t => t.status === 'approved').length;
  const declinedCount = allTransactions.filter(t => t.status === 'declined').length;
  console.log(`\nTotal transactions breakdown:`);
  console.log(`  Approved: ${approvedCount} (${(approvedCount / allTransactions.length * 100).toFixed(1)}%)`);
  console.log(`  Declined: ${declinedCount} (${(declinedCount / allTransactions.length * 100).toFixed(1)}%)`);
}

main();
