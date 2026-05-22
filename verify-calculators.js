// Calculator Mathematical Verification Suite
// This script runs locally using Node.js to verify all calculator formulas.

const assert = (name, actual, expected, precision = 2) => {
  const diff = Math.abs(Number(actual) - Number(expected));
  const maxDiff = Math.pow(10, -precision);
  if (diff <= maxDiff) {
    console.log(`✅ [PASS] ${name}: Got ${Number(actual).toFixed(precision)} (Expected: ${Number(expected).toFixed(precision)})`);
    return true;
  } else {
    console.error(`❌ [FAIL] ${name}: Got ${actual} (Expected: ${expected})`);
    return false;
  }
};

const assertString = (name, actual, expected) => {
  if (actual === expected) {
    console.log(`✅ [PASS] ${name}: Got "${actual}" (Expected: "${expected}")`);
    return true;
  } else {
    console.error(`❌ [FAIL] ${name}: Got "${actual}" (Expected: "${expected}")`);
    return false;
  }
};

console.log("==================================================");
console.log("STARTING MATH CALCULATOR VERIFICATION TESTS");
console.log("==================================================\n");

let passedTests = 0;
let totalTests = 0;

const runTest = (name, testFn) => {
  totalTests++;
  try {
    const success = testFn();
    if (success) passedTests++;
  } catch (err) {
    console.error(`❌ [ERROR] ${name} threw an exception:`, err);
  }
};

// 1. EMI Calculator Test
runTest("EMI Calculator Formula", () => {
  const principal = 50000;
  const interestRate = 8.5;
  const N = 15 * 12; // 15 years in months
  const r = interestRate / 12 / 100;
  
  const emi = (principal * r * Math.pow(1 + r, N)) / (Math.pow(1 + r, N) - 1);
  const totalPayment = emi * N;
  const totalInterest = totalPayment - principal;

  let ok1 = assert("Monthly EMI", emi, 492.37, 2);
  let ok2 = assert("Total Payment", totalPayment, 88626.56, 2);
  let ok3 = assert("Total Interest", totalInterest, 38626.56, 2);
  return ok1 && ok2 && ok3;
});

// 2. Loan Calculator with Prepayments Test
runTest("Loan Prepayment Calculator Simulation", () => {
  const principal = 100000;
  const interestRate = 6.5;
  const N = 30 * 12; // 360 months
  const extraPayment = 100;
  
  const r = interestRate / 12 / 100;
  const emiCalc = (principal * r * Math.pow(1 + r, N)) / (Math.pow(1 + r, N) - 1);

  let balance = principal;
  let totalIntPaid = 0;
  let totalPaid = 0;
  let currentMonth = 0;

  while (balance > 0.01 && currentMonth < 600) {
    currentMonth++;
    const interestPaid = balance * r;
    let principalPaid = emiCalc - interestPaid;
    if (principalPaid > balance) principalPaid = balance;
    balance = Math.max(0, balance - principalPaid);
    
    if (balance > 0 && extraPayment > 0) {
      const actualExtra = Math.min(balance, extraPayment);
      balance = Math.max(0, balance - actualExtra);
      totalPaid += actualExtra;
    }
    totalIntPaid += interestPaid;
    totalPaid += principalPaid;
  }

  // Prepayment speeds up loan payoff.
  // Standard 360 months should shrink to 250 months.
  let ok1 = assert("Actual tenure with prepayments (months)", currentMonth, 250, 0);
  let ok2 = assert("Total Interest Paid", totalIntPaid, 82506.10, 0); // approx
  return ok1 && ok2;
});

// 3. SIP Calculator Test
runTest("SIP Future Value Accumulation", () => {
  const P = 500;
  const annualRate = 12;
  const n = 10 * 12; // 10 years (120 months)
  const i = annualRate / 12 / 100;

  const fv = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
  const invested = P * n;
  const returns = fv - invested;

  let ok1 = assert("Total Invested Amount", invested, 60000, 0);
  let ok2 = assert("Future Wealth Value", fv, 116169.54, 2);
  let ok3 = assert("Compound Returns Owed", returns, 56169.54, 2);
  return ok1 && ok2 && ok3;
});

// 4. GST Calculator Test
runTest("GST Add/Remove Tax Splits", () => {
  // Add GST Test
  const net1 = 1000;
  const rate = 18;
  const gstAdded = net1 * (rate / 100);
  const gross1 = net1 + gstAdded;

  let ok1 = assert("Add GST - Gross Amount", gross1, 1180, 2);
  let ok2 = assert("Add GST - Tax Amount", gstAdded, 180, 2);

  // Remove GST Test (gross input)
  const gross2 = 1180;
  const net2 = gross2 / (1 + rate / 100);
  const gstRemoved = gross2 - net2;

  let ok3 = assert("Remove GST - Net Amount", net2, 1000, 2);
  let ok4 = assert("Remove GST - Tax Extracted", gstRemoved, 180, 2);
  return ok1 && ok2 && ok3 && ok4;
});

// 5. Discount Calculator Test
runTest("Discount stacked rate and tax additions", () => {
  const original = 100;
  const disc1 = 20;
  const disc2 = 10;
  const tax = 8;

  const priceAfterDisc1 = original * (1 - disc1 / 100);
  const priceAfterDisc2 = priceAfterDisc1 * (1 - disc2 / 100);
  const calcTax = priceAfterDisc2 * (tax / 100);
  const finalPrice = priceAfterDisc2 + calcTax;
  const savings = original - priceAfterDisc2;

  let ok1 = assert("Price after first discount", priceAfterDisc1, 80, 2);
  let ok2 = assert("Price after stacked second discount", priceAfterDisc2, 72, 2);
  let ok3 = assert("Final Checkout Price", finalPrice, 77.76, 2);
  let ok4 = assert("Total savings", savings, 28, 2);
  return ok1 && ok2 && ok3 && ok4;
});

// 6. BMI Calculator Test
runTest("BMI Metric & Imperial Systems", () => {
  // Metric BMI Test
  const weightKg = 70;
  const heightCm = 175;
  const heightM = heightCm / 100;
  const bmiMetric = weightKg / (heightM * heightM);

  let ok1 = assert("BMI Metric Score", bmiMetric, 22.86, 2);

  // Imperial BMI Test
  const weightLbs = 154;
  const heightFt = 5;
  const heightIn = 9;
  const totalInches = heightFt * 12 + heightIn;
  const bmiImperial = (weightLbs * 703) / (totalInches * totalInches);

  let ok2 = assert("BMI Imperial Score", bmiImperial, 22.74, 2);
  return ok1 && ok2;
});

// 7. Age Calculator Test
runTest("Age breakdown years-months-days", () => {
  const dob = new Date("1995-05-15");
  const target = new Date("2026-05-22");

  let y = target.getFullYear() - dob.getFullYear();
  let m = target.getMonth() - dob.getMonth();
  let d = target.getDate() - dob.getDate();

  if (d < 0) {
    const prevMonth = new Date(target.getFullYear(), target.getMonth(), 0);
    d += prevMonth.getDate();
    m -= 1;
  }
  if (m < 0) {
    m += 12;
    y -= 1;
  }

  let ok1 = assert("Age Years", y, 31, 0);
  let ok2 = assert("Age Months", m, 0, 0);
  let ok3 = assert("Age Days", d, 7, 0);
  return ok1 && ok2 && ok3;
});

// 8. Scientific Calculator Test
runTest("Scientific Calculator Math Parser & Safety Checks", () => {
  const evaluateExpr = (expr, isRad = true) => {
    const factorial = (num) => {
      if (num < 0 || !Number.isInteger(num)) return NaN;
      if (num === 0 || num === 1) return 1;
      let val = 1;
      for (let i = 2; i <= num; i++) val *= i;
      return val;
    };
    
    let parsed = expr
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/π/g, "Math.PI")
      .replace(/e/g, "Math.E")
      .replace(/\^/g, "**")
      .replace(/sin\(/g, isRad ? "Math.sin(" : "Math.sin(Math.PI/180*")
      .replace(/cos\(/g, isRad ? "Math.cos(" : "Math.cos(Math.PI/180*")
      .replace(/tan\(/g, isRad ? "Math.tan(" : "Math.tan(Math.PI/180*")
      .replace(/log\(/g, "Math.log10(")
      .replace(/ln\(/g, "Math.log(")
      .replace(/sqrt\(/g, "Math.sqrt(")
      .replace(/fact\(/g, "factorial(");

    const openB = (parsed.match(/\(/g) || []).length;
    const closeB = (parsed.match(/\)/g) || []).length;
    for (let i = 0; i < openB - closeB; i++) parsed += ")";

    if (/\/0(?!\d|\.\d)/.test(parsed)) {
      return "Error: Divide by 0";
    }

    try {
      const evalFunc = new Function("factorial", `return (${parsed})`);
      return evalFunc(factorial);
    } catch (e) {
      return "Error";
    }
  };

  let ok1 = assert("Scientific - Trig RAD sin(π/6)", evaluateExpr("sin(π/6)", true), 0.5, 2);
  let ok2 = assert("Scientific - Trig DEG sin(30)", evaluateExpr("sin(30)", false), 0.5, 2);
  let ok3 = assert("Scientific - Log10 log(100)", evaluateExpr("log(100)"), 2, 0);
  let ok4 = assert("Scientific - Natural log ln(e)", evaluateExpr("ln(e)"), 1, 0);
  let ok5 = assert("Scientific - Power 2^3", evaluateExpr("2^3"), 8, 0);
  let ok6 = assert("Scientific - Factorial fact(5)", evaluateExpr("fact(5)"), 120, 0);
  let ok7 = assertString("Scientific - Div by Zero Protection 10/0", evaluateExpr("10/0"), "Error: Divide by 0");

  return ok1 && ok2 && ok3 && ok4 && ok5 && ok6 && ok7;
});

console.log("\n==================================================");
console.log(`VERIFICATION COMPLETE: ${passedTests} / ${totalTests} MODULES PASSED`);
console.log("==================================================");
process.exit(passedTests === totalTests ? 0 : 1);
