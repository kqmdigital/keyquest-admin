// ===================================
// PDF REPORT GENERATION FUNCTIONS
// ===================================

function generateProfessionalReport() {
    if (!currentResults.length) {
        showNotification('No results to generate report. Please search for packages first.', 'error');
        return;
    }

    // Debug: Check searchCriteria content
    console.log('🔍 searchCriteria in generateProfessionalReport:', searchCriteria);
    console.log('💰 Loan Amount:', searchCriteria.loanAmount);
    console.log('📅 Loan Tenure:', searchCriteria.loanTenure);
    console.log('🏠 Loan Type:', searchCriteria.loanType);
    console.log('📊 Existing Rate:', searchCriteria.existingInterestRate);

    // Safeguard: If searchCriteria is empty or missing data, rebuild it from form
    if (!searchCriteria || Object.keys(searchCriteria).length === 0 || !searchCriteria.loanAmount || !searchCriteria.loanTenure) {
        console.warn('⚠️ searchCriteria missing data, rebuilding from form...');
        searchCriteria = {
            ...searchCriteria,
            loanAmount: parseFloat(document.getElementById('loanAmount').value) || 0,
            loanTenure: parseInt(document.getElementById('loanTenure').value) || 25,
            propertyType: document.getElementById('propertyType').value,
            propertyStatus: document.getElementById('propertyStatus').value,
            loanType: currentLoanType || 'New Home Loan',
            existingInterestRate: parseFloat(document.getElementById('existingInterestRate').value) || 0
        };
        console.log('🔧 Rebuilt searchCriteria:', searchCriteria);
    }
    
    // Ensure existingInterestRate is always captured for refinancing
    if (!searchCriteria.existingInterestRate && searchCriteria.loanType === 'Refinancing Home Loan') {
        searchCriteria.existingInterestRate = parseFloat(document.getElementById('existingInterestRate').value) || 0;
        console.log('🔄 Added missing existingInterestRate:', searchCriteria.existingInterestRate);
    }

    // Get report options
    const clientName = document.getElementById('clientName').value.trim();
    const hideBankNames = document.getElementById('hideBankNames').checked;

    // Get selected packages or default to top 3
    let selectedPackages = currentResults.filter(pkg => pkg.selected !== false);
    if (selectedPackages.length === 0) {
        selectedPackages = currentResults.slice(0, 3);
    } else {
        selectedPackages = selectedPackages.slice(0, 3); // Limit to top 3
    }
    
    // Debug: Check selected packages
    console.log('📦 Selected Packages:', selectedPackages.map(pkg => ({
        bank: pkg.bank_name,
        totalSavings: pkg.totalSavings,
        lockPeriod: pkg.lock_period
    })));

    // Recalculate savings for PDF generation if refinancing
    if (searchCriteria.loanType === 'Refinancing Home Loan' && searchCriteria.existingInterestRate > 0) {
        selectedPackages = selectedPackages.map(pkg => {
            const avgFirst2Years = pkg.avgFirst2Years || calculateAverageFirst2Years(pkg);
            const monthlySavings = calculateMonthlySavings(
                searchCriteria.loanAmount, 
                searchCriteria.loanTenure, 
                searchCriteria.existingInterestRate, 
                avgFirst2Years
            );
            const totalSavings = calculateTotalSavings(monthlySavings, pkg.lock_period);
            
            console.log(`💰 Recalculated savings for ${pkg.bank_name}:`, {
                monthlySavings,
                totalSavings,
                lockPeriod: pkg.lock_period,
                avgRate: avgFirst2Years,
                existingRate: searchCriteria.existingInterestRate
            });
            
            return {
                ...pkg,
                totalSavings,
                monthlySavings
            };
        });
    }

    if (selectedPackages.length === 0) {
        showNotification('Please select at least one package for the report.', 'error');
        return;
    }

    console.log('📄 Generating professional report for', selectedPackages.length, 'packages');

    const reportDate = new Date().toLocaleDateString('en-SG', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    // FIXED: Always show all 5 years + thereafter (remove duplicate declaration)
    const yearsToShow = [1, 2, 3, 4, 5];
    const hasThereafterData = true; // Always show thereafter row

    const reportContent = `
        <div class="pdf-report-container">
            <!-- Professional Header -->
            <div class="pdf-header">
                <div class="logo-section">
                    <img src="https://ik.imagekit.io/hst9jooux/KEYQUEST%20LOGO%20(Black%20Text%20Horizontal).png?updatedAt=1753262438682" 
                         alt="KeyQuest Mortgage Logo" 
                         onerror="this.style.display='none';" />
                </div>
                <div class="title-section">
                    <h1>Mortgage Package Analysis</h1>
                    ${clientName ? `<div class="client-name">Prepared for: ${clientName}</div>` : ''}
                </div>
            </div>

            <!-- Key Information Cards -->
            <div class="pdf-key-info">
                <div class="pdf-info-grid">
                    <div class="pdf-info-item">
                        <div class="pdf-info-icon">💰</div>
                        <div class="pdf-info-label">Loan Amount</div>
                        <div class="pdf-info-value">${formatCurrency(searchCriteria.loanAmount || 0)}</div>
                    </div>
                    <div class="pdf-info-item">
                        <div class="pdf-info-icon">📅</div>
                        <div class="pdf-info-label">Loan Tenure</div>
                        <div class="pdf-info-value">${searchCriteria.loanTenure || 'N/A'} Years</div>
                    </div>
                    <div class="pdf-info-item">
                        <div class="pdf-info-icon">🏠</div>
                        <div class="pdf-info-label">Property Type</div>
                        <div class="pdf-info-value property-type">${searchCriteria.propertyType || 'Private Property'}</div>
                    </div>
                    <div class="pdf-info-item">
                        <div class="pdf-info-icon">📋</div>
                        <div class="pdf-info-label">Property Status</div>
                        <div class="pdf-info-value property-status">${searchCriteria.propertyStatus || 'Completed'}</div>
                    </div>
                    ${searchCriteria.loanType === 'Refinancing Home Loan' && searchCriteria.existingInterestRate ? `
                    <div class="pdf-info-item">
                        <div class="pdf-info-icon">📊</div>
                        <div class="pdf-info-label">Current Rate</div>
                        <div class="pdf-info-value current-rate">${parseFloat(searchCriteria.existingInterestRate).toFixed(2)}%</div>
                    </div>
                    ` : `
                    <div class="pdf-info-item">
                        <div class="pdf-info-icon">⭐</div>
                        <div class="pdf-info-label">Best Rate</div>
                        <div class="pdf-info-value best-rate">${selectedPackages[0]?.avgFirst2Years?.toFixed(2) || 'N/A'}%</div>
                    </div>
                    `}
                </div>
            </div>


            <!-- Package Comparison Table -->
            <div class="pdf-comparison-section">
                <div class="pdf-comparison-title">Package Comparison</div>
                
                <table class="pdf-comparison-table">
                    <thead>
                        <tr>
                            <th>Details</th>
                            ${selectedPackages.map((pkg, index) => `
                                <th class="${index === 0 ? 'recommended' : ''}">
                                    ${hideBankNames ? `PKG(${index + 1})` : pkg.bank_name}
                                </th>
                            `).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Rate Type</td>
                            ${selectedPackages.map((pkg, index) => `
                                <td class="${index === 0 ? 'recommended' : ''}">
                                    ${pkg.rate_type_category || 'Rate Package'}
                                </td>
                            `).join('')}
                        </tr>
                        <tr>
                            <td>Min Loan Amount</td>
                            ${selectedPackages.map((pkg, index) => `
                                <td class="${index === 0 ? 'recommended amount' : 'amount'}">
                                    ${formatCurrency(pkg.minimum_loan_size || 0)}
                                </td>
                            `).join('')}
                        </tr>
                        
                        ${yearsToShow.map((year, yearIndex) => `
                            <tr>
                                <td>Year ${year}</td>
                                ${selectedPackages.map((pkg, index) => {
                                    const rateDisplay = formatRateDisplay(pkg, year);
                                    return `
                                    <td class="${index === 0 ? 'recommended rate-value' : 'rate-value'}">
                                        ${rateDisplay}
                                    </td>
                                `;
                                }).join('')}
                            </tr>
                        `).join('')}
                        
                        <tr>
                            <td>Thereafter</td>
                            ${selectedPackages.map((pkg, index) => {
                                const rateDisplay = formatRateDisplay(pkg, 'thereafter');
                                return `
                                <td class="${index === 0 ? 'recommended rate-value' : 'rate-value'}">
                                    ${rateDisplay}
                                </td>
                            `;
                            }).join('')}
                        </tr>
                        
                        <tr>
                            <td>Lock-in Period</td>
                            ${selectedPackages.map((pkg, index) => `
                                <td class="${index === 0 ? 'recommended period' : 'period'}">
                                    ${parseLockInPeriod(pkg.lock_period) || 0} Years
                                </td>
                            `).join('')}
                        </tr>
                        
                        
                        ${searchCriteria.loanType === 'Refinancing Home Loan' && searchCriteria.existingInterestRate ? `
                        <tr>
                            <td>Monthly Installment</td>
                            ${selectedPackages.map((pkg, index) => `
                                <td class="${index === 0 ? 'recommended' : ''}">
                                    ${formatCurrency(pkg.monthlyInstallment || 0)}
                                </td>
                            `).join('')}
                        </tr>
                        <tr>
                            <td>Total Savings</td>
                            ${selectedPackages.map((pkg, index) => `
                                <td class="${index === 0 ? 'recommended savings-cell' : 'savings-cell'}">
                                    ${formatSavings(pkg.totalSavings || 0, pkg.lock_period)}
                                </td>
                            `).join('')}
                        </tr>
                        ` : `
                        <tr>
                            <td>Monthly Installment</td>
                            ${selectedPackages.map((pkg, index) => `
                                <td class="${index === 0 ? 'recommended' : ''}">
                                    ${formatCurrency(pkg.monthlyInstallment || 0)}
                                </td>
                            `).join('')}
                        </tr>
                        `}
                        
                        <tr>
                            <td>Package Features</td>
                            ${selectedPackages.map((pkg, index) => `
                                <td class="${index === 0 ? 'recommended features-cell' : 'features-cell'}">
                                    ${pkg.legal_fee_subsidy === 'true' || pkg.legal_fee_subsidy === true ? 
                                        '<div style="color: #2563eb; margin-bottom: 3px;">✓ Legal Fee Subsidy</div>' : ''}
                                    ${pkg.cash_rebate === 'true' || pkg.cash_rebate === true ? 
                                        '<div style="color: #2563eb; margin-bottom: 3px;">✓ Cash Rebate</div>' : ''}
                                    ${pkg.free_package_conversion_12m === 'true' || pkg.free_package_conversion_12m === true ? 
                                        '<div style="color: #2563eb; margin-bottom: 3px;">✓ Free Conversion (12M)</div>' : ''}
                                    ${pkg.free_package_conversion_24m === 'true' || pkg.free_package_conversion_24m === true ? 
                                        '<div style="color: #2563eb; margin-bottom: 3px;">✓ Free Conversion (24M)</div>' : ''}
                                    ${pkg.valuation_subsidy === 'true' || pkg.valuation_subsidy === true ? 
                                        '<div style="color: #2563eb; margin-bottom: 3px;">✓ Valuation Subsidy</div>' : ''}
                                    ${pkg.partial_repayment === 'true' || pkg.partial_repayment === true ? 
                                        '<div style="color: #2563eb; margin-bottom: 3px;">✓ Partial Repayment</div>' : ''}
                                    ${pkg.waiver_due_to_sales === 'true' || pkg.waiver_due_to_sales === true ? 
                                        '<div style="color: #2563eb; margin-bottom: 3px;">✓ Waiver Due to Sales</div>' : ''}
                                    ${(!pkg.legal_fee_subsidy || pkg.legal_fee_subsidy === 'false') && 
                                      (!pkg.cash_rebate || pkg.cash_rebate === 'false') && 
                                      (!pkg.free_package_conversion_12m || pkg.free_package_conversion_12m === 'false') &&
                                      (!pkg.free_package_conversion_24m || pkg.free_package_conversion_24m === 'false') &&
                                      (!pkg.valuation_subsidy || pkg.valuation_subsidy === 'false') &&
                                      (!pkg.partial_repayment || pkg.partial_repayment === 'false') &&
                                      (!pkg.waiver_due_to_sales || pkg.waiver_due_to_sales === 'false') ? 
                                        '<div style="color: #6b7280;">Not Specified</div>' : ''}
                                </td>
                            `).join('')}
                        </tr>
                        
                        <tr>
                            <td>Remarks</td>
                            ${selectedPackages.map((pkg, index) => `
                                <td class="${index === 0 ? 'recommended features-cell' : 'features-cell'}">
                                    ${(pkg.custom_remarks || pkg.remarks || 'All packages are structured with fixed rates followed by floating rates based on 3M SORA.').replace(/\n/g, '<br>').substring(0, 200)}${(pkg.custom_remarks || pkg.remarks || '').length > 200 ? '...' : ''}
                                </td>
                            `).join('')}
                        </tr>
                    </tbody>
                </table>
            </div>

            ${searchCriteria.loanType === 'Refinancing Home Loan' && searchCriteria.existingInterestRate ? `
            <!-- Potential Savings Section -->
            <div class="pdf-savings-section">
                <div class="pdf-savings-title">Potential Savings with Our Recommended Package</div>
                <div class="pdf-savings-grid">
                    <div class="pdf-savings-item">
                        <div class="label">Current Monthly Payment</div>
                        <div class="value current">${formatCurrency(calculateMonthlyInstallment(searchCriteria.loanAmount, searchCriteria.loanTenure, searchCriteria.existingInterestRate))}</div>
                        <div class="sub-label">at ${parseFloat(searchCriteria.existingInterestRate).toFixed(2)}%</div>
                    </div>
                    <div class="pdf-savings-item">
                        <div class="label">New Monthly Payment</div>
                        <div class="value new">${formatCurrency(selectedPackages[0]?.monthlyInstallment || 0)}</div>
                        <div class="sub-label">at ${selectedPackages[0]?.avgFirst2Years?.toFixed(2) || 'N/A'}%</div>
                    </div>
                    <div class="pdf-savings-item">
                        <div class="label">Total Savings</div>
                        <div class="value savings">${formatSavings(selectedPackages[0]?.totalSavings || 0, selectedPackages[0]?.lock_period)}</div>
                    </div>
                </div>
            </div>
            ` : ''}

            <!-- Professional Disclaimer -->
            <div class="pdf-disclaimer">
                <div class="pdf-disclaimer-title">Disclaimer:</div>
                <div class="pdf-disclaimer-text">
                    This report is for informational purposes only. Rates and terms are subject to bank approval and may change without notice. 
                    Please verify all details with lenders and consult qualified professionals before making financial decisions. 
                    Check for penalties or fees before switching lenders.
                </div>
            </div>
        </div>
    `;

    // Skip modal preview and go directly to print/PDF
    openDirectPrintReport(reportContent);
}

function openDirectPrintReport(reportContent) {
    // Set document title for the PDF export
    const originalTitle = document.title;
    document.title = `Keyquest_Mortgage_Report_${new Date().toISOString().split('T')[0]}`;
    
    // Open new window and directly write the report content
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Keyquest Mortgage Report</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                @page {
                    margin: 0.4in 0.3in;
                    size: A4;
                }
                
                @media print {
                    @page {
                        margin: 0.4in 0.3in;
                        size: A4;
                    }
                    
                    /* Hide browser-generated headers and footers */
                    body {
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    
                    /* Remove any browser-generated content */
                    .no-print,
                    header,
                    footer {
                        display: none !important;
                    }
                }
                
                * {
                    -webkit-print-color-adjust: exact !important;
                    color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
                    margin: 0;
                    padding: 0;
                    background: white !important;
                    color: #1a1a1a !important;
                }
                
                /* Use the same print styles as before but ensure they match our new theme */
                .pdf-report-container {
                    padding: 20px !important;
                    background: white !important;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
                    line-height: 1.4 !important;
                    color: #1f2937 !important;
                    max-width: none !important;
                    margin: 0 auto !important;
                    overflow: visible !important;
                }

                /* Apply our blue-green theme to print styles */
                .pdf-header {
                    display: flex !important;
                    justify-content: space-between !important;
                    align-items: center !important;
                    margin: 0 0 15px 0 !important;
                    padding: 5px 0 10px 0 !important;
                    border-bottom: 2px solid #000000 !important;
                    height: 85px !important;
                    overflow: visible !important;
                }

                .pdf-key-info {
                    background: transparent !important;
                    border: none !important;
                    border-radius: 16px !important;
                    padding: 15px !important;
                    margin-top: 20px !important;
                    margin-bottom: 20px !important;
                }

                .pdf-info-label {
                    color: white !important;
                    margin-bottom: 8px !important;
                    font-weight: 600 !important;
                    font-size: 11px !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.5px !important;
                    line-height: 1.2 !important;
                }

                .pdf-info-value {
                    font-size: 16px !important;
                    font-weight: 800 !important;
                    color: white !important;
                    line-height: 1.3 !important;
                    margin: 0 !important;
                }

                .pdf-info-value.current-rate {
                    color: white !important;
                }

                .pdf-comparison-title {
                    font-size: 20px !important;
                    font-weight: 700 !important;
                    color: #2563eb !important;
                    margin-bottom: 15px !important;
                }

                .pdf-comparison-table thead {
                    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
                }

                .pdf-comparison-table th:first-child {
                    background: #1d4ed8 !important;
                }

                .pdf-comparison-table td.recommended {
                    background: rgba(37, 99, 235, 0.15) !important;
                    font-weight: 600 !important;
                    color: #1d4ed8 !important;
                }

                .pdf-comparison-table th.recommended {
                    background: #1e40af !important;
                    position: relative !important;
                }

                .pdf-savings-item .value.new {
                    color: #1d4ed8 !important;
                }

                /* Complete PDF Report Styles */
                .pdf-header .logo-section {
                    flex: 0 0 auto !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    line-height: 0 !important;
                }

                .pdf-header .logo-section {
                    height: 85px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: flex-start !important;
                    overflow: visible !important;
                    flex-shrink: 0 !important;
                }

                .pdf-header .logo-section img {
                    height: 150px !important;
                    width: auto !important;
                    object-fit: contain !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    border: 0 !important;
                    vertical-align: middle !important;
                    display: block !important;
                    max-width: 200px !important;
                }

                .pdf-header .title-section {
                    text-align: right !important;
                    flex: 1 !important;
                    margin-left: 30px !important;
                    display: flex !important;
                    flex-direction: column !important;
                    justify-content: center !important;
                    align-items: flex-end !important;
                }

                .pdf-header h1 {
                    margin: 0 !important;
                    font-size: 24px !important;
                    font-weight: 800 !important;
                    color: #1f2937 !important;
                    letter-spacing: -0.5px !important;
                    line-height: 1.2 !important;
                }

                .pdf-header .client-name {
                    font-size: 16px !important;
                    color: #6b7280 !important;
                    margin: 2px 0 !important;
                    font-weight: 500 !important;
                    line-height: 1.2 !important;
                }

                .pdf-header .report-date {
                    font-size: 13px !important;
                    color: #9ca3af !important;
                    margin: 0 !important;
                    line-height: 1.2 !important;
                }

                .pdf-info-grid {
                    display: grid !important;
                    grid-template-columns: repeat(5, 1fr) !important;
                    gap: 20px !important;
                    align-items: stretch !important;
                    padding: 10px !important;
                }

                .pdf-info-item {
                    text-align: center !important;
                    display: flex !important;
                    flex-direction: column !important;
                    align-items: center !important;
                    justify-content: center !important;
                    min-height: 100px !important;
                    padding: 16px 12px !important;
                    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
                    border-radius: 12px !important;
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25) !important;
                }

                .pdf-info-value.best-rate,
                .pdf-info-value.savings {
                    color: white !important;
                }

                .pdf-info-value.property-type {
                    font-size: 16px !important;
                    font-weight: 700 !important;
                    line-height: 1.2 !important;
                }

                .pdf-info-value.savings {
                    font-size: 14px !important;
                    line-height: 1.2 !important;
                }

                .pdf-info-value .sub-text {
                    font-size: 12px !important;
                    display: block !important;
                    margin-top: 2px !important;
                }

                /* Potential Savings Section */
                .pdf-savings-section {
                    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important;
                    border: 2px solid #2563eb !important;
                    border-radius: 16px !important;
                    padding: 20px !important;
                    margin-bottom: 20px !important;
                    margin-top: 15px !important;
                    position: relative !important;
                }

                .pdf-savings-section::before {
                    content: '💰' !important;
                    position: absolute !important;
                    top: 15px !important;
                    left: 15px !important;
                    font-size: 20px !important;
                }

                .pdf-savings-title {
                    font-size: 16px !important;
                    font-weight: 700 !important;
                    color: #2563eb !important;
                    margin-bottom: 15px !important;
                    margin-left: 30px !important;
                }

                .pdf-savings-grid {
                    display: flex !important;
                    justify-content: space-between !important;
                    align-items: stretch !important;
                    gap: 30px !important;
                    flex-wrap: wrap !important;
                    padding: 10px 20px !important;
                }

                .pdf-savings-item {
                    text-align: center !important;
                    flex: 1 !important;
                    min-width: 140px !important;
                    display: flex !important;
                    flex-direction: column !important;
                    justify-content: center !important;
                    align-items: center !important;
                }

                .pdf-savings-item .label {
                    color: #6b7280 !important;
                    font-size: 12px !important;
                    margin-bottom: 6px !important;
                }

                .pdf-savings-item .value {
                    font-size: 18px !important;
                    font-weight: 700 !important;
                }

                .pdf-savings-item .value.current {
                    color: #1d4ed8 !important;
                }

                .pdf-savings-item .value.new {
                    color: #2563eb !important;
                }

                .pdf-savings-item .value.savings {
                    color: #2563eb !important;
                    font-size: 18px !important;
                    font-weight: 800 !important;
                    line-height: 1.3 !important;
                }

                .pdf-savings-item .sub-label {
                    font-size: 11px !important;
                    color: #6b7280 !important;
                    margin-top: 4px !important;
                }

                /* Package Comparison Table */
                .pdf-comparison-section {
                    margin-bottom: 25px !important;
                }

                .pdf-comparison-table {
                    width: 100% !important;
                    border-collapse: collapse !important;
                    background: white !important;
                    border-radius: 12px !important;
                    overflow: hidden !important;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
                    table-layout: fixed !important;
                }

                .pdf-comparison-table th {
                    padding: 10px 6px !important;
                    text-align: center !important;
                    font-weight: 600 !important;
                    font-size: 12px !important;
                    color: white !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.3px !important;
                    word-wrap: break-word !important;
                    vertical-align: middle !important;
                }

                .pdf-comparison-table th:first-child {
                    width: 25% !important;
                    text-align: left !important;
                    padding-left: 12px !important;
                }

                .pdf-comparison-table th:not(:first-child) {
                    width: 25% !important;
                }

                .pdf-comparison-table th.recommended {
                    background: #1e40af !important;
                    position: relative !important;
                }

                .pdf-comparison-table th.recommended::after {
                    content: 'RECOMMENDED' !important;
                    position: absolute !important;
                    bottom: -8px !important;
                    left: 50% !important;
                    transform: translateX(-50%) !important;
                    background: #3b82f6 !important;
                    color: white !important;
                    font-size: 6px !important;
                    padding: 2px 6px !important;
                    border-radius: 3px !important;
                    font-weight: 700 !important;
                    white-space: nowrap !important;
                    z-index: 10 !important;
                }

                .pdf-comparison-table tbody tr:nth-child(even) {
                    background: #f8fafc !important;
                }

                .pdf-comparison-table td {
                    padding: 8px 6px !important;
                    text-align: center !important;
                    border-bottom: 1px solid #e2e8f0 !important;
                    font-size: 11px !important;
                    line-height: 1.4 !important;
                    word-wrap: break-word !important;
                    vertical-align: top !important;
                    max-width: 0 !important;
                }

                .pdf-comparison-table td:first-child {
                    text-align: left !important;
                    font-weight: 600 !important;
                    color: #374151 !important;
                    padding-left: 12px !important;
                    white-space: nowrap !important;
                }

                .pdf-comparison-table td.rate-value {
                    font-weight: 600 !important;
                    color: #1d4ed8 !important;
                }

                .pdf-comparison-table td.amount {
                    color: #3b82f6 !important;
                    font-weight: 600 !important;
                }

                .pdf-comparison-table td.period {
                    color: #3b82f6 !important;
                    font-weight: 600 !important;
                }

                .pdf-comparison-table td.features-cell {
                    text-align: center !important;
                    vertical-align: middle !important;
                    font-size: 11px !important;
                    line-height: 1.3 !important;
                    padding: 8px 4px !important;
                    word-wrap: break-word !important;
                    overflow-wrap: break-word !important;
                    hyphens: auto !important;
                }

                .pdf-comparison-table td.remarks-cell {
                    text-align: left !important;
                    vertical-align: top !important;
                    font-size: 8px !important;
                    line-height: 1.3 !important;
                    padding: 8px 4px !important;
                    word-wrap: break-word !important;
                    overflow-wrap: break-word !important;
                    hyphens: auto !important;
                }

                .pdf-comparison-table td.features-cell div,
                .pdf-comparison-table td.remarks-cell div {
                    margin-bottom: 2px !important;
                    word-break: break-word !important;
                }

                .pdf-comparison-table td.amount,
                .pdf-comparison-table td.period {
                    font-size: 11px !important;
                    font-weight: 600 !important;
                }

                /* Specific improvements for better table layout */
                .pdf-comparison-table td.rate-value {
                    font-size: 11px !important;
                    line-height: 1.2 !important;
                }

                .pdf-comparison-table .savings-cell {
                    font-size: 11px !important;
                    line-height: 1.2 !important;
                    text-align: center !important;
                    vertical-align: middle !important;
                }

                /* Ensure consistent row heights */
                .pdf-comparison-table tr {
                    height: auto !important;
                    min-height: 30px !important;
                }

                /* Better spacing for package comparison section */
                .pdf-comparison-section {
                    margin-bottom: 20px !important;
                    page-break-inside: avoid !important;
                }

                /* Page break controls for better PDF layout */
                .pdf-header {
                    page-break-after: avoid !important;
                }

                .pdf-key-info {
                    page-break-inside: avoid !important;
                    page-break-after: avoid !important;
                }

                .pdf-savings-section {
                    page-break-inside: avoid !important;
                }

                .pdf-comparison-table {
                    page-break-inside: auto !important;
                }

                .pdf-comparison-table thead {
                    page-break-after: avoid !important;
                }

                .pdf-comparison-table tr {
                    page-break-inside: avoid !important;
                }

                .pdf-disclaimer {
                    page-break-inside: avoid !important;
                }

                /* Disclaimer Section */
                .pdf-disclaimer {
                    background: #f9fafb !important;
                    border: 1px solid #e5e7eb !important;
                    border-radius: 8px !important;
                    padding: 12px !important;
                    margin-top: 20px !important;
                }

                .pdf-disclaimer-title {
                    font-weight: 700 !important;
                    color: #374151 !important;
                    margin-bottom: 6px !important;
                    font-size: 12px !important;
                }

                .pdf-disclaimer-text {
                    font-size: 10px !important;
                    color: #6b7280 !important;
                    line-height: 1.5 !important;
                }
            </style>
        </head>
        <body>
            ${reportContent}
        </body>
        </html>
    `);
    printWindow.document.close();
    
    // Automatically trigger print dialog after a short delay to ensure content loads
    setTimeout(() => {
        printWindow.print();
    }, 500);
    
    // Restore original title
    document.title = originalTitle;
}