import React, { useState } from 'react';

// --- Helper Components ---
const DollarDisplay = ({ value, isNegative = false, colorClass = '' }) => {
    const displayValue = Math.abs(value);
    const formattedValue = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(displayValue);
    const finalColorClass = isNegative ? 'text-red-600' : colorClass;
    return <span className={`font-semibold ${finalColorClass}`}>{isNegative ? `-${formattedValue}` : formattedValue}</span>;
};

const InputField = ({ label, id, value, onChange, placeholder = "0", helpText }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="mt-1 relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
                type="number"
                id={id}
                value={value}
                onChange={onChange}
                className="block w-full rounded-md border-gray-300 pl-7 pr-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder={placeholder}
                min="0"
            />
        </div>
        {helpText && <p className="mt-1 text-xs text-gray-500">{helpText}</p>}
    </div>
);

const SelectField = ({ label, id, value, onChange, options }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
        <select
            id={id}
            value={value}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
        >
            {options.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
            ))}
        </select>
    </div>
);

// --- Schedule E Modal Component ---
const ScheduleEModal = ({ isOpen, onClose, onSave, scheduleEData, setScheduleEData }) => {
    if (!isOpen) return null;

    const handleSave = () => {
        onSave(scheduleEData);
        onClose();
    };
    
    const p = (v) => parseFloat(v) || 0;
    const netIncome = p(scheduleEData.rentalIncome) - p(scheduleEData.rentalExpenses) + p(scheduleEData.passthroughIncome);

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md mx-auto">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Schedule E Worksheet</h2>
                <p className="text-sm text-gray-600 mb-6">Enter income from rental real estate and passthrough entities.</p>
                <div className="space-y-4">
                    <InputField label="Gross Rental Income" id="rentalIncome" value={scheduleEData.rentalIncome} onChange={(e) => setScheduleEData({...scheduleEData, rentalIncome: e.target.value})} />
                    <InputField label="Total Rental Expenses" id="rentalExpenses" value={scheduleEData.rentalExpenses} onChange={(e) => setScheduleEData({...scheduleEData, rentalExpenses: e.target.value})} helpText="Includes mortgage interest, taxes, repairs, depreciation, etc." />
                    <InputField label="Passthrough Income (K-1)" id="passthroughIncome" value={scheduleEData.passthroughIncome} onChange={(e) => setScheduleEData({...scheduleEData, passthroughIncome: e.target.value})} helpText="From partnerships, S-corps, etc." />
                </div>
                <div className="mt-6 pt-4 border-t">
                    <h3 className="text-lg font-semibold">Net Schedule E Income: <DollarDisplay value={netIncome} colorClass="text-indigo-600" /></h3>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Save and Close</button>
                </div>
            </div>
        </div>
    );
};


// --- Main Application Component ---
export default function App() {
    // --- State Management ---
    const [form, setForm] = useState({
        wages: '', filingStatus: 'single', state: 'none', credits: '', interest: '',
        ordDividends: '', qualDividends: '', stGains: '', ltGains: '', charity: '',
        withheld: '', estimatedPayments: ''
    });
    const [scheduleEData, setScheduleEData] = useState({ rentalIncome: '', rentalExpenses: '', passthroughIncome: '' });
    const [netScheduleE, setNetScheduleE] = useState(0);
    const [isScheduleEModalOpen, setScheduleEModalOpen] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [taxData, setTaxData] = useState(null);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setForm(prev => ({ ...prev, [id]: value }));
    };

    const handleSaveScheduleE = (data) => {
        const p = (v) => parseFloat(v) || 0;
        const netIncome = p(data.rentalIncome) - p(data.rentalExpenses) + p(data.passthroughIncome);
        setNetScheduleE(netIncome);
    };

    // --- Tax Data ---
    const taxInfo = {
        federal: {
            single: { deduction: 15000, brackets: [ { rate: 0.10, limit: 11950 }, { rate: 0.12, limit: 48575 }, { rate: 0.22, limit: 103575 }, { rate: 0.24, limit: 197725 }, { rate: 0.32, limit: 251050 }, { rate: 0.35, limit: 627600 }, { rate: 0.37, limit: Infinity } ], capitalGainsBrackets: [ { rate: 0.00, limit: 49230 }, { rate: 0.15, limit: 541900 }, { rate: 0.20, limit: Infinity } ], niitThreshold: 200000, medicareThreshold: 200000 },
            marriedFilingJointly: { deduction: 30000, brackets: [ { rate: 0.10, limit: 23900 }, { rate: 0.12, limit: 97150 }, { rate: 0.22, limit: 207150 }, { rate: 0.24, limit: 395450 }, { rate: 0.32, limit: 502100 }, { rate: 0.35, limit: 753100 }, { rate: 0.37, limit: Infinity } ], capitalGainsBrackets: [ { rate: 0.00, limit: 98460 }, { rate: 0.15, limit: 606550 }, { rate: 0.20, limit: Infinity } ], niitThreshold: 250000, medicareThreshold: 250000 },
            headOfHousehold: { deduction: 22500, brackets: [ { rate: 0.10, limit: 17050 }, { rate: 0.12, limit: 65100 }, { rate: 0.22, limit: 103550 }, { rate: 0.24, limit: 197700 }, { rate: 0.32, limit: 251050 }, { rate: 0.35, limit: 627600 }, { rate: 0.37, limit: Infinity } ], capitalGainsBrackets: [ { rate: 0.00, limit: 66050 }, { rate: 0.15, limit: 573700 }, { rate: 0.20, limit: Infinity } ], niitThreshold: 200000, medicareThreshold: 200000 },
        },
        virginia: {
            single: { deduction: 8000, brackets: [ { rate: 0.02, limit: 3000 }, { rate: 0.03, limit: 5000 }, { rate: 0.05, limit: 17000 }, { rate: 0.0575, limit: Infinity } ] },
            marriedFilingJointly: { deduction: 16000, brackets: [ { rate: 0.02, limit: 3000 }, { rate: 0.03, limit: 5000 }, { rate: 0.05, limit: 17000 }, { rate: 0.0575, limit: Infinity } ] },
            headOfHousehold: { deduction: 8000, brackets: [ { rate: 0.02, limit: 3000 }, { rate: 0.03, limit: 5000 }, { rate: 0.05, limit: 17000 }, { rate: 0.0575, limit: Infinity } ] }
        },
        california: {
            single: { deduction: 5540, brackets: [ { rate: 0.01, limit: 10756 }, { rate: 0.02, limit: 25499 }, { rate: 0.04, limit: 40245 }, { rate: 0.06, limit: 55866 }, { rate: 0.08, limit: 70606 }, { rate: 0.093, limit: 360659 }, { rate: 0.103, limit: 432787 }, { rate: 0.113, limit: 721314 }, { rate: 0.123, limit: Infinity } ] },
            marriedFilingJointly: { deduction: 11080, brackets: [ { rate: 0.01, limit: 21512 }, { rate: 0.02, limit: 50998 }, { rate: 0.04, limit: 80490 }, { rate: 0.06, limit: 111732 }, { rate: 0.08, limit: 141212 }, { rate: 0.093, limit: 721318 }, { rate: 0.103, limit: 865574 }, { rate: 0.113, limit: 1442628 }, { rate: 0.123, limit: Infinity } ] },
            headOfHousehold: { deduction: 11080, brackets: [ { rate: 0.01, limit: 21527 }, { rate: 0.02, limit: 51000 }, { rate: 0.04, limit: 65744 }, { rate: 0.06, limit: 81364 }, { rate: 0.08, limit: 97329 }, { rate: 0.093, limit: 489637 }, { rate: 0.103, limit: 587563 }, { rate: 0.113, limit: 979273 }, { rate: 0.123, limit: Infinity } ] }
        },
        newYork: {
            single: { deduction: 8000, brackets: [ { rate: 0.04, limit: 8500 }, { rate: 0.045, limit: 11700 }, { rate: 0.0525, limit: 13900 }, { rate: 0.055, limit: 80650 }, { rate: 0.06, limit: 215400 }, { rate: 0.0685, limit: 1077550 }, { rate: 0.0965, limit: 5000000 }, { rate: 0.103, limit: 25000000 }, { rate: 0.109, limit: Infinity } ] },
            marriedFilingJointly: { deduction: 16050, brackets: [ { rate: 0.04, limit: 17150 }, { rate: 0.045, limit: 23600 }, { rate: 0.0525, limit: 27900 }, { rate: 0.055, limit: 161550 }, { rate: 0.06, limit: 323200 }, { rate: 0.0685, limit: 2155350 }, { rate: 0.0965, limit: 5000000 }, { rate: 0.103, limit: 25000000 }, { rate: 0.109, limit: Infinity } ] },
            headOfHousehold: { deduction: 11200, brackets: [ { rate: 0.04, limit: 12800 }, { rate: 0.045, limit: 17650 }, { rate: 0.0525, limit: 20900 }, { rate: 0.055, limit: 107650 }, { rate: 0.06, limit: 269300 }, { rate: 0.0685, limit: 1616450 }, { rate: 0.0965, limit: 5000000 }, { rate: 0.103, limit: 25000000 }, { rate: 0.109, limit: Infinity } ] }
        },
        northCarolina: {
            single: { deduction: 12750, brackets: [ { rate: 0.0425, limit: Infinity } ], isFlat: true },
            marriedFilingJointly: { deduction: 25500, brackets: [ { rate: 0.0425, limit: Infinity } ], isFlat: true },
            headOfHousehold: { deduction: 19125, brackets: [ { rate: 0.0425, limit: Infinity } ], isFlat: true }
        },
        florida: { noTax: true, single: {}, marriedFilingJointly: {}, headOfHousehold: {} },
        texas: { noTax: true, single: {}, marriedFilingJointly: {}, headOfHousehold: {} }
    };
    
    // --- Calculation Logic ---
    const calculateTaxes = () => {
        const { wages, filingStatus, state, credits, interest, ordDividends, qualDividends, stGains, ltGains, charity, withheld, estimatedPayments } = form;
        const p = (v) => parseFloat(v) || 0;
        const grossWages = p(wages), taxCredits = p(credits), interestIncome = p(interest), ordinaryDividends = p(ordDividends),
              qualifiedDividends = p(qualDividends), shortTermGains = p(stGains), longTermGains = p(ltGains), charitableDed = p(charity),
              taxWithheld = p(withheld), estimatedTaxPayments = p(estimatedPayments);

        // --- Federal Calculation ---
        const fedStatusInfo = taxInfo.federal[filingStatus];
        const ordinaryIncome = grossWages + interestIncome + ordinaryDividends + shortTermGains + (netScheduleE > 0 ? netScheduleE : 0); // Add positive Sch E income
        const preferentialIncome = qualifiedDividends + longTermGains;
        const totalAgi = ordinaryIncome + preferentialIncome;
        const totalDeductions = fedStatusInfo.deduction + charitableDed;
        const taxableIncome = Math.max(0, totalAgi - totalDeductions);
        
        // Regular Income Tax
        const taxableOrdinaryIncome = Math.max(0, taxableIncome - preferentialIncome);
        let regularIncomeTax = 0;
        let remainingOrdIncome = taxableOrdinaryIncome;
        let prevLimit = 0;
        for (const bracket of fedStatusInfo.brackets) {
            if (remainingOrdIncome <= 0) break;
            const incomeInBracket = Math.min(remainingOrdIncome, bracket.limit - prevLimit);
            regularIncomeTax += incomeInBracket * bracket.rate;
            remainingOrdIncome -= incomeInBracket;
            prevLimit = bracket.limit;
        }

        let capitalGainsTax = 0;
        let remainingPrefIncome = preferentialIncome;
        prevLimit = 0;
        for (const bracket of fedStatusInfo.capitalGainsBrackets) {
            if (remainingPrefIncome <= 0) break;
            const roomInBracket = Math.max(0, bracket.limit - (taxableOrdinaryIncome + (preferentialIncome - remainingPrefIncome)));
            const incomeInBracket = Math.min(remainingPrefIncome, roomInBracket);
            capitalGainsTax += incomeInBracket * bracket.rate;
            remainingPrefIncome -= incomeInBracket;
        }
        const incomeTaxBeforeCredits = regularIncomeTax + capitalGainsTax;

        // Additional Medicare Tax (Form 8959)
        const medicareTax = Math.max(0, grossWages - fedStatusInfo.medicareThreshold) * 0.009;

        // Net Investment Income Tax (NIIT, Form 8960)
        const netInvestmentIncome = interestIncome + ordinaryDividends + shortTermGains + longTermGains + netScheduleE;
        const niitBase = Math.min(Math.max(0, netInvestmentIncome), Math.max(0, totalAgi - fedStatusInfo.niitThreshold));
        const niit = niitBase * 0.038;

        const totalFederalTax = incomeTaxBeforeCredits + medicareTax + niit - taxCredits;
        const totalPayments = taxWithheld + estimatedTaxPayments;
        const balanceDueOrRefund = totalFederalTax - totalPayments;

        const federalResults = { totalTax: totalFederalTax, agi: totalAgi, taxableIncome, incomeTaxBeforeCredits, medicareTax, niit, totalPayments, balanceDueOrRefund };

        // --- State Calculation (Simplified) ---
        let stateResults = null;
        const stateInfo = taxInfo[state];
        if (stateInfo) {
            const stateName = stateOptions.find(opt => opt.value === state).label;
            if (stateInfo.noTax) {
                stateResults = { stateName, totalTax: 0, noTaxState: true };
            } else {
                const stateStatusInfo = stateInfo[filingStatus];
                const stateDeduction = stateStatusInfo.deduction;
                const stateTaxableIncome = Math.max(0, totalAgi - stateDeduction);
                let stateTax = 0;

                if (stateStatusInfo.isFlat) {
                    stateTax = stateTaxableIncome * stateStatusInfo.brackets[0].rate;
                } else {
                    let remainingStateIncome = stateTaxableIncome;
                    let statePrevLimit = 0;
                    for (const bracket of stateStatusInfo.brackets) {
                        if (remainingStateIncome <= 0) break;
                        const incomeInBracket = Math.min(remainingStateIncome, bracket.limit - statePrevLimit);
                        stateTax += incomeInBracket * bracket.rate;
                        remainingStateIncome -= incomeInBracket;
                        statePrevLimit = bracket.limit;
                    }
                }
                stateResults = { stateName, totalTax: Math.max(0, stateTax), taxableIncome: stateTaxableIncome };
            }
        }
        
        setTaxData({ federal: federalResults, state: stateResults });
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        calculateTaxes();
    };
    
    const stateOptions = [
        { value: 'none', label: 'Select State' }, { value: 'california', label: 'California' }, { value: 'florida', label: 'Florida' },
        { value: 'newYork', label: 'New York' }, { value: 'northCarolina', label: 'North Carolina' }, { value: 'texas', label: 'Texas' },
        { value: 'virginia', label: 'Virginia' },
    ];
    const filingStatusOptions = [ { value: 'single', label: 'Single' }, { value: 'marriedFilingJointly', label: 'Married Filing Jointly' }, { value: 'headOfHousehold', label: 'Head of Household' }];

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <ScheduleEModal isOpen={isScheduleEModalOpen} onClose={() => setScheduleEModalOpen(false)} onSave={handleSaveScheduleE} scheduleEData={scheduleEData} setScheduleEData={setScheduleEData} />
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <header className="text-center mb-6">
                    <h1 className="text-4xl font-bold text-gray-800">2025 Comprehensive Tax Estimator</h1>
                    <p className="text-md text-gray-600 mt-2">A detailed tool for Federal and State income tax estimation.</p>
                </header>
                
                <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* --- Input Form --- */}
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <form onSubmit={handleFormSubmit} className="space-y-6">
                            <h2 className="text-2xl font-semibold text-gray-700 border-b pb-3">Your Financials</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <SelectField label="Filing Status" id="filingStatus" value={form.filingStatus} onChange={handleInputChange} options={filingStatusOptions} />
                               <SelectField label="State of Residence" id="state" value={form.state} onChange={handleInputChange} options={stateOptions} />
                            </div>
                            <InputField label="Wages, Salaries, Tips" id="wages" value={form.wages} onChange={handleInputChange} placeholder="e.g., 85000" />
                            <div className="text-center">
                                <button type="button" onClick={() => setScheduleEModalOpen(true)} className="w-full py-2 px-4 border border-dashed border-indigo-400 text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors">
                                    Enter Rental/Passthrough Income (Sch E)
                                </button>
                                {netScheduleE !== 0 && <p className="text-sm mt-2">Net Sch E Income: <DollarDisplay value={netScheduleE} colorClass="text-gray-700" isNegative={netScheduleE < 0} /></p>}
                            </div>

                            <div className="pt-2">
                                <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                                    {showAdvanced ? '▼ Hide' : '► Show'} Advanced Income & Deductions
                                </button>
                            </div>

                            {showAdvanced && (
                                <div className="space-y-4 border-t pt-6 animate-fade-in">
                                    <InputField label="Taxable Interest" id="interest" value={form.interest} onChange={handleInputChange} />
                                    <InputField label="Ordinary Dividends" id="ordDividends" value={form.ordDividends} onChange={handleInputChange} />
                                    <InputField label="Qualified Dividends" id="qualDividends" value={form.qualDividends} onChange={handleInputChange} helpText="Portion of ordinary dividends that are qualified." />
                                    <InputField label="Short-Term Capital Gains" id="stGains" value={form.stGains} onChange={handleInputChange} />
                                    <InputField label="Long-Term Capital Gains" id="ltGains" value={form.ltGains} onChange={handleInputChange} />
                                    <InputField label="Charitable Contributions" id="charity" value={form.charity} onChange={handleInputChange} helpText="Simplified deduction added to standard." />
                                </div>
                            )}

                            <div className="border-t pt-6 space-y-4">
                                 <h3 className="text-lg font-medium text-gray-700">Payments & Withholding</h3>
                                 <InputField label="Federal Income Tax Withheld" id="withheld" value={form.withheld} onChange={handleInputChange} helpText="From W-2s, 1099s, etc."/>
                                 <InputField label="Estimated Tax Payments Made" id="estimatedPayments" value={form.estimatedPayments} onChange={handleInputChange} />
                                 <InputField label="Federal Tax Credits" id="credits" value={form.credits} onChange={handleInputChange} helpText="e.g., Child Tax Credit. Applied after tax is calculated." />
                            </div>

                            <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300">
                                Calculate Comprehensive Estimate
                            </button>
                        </form>
                    </div>

                    {/* --- Results Display --- */}
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h2 className="text-2xl font-semibold text-gray-700 border-b pb-3 mb-4">Your Estimate</h2>
                        {taxData ? (
                            <div className="space-y-6">
                                {/* Final Summary */}
                                <div className={`p-4 rounded-lg text-center ${taxData.federal.balanceDueOrRefund > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                                    <p className="text-lg font-medium text-gray-700">{taxData.federal.balanceDueOrRefund > 0 ? 'Estimated Amount Owed' : 'Estimated Refund'}</p>
                                    <p className={`text-4xl font-bold ${taxData.federal.balanceDueOrRefund > 0 ? 'text-red-700' : 'text-green-700'}`}>
                                        <DollarDisplay value={Math.abs(taxData.federal.balanceDueOrRefund)} />
                                    </p>
                                </div>

                                {/* Federal Tax Breakdown */}
                                <div className="p-4 bg-indigo-50 rounded-lg">
                                    <h3 className="font-bold text-xl text-indigo-800 mb-3">Federal Tax Breakdown</h3>
                                    <div className="space-y-2 text-sm text-gray-700">
                                        <div className="flex justify-between py-1 border-b"><span>Income Tax (Regular + Cap Gains):</span> <DollarDisplay value={taxData.federal.incomeTaxBeforeCredits} colorClass="text-indigo-700" /></div>
                                        <div className="flex justify-between py-1 border-b"><span>Add'l Medicare Tax:</span> <DollarDisplay value={taxData.federal.medicareTax} colorClass="text-indigo-700" /></div>
                                        <div className="flex justify-between py-1 border-b"><span>Net Investment Income Tax:</span> <DollarDisplay value={taxData.federal.niit} colorClass="text-indigo-700" /></div>
                                        <div className="flex justify-between font-bold py-1 border-b text-base"><span>Tax Before Credits:</span> <DollarDisplay value={taxData.federal.incomeTaxBeforeCredits + taxData.federal.medicareTax + taxData.federal.niit} colorClass="text-indigo-900" /></div>
                                        <div className="flex justify-between font-bold py-1 text-base"><span>Total Federal Tax:</span> <DollarDisplay value={taxData.federal.totalTax} colorClass="text-indigo-900" /></div>
                                    </div>
                                </div>

                                {/* Payment Breakdown */}
                                <div className="p-4 bg-gray-50 rounded-lg">
                                     <h3 className="font-bold text-xl text-gray-800 mb-3">Payment Summary</h3>
                                     <div className="space-y-2 text-sm text-gray-700">
                                        <div className="flex justify-between py-1 border-b"><span>Total Tax:</span> <DollarDisplay value={taxData.federal.totalTax} colorClass="text-gray-700" /></div>
                                        <div className="flex justify-between py-1 border-b"><span>Payments & Withholding:</span> <span>- <DollarDisplay value={taxData.federal.totalPayments} colorClass="text-green-600" /></span></div>
                                     </div>
                                </div>

                                {/* State Results */}
                                {taxData.state && taxData.state.stateName !== 'Select State' && (
                                     <div className="p-4 bg-green-50 rounded-lg">
                                        <h3 className="font-bold text-xl text-green-800 mb-2">{taxData.state.stateName} State Tax</h3>
                                        {taxData.state.noTaxState ? (
                                            <p className="text-center text-gray-700 py-8">{taxData.state.stateName} has no state income tax.</p>
                                        ) : (
                                            <div className="text-center">
                                                <p className="text-lg text-gray-600">Estimated State Tax Owed</p>
                                                <p className="text-4xl font-bold text-green-700"><DollarDisplay value={taxData.state.totalTax} /></p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 py-16">
                                <p>Enter your information and click "Calculate" to see your comprehensive estimate.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
