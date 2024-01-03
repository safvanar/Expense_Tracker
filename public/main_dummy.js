const myForm=document.getElementById('addForm')
const expList=document.getElementById('expense-list')
myForm.addEventListener('submit', addExpense)

document.addEventListener('DOMContentLoaded', domLoad)

function domLoad(){
    let total = 0
    axios.get('/expense/get-expenses')
        .then(response => {
            const data = response.data
            const expenses = data.expenses
            document.getElementById('expense-btn').value = "Add expense"
            //clear existing list
            expList.innerHTML = ''

            expenses.forEach(expense => {
                total += expense.amount
                let newExpense=document.createElement('li')
                newExpense.className="list-group-item"
                newExpense.innerHTML=`${expense.title}::<b style="color: red;">${expense.amount}</b>::${expense.category}`
                let delBtn=document.createElement('button')
                delBtn.innerText="Delete"
                delBtn.className="btn btn-danger btn-sm float-right delete"
                delBtn.id = expense.id

                function removeExpense(event){
                    const expId = expense.id
                    console.log(expId)
                    axios.delete(`/expense/delete-expense/${expId}`)
                        .then(result => {
                            domLoad()
                        })
                        .catch(err => {
                            console.log(err)
                        })
                }

                let edBtn=document.createElement('button')
                edBtn.innerText="Edit"
                edBtn.className="btn btn-success btn-sm float-right"
                edBtn.addEventListener('click',editExpense)

                function editExpense(event){
                    const expId = expense.id

                    document.getElementById('expense').value = expense.amount
                    document.getElementById('desc').value = expense.title
                    document.getElementById('expense-btn').value = "Edit Expense"
                    localStorage.setItem('itemToEdit', expId)
                    
                    axios.get(`/expense/edit-expenses/${expId}`)
                        .then(response => {
                          expList.removeChild(newExpense)
                        })
                        .catch(err => {
                            console.log(err)
                        })
            }

            newExpense.appendChild(delBtn)
            newExpense.appendChild(edBtn)
            expList.appendChild(newExpense)
            myForm.reset()
        })
        expList.innerHTML += `<h2>Total Expense: <b style="color: red;">${total}</b></h2>`
    })
    .catch(err => {
        console.log(err)
    })
}

function addExpense(e){
    e.preventDefault()

    const data ={
        userId: localStorage.getItem('userId'),
        expenseAmount: document.getElementById('expense').value,
        expenseTitle: document.getElementById('desc').value,
        expenseCategory: document.getElementById('category').value
    }

    if(document.getElementById('expense-btn').value === 'Add expense'){
        axios.post('/expense/add-expense', data)
        .then(response => {
            console.log(response)
            domLoad();
        })
        .catch(err => {
            console.log(err)
        })
    }else{
        data[expId] = localStorage.getItem('itemToEdit')
        axios.put(`/expense/edit-expense`, data)
        .then(response => {
            console.log(response.data)
            domLoad();
        })
        .catch(err => {
            console.log(err)
        })
    }
    
}

