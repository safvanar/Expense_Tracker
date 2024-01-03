const myForm = document.getElementById('addForm')
const expList = document.getElementById('expense-list')
const premiumDiv = document.getElementById('premiumDiv')
const premiumBtn = document.getElementById('premiumBtn')
const premiumContainer = document.getElementById('premiumContainer')

myForm.addEventListener('submit', addExpense)
expList.addEventListener('click', addOrDeleteExpense)
document.addEventListener('DOMContentLoaded', domLoad)
premiumBtn.addEventListener('click', activateSubscription)

function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

// Define a variable to keep track of the current page
let currentPage = 1;

// Define the number of items to display per page
let itemsPerPage = 5;

async function domLoad(){
    try{
            const rows = localStorage.getItem('rowsPerPage')
            if(rows){
                itemsPerPage = rows
            }
            premiumContainer.style.display = 'none'
            // let total = 0
            const token = localStorage.getItem('token')

            // const userStatus = await axios.get(`/user/getStatus`, {headers: {'Authorization': token}})
            if(parseJwt(token).isPremiumUser){
                premiumBtn.style.display = 'none'
                premiumDiv.innerHTML = `<h2 style="color: gold;">You Are a premium user!</h2>
                                        <button class="btn btn-dark" style="color: gold;" onclick = "showLeaderboard()">Leaderboad</button>
                                        <button class="btn btn-dark" style="color: gold;" onclick = "downloadReport()">Expense Report</button>`
                const fileResponse = await axios.get('/premium/getDownloadedFiles', {headers: {'Authorization': token}})
                const downloadedFiles = fileResponse.data.downloadedFiles
                premiumContainer.innerHTML= '<h2>Downloaded Files</h2>'
                let count = 1
                let newFileList = document.createElement('ul')
                newFileList.classList.add('list-group')
                downloadedFiles.forEach((file) => {
                    let newFile = document.createElement('li')
                    newFile.classList.add('list-group-item')
                    newFile.innerHTML = `<a href="${file.fileUrl}">File${count}</a>`
                    newFileList.appendChild(newFile)
                    count+=1
                })
                premiumContainer.appendChild(newFileList)
                premiumContainer.style.display='block'
            }

            console.log(token)
            const response = await axios.get(`/expense/get-expenses?page=${currentPage}&pageSize=${itemsPerPage}` , {headers: {'Authorization': token}})
            const data = response.data
            const expenses = data.expenses
            document.getElementById('expense-btn').value = "Add expense"
            //clear existing list
            expList.innerHTML = ''

            expenses.forEach(expense => {
                // total += expense.amount
                let newExpense=document.createElement('li')
                newExpense.className="list-group-item"
                newExpense.innerHTML=`${expense.title}::<b style="color: red;">${expense.amount}</b>::${expense.category}`

                //Creating a delete button for each expense items

                let delBtn=document.createElement('button')
                delBtn.innerText="Delete"
                delBtn.className="btn btn-danger btn-sm float-right delete"
                delBtn.id = expense.id

                //Creating an edit button for each expense items

                let edBtn=document.createElement('button')
                edBtn.innerText="Edit"
                edBtn.className="btn btn-success btn-sm float-right edit"
                edBtn.id = expense.id
                    
                //appending buttons to the newly created expense item and adding whole item with buttons to the list

                newExpense.appendChild(delBtn)
                newExpense.appendChild(edBtn)
                expList.appendChild(newExpense)
                myForm.reset()
            })

            let total = await axios.get('/user/totalExpense', {headers: {'Authorization': token}})

            // Display pagination information
            expList.innerHTML += `<div class="pagination mt-2 d-flex align-items-center">
                                    <label for="rowsPerPage">Rows Per Page:</label>
                                    <select id="rowsPerPage" onchange="updateRowsPerPage()" class="dropdown ml-2">
                                        <option value="5" ${itemsPerPage === 5 ? 'selected' : ''}>5</option>
                                        <option value="10" ${itemsPerPage === 10 ? 'selected' : ''}>10</option>
                                        <option value="15" ${itemsPerPage === 15 ? 'selected' : ''}>15</option>
                                        <!-- Add more options as needed -->
                                    </select>
                                    <button class="btn btn-warning ml-2" onclick="loadPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>
                                    <button class="btn btn-success ml-2" disabled>Page-${currentPage}</button>
                                    <button class="btn btn-warning ml-2" onclick="loadPage(${currentPage + 1})" ${expenses.length < itemsPerPage || expenses.length === 0 ? 'disabled' : ''}>Next</button>
                                 </div>`;

            expList.innerHTML += `<div class="mt-2 bg-dark">
                                    <h2 style="color: white;">Total Expense: <b style="color: red;">${total.data.total}</b></h2>
                                  </div>`
            
    }catch(err){
        console.log(err)
        premiumContainer.innerHTML = err
    }
}

function updateRowsPerPage() {
    const dropdown = document.getElementById('rowsPerPage');
    itemsPerPage = parseInt(dropdown.value, 10);
    localStorage.setItem('rowsPerPage', itemsPerPage)
    loadPage(currentPage); // Reload the current page with the new items per page
  }

// Function to load a specific page
async function loadPage(page) {
    if (page >= 1) {
        currentPage = page;
        await domLoad();
    }
}


function addExpense(e){
    e.preventDefault()
    const token = localStorage.getItem('token')
    const data ={
        expenseAmount: document.getElementById('expense').value,
        expenseTitle: document.getElementById('desc').value,
        expenseCategory: document.getElementById('category').value
    }

    if(document.getElementById('expense-btn').value === 'Add expense'){
        axios.post('/expense/add-expense', data, {headers: {'Authorization': token}})
        .then(response => {
            domLoad();
        })
        .catch(err => {
            console.log(err.message)
            domLoad();
        })
    }else{
        data['expId'] = localStorage.getItem('itemToEdit')
        axios.put(`/expense/edit-expense`, data, {headers: {'Authorization': token}})
        .then(response => {
            console.log(response.data)
            domLoad();
        })
        .catch(err => {
            console.log(err)
        })
    }
    
}

async function addOrDeleteExpense(e){

    try{
        const token = localStorage.getItem('token')
        e.preventDefault()
        const expId = e.target.id
        if(e.target.classList.contains('delete')){
            console.log(expId)
            await axios.delete(`/expense/delete-expense/${expId}`, {headers: {'Authorization': token}})
            domLoad()
        }else if(e.target.classList.contains('edit')){
            const editItem = await axios.get(`/expense/get-expense/${expId}`, {headers: {'Authorization': token}})
            
            document.getElementById('expense').value = editItem.data.expense.amount
            document.getElementById('desc').value = editItem.data.expense.title
            document.getElementById('category').value = editItem.data.expense.category
            document.getElementById('expense-btn').value = "Edit Expense"
            localStorage.setItem('itemToEdit', expId)
                        
            e.target.parentElement.remove()
        }
    }catch(err){
        console.log(err)
    }
    
}

async function activateSubscription(e){
    try{
        e.preventDefault()
        const token = localStorage.getItem('token')
        // console.log(token)
        const response = await axios.get('/purchase/premiumMembership', {headers: {'Authorization': token}})
        // console.log(response)
        var options = {
            "key": response.data.key_id,
            "order_id": response.data.order.id,
            "handler": async function(response){
                try{
                    const subscription = await axios.post('/purchase/updateTransactionStatus', {
                        order_id: options.order_id,
                        payment_id: response.razorpay_payment_id
                    }, {headers: {'Authorization': token}})
                    localStorage.setItem('token', subscription.data.token)
                    alert('You are a premium user now!')
                    domLoad()
                }catch(err){
                    console.log(err)
                }
            }
        }

        const rzp = new Razorpay(options)
        rzp.open()

        rzp.on('payment.failed', async function(response){
            try{
                await axios.post('/purchase/updateFailedTransactionStatus', {
                    order_id: options.order_id,
                    payment_id: 'failed'
                }, {headers: {'Authorization': token}})
                alert('Payment failed!')
            }catch(err){
                console.log(err)
            }
        })
    }catch(err){
        console.log(err)
    }
    
}

async function showLeaderboard(){
    try{
        domLoad()
        const token = localStorage.getItem('token')
        const response = await axios.get('/premium/showLeaderBoard', {headers: {'Authorization': token}})
        const users = response.data.users
        console.log(users)

        premiumContainer.innerHTML =  `
                                        <div class="container">
                                            <h2 class="card-header bg-success text-white">Leader Board</h2>
                                            <table id="leaderboardTable" class="table table-striped">
                                                <thead>
                                                    <tr>
                                                        <th>Name</th>
                                                        <th>Total Spending</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    ${users.map(user => `
                                                        <tr>
                                                            <td>${user.name}</td>
                                                            <td style="color: green;">${user.totalSpending}</td>
                                                        </tr>
                                                    `).join('')}
                                                </tbody>
                                            </table>
                                        </div>`
        
        premiumContainer.style.display = 'block'
        
    }catch(err){
        console.log(err)
    }
}

async function downloadReport(){
    try{
        const token = localStorage.getItem('token')
        const response = await axios.get('/premium/get-report', {headers: {'Authorization': token}})
        if(response.status === 200){
            const a = document.createElement('a')
            a.href = response.data.fileUrl
            a.download = 'myexpenses.csv'
            a.click()
        }else{
            throw new Error(response.data.message)
        }
        
        
        // premiumContainer.innerHTML=`<div class="container">
        //                                 <h2 class="card-header bg-success text-white">Expense Report</h2>
        //                                 <table id="reportTable" class="table table-striped">
        //                                     <thead>
        //                                         <tr>
        //                                             <th>Date</th>
        //                                             <th>Category</th>
        //                                         </tr>
        //                                     </thead>
        //                                     <tbody>
        //                                         <!-- Table rows will be dynamically added here -->
        //                                     </tbody>
        //                                 </table>
        //                             </div>`
        
        // premiumContainer.style.display = 'block'

    }catch(err){
        console.log(err)
        premiumContainer.innerHTML=err
    }
}



