import { useState } from 'react';
import { login, register, session } from '../api';

export default function Login({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      const data = mode === 'login' ? await login(form) : await register(form);
      session.save(data);
      onAuth(data.user);
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="shell" style={{ maxWidth: 420, paddingTop: 80 }}>
      <h1>Water Monitor</h1>
      <h2>{mode === 'login' ? 'Log in' : 'Create an account'}</h2>
      <form className="form" style={{ gridTemplateColumns: '1fr' }} onSubmit={submit}>
        {mode === 'register' && <label>Name<input required value={form.name} onChange={set('name')} /></label>}
        <label>Email<input type="email" required value={form.email} onChange={set('email')} /></label>
        <label>Password<input type="password" required minLength={6} value={form.password} onChange={set('password')} /></label>
        <button className="primary">{mode === 'login' ? 'Log in' : 'Create account'}</button>
      </form>
      {error && <p className="error">{error}</p>}
      <p>
        {mode === 'login' ? 'New here? ' : 'Already have an account? '}
        <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
          {mode === 'login' ? 'Create an account' : 'Log in'}
        </button>
      </p>
    </div>
  );
}
