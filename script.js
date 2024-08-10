let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let chart;

function addExpense(e) {
    e.preventDefault();

    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;
    
    // Ensure amount is a valid number
    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }

    const date = moment().format('YYYY-MM-DD HH:mm:ss');

    const expense = {
        id: Date.now(),
        description,
        amount,
        category,
        date
    };

    expenses.push(expense);
    updateLocalStorage();
    renderExpenses();
    updateChart();
    updateSummary();

    document.getElementById('expense-form').reset();
}

function renderExpenses() {
    const expenseList = document.getElementById('expense-list');
    expenseList.innerHTML = '';

    const monthFilter = document.getElementById('month-filter').value;

    expenses.filter(expense => {
        if (monthFilter) {
            return moment(expense.date).format('YYYY-MM') === monthFilter;
        }
        return true;
    }).forEach(expense => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td data-label="Description">${expense.description}</td>
            <td data-label="Amount">₹${expense.amount.toFixed(2)}</td>
            <td data-label="Category">${expense.category}</td>
            <td data-label="Date">${moment(expense.date).format('MMM D, YYYY')}</td>
            <td data-label="Actions">
                <i class="fas fa-edit action-btn" onclick="editExpense(${expense.id})"></i>
                <i class="fas fa-trash action-btn" onclick="deleteExpense(${expense.id})"></i>
            </td>
        `;
        expenseList.appendChild(tr);
    });
}

function updateLocalStorage() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

function updateChart() {
    const ctx = document.getElementById('expense-chart').getContext('2d');
    
    const categoryTotals = expenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
    }, {});

    const data = {
        labels: Object.keys(categoryTotals),
        datasets: [{
            data: Object.values(categoryTotals),
            backgroundColor: [
                '#FF6384',
                '#36A2EB',
                '#FFCE56',
                '#4BC0C0',
                '#9966FF'
            ]
        }]
    };

    if (chart) {
        chart.destroy(); // Destroy the previous chart instance
    }

    chart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                }
            }
        }
    });
}

function updateSummary() {
    const totalIncome = parseFloat(document.getElementById('total-income').value) || 0;
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const amountLeft = totalIncome - totalExpenses;

    document.getElementById('total-expenses').textContent = `₹${totalExpenses.toFixed(2)}`;
    document.getElementById('amount-left').textContent = `₹${amountLeft.toFixed(2)}`;
}

function editExpense(id) {
    const expense = expenses.find(e => e.id === id);
    if (expense) {
        document.getElementById('description').value = expense.description;
        document.getElementById('amount').value = expense.amount;
        document.getElementById('category').value = expense.category;
        
        expenses = expenses.filter(e => e.id !== id);
        updateLocalStorage();
        renderExpenses();
        updateChart();
        updateSummary();
    }
}

function deleteExpense(id) {
    expenses = expenses.filter(e => e.id !== id);
    updateLocalStorage();
    renderExpenses();
    updateChart();
    updateSummary();
}

document.getElementById('expense-form').addEventListener('submit', addExpense);
document.getElementById('month-filter').addEventListener('change', renderExpenses);
document.getElementById('total-income').addEventListener('change', updateSummary);

renderExpenses();
updateChart();
updateSummary();


// pagination
<div id="pagination">
    <button id="prev-page">Previous</button>
    <button id="next-page">Next</button>
</div>

//filter
document.getElementById('category-filter').addEventListener('change', function () {
    const selectedCategory = this.value;
    const rows = document.querySelectorAll('#expense-list tr');

    rows.forEach(row => {
        const category = row.querySelector('td[data-label="Category"]').textContent;
        row.style.display = selectedCategory === '' || category === selectedCategory ? '' : 'none';
    });
});


//download expenses dtat
function exportToCSV() {
    const rows = Array.from(document.querySelectorAll('#expense-table tbody tr'));
    const csvContent = 'data:text/csv;charset=utf-8,'
        + rows.map(row => Array.from(row.querySelectorAll('td')).map(cell => cell.textContent).join(',')).join('\n');

    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', 'expenses.csv');
    link.click();
}
