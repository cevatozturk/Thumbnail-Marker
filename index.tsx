import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// DEDEKTİF KODU BAŞLANGICI
window.alert('Uygulama Başlıyor!'); 
window.onerror = function(message, source, lineno, colno, error) {
  window.alert('HATA VAR: ' + message);
};
// DEDEKTİF KODU BİTİŞİ

const rootElement = document.getElementById('root');

if (!rootElement) {
    window.alert('Kritik Hata: "root" idli kutu HTML içinde bulunamadı!');
} else {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
}
