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
      // Simulate sending email
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
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span>TCR ROI Calculator</span>
          </div>
          <p className="subtitle">Calculate your potential savings with Teller Cash Recycler implementation</p>
        </header>

        <main className="main-content">
          <div className="input-section">
            <h2>Branch Information</h2>

            <div className="input-group">
              <label htmlFor="transactions">
                Total Transactions Per Month
                <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <input
                  type="number"
                  id="transactions"
                  value={transactions}
                  onChange={(e) => setTransactions(e.target.value)}
                  placeholder="Enter monthly transactions"
                  min="0"
                />
                <span className="input-hint">Average monthly transaction volume for branch</span>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="currentFTEs">
                Current FTEs
                <span className="required">*</span>
              </label>
              <div className="input-wrapper">
                <input
                  type="number"
                  id="currentFTEs"
                  value={currentFTEs}
                  onChange={(e) => setCurrentFTEs(e.target.value)}
                  placeholder="Enter current FTE count"
                  min="0"
                  step="0.5"
                />
                <span className="input-hint">Full-time equivalent employees at branch</span>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="fteCost">
                Total Cost Per FTE
                <span className="optional">(Optional)</span>
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
                <span className="input-hint">Salary + benefits total. Default: $42,000</span>
              </div>
            </div>

            <div className="button-group">
              <button className="btn btn-primary" onClick={calculateROI}>
                Calculate ROI
              </button>
              <button className="btn btn-secondary" onClick={handleReset}>
                Reset
              </button>
            </div>
          </div>

          {results && (
            <div className="results-section">
              <h2>Your Results</h2>

              {results.noSavings ? (
                <div className="no-savings-card">
                  <div className="no-savings-icon">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <circle cx="12" cy="16" r="1" fill="currentColor"/>
                    </svg>
                  </div>
                  <h3>Limited Cost Savings Available</h3>
                  {results.atMinimum ? (
                    <p>
                      Your branch is currently operating at or near the minimum of {MINIMUM_FTES} FTEs required for operations.
                      While TCR implementation offers operational benefits, direct labor cost savings would be limited in this scenario.
                    </p>
                  ) : (
                    <p>
                      Based on your transaction volume, the recommended staffing level would bring your branch
                      below the minimum {MINIMUM_FTES} FTEs required for operations. TCR implementation may still
                      offer operational efficiencies and improved customer service.
                    </p>
                  )}
                  <div className="info-box">
                    <strong>Note:</strong> A minimum of {MINIMUM_FTES} FTEs is required for branch operations, with very few exceptions.
                  </div>
                </div>
              ) : (
                <>
                  <div className="results-grid">
                    <div className="result-card">
                      <div className="result-label">Recommended FTEs</div>
                      <div className="result-value">{results.recommendedFTEs}</div>
                      <div className="result-sublabel">Based on {formatNumber(results.inputData.transactions)} transactions/month</div>
                    </div>

                    <div className="result-card">
                      <div className="result-label">FTE Reduction</div>
                      <div className="result-value highlight">{results.fteSave}</div>
                      <div className="result-sublabel">Full-time equivalents saved</div>
                    </div>

                    <div className="result-card">
                      <div className="result-label">Annual Labor Savings</div>
                      <div className="result-value">{formatCurrency(results.annualSavings)}</div>
                      <div className="result-sublabel">At {formatCurrency(results.inputData.fteCost)} per FTE</div>
                    </div>

                    <div className="result-card featured">
                      <div className="result-label">Estimated Annual TCR ROI</div>
                      <div className="result-value large">{formatCurrency(results.estimatedROI)}</div>
                      <div className="result-sublabel">After {formatCurrency(ANNUAL_TCR_COST)} annual TCR cost</div>
                    </div>
                  </div>

                  <div className="calculation-breakdown">
                    <h3>Calculation Breakdown</h3>
                    <ul>
                      <li>
                        <span>Transactions / Capacity per FTE:</span>
                        <span>{formatNumber(results.inputData.transactions)} / {formatNumber(TRANSACTIONS_PER_FTE)} = {results.recommendedFTEs} recommended FTEs</span>
                      </li>
                      <li>
                        <span>Current FTEs - Recommended:</span>
                        <span>{results.inputData.currentFTEs} - {results.recommendedFTEs} = {results.fteSave} FTE reduction</span>
                      </li>
                      <li>
                        <span>FTE Reduction x Cost per FTE:</span>
                        <span>{results.fteSave} x {formatCurrency(results.inputData.fteCost)} = {formatCurrency(results.annualSavings)}</span>
                      </li>
                      <li>
                        <span>Annual Savings - TCR Cost:</span>
                        <span>{formatCurrency(results.annualSavings)} - {formatCurrency(ANNUAL_TCR_COST)} = {formatCurrency(results.estimatedROI)}</span>
                      </li>
                    </ul>
                  </div>
                </>
              )}

              <div className="email-section">
                {!showEmailForm ? (
                  <button className="btn btn-outline" onClick={() => setShowEmailForm(true)}>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                      <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Email My Results
                  </button>
                ) : emailSent ? (
                  <div className="email-success">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                      <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Results sent to {email}!
                  </div>
                ) : (
                  <div className="email-form">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                    />
                    <button className="btn btn-primary" onClick={handleEmailResults}>
                      Send Results
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
            <h4>Calculation Assumptions</h4>
            <ul>
              <li>Single FTE capacity: {formatNumber(TRANSACTIONS_PER_FTE)} transactions/month</li>
              <li>Default FTE cost: {formatCurrency(DEFAULT_FTE_COST)}/year</li>
              <li>Annual TCR cost: {formatCurrency(ANNUAL_TCR_COST)}</li>
              <li>Minimum branch staffing: {MINIMUM_FTES} FTEs</li>
            </ul>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default App
