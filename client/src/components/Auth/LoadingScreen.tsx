function LoadingScreen() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-sky-100 to-white flex items-center justify-center">
            <div className="bg-white rounded-xl border p-6 shadow-sm">
                <p className="text-sm text-gray-600">Loading...</p>
            </div>
        </div>
    );
}

export default LoadingScreen;