import { useState } from 'react';
import { session } from './api';
import Login from './pages/Login';
import Buildings from './pages/Buildings';
import Meters from './pages/Meters';
import Readings from './pages/Readings';
import Consumption from './pages/Consumption';

const tabs = { Consumption, Buildings, Meters, Readings };

export default function App() {
  const [user, setUser] = useState(session.user());
  const [tab, setTab] = useState('Consumption');
  if (!user || !session.token()) return <Login onAuth={setUser} />;

  const Page = tabs[tab];
  const logout = () => { session.clear(); setUser(null); };
  return (
    <div className="shell">
      <header>
        <h1>Water Monitor</h1>
        <nav>
          {Object.keys(tabs).map((t) => (
            <button key={t} className={t === tab ? 'active' : ''} onClick={() => setTab(t)}>{t}</button>
          ))}
          <button onClick={logout}>Log out ({user.name}, {user.role})</button>
        </nav>
      </header>
      <main><Page key={tab} /></main>
    </div>
  );
}
