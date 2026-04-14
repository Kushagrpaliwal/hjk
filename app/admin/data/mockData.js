// Mock data for the Admin Portal

export const dashboardStats = [
    { label: "Total Players", value: "12,845", change: "+12.5%", changeType: "up", icon: "Users" },
    { label: "Total Revenue", value: "₹8,45,200", change: "+8.2%", changeType: "up", icon: "IndianRupee" },
    { label: "Today's Deposits", value: "₹1,24,500", change: "+15.3%", changeType: "up", icon: "ArrowDownCircle" },
    { label: "Today's Withdrawals", value: "₹85,200", change: "-3.1%", changeType: "down", icon: "ArrowUpCircle" },
    { label: "Pending Deposits", value: "23", change: "+5", changeType: "up", icon: "Clock" },
    { label: "Pending Withdrawals", value: "18", change: "-2", changeType: "down", icon: "Hourglass" },
];

export const revenueData = [
    { day: "Mon", revenue: 42000 },
    { day: "Tue", revenue: 55000 },
    { day: "Wed", revenue: 38000 },
    { day: "Thu", revenue: 67000 },
    { day: "Fri", revenue: 72000 },
    { day: "Sat", revenue: 91000 },
    { day: "Sun", revenue: 85000 },
];

export const recentTransactions = [
    { id: "TXN001", player: "Rahul Sharma", type: "Deposit", amount: "₹5,000", status: "Approved", date: "2026-02-25" },
    { id: "TXN002", player: "Priya Patel", type: "Withdrawal", amount: "₹3,200", status: "Pending", date: "2026-02-25" },
    { id: "TXN003", player: "Amit Kumar", type: "Win", amount: "₹8,500", status: "Approved", date: "2026-02-25" },
    { id: "TXN004", player: "Sneha Gupta", type: "Deposit", amount: "₹2,000", status: "Approved", date: "2026-02-25" },
    { id: "TXN005", player: "Vikram Singh", type: "Loss", amount: "₹1,500", status: "Approved", date: "2026-02-24" },
    { id: "TXN006", player: "Anita Desai", type: "Withdrawal", amount: "₹7,800", status: "Rejected", date: "2026-02-24" },
    { id: "TXN007", player: "Ravi Verma", type: "Deposit", amount: "₹10,000", status: "Pending", date: "2026-02-24" },
    { id: "TXN008", player: "Meera Iyer", type: "Win", amount: "₹4,200", status: "Approved", date: "2026-02-24" },
    { id: "TXN009", player: "Karan Malhotra", type: "Deposit", amount: "₹6,000", status: "Approved", date: "2026-02-23" },
    { id: "TXN010", player: "Pooja Reddy", type: "Withdrawal", amount: "₹9,500", status: "Approved", date: "2026-02-23" },
];

export const players = [
    { id: "PLY001", name: "Rahul Sharma", email: "rahul@email.com", phone: "+91 9876543210", balance: "₹12,500", status: "Active", regDate: "2025-08-15", totalGames: 245, totalWins: 120, totalDeposits: "₹85,000", totalWithdrawals: "₹45,000" },
    { id: "PLY002", name: "Priya Patel", email: "priya@email.com", phone: "+91 9876543211", balance: "₹8,200", status: "Active", regDate: "2025-09-02", totalGames: 180, totalWins: 95, totalDeposits: "₹62,000", totalWithdrawals: "₹38,000" },
    { id: "PLY003", name: "Amit Kumar", email: "amit@email.com", phone: "+91 9876543212", balance: "₹0", status: "Suspended", regDate: "2025-07-20", totalGames: 320, totalWins: 150, totalDeposits: "₹1,20,000", totalWithdrawals: "₹95,000" },
    { id: "PLY004", name: "Sneha Gupta", email: "sneha@email.com", phone: "+91 9876543213", balance: "₹25,800", status: "Active", regDate: "2025-10-10", totalGames: 95, totalWins: 52, totalDeposits: "₹45,000", totalWithdrawals: "₹18,000" },
    { id: "PLY005", name: "Vikram Singh", email: "vikram@email.com", phone: "+91 9876543214", balance: "₹3,400", status: "Active", regDate: "2025-11-05", totalGames: 150, totalWins: 78, totalDeposits: "₹55,000", totalWithdrawals: "₹32,000" },
    { id: "PLY006", name: "Anita Desai", email: "anita@email.com", phone: "+91 9876543215", balance: "₹15,000", status: "Active", regDate: "2025-06-18", totalGames: 410, totalWins: 210, totalDeposits: "₹1,50,000", totalWithdrawals: "₹1,10,000" },
    { id: "PLY007", name: "Ravi Verma", email: "ravi@email.com", phone: "+91 9876543216", balance: "₹0", status: "Suspended", regDate: "2025-12-01", totalGames: 60, totalWins: 25, totalDeposits: "₹20,000", totalWithdrawals: "₹15,000" },
    { id: "PLY008", name: "Meera Iyer", email: "meera@email.com", phone: "+91 9876543217", balance: "₹42,100", status: "Active", regDate: "2025-05-22", totalGames: 520, totalWins: 280, totalDeposits: "₹2,00,000", totalWithdrawals: "₹1,40,000" },
    { id: "PLY009", name: "Karan Malhotra", email: "karan@email.com", phone: "+91 9876543218", balance: "₹7,600", status: "Active", regDate: "2025-09-15", totalGames: 200, totalWins: 105, totalDeposits: "₹75,000", totalWithdrawals: "₹50,000" },
    { id: "PLY010", name: "Pooja Reddy", email: "pooja@email.com", phone: "+91 9876543219", balance: "₹18,900", status: "Active", regDate: "2025-08-30", totalGames: 310, totalWins: 165, totalDeposits: "₹1,10,000", totalWithdrawals: "₹72,000" },
];

export const transactions = [
    { id: "TXN001", player: "Rahul Sharma", type: "Deposit", amount: "₹5,000", status: "Approved", date: "2026-02-25" },
    { id: "TXN002", player: "Priya Patel", type: "Withdrawal", amount: "₹3,200", status: "Pending", date: "2026-02-25" },
    { id: "TXN003", player: "Amit Kumar", type: "Win", amount: "₹8,500", status: "Approved", date: "2026-02-25" },
    { id: "TXN004", player: "Sneha Gupta", type: "Deposit", amount: "₹2,000", status: "Approved", date: "2026-02-25" },
    { id: "TXN005", player: "Vikram Singh", type: "Loss", amount: "₹1,500", status: "Approved", date: "2026-02-24" },
    { id: "TXN006", player: "Anita Desai", type: "Withdrawal", amount: "₹7,800", status: "Rejected", date: "2026-02-24" },
    { id: "TXN007", player: "Ravi Verma", type: "Deposit", amount: "₹10,000", status: "Pending", date: "2026-02-24" },
    { id: "TXN008", player: "Meera Iyer", type: "Win", amount: "₹4,200", status: "Approved", date: "2026-02-24" },
    { id: "TXN009", player: "Karan Malhotra", type: "Deposit", amount: "₹6,000", status: "Approved", date: "2026-02-23" },
    { id: "TXN010", player: "Pooja Reddy", type: "Withdrawal", amount: "₹9,500", status: "Approved", date: "2026-02-23" },
    { id: "TXN011", player: "Rahul Sharma", type: "Win", amount: "₹12,000", status: "Approved", date: "2026-02-23" },
    { id: "TXN012", player: "Sneha Gupta", type: "Loss", amount: "₹3,000", status: "Approved", date: "2026-02-22" },
    { id: "TXN013", player: "Meera Iyer", type: "Deposit", amount: "₹15,000", status: "Approved", date: "2026-02-22" },
    { id: "TXN014", player: "Vikram Singh", type: "Withdrawal", amount: "₹5,500", status: "Approved", date: "2026-02-22" },
    { id: "TXN015", player: "Karan Malhotra", type: "Win", amount: "₹7,200", status: "Approved", date: "2026-02-21" },
];

export const depositRequests = [
    { id: "DEP001", player: "Rahul Sharma", amount: "₹5,000", utr: "UTR123456789", screenshot: "/placeholder-receipt.jpg", date: "2026-02-25 14:30", status: "Pending" },
    { id: "DEP002", player: "Sneha Gupta", amount: "₹2,000", utr: "UTR987654321", screenshot: "/placeholder-receipt.jpg", date: "2026-02-25 13:15", status: "Pending" },
    { id: "DEP003", player: "Ravi Verma", amount: "₹10,000", utr: "UTR456789123", screenshot: "/placeholder-receipt.jpg", date: "2026-02-24 18:45", status: "Pending" },
    { id: "DEP004", player: "Karan Malhotra", amount: "₹6,000", utr: "UTR789123456", screenshot: "/placeholder-receipt.jpg", date: "2026-02-24 11:20", status: "Approved" },
    { id: "DEP005", player: "Meera Iyer", amount: "₹15,000", utr: "UTR321654987", screenshot: "/placeholder-receipt.jpg", date: "2026-02-23 09:00", status: "Approved" },
    { id: "DEP006", player: "Pooja Reddy", amount: "₹3,500", utr: "UTR654321789", screenshot: "/placeholder-receipt.jpg", date: "2026-02-23 16:30", status: "Rejected" },
];

export const withdrawalRequests = [
    { id: "WTH001", player: "Priya Patel", amount: "₹3,200", upiId: "priya@upi", date: "2026-02-25 10:30", status: "Pending" },
    { id: "WTH002", player: "Anita Desai", amount: "₹7,800", upiId: "anita@upi", date: "2026-02-24 15:00", status: "Pending" },
    { id: "WTH003", player: "Pooja Reddy", amount: "₹9,500", upiId: "pooja@upi", date: "2026-02-24 12:45", status: "Pending" },
    { id: "WTH004", player: "Vikram Singh", amount: "₹5,500", upiId: "vikram@upi", date: "2026-02-23 08:20", status: "Approved" },
    { id: "WTH005", player: "Rahul Sharma", amount: "₹4,000", upiId: "rahul@upi", date: "2026-02-22 17:10", status: "Approved" },
    { id: "WTH006", player: "Amit Kumar", amount: "₹2,500", upiId: "amit@upi", date: "2026-02-22 14:30", status: "Rejected" },
];

export const gameHistory = [
    { id: "GAME001", players: "Rahul vs Priya", entryFee: "₹500", winner: "Rahul Sharma", prize: "₹900", duration: "12 min", status: "Completed", date: "2026-02-25 14:00" },
    { id: "GAME002", players: "Amit vs Sneha", entryFee: "₹1,000", winner: "Sneha Gupta", prize: "₹1,800", duration: "8 min", status: "Completed", date: "2026-02-25 13:30" },
    { id: "GAME003", players: "Vikram vs Anita", entryFee: "₹200", winner: "Vikram Singh", prize: "₹360", duration: "15 min", status: "Completed", date: "2026-02-25 12:00" },
    { id: "GAME004", players: "Ravi vs Meera", entryFee: "₹500", winner: "-", prize: "-", duration: "5 min", status: "In Progress", date: "2026-02-25 15:00" },
    { id: "GAME005", players: "Karan vs Pooja", entryFee: "₹2,000", winner: "Karan Malhotra", prize: "₹3,600", duration: "20 min", status: "Completed", date: "2026-02-24 18:00" },
    { id: "GAME006", players: "Rahul vs Amit", entryFee: "₹500", winner: "Rahul Sharma", prize: "₹900", duration: "10 min", status: "Completed", date: "2026-02-24 16:30" },
    { id: "GAME007", players: "Sneha vs Vikram", entryFee: "₹1,000", winner: "-", prize: "-", duration: "-", status: "Cancelled", date: "2026-02-24 14:00" },
    { id: "GAME008", players: "Anita vs Meera", entryFee: "₹500", winner: "Meera Iyer", prize: "₹900", duration: "18 min", status: "Completed", date: "2026-02-23 20:00" },
    { id: "GAME009", players: "Pooja vs Ravi", entryFee: "₹200", winner: "Pooja Reddy", prize: "₹360", duration: "7 min", status: "Completed", date: "2026-02-23 15:30" },
    { id: "GAME010", players: "Karan vs Rahul", entryFee: "₹5,000", winner: "Rahul Sharma", prize: "₹9,000", duration: "25 min", status: "Completed", date: "2026-02-23 12:00" },
];
