import axios from "axios"

export function ExpenseTableData({ page, accesstoken, setmessage, delEntry }){
const del = async(id) => {
const config = {
    params: {
        id: id
    },
     headers:{
            Authorization:`<Bearer> ${accesstoken}`
        }
    
}
try{
const res = await axios.post("https://login-backend-izl3.onrender.com/delete/expense", null , config);
if (res.status === 200){
    delEntry(id);
    setmessage(res.data?.message);
}

}catch(err){
    if(err.response?.status === 404){
        console.log(err);
    }
    if(err.response?.status === 500){
        setmessage("internal server error");
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
      if (refrshReq.status === 200){
        delEntry(id);
      }
      else if(refrshReq.status === 401){
        localStorage.removeItem('email');
        navigate('/');
      }
    }
}
    }



    return(
page.map((entry, i)=>{
    return(
        <tr key={entry._id}>
    <td>{entry.Date}</td>
    <td>{entry.Description}</td>
    <td><span className="expense-category category-food">{entry.Category}</span></td>
    <td className="expense-amount">-{entry.Amount}</td>
    <td>
        <div className="expense-actions">
            <button className="row-action" title="Delete expense" onClick={()=>{del(entry._id)}}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                Delete
            </button>
        </div>
    </td>
</tr>
    )
})
    )
}


