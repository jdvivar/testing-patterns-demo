import './App.css';
import UserDataProvider from './components/UserDataProvider';

function App() {
  return (
    <div className="app">
      <header>
        <h1>Testing Patterns Demo</h1>
        <p>A simple app demonstrating component separation patterns</p>
      </header>
      
      <main>
        <UserDataProvider />
      </main>
    </div>
  );
}

export default App;
