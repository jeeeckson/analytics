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

const VALID_CURRENCIES: Record<string, string> = {
  'Mexico': 'MXN',
  'Colombia': 'COP',
  'Brazil': 'BRL'
};

const VALID_PAYMENT_METHODS: Record<string, Set<string>> = {
  'Mexico': new Set(['credit_card', 'debit_card']),
  'Colombia': new Set(['credit_card', 'debit_card', 'pse']),
  'Brazil': new Set(['credit_card', 'debit_card', 'pix', 'boleto'])
};

function main() {
  const dataPath = path.join(__dirname, '../data/transactions.json');

  let transactions: Transaction[];
  try {
    transactions = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    console.log('✓ JSON structure is valid');
  } catch (error) {
    console.error('✗ Invalid JSON structure:', error);
    return;
  }

  console.log(`✓ Total transactions: ${transactions.length}`);

  if (transactions.length !== 600) {
    console.warn(`⚠ Expected 600 transactions, found ${transactions.length}`);
  }

  const ids = new Set<string>();
  let duplicateIds = 0;
  transactions.forEach(t => {
    if (ids.has(t.id)) {
      duplicateIds++;
      console.error(`✗ Duplicate ID found: ${t.id}`);
    }
    ids.add(t.id);
  });

  if (duplicateIds === 0) {
    console.log('✓ All transaction IDs are unique');
  } else {
    console.error(`✗ Found ${duplicateIds} duplicate IDs`);
  }

  let invalidCombinations = 0;
  transactions.forEach((t, idx) => {
    const expectedCurrency = VALID_CURRENCIES[t.country];
    if (t.currency !== expectedCurrency) {
      console.error(`✗ Transaction ${idx + 1} (${t.id}): Invalid country-currency pair: ${t.country}-${t.currency}`);
      invalidCombinations++;
    }

    const validPaymentMethods = VALID_PAYMENT_METHODS[t.country];
    if (!validPaymentMethods || !validPaymentMethods.has(t.payment_method)) {
      console.error(`✗ Transaction ${idx + 1} (${t.id}): Invalid payment method ${t.payment_method} for ${t.country}`);
      invalidCombinations++;
    }
  });

  if (invalidCombinations === 0) {
    console.log('✓ All country-currency-payment method combinations are valid');
  } else {
    console.error(`✗ Found ${invalidCombinations} invalid combinations`);
  }

  let timestampIssues = 0;
  for (let i = 1; i < transactions.length; i++) {
    const prevTime = new Date(transactions[i - 1].timestamp).getTime();
    const currTime = new Date(transactions[i].timestamp).getTime();

    if (isNaN(prevTime) || isNaN(currTime)) {
      console.error(`✗ Invalid timestamp at position ${i} or ${i - 1}`);
      timestampIssues++;
    }
  }

  if (timestampIssues === 0) {
    console.log('✓ All timestamps are valid');
  } else {
    console.error(`✗ Found ${timestampIssues} timestamp issues`);
  }

  let declineCodeIssues = 0;
  transactions.forEach((t, idx) => {
    if (t.status === 'approved' && t.decline_code !== null) {
      console.error(`✗ Transaction ${idx + 1} (${t.id}): Approved transaction has decline_code: ${t.decline_code}`);
      declineCodeIssues++;
    }
    if (t.status === 'declined' && t.decline_code === null) {
      console.error(`✗ Transaction ${idx + 1} (${t.id}): Declined transaction missing decline_code`);
      declineCodeIssues++;
    }
  });

  if (declineCodeIssues === 0) {
    console.log('✓ All decline codes are correctly assigned');
  } else {
    console.error(`✗ Found ${declineCodeIssues} decline code issues`);
  }

  const approvedCount = transactions.filter(t => t.status === 'approved').length;
  const declinedCount = transactions.filter(t => t.status === 'declined').length;
  const approvalRate = (approvedCount / transactions.length * 100).toFixed(1);

  console.log(`\nSummary:`);
  console.log(`  Total transactions: ${transactions.length}`);
  console.log(`  Approved: ${approvedCount} (${approvalRate}%)`);
  console.log(`  Declined: ${declinedCount} (${(100 - parseFloat(approvalRate)).toFixed(1)}%)`);
  console.log(`  First timestamp: ${transactions[0].timestamp}`);
  console.log(`  Last timestamp: ${transactions[transactions.length - 1].timestamp}`);

  if (duplicateIds === 0 && invalidCombinations === 0 && timestampIssues === 0 && declineCodeIssues === 0) {
    console.log('\n✓ All validations passed!');
  } else {
    console.log('\n✗ Some validations failed. Please review the errors above.');
  }
}

main();
