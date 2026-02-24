import * as fs from 'fs';
import * as path from 'path';

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

function generateTransactionId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = 'txn_';
  for (let i = 0; i < 16; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
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
  let id = generateTransactionId();
  while (existingIds.has(id)) {
    id = generateTransactionId();
  }
  existingIds.add(id);

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

  const existingData = JSON.parse(fs.readFileSync(dataPath, 'utf-8')) as Transaction[];
  console.log(`Loaded ${existingData.length} existing transactions`);

  const existingIds = new Set(existingData.map(t => t.id));

  const lastTransaction = existingData[existingData.length - 1];
  let baseTimestamp = new Date(lastTransaction.timestamp);
  baseTimestamp.setHours(baseTimestamp.getHours() + 1);

  const newTransactions: Transaction[] = [];

  for (let i = 0; i < 300; i++) {
    const transaction = generateTransaction(existingIds, baseTimestamp);
    newTransactions.push(transaction);
    baseTimestamp = new Date(transaction.timestamp);
    baseTimestamp.setMinutes(baseTimestamp.getMinutes() + Math.floor(Math.random() * 15) + 5);

    if (i % 50 === 0) {
      console.log(`Generated ${i + 1}/300 transactions...`);
    }
  }

  console.log(`Generated ${newTransactions.length} new transactions`);

  const allTransactions = [...existingData, ...newTransactions];

  fs.writeFileSync(dataPath, JSON.stringify(allTransactions, null, 2));
  console.log(`Successfully wrote ${allTransactions.length} transactions to ${dataPath}`);

  const approvedCount = newTransactions.filter(t => t.status === 'approved').length;
  const declinedCount = newTransactions.filter(t => t.status === 'declined').length;
  console.log(`\nNew transactions breakdown:`);
  console.log(`  Approved: ${approvedCount} (${(approvedCount / 300 * 100).toFixed(1)}%)`);
  console.log(`  Declined: ${declinedCount} (${(declinedCount / 300 * 100).toFixed(1)}%)`);
}

main();
