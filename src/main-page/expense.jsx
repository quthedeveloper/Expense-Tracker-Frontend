import './expense.css';
import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import TokenContext from '../accessContext/tokenContext';
import { MessageDiv } from '../UI extras/expenseMessage-div';
import { useNavigate } from 'react-router-dom';
import { ExpenseTableData } from './ExpenseTableData';
import AppShell from './AppShell';

//expense page delete functionality
export function ExpensePage(){
    const navigate = useNavigate();
    const {accesstoken, setAccess} = useContext(TokenContext);
    const [expense, setExpense] = useState({
        date:"",
        description:"",
        category: "",
        amount: 0
    });
    const [message, setmessage] = useState("");
    const [show, setShow] = useState(false);
    const[sendNum, setNum] = useState(1);
    const[limit, setLimit] = useState(10);
    const [page, setPage] = useState([]);
    const [pageNum, setPageNum] = useState([]);
    const[total, setTotal] = useState(JSON.parse(localStorage.getItem('total')) || 0);
    const [isDisabled, setDisabled] = useState(true);
    const [selectedNum, setSelectedNum] = useState(1);

    const OnMountRefresh = async() => {
         let newToken
     try{
         const res = await axios.get('https://login-backend-izl3.onrender.com/refresh/jwt',
        {
            withCredentials: true
        }
    );
    if(res){
         newToken = res.data?.accessToken;
        setAccess(res.data?.accessToken);
    }

    if(newToken){
         const config = {
            params: {
            page: 1,
            limit: limit
        },
        headers:{
            Authorization:`<Bearer> ${newToken}`
        }
        }
        const res = await axios.get("https://login-backend-izl3.onrender.com/get/expense", config)
        setPage(res.data?.Entries)
        setPageNum(res.data?.totalEntries);
    }
     }catch(err){
           if(err.response?.status === 401){
            localStorage.removeItem('email');
                navigate('/');
            }
            if(err.response?.status === 500){
                userMessage("server is down");
            }
            if(err.response?.status === 400){
                userMessage('something is wrong')
                navigate('/')
            }

}  
    }
    


useEffect(()=>{
    OnMountRefresh();
},[])


const setsource = (event) => {
setExpense({
    ...expense,
    [event.target.name]:event.target.value
})
}

const send = async() =>{
     const config = {
            params: {
            page: sendNum,
            limit: limit
        },
        headers:{
            Authorization:`<Bearer> ${accesstoken}`
        }
        }
        try{
        const res = await axios.get("https://login-backend-izl3.onrender.com/get/expense", config)
        setPage(res.data?.Entries)
        setPageNum(res.data?.totalEntries);
        setTotal(res.data?.TotalDocs);
        }
        catch(err){
        if(err.response?.status === 401){
     let newToken
     const res = await axios.get('https://login-backend-izl3.onrender.com/refresh/jwt',
        {
            withCredentials: true
        }
    );
    if(res){
         newToken = res.data?.accessToken;
        setAccess(res.data?.accessToken);
    }
      err.config.headers.Authorization = `<Bearer> ${newToken}`
      const refrshReq = await axios(err.config);        
      if (refrshReq.status === 201){
        userMessage(refrshReq.data?.message)
      }
      else if(refrshReq.status === 401){
        localStorage.removeItem('email');
        navigate('/');
      }
    }
        }  
}


 useEffect(()=>{
  send();
 }, [sendNum])

 useEffect(()=>{
    localStorage.setItem('total', JSON.stringify(total));
 }, [total])

const userMessage = (message) =>{
  setmessage(message);
        setShow(true);
         setTimeout(()=> {
            setShow(false);
        }, 3000)
}

const addExpense = async(e) => {
e.preventDefault();
let obj = {...expense}
   const newAmount = Number(obj.amount);
   obj.amount = newAmount;
   const expenseRoute = 'https://login-backend-izl3.onrender.com/add/expense';
   const authheader = `<Bearer> ${accesstoken}`;

try{
const res = await axios.post(expenseRoute, obj, {
    headers: {
        Authorization: authheader
    }
})

if(res.status === 201){
userMessage(res.data?.message);
send();
}
}catch(err){
    if(err.response?.status === 400){
        userMessage("insufficient Funds");
    }
    if(err.response?.status === 403){
        userMessage(err.response?.message);
    }
    if(err.response?.status === 500){
        userMessage("server is Down");
    }
    if(err.response?.status === 401){
     let newToken
     const res = await axios.get('https://login-backend-izl3.onrender.com/refresh/jwt',
        {
            withCredentials: true
        }
    );
    if(res){
         newToken = res.data?.accessToken;
        setAccess(res.data?.accessToken);
    }
      err.config.headers.Authorization = `<Bearer> ${newToken}`
      const refrshReq = await axios(err.config);        
      if (refrshReq.status === 201){
        userMessage(refrshReq.data?.message)
      }
      else if(refrshReq.status === 401){
        localStorage.removeItem('email');
        navigate('/');
      }
    }
   }
}




const clear = () => {
    const obj = 
       { 
        date:"",
        description:"",
        category: "",
        amount: 0
       }
    setExpense(prev => {
        return obj
    })
}

const changePage = async(key) => {
const page = key;
if(key > 1){
    setDisabled(false);
}
else{
   setDisabled(true); 
}
setNum(page);
setSelectedNum(page);
}

const nextPage = () => {
let next = sendNum + 1;
setDisabled(false);
if(!pageNum.includes(next)){
    next = 1;
    setDisabled(true);
}
setNum(next);
setSelectedNum(next);
}

const previousPage = () => {
    let previous = sendNum - 1
    if(!pageNum.includes(previous) || previous === 1){
        setDisabled(true);
    }
    setNum(previous);
    setSelectedNum(previous);
}

const delEntry = (id) => {
const newPages = page.filter((entry,_)=>{
    return entry._id !== id
})
setPage(newPages);
setTotal(t => {
    return t - 1
})
}

    return (
        <AppShell>
            <MessageDiv Message={message} show={show} />
            <div className="page-head">
                <h1>Expenses</h1>
                <p>Track and manage your spending</p>
            </div>

            <div className="card">
                <div className="card-head"><h3>Add Expense</h3></div>
                <form>
                    <div className="form-grid">
                        <div className="field">
                            <label>Description</label>
                            <input type="text" name="description" placeholder="Enter expense description" onChange={setsource} required />
                        </div>
                        <div className="field">
                            <label>Amount</label>
                            <input type="number" placeholder="0.00" step="0.01" name='amount' onChange={setsource} required />
                        </div>
                        <div className="field">
                            <label>Category</label>
                            <select name='category' onChange={setsource} required>
                                <option value="select your option">select your option</option>
                                <option value="Food & Dinning">Food & Dining</option>
                                <option value="Transportation">Transportation</option>
                                <option value="Utilities">Utilities</option>
                                <option value="Entertainment">Entertainment</option>
                                <option value="Shopping">Shopping</option>
                                <option value="Healthcare">Healthcare</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="field">
                            <label>Date</label>
                            <input type="date" name='date' onChange={setsource} required />
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="btn-green" onClick={addExpense}>Add Expense</button>
                        <button type="reset" className="btn-outline" onClick={clear}>Clear</button>
                    </div>
                </form>
            </div>

            <div className="card">
                <div className="card-head">
                    <h3>Expense History</h3>
                    <span className="muted">{`Showing 1 to ${page.length} of ${total} entries`}</span>
                </div>
                <div className="tbl-wrap">
                    <table className="tbl">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Category</th>
                                <th>Amount</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {page.length > 0 ? <ExpenseTableData
                                page={page}
                                delEntry={delEntry}
                                accesstoken={accesstoken}
                                setAccess={setAccess}
                                setmessage={userMessage}
                            />
                                :
                                <tr><td colSpan={5}><div className="empty-state">No entries available</div></td></tr>}
                        </tbody>
                    </table>
                </div>

                <div className="pagination">
                    <button className="page-btn" disabled={isDisabled} onClick={previousPage}>Previous</button>
                    {pageNum.map((num, _) => (
                        <button
                            className={`page-btn${selectedNum === num ? ' active' : ''}`}
                            key={num}
                            onClick={() => { changePage(num) }}
                        >{num}</button>
                    ))}
                    <button className="page-btn" onClick={nextPage}>Next</button>
                </div>
            </div>
        </AppShell>
    )
}

