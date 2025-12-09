// --- Simple auth using localStorage (front-end only, demo purpose) ---

const authSection = document.getElementById("auth-section");
const appSection = document.getElementById("app-section");
const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("login-email");
const passwordInput = document.getElementById("login-password");
const userEmailBadge = document.getElementById("user-email-badge");
const userEmailText = document.getElementById("user-email-text");
const logoutBtn = document.getElementById("logout-btn");

// Expense elements
const expenseForm = document.getElementById("expense-form");
const expDate = document.getElementById("exp-date");
const expCategory = document.getElementById("exp-category");
const expDesc = document.getElementById("exp-desc");
const expAmount = document.getElementById("exp-amount");
const expenseTableBody = document.getElementById("expense-table-body");

// Summary
const totalSpentEl = document.getElementById("total-spent");
const monthSpentEl = document.getElementById("month-spent");
const totalCountEl = document.getElementById("total-count");
const chartYearLabel = document.getElementById("chart-year-label");

// Chart variables
let chartInstance = null;
let expenses = [];

// --- Helpers for localStorage ---
function loadUser() {
    const user = localStorage.getItem("fintrack_user");
    return user ? JSON.parse(user) : null;
}

function saveUser(user) {
    localStorage.setItem("fintrack_user", JSON.stringify(user));
}

function loadExpenses() {
    const data = localStorage.getItem("fintrack_expenses");
    expenses = data ? JSON.parse(data) : [];
}

function saveExpenses() {
    localStorage.setItem("fintrack_expenses", JSON.stringify(expenses));
}

// --- Auth handling ---
function showApp(user) {
    authSection.classList.add("d-none");
    appSection.classList.remove("d-none");
    userEmailBadge.classList.remove("d-none");
    logoutBtn.classList.remove("d-none");
    userEmailText.textContent = user.email;
    renderUI();
}

function showLogin() {
    authSection.classList.remove("d-none");
    appSection.classList.add("d-none");
    userEmailBadge.classList.add("d-none");
    logoutBtn.classList.add("d-none");
}

loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) return;

    const user = { email };
    saveUser(user);
    showApp(user);
});

logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("fintrack_user");
    showLogin();
});

// --- Expense logic ---
expenseForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const dateVal = expDate.value;
    const catVal = expCategory.value;
    const descVal = expDesc.value.trim();
    const amtVal = parseFloat(expAmount.value);

    if (!dateVal || !catVal || isNaN(amtVal)) return;

    const newExpense = {
    id: Date.now(),
    date: dateVal,
    category: catVal,
    description: descVal || "-",
    amount: amtVal,
    };

    expenses.push(newExpense);
    saveExpenses();
    expenseForm.reset();
    renderUI();
});

function renderUI() {
    renderTable();
    renderSummary();
    renderChart();
}

function renderTable() {
    expenseTableBody.innerHTML = "";
    const sorted = [...expenses].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
    );

    sorted.forEach((exp) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
        <td>${exp.date}</td>
        <td>${exp.category}</td>
        <td>${exp.description}</td>
        <td class="text-end">₹${exp.amount.toFixed(2)}</td>
    `;
    expenseTableBody.appendChild(tr);
    });
}

function renderSummary() {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    totalSpentEl.textContent = "₹" + total.toFixed(2);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthTotal = expenses
    .filter((e) => {
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, e) => sum + e.amount, 0);

    monthSpentEl.textContent = "₹" + monthTotal.toFixed(2);
    totalCountEl.textContent = expenses.length;
}

// Build monthly totals for chart
function getMonthlyTotals(year) {
    const totals = new Array(12).fill(0);
    expenses.forEach((e) => {
    const d = new Date(e.date);
    if (d.getFullYear() === year) {
        const m = d.getMonth();
        totals[m] += e.amount;
    }
    });
    return totals;
}

function renderChart() {
    const ctx = document.getElementById("monthlyChart").getContext("2d");
    const now = new Date();
    const year = now.getFullYear();
    const data = getMonthlyTotals(year);
    chartYearLabel.textContent = year;

    if (chartInstance) {
    chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
        labels: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
        ],
        datasets: [
        {
            label: "Monthly Spend (₹)",
            data,
            borderWidth: 1,
            backgroundColor: "rgba(79, 70, 229, 0.35)",
            borderColor: "rgba(79, 70, 229, 0.9)",
            borderRadius: 8,
        },
        ],
    },
    options: {
        scales: {
        y: {
            beginAtZero: true,
            ticks: {
            callback: (value) => "₹" + value,
            },
        },
        },
        plugins: {
        legend: {
            display: false,
        },
        },
    },
    });
}

// --- Init ---
window.addEventListener("DOMContentLoaded", () => {
    loadExpenses();
    const user = loadUser();
    if (user) {
    showApp(user);
    } else {
    showLogin();
    }
});
