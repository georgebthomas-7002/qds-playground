import { useState } from 'react'
import './App.css'

// Constants
const TRANSACTIONS_PER_FTE = 2250
const DEFAULT_FTE_COST = 42000
const ANNUAL_TCR_COST = 12000
const MINIMUM_FTES = 3

function App() {
  const [transactions, setTransactions] = useState('')
  const [currentFTEs, setCurrentFTEs] = useState('')
  const [fteCost, setFteCost] = useState('')
  const [email, setEmail] = useState('')
  const [results, setResults] = useState(null)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  // Round down to nearest 0.5
  const roundDownToHalf = (num) => {
    return Math.floor(num * 2) / 2
  }

  const calculateROI = () => {
    const transactionsNum = parseFloat(transactions)
    const currentFTEsNum = parseFloat(currentFTEs)
    const fteCostNum = fteCost ? parseFloat(fteCost) : DEFAULT_FTE_COST

    if (!transactionsNum || !currentFTEsNum || transactionsNum <= 0 || currentFTEsNum <= 0) {
      return
    }

    // Step 1: Calculate Recommended FTEs
    let recommendedFTEs = transactionsNum / TRANSACTIONS_PER_FTE

    // Apply minimum FTE rule - no branch operates below 3 FTEs
    if (recommendedFTEs < MINIMUM_FTES) {
      recommendedFTEs = MINIMUM_FTES
    }

    // Step 2: Calculate FTE Save (round down to nearest 0.5)
    let fteSave = currentFTEsNum - recommendedFTEs
    fteSave = roundDownToHalf(fteSave)

    // Smart rule: If FTE save would bring them below minimum, adjust
    if (fteSave < 0) {
      fteSave = 0
    }

    // Step 3: Calculate Annual Savings
    const annualSavings = fteSave * fteCostNum

    // Step 4: Calculate Estimated Annual TCR ROI
    const estimatedROI = annualSavings - ANNUAL_TCR_COST

    // Determine if there's a cost savings scenario
    const noSavings = fteSave === 0 || estimatedROI <= 0
    const atMinimum = currentFTEsNum <= MINIMUM_FTES

    setResults({
      recommendedFTEs: Math.max(recommendedFTEs, MINIMUM_FTES).toFixed(2),
      fteSave: fteSave.toFixed(1),
      annualSavings: annualSavings,
      estimatedROI: estimatedROI,
      noSavings,
      atMinimum,
      inputData: {
        transactions: transactionsNum,
        currentFTEs: currentFTEsNum,
        fteCost: fteCostNum
      }
    })
  }

  const handleReset = () => {
    setTransactions('')
    setCurrentFTEs('')
    setFteCost('')
    setResults(null)
    setShowEmailForm(false)
    setEmailSent(false)
    setEmail('')
  }

  const handleEmailResults = () => {
    if (email && email.includes('@')) {
      setEmailSent(true)
      setTimeout(() => {
        setShowEmailForm(false)
      }, 2000)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  return (
    <div className="app">
      <div className="calculator-container">
        <header className="header">
          <div className="logo">
            <div className="logo-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <span>TCR ROI Calculator</span>
          </div>
          <p className="subtitle">Evaluate the financial impact of Teller Cash Recycler implementation for your branch</p>
        </header>

        <main className="main-content">
          <div className="input-section">
            <h2>Branch Details</h2>

            <div className="input-group">
              <label htmlFor="transactions">
                Monthly Transaction Volume
                <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <input
                  type="number"
                  id="transactions"
                  value={transactions}
                  onChange={(e) => setTransactions(e.target.value)}
                  placeholder="e.g., 15000"
                  min="0"
                />
                <span className="input-hint">Total transactions processed per month at this branch</span>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="currentFTEs">
                Current Staff (FTEs)
                <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <input
                  type="number"
                  id="currentFTEs"
                  value={currentFTEs}
                  onChange={(e) => setCurrentFTEs(e.target.value)}
                  placeholder="e.g., 5"
                  min="0"
                  step="0.5"
                />
                <span className="input-hint">Full-time equivalent employees currently at branch</span>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="fteCost">
                Annual Cost Per FTE
                <span className="optional">Optional</span>
              </label>
              <div className="input-wrapper has-prefix">
                <span className="input-prefix">$</span>
                <input
                  type="number"
                  id="fteCost"
                  value={fteCost}
                  onChange={(e) => setFteCost(e.target.value)}
                  placeholder="42,000"
                  min="0"
                />
                <span className="input-hint">Total compensation including salary and benefits. Defaults to $42,000 if not specified.</span>
              </div>
            </div>

            <div className="button-group">
              <button className="btn btn-primary" onClick={calculateROI}>
                Calculate ROI
              </button>
              <button className="btn btn-secondary" onClick={handleReset}>
                Clear
              </button>
            </div>
          </div>

          {results && (
            <div className="results-section">
              <h2>Analysis Results</h2>

              {results.noSavings ? (
                <div className="no-savings-card">
                  <div className="no-savings-icon">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 8v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <circle cx="12" cy="16" r="1" fill="currentColor"/>
                    </svg>
                  </div>
                  <h3>Limited Direct Savings Identified</h3>
                  {results.atMinimum ? (
                    <p>
                      Your branch is currently operating at or near the minimum staffing requirement of {MINIMUM_FTES} FTEs.
                      While TCR implementation provides significant operational efficiencies, direct labor cost reductions would be limited in this configuration.
                    </p>
                  ) : (
                    <p>
                      Based on your current transaction volume, optimal staffing would fall below the minimum {MINIMUM_FTES} FTE requirement for branch operations.
                      TCR implementation may still deliver value through improved efficiency and customer experience.
                    </p>
                  )}
                  <div className="info-box">
                    <strong>Note:</strong> Branches require a minimum of {MINIMUM_FTES} FTEs for full operational capability, with limited exceptions.
                  </div>
                </div>
              ) : (
                <>
                  <div className="results-grid">
                    <div className="result-card">
                      <div className="result-label">Optimal Staffing</div>
                      <div className="result-value">{results.recommendedFTEs}</div>
                      <div className="result-sublabel">FTEs for {formatNumber(results.inputData.transactions)} transactions/mo</div>
                    </div>

                    <div className="result-card">
                      <div className="result-label">Staff Reduction</div>
                      <div className="result-value highlight">{results.fteSave}</div>
                      <div className="result-sublabel">Full-time equivalent positions</div>
                    </div>

                    <div className="result-card">
                      <div className="result-label">Annual Labor Savings</div>
                      <div className="result-value">{formatCurrency(results.annualSavings)}</div>
                      <div className="result-sublabel">At {formatCurrency(results.inputData.fteCost)} per FTE</div>
                    </div>

                    <div className="result-card featured">
                      <div className="result-label">Estimated Annual ROI</div>
                      <div className="result-value large">{formatCurrency(results.estimatedROI)}</div>
                      <div className="result-sublabel">Net savings after {formatCurrency(ANNUAL_TCR_COST)} TCR cost</div>
                    </div>
                  </div>

                  <div className="calculation-breakdown">
                    <h3>Calculation Summary</h3>
                    <ul>
                      <li>
                        <span>Transaction Capacity Analysis</span>
                        <span>{formatNumber(results.inputData.transactions)} ÷ {formatNumber(TRANSACTIONS_PER_FTE)} = {results.recommendedFTEs} FTEs</span>
                      </li>
                      <li>
                        <span>Staffing Optimization</span>
                        <span>{results.inputData.currentFTEs} − {results.recommendedFTEs} = {results.fteSave} FTE reduction</span>
                      </li>
                      <li>
                        <span>Labor Cost Reduction</span>
                        <span>{results.fteSave} × {formatCurrency(results.inputData.fteCost)} = {formatCurrency(results.annualSavings)}</span>
                      </li>
                      <li>
                        <span>Net Annual Return</span>
                        <span>{formatCurrency(results.annualSavings)} − {formatCurrency(ANNUAL_TCR_COST)} = {formatCurrency(results.estimatedROI)}</span>
                      </li>
                    </ul>
                  </div>
                </>
              )}

              <div className="email-section">
                {!showEmailForm ? (
                  <button className="btn btn-outline" onClick={() => setShowEmailForm(true)}>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="18" height="18">
                      <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
                      <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Email Results
                  </button>
                ) : emailSent ? (
                  <div className="email-success">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Results sent to {email}
                  </div>
                ) : (
                  <div className="email-form">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email address"
                    />
                    <button className="btn btn-primary" onClick={handleEmailResults}>
                      Send
                    </button>
                    <button className="btn btn-text" onClick={() => setShowEmailForm(false)}>
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        <footer className="footer">
          <div className="assumptions">
            <h4>Model Assumptions</h4>
            <ul>
              <li>FTE capacity: {formatNumber(TRANSACTIONS_PER_FTE)} transactions/month</li>
              <li>Default FTE cost: {formatCurrency(DEFAULT_FTE_COST)}/year</li>
              <li>Annual TCR cost: {formatCurrency(ANNUAL_TCR_COST)}</li>
              <li>Minimum staffing: {MINIMUM_FTES} FTEs</li>
            </ul>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default App
