import TokenContext from "../accessContext/tokenContext";
import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import './dashboard.css';
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import AppShell from "./AppShell";

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale
);

function Dashboard() {
    const navigate = useNavigate();
    const { accesstoken, setAccess } = useContext(TokenContext);
    const [skeletonEnabler, setEnabler] = useState(false);
    const [email, setEmail] = useState('');
    const [info, setinfo] = useState({});
    const [balance, setbalance] = useState(0);
    const [income, setIncome] = useState(0);
    const [expense, setExpense] = useState(0);
    const [recentIncome, setrecentIncome] = useState([]);
    const [recentExpense, setrecentExpense] = useState([]);
    const [healthcare, sethealthcare] = useState(0);
    const [Entertainment, setentertainment] = useState(0);
    const [shopping, setshopping] = useState(0);
    const [food, setfood] = useState(0);
    const [others, setothers] = useState(0);
    const [transport, settransport] = useState(0);
    const [utils, setutils] = useState(0);

    const data = {
        labels: ['Balance', 'Expenses', 'Income'],
        datasets: [{
            label: 'amount',
            data: [balance || 0, expense || 0, income || 0],
            backgroundColor: ["#16a34a", "#ef4444", "#f59e0b"],
            borderColor: ["#16a34a", "#ef4444", "#f59e0b"],
            borderWidth: 2,
        }]
    };
    const options = {
        plugins: {
            legend: {
                labels: {
                    usePointStyle: true,
                    pointStyle: 'circle',
                    boxWidth: 8,
                    padding: 16,
                    font: { family: 'Roboto', size: 12 }
                }
            }
        },
        cutout: '68%',
    };

    const catLabels = ['Healthcare', 'Food', 'Transport', 'Utilities', 'Entertainment', 'Others', 'Shopping'];
    const catValues = [healthcare, food, transport, utils, Entertainment, others, shopping].map(v => Number(v) || 0);

    const barData = {
        labels: catLabels.map(l => l.slice(0, 3).toUpperCase()),
        datasets: [{
            data: catValues,
            backgroundColor: '#16a34a',
            hoverBackgroundColor: '#15803d',
            borderRadius: 7,
            barThickness: 26,
        }]
    };
    const barOptions = {
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { display: false }, ticks: { font: { family: 'Roboto', size: 10 }, color: '#667085' } },
            y: { beginAtZero: true, grid: { color: '#eef1ef' }, ticks: { font: { family: 'Roboto', size: 10 }, color: '#667085' } }
        },
        maintainAspectRatio: false,
    };

    useEffect(() => {
        const API = axios.create({
            withCredentials: true,
            baseURL: 'https://login-backend-izl3.onrender.com'
        });

        // request interceptor
        API.interceptors.request.use(function (config) {
            setEnabler(true);
            return config
        }, (err) => {
            setEnabler(false);
            return Promise.reject(err);
        }
        )

        API.interceptors.response.use(function (response) {
            if (response.data?.email) {
                setEmail(response.data.email);
            }
            if (response.data?.accessToken) {
                setAccess(response.data.accessToken);
            }
            return response;
        }), (error) => {
            setEnabler(false);
            if (error.response.status === 400) {
                alert('you do not exist')// message div
            }
            else if (error.response.status === 401) {
                localStorage.removeItem('email');
                navigate('/');
            }
            else if (error.response.status === 500) {
                alert('server error please');//message div
                navigate('/');
            }
        }

        API.get('/refresh/jwt', { withCredentials: true });

    }, [])

    const getInfo = async () => {
        try {
            const res = await axios.get("https://login-backend-izl3.onrender.com/dashboard/info",
                {
                    headers: {
                        Authorization: `<Bearer> ${accesstoken}`
                    }
                }
            )

            if (res.status === 200) {
                setinfo(res.data?.dashboard);
            }
        } catch (err) {
            if (err.response?.status === 401) {
                let newToken
                const res = await axios.get('https://login-backend-izl3.onrender.com/refresh/jwt',
                    {
                        withCredentials: true
                    }
                );
                if (res) {
                    newToken = res.data?.accessToken;
                    setAccess(res.data?.accessToken);
                }
                err.config.headers.Authorization = `<Bearer> ${newToken}`
                const refrshReq = await axios(err.config);
                if (refrshReq.status === 200) {
                }
                else if (refrshReq.status === 401) {
                    localStorage.removeItem('email');
                    navigate('/');
                }
            }
        }
    }

    useEffect(() => {
        getInfo();
        setTimeout(() => {
            setEnabler(false);
        }, 2000)
    }, [accesstoken]);

    useEffect(() => {
        setbalance(info?.Balance);
        setIncome(info?.TotalIncome);
        setExpense(info?.TotalExpense);
        setrecentIncome(info?.recentIncome);
        setrecentExpense(info?.recentExpense);
        setentertainment(info?.Entertainment);
        setfood(info?.Food);
        sethealthcare(info?.Healthcare);
        setothers(info?.Others);
        setutils(info?.Utilities);
        setshopping(info?.Shopping);
        settransport(info?.Transportation);
    }, [info])

    // ---- derived display data (read-only) ----
    const displayName = email
        ? email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
        : '';

    const now = new Date();
    const fmtDay = (d) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const monthRange = `${fmtDay(new Date(now.getFullYear(), now.getMonth(), 1))} - ${fmtDay(new Date(now.getFullYear(), now.getMonth() + 1, 0))}`;

    const recentTx = [
        ...(recentIncome || []).map(t => ({ ...t, _key: `i-${t._id}`, kind: 'income', name: t.Source })),
        ...(recentExpense || []).map(t => ({ ...t, _key: `e-${t._id}`, kind: 'expense', name: t.Category })),
    ].slice(0, 6);

    const topCats = catLabels
        .map((label, i) => ({ label, value: catValues[i] }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

    const stat = (v) => skeletonEnabler ? <Skeleton width={110} /> : `$${Number(v || 0).toFixed(2)}`;

    return (
        <AppShell>
            <div className="dash-head">
                <h1 className="dash-title">Welcome Back{displayName ? `, ${displayName}` : ''}</h1>
                <div className="dash-head-actions">
                    <span className="date-pill">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z" /></svg>
                        {monthRange}
                    </span>
                    <Link to="/expensepage" className="btn-green">+ Add Expense</Link>
                </div>
            </div>

            <div className="dash-grid-3">
                <div className="bal-card">
                    <div className="bal-top">
                        <span className="bal-label">Total Balance</span>
                        <span className="bal-chip">VISA</span>
                    </div>
                    <div className="bal-amount">{stat(balance)}</div>
                    <div className="bal-foot">
                        <span className="bal-num">**** ****</span>
                        <span className="bal-exp">TRACKER</span>
                    </div>
                </div>

                <div className="card">
                    <div className="card-head">
                        <h3>Spending by Category</h3>
                    </div>
                    <div className="chart-box">
                        {skeletonEnabler ? <Skeleton height={190} /> : <Bar data={barData} options={barOptions} />}
                    </div>
                </div>

                <div className="card">
                    <div className="card-head">
                        <h3>Income vs Expenses</h3>
                    </div>
                    <div className="chart-box chart-box-sm">
                        {skeletonEnabler ? <Skeleton height={170} /> : <Doughnut data={data} options={options} />}
                    </div>
                    <div className="dash-cta-row">
                        <Link to="/incomepage" className="btn-green btn-sm">Add Income</Link>
                        <Link to="/expensepage" className="btn-outline btn-sm">Add Expense</Link>
                    </div>
                </div>
            </div>

            <div className="dash-grid-2">
                <div className="card">
                    <div className="card-head">
                        <h3>Recent Transactions</h3>
                        <span className="muted">{recentTx.length} latest</span>
                    </div>
                    <div className="tbl-wrap">
                        <table className="tbl">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentTx.length > 0 ? recentTx.map((t) => (
                                    <tr key={t._key}>
                                        <td><strong>{t.name}</strong></td>
                                        <td className="muted">{t.Date}</td>
                                        <td><span className="badge badge-green">Successful</span></td>
                                        <td className={`tx-amount ${t.kind === 'income' ? 'tx-in' : 'tx-out'}`}>
                                            {t.kind === 'income' ? `+$${t.Amount}` : `-$${t.Amount}`}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={4}><div className="empty-state">No transactions yet</div></td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="card">
                    <div className="card-head">
                        <h3>Top Categories</h3>
                    </div>
                    <div className="cat-list">
                        {topCats.map((c) => (
                            <div className="cat-row" key={c.label}>
                                <div className="cat-meta">
                                    <span className="cat-name">{c.label}</span>
                                    <span className="cat-pct">{Number(c.value || 0).toFixed(0)}%</span>
                                </div>
                                <div className="cat-bar">
                                    <div className="cat-fill" style={{ width: `${Number(c.value || 0).toFixed(0)}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AppShell>
    )
}

export default Dashboard
