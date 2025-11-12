import React, { useState } from 'react';

// Define the props the Login component will accept
interface LoginProps {
  onLogin: (password: string) => Promise<void>;
  loginError: string;
}

export const Login: React.FC<LoginProps> = ({ onLogin, loginError }) => {
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password) {
      onLogin(password);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-md">
        <div className="text-center">
            <img src="/logo_RPCC.png" alt="RPCC Logo" className="w-43 h-24 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">
                Sunday School Attendance
            </h2>
            <p className="mt-2 text-gray-600">Please log in to continue</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="relative">
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {loginError && (
            <p className="text-sm text-center text-red-600">
              {loginError}
            </p>
          )}

          <div>
            <button
              type="submit"
              className="w-full px-4 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Log In
            </button>
          </div>
        </form>
        <div className="pt-2 text-center text-[10px] text-gray-400">V1.0.0.7</div>
      </div>
    </div>
  );
};