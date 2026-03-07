type AuthMode = 'login' | 'register';

type AuthScreenProps = {
    mode: AuthMode;
    username: string;
    password: string;
    authError: string;
    isSubmitting: boolean;
    onUsernameChange: (value: string) => void;
    onPasswordChange: (value: string) => void;
    onSubmit: () => void;
    onModeChange: (mode: AuthMode) => void;
};

function AuthScreen({
    mode,
    username,
    password,
    authError,
    isSubmitting,
    onUsernameChange,
    onPasswordChange,
    onSubmit,
    onModeChange,
}: AuthScreenProps) {
    const isLogin = mode === 'login';

    return (
        <div className="min-h-screen bg-gradient-to-b from-sky-100 to-white flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border p-6 w-full max-w-sm shadow-sm space-y-4">
                <div>
                    <h1 className="text-2xl font-bold">TsukiPad</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        {isLogin ? 'Login to continue' : 'Create an account to continue'}
                    </p>
                </div>

                <div className="flex rounded-lg border overflow-hidden">
                    <button
                        onClick={() => onModeChange('login')}
                        className={`flex-1 px-3 py-2 text-sm ${isLogin ? 'bg-sky-500 text-white' : 'bg-white text-gray-700'
                            }`}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => onModeChange('register')}
                        className={`flex-1 px-3 py-2 text-sm ${!isLogin ? 'bg-sky-500 text-white' : 'bg-white text-gray-700'
                            }`}
                    >
                        Create Account
                    </button>
                </div>

                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => onUsernameChange(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => onPasswordChange(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                />

                {!isLogin && (
                    <p className="text-xs text-gray-500">
                        Username must be at least 5 characters. Password must be at least 6 characters. :DDD dw ur password is hashed
                    </p>
                )}

                {authError && (
                    <p className="text-sm text-red-500">{authError}</p>
                )}

                <button
                    onClick={onSubmit}
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 rounded-lg bg-sky-500 text-white text-sm hover:bg-sky-600 disabled:opacity-50"
                >
                    {isSubmitting
                        ? isLogin
                            ? 'Logging in...'
                            : 'Creating account...'
                        : isLogin
                            ? 'Login'
                            : 'Create Account'}
                </button>
            </div>
        </div>
    );
}

export default AuthScreen;