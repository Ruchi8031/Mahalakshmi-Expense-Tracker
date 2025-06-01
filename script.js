document.addEventListener('DOMContentLoaded', () => {
    const verificationForm = document.getElementById('verification-form');
    const verificationSuccessMessage = document.getElementById('verification-success-message');
    const verifyBtn = document.getElementById('verify-btn');
    const verificationStatusMessage = document.getElementById('verification-status-message');
    const menuBtns = document.querySelectorAll('.menu-btn');
    const dashboardBtn = document.querySelector('[data-section="dashboard"]');
    const addExpenseBtn = document.getElementById('add-expense-btn');
    const expenseNameInput = document.getElementById('expense-name');
    const expenseAmountInput = document.getElementById('expense-amount');
    const recentExpenseList = document.getElementById('recent-expense-list');
    const expenseList = document.getElementById('expense-list');
    const totalExpensesElement = document.getElementById('total-expenses');
    const dashboardBudgetEl = document.getElementById('dashboard-budget');
    const dashboardWalletEl = document.getElementById('dashboard-wallet');
    const dashboardCashbackEl = document.getElementById('dashboard-cashback');
    const cashbackSummaryElement = document.getElementById('cashback-summary');
    const monthWiseCashbackElement = document.getElementById('month-wise-cashback');
    const cashbackListElement = document.getElementById('cashback-list');
    const dashboardGradeDisplay = document.getElementById('dashboard-grade');

    const setBudgetBtn = document.getElementById('set-budget-btn');
    const budgetAmountInput = document.getElementById('budget-amount');
    const displayBudgetEl = document.getElementById('display-budget');
    const walletBalanceEl = document.getElementById('wallet-balance');
    const addFundsBtn = document.getElementById('add-funds-btn');
    const addFundsInput = document.getElementById('add-funds');
    const withdrawBtn = document.getElementById('withdraw-btn');
    const withdrawAmountInput = document.getElementById('withdraw-amount');
    const withdrawalMessage = document.getElementById('withdrawal-message');
    const dashboardTrackerStatus = document.getElementById('dashboard-tracker-status');
    const dashboardGradeDisplayElement = document.getElementById('dashboard-grade');


    let budget = 0;
    let walletBalance = 0;
    let expenses = [];
    let isVerified = false;
    let trackingStarted = false;
    let currentMonthExpenses = 0;
    let totalCashback = 0;
    let monthlyCashback = [];
    let currentMonth = 0; // 1-12
    let userGender = ''; // Added for gender
    let firstTimeGradeA = true;
    let currentGrade = '';

    // Function to enable/disable menu buttons
    function setMenuState(isVerified) {
        menuBtns.forEach(button => {
            if (button.dataset.section !== 'verification') { // Keep verification enabled
                button.disabled = !isVerified;
                if (!isVerified) {
                    button.classList.add('disabled');
                } else {
                    button.classList.remove('disabled');
                }
            }
        });
        // Optionally, make sure the dashboard is shown by default.
        if (isVerified) {
            showSection('dashboard');
            document.querySelector('[data-section="dashboard"]').classList.add('active');
        } else {
            showSection('verification');
            document.querySelector('[data-section="verification"]').classList.add('active');
        }
    }

    function showSection(sectionId) {
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => section.classList.remove('active'));
        document.getElementById(sectionId).classList.add('active');
    }

    // Initial state:  Show verification form, disable other menus
    setMenuState(false);
    currentMonth = new Date().getMonth() + 1;

    // Event listener for the verification button
    verifyBtn.addEventListener('click', () => {
        const name = document.getElementById('verification-name').value.trim();
        const gender = document.getElementById('verification-gender').value;
        const dob = document.getElementById('verification-dob').value;
        const aadhar = document.getElementById('verification-aadhar').value.trim();

        let isValid = true;
        let errorMessage = '';

        if (!name) {
            isValid = false;
            errorMessage += 'Please enter your full name.<br>';
        }
        if (!gender) {
            isValid = false;
            errorMessage += 'Please select your gender.<br>';
        }
        if (!dob) {
            isValid = false;
            errorMessage += 'Please enter your date of birth.<br>';
        }
        if (!aadhar) {
            isValid = false;
            errorMessage += 'Please enter your Aadhaar number.<br>';
        } else if (aadhar.length !== 12 || !/^\d+$/.test(aadhar)) {
            isValid = false;
            errorMessage += 'Aadhaar number must be 12 digits and contain only numbers.<br>';
        }

        if (isValid) {
            // Simulate successful verification (replace with your actual verification logic)
            verificationForm.style.display = 'none';
            verificationSuccessMessage.style.display = 'block';
            setMenuState(true); // Enable other menu buttons
            showSection('dashboard'); // Optionally go to dashboard
            document.querySelector('[data-section="dashboard"]').classList.add('active');
            isVerified = true;
            userGender = gender; // Store the gender
            //set budget and wallet
            if (budget > 0) {
                displayBudgetEl.textContent = budget.toFixed(2);
                dashboardBudgetEl.textContent = budget.toFixed(2);
            }
            walletBalanceEl.textContent = walletBalance.toFixed(2);
            dashboardWalletEl.textContent = walletBalance.toFixed(2);

        } else {
            verificationStatusMessage.innerHTML = errorMessage;
            verificationStatusMessage.style.color = 'red';
        }
    });

    // Add this, so that after completing verification, user is taken to Budget page.
    document.getElementById('move-to-budget-btn').addEventListener('click', () => {
        showSection('set-budget');
        document.querySelector('[data-section="set-budget"]').classList.add('active');
    });

    // Menu button click handler to show sections
    menuBtns.forEach(button => {
        button.addEventListener('click', () => {
            if (!button.disabled) { // Only allow clicks if not disabled
                menuBtns.forEach(b => b.classList.remove('active'));
                button.classList.add('active');
                showSection(button.dataset.section);
            }
        });
    });

    // Event listener for adding expenses
    addExpenseBtn.addEventListener('click', () => {
        const name = expenseNameInput.value.trim();
        const amount = parseFloat(expenseAmountInput.value);

        if (name && !isNaN(amount) && amount > 0) {
            expenses.push({ name, amount });
            walletBalance -= amount; // Deduct from wallet
            walletBalanceEl.textContent = walletBalance.toFixed(2);
            dashboardWalletEl.textContent = walletBalance.toFixed(2);
            displayExpense(name, amount);
            expenseNameInput.value = '';
            expenseAmountInput.value = '';
            if (expenses.length <= 5) {
                displayRecentExpense(name, amount);
            }
            currentMonthExpenses += amount;
            updateTrackingStatus();

        } else {
            alert('Please enter a valid expense name and amount.');
        }
    });

    function displayExpense(name, amount) {
        const li = document.createElement('li');
        li.textContent = `${name}: ₹${amount.toFixed(2)}`;
        expenseList.appendChild(li);
        displayTotalExpenses();
    }
    function displayRecentExpense(name, amount) {
        const li = document.createElement('li');
        li.textContent = `${name}: ₹${amount.toFixed(2)}`;
        recentExpenseList.appendChild(li);
    }

    function displayTotalExpenses() {
        let total = 0;
        expenses.forEach(expense => {
            total += expense.amount;
        });
        totalExpensesElement.textContent = total.toFixed(2);
    }

    //event listener for set budget
    setBudgetBtn.addEventListener('click', () => {
        const budgetInput = parseFloat(budgetAmountInput.value);
        if (!isNaN(budgetInput) && budgetInput > 0) {
            budget = budgetInput;
            displayBudgetEl.textContent = budget.toFixed(2);
            dashboardBudgetEl.textContent = budget.toFixed(2);
            // IMPORTANT:  Wallet balance is NOT automatically set to budget.
            // User must add funds separately.
            budgetAmountInput.value = '';
            alert('Budget set successfully!');
            if (isVerified) {
                showSection('my-wallet');
                document.querySelector('[data-section="my-wallet"]').classList.add('active');
            }
            trackingStarted = true;
            currentMonthExpenses = 0;
            updateTrackingStatus();

        } else {
            alert('Please enter a valid budget amount.');
        }
    });

    // Event listener for adding funds to wallet
    addFundsBtn.addEventListener('click', () => {
        const funds = parseFloat(addFundsInput.value);
        if (!isNaN(funds) && funds > 0) {
            walletBalance += funds;
            walletBalanceEl.textContent = walletBalance.toFixed(2);
            dashboardWalletEl.textContent = walletBalance.toFixed(2);
            addFundsInput.value = '';
        } else {
            alert('Please enter a valid amount to add.');
        }
    });

    // Event listener for withdrawing funds
    withdrawBtn.addEventListener('click', () => {
        const amount = parseFloat(withdrawAmountInput.value);
        if (!isNaN(amount) && amount > 0) {
            if (amount <= walletBalance) {
                walletBalance -= amount;
                walletBalanceEl.textContent = walletBalance.toFixed(2);
                dashboardWalletEl.textContent = walletBalance.toFixed(2);
                withdrawAmountInput.value = '';
                withdrawalMessage.textContent = `Successfully withdrew ₹${amount.toFixed(2)}`;
                withdrawalMessage.style.color = 'green';
            } else {
                withdrawalMessage.textContent = 'Insufficient funds.';
                withdrawalMessage.style.color = 'red';
            }
        } else {
            withdrawalMessage.textContent = 'Please enter a valid amount to withdraw.';
            withdrawalMessage.style.color = 'red';
        }
    });

    function updateTrackingStatus() {
        if (!trackingStarted) {
            dashboardTrackerStatus.textContent = 'Not Started';
            dashboardTrackerStatus.className = 'expense-tracker-status dashboard-status red';
            dashboardGradeDisplayElement.textContent = 'N/A';
            cashbackSummaryElement.style.display = 'none';
        } else if (budget === 0) {
            dashboardTrackerStatus.textContent = 'No Budget';
            dashboardTrackerStatus.className = 'expense-tracker-status dashboard-status red';
            dashboardGradeDisplayElement.textContent = 'N/A';
            cashbackSummaryElement.style.display = 'none';
        } else {
            const expensePercentage = (currentMonthExpenses / budget) * 100;
            let statusText = '';
            let statusColor = '';
            let grade = '';
            let cashback = 0;
            let gradeText = '';

            if (expensePercentage <= 60) {
                statusText = `Good (${expensePercentage.toFixed(2)}%)`;
                statusColor = 'green';
                grade = 'A';
                gradeText = 'Grade A';
                cashback = (userGender === 'female') ? 250 : 150;
                if (firstTimeGradeA) {
                    cashback += (userGender === 'female') ? 250 : 100;
                }
            } else if (expensePercentage <= 85) {
                statusText = `Average (${expensePercentage.toFixed(2)}%)`;
                statusColor = 'yellow';
                grade = 'B';
                gradeText = 'Grade B';
                cashback = (userGender === 'female') ? 100 : 50;
            } else if (expensePercentage <= 100) {
                statusText = `Caution (${expensePercentage.toFixed(2)}%)`;
                statusColor = 'orange';
                grade = 'C';
                gradeText = 'Grade C';
                cashback = (userGender === 'female') ? 50 : 20;
            } else {
                statusText = `High Risk (${expensePercentage.toFixed(2)}%)`;
                statusColor = 'red';
                grade = 'Needs Improvement';
                gradeText = 'Needs Improvement';
                cashback = 0;
            }

            dashboardTrackerStatus.textContent = statusText;
            dashboardTrackerStatus.className = `expense-tracker-status dashboard-status ${statusColor}`;
            dashboardGradeDisplayElement.textContent = gradeText;
            currentGrade = grade;

            dashboardCashbackEl.textContent = totalCashback.toFixed(2);
            cashbackSummaryElement.style.display = 'block';
            monthlyCashback.push({ month: currentMonth, grade: grade, cashback: cashback });
            if (grade === 'A') {
                firstTimeGradeA = false;
            }
        }
    }
    updateTrackingStatus(); //call when page loads

    cashbackSummaryElement.addEventListener('click', () => {
        monthWiseCashbackElement.style.display = (monthWiseCashbackElement.style.display === 'none') ? 'block' : 'none';
        if (monthWiseCashbackElement.style.display === 'block') {
            cashbackListElement.innerHTML = '';
            monthlyCashback.forEach(item => {
                const li = document.createElement('li');
                li.textContent = `Month: ${item.month}, Grade: ${item.grade}, Cashback: ₹${item.cashback.toFixed(2)}`;
                cashbackListElement.appendChild(li);
            });
        }
    });

});