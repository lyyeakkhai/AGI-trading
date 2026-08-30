export default function OverviewPage() {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Portfolio Overview</h1>
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-800 p-4 rounded shadow">
                    <div className="text-gray-400">Total Balance</div>
                    <div className="text-2xl font-bold">$10,000.00</div>
                </div>
                <div className="bg-gray-800 p-4 rounded shadow">
                    <div className="text-gray-400">Open Positions</div>
                    <div className="text-2xl font-bold">2</div>
                </div>
                <div className="bg-gray-800 p-4 rounded shadow">
                    <div className="text-gray-400">System Health</div>
                    <div className="text-2xl font-bold text-green-500">Healthy</div>
                </div>
            </div>
        </div>
    );
}
