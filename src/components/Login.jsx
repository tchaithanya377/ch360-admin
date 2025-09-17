import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDjangoAuth } from "../contexts/DjangoAuthContext";
import { } from "../utils/djangoAuthHelpers";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null); // { title: string, details?: string } | null
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login: djangoLogin, isAuthenticated, token } = useDjangoAuth();

  const handleLogin = async () => {
    setError(null);
    setLoading(true);

    // Validate input fields
    if (!email.trim()) {
      setError({ title: 'Email required', details: 'Please enter your email address.' });
      setLoading(false);
      return;
    }
    
    if (!password.trim()) {
      setError({ title: 'Password required', details: 'Please enter your password.' });
      setLoading(false);
      return;
    }

    try {
      const sanitizedEmail = email.trim().toLowerCase();
      
      // Django API login
      const djangoResult = await djangoLogin(sanitizedEmail, password);
      
      if (djangoResult.success) {
        // Django login successful
        console.log('Django login successful:', djangoResult.user);
        console.log('Raw login response:', djangoResult.rawResponse);
        
        // Authorize based on roles (groups) and permissions
        const user = djangoResult.user;
        console.log('Login result user data:', user);
        console.log('User data structure:', {
          email: user?.email,
          username: user?.username,
          is_superuser: user?.is_superuser,
          is_staff: user?.is_staff,
          is_active: user?.is_active,
          fullUserObject: user
        });
        
        if (!user) {
          // Create a basic user object if none exists
          const fallbackUser = {
            email: sanitizedEmail,
            username: sanitizedEmail.split('@')[0],
            is_superuser: false,
            is_staff: false,
            is_active: true
          };
          console.log('No user data received, using fallback user:', fallbackUser);
          // Continue with fallback user instead of failing
        }
        
        // Use fallback user if original user is null
        const currentUser = user || {
          email: sanitizedEmail,
          username: sanitizedEmail.split('@')[0],
          is_superuser: false,
          is_staff: false,
          is_active: true
        };
        
        console.log('Using user for validation:', currentUser);
        
        const roles = Array.isArray(currentUser.roles) ? currentUser.roles : [];
        // Strict policy: only users in Django group named 'admin' can log in
        const hasAdminAccess = roles.map((r) => String(r).toLowerCase()).includes('admin');

        // Fallback: try to infer admin flags from JWT payload if not present in profile
        if (!hasAdminAccess && token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const tokenIsSuper = payload?.is_superuser === true || payload?.superuser === true;
            const tokenIsStaff = payload?.is_staff === true || payload?.staff === true;
            console.log('Admin flags from token payload (not granting access):', { tokenIsSuper, tokenIsStaff });
          } catch (e) {
            console.warn('Could not decode JWT payload for admin flags');
          }
        }
        if (!hasAdminAccess) {
          setError({
            title: 'Access denied',
            details: "Your account must belong to the 'admin' group to sign in. Ask your administrator to add your user to the 'admin' group in Django Admin.",
          });
          setLoading(false);
          return;
        }
        
        console.log('Access granted (group "admin"), proceeding to dashboard');

        // Login successful
        navigate("/dashboard");
        return;
      } else {
        // Map backend status to friendly errors
        const status = djangoResult.status;
        if (status === 401) {
          setError({ title: 'Invalid credentials', details: 'The email or password you entered is incorrect.' });
        } else if (status === 403) {
          setError({ title: 'Permission denied', details: "You don't have access to this app. If you should, request to be added to the 'admin' group." });
        } else if (status >= 500) {
          setError({ title: 'Server error', details: 'Something went wrong on our side. Please try again later.' });
        } else {
          setError({ title: 'Login failed', details: djangoResult.error || 'Please try again.' });
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      const isNetwork = typeof error?.message === 'string' && (/Network|Failed to fetch/i).test(error.message);
      setError({
        title: isNetwork ? 'Network error' : 'Unexpected error',
        details: isNetwork ? 'Please check your internet connection and try again.' : 'Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-sky-500">
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl animate-spin-slow" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl animate-pulse" />

      <div className="relative w-[380px] max-w-[92vw] rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl p-7">
        <div className="flex flex-col items-center mb-6 select-none">
          <div className="h-11 w-11 rounded-xl bg-white/20 flex items-center justify-center shadow-md">
            <span className="text-white text-xl font-semibold">C</span>
          </div>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-white">Campushub360</h2>
          <p className="mt-1 text-sm text-white/70">Secure admin access</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-100 shadow-sm transition-all">
            <div className="font-medium">{typeof error === 'string' ? error : error.title}</div>
            {typeof error !== 'string' && error.details && (
              <div className="mt-0.5 text-xs text-red-100/90">{error.details}</div>
            )}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-white/80">Email</label>
            <div className="relative">
              <input
                type="email"
                placeholder="you@company.com"
                className="block w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-white/50 outline-none transition focus:border-white/40 focus:ring-2 focus:ring-white/30"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !loading && handleLogin()}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-white/80">Password</label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                className="block w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-white/50 outline-none transition focus:border-white/40 focus:ring-2 focus:ring-white/30"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !loading && handleLogin()}
                disabled={loading}
              />
            </div>
          </div>

          <button
            onClick={handleLogin}
            className={`group relative block w-full overflow-hidden rounded-xl bg-white px-4 py-2.5 font-medium text-indigo-700 shadow-lg transition focus:outline-none ${
              loading ? "opacity-70 cursor-not-allowed" : "hover:shadow-2xl"
            }`}
            disabled={loading}
          >
            <span className="relative z-10">{loading ? "Signing in..." : "Login"}</span>
            <span className="absolute inset-0 -z-0 bg-gradient-to-r from-sky-400 via-indigo-400 to-blue-500 opacity-0 transition group-hover:opacity-20" />
          </button>
        </div>

        <div className="mt-5 text-center text-xs text-white/60">
          © {new Date().getFullYear()} Campushub360
        </div>
      </div>

      <style>{`
        .animate-spin-slow { animation: spin 18s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Login;


