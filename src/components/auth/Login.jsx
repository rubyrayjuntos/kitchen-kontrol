import React, { useState } from 'react';
import { Lock, Mail, LogIn } from 'lucide-react';
import useStore from '../../store';

const Login = () => {
    const { login } = useStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            await login(email, password);
        } catch (err) {
            setError('Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex items-center justify-center" style={{ 
            minHeight: '100vh',
            background: 'linear-gradient(135deg, var(--bg-primary), var(--bg-secondary))'
        }}>
            <div className="card-lg" style={{ 
                maxWidth: '420px', 
                width: '100%',
                margin: 'var(--spacing-4)'
            }}>
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="d-flex justify-center mb-4">
                        <div className="neumorphic-raised" style={{ 
                            padding: 'var(--spacing-4)', 
                            borderRadius: 'var(--radius-full)',
                            display: 'inline-flex'
                        }}>
                            <Lock size={32} className="text-accent" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-neumorphic-embossed mb-2">Kitchen Kontrol</h1>
                    <p className="text-secondary">Sign in to manage your kitchen</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div style={{
                        padding: 'var(--spacing-3)',
                        marginBottom: 'var(--spacing-4)',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--color-error)',
                        color: 'white',
                        fontSize: 'var(--font-size-sm)'
                    }}>
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="form-field">
                        <label className="form-label">
                            <Mail size={16} style={{ marginRight: 'var(--spacing-2)' }} />
                            Email Address
                        </label>
                        <input
                            type="email"
                            className="neumorphic-input"
                            placeholder="admin@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-field">
                        <label className="form-label">
                            <Lock size={16} style={{ marginRight: 'var(--spacing-2)' }} />
                            Password
                        </label>
                        <input
                            type="password"
                            className="neumorphic-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    <button 
                        type="submit" 
                        className={`btn btn-primary btn-lg ${loading ? 'btn-loading' : ''}`}
                        style={{ width: '100%', marginTop: 'var(--spacing-4)' }}
                        disabled={loading}
                    >
                        <LogIn size={20} style={{ marginRight: 'var(--spacing-2)' }} />
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                {/* Footer */}
                <div className="text-center mt-6">
                    <p className="text-xs text-secondary">
                        Default credentials: admin@example.com / password
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
