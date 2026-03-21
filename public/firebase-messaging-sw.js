importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js');

// ⚠️ ATENÇÃO: Substitua aqui também pelo seu config do Firebase
const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "seu-projeto-firebase.firebaseapp.com",
  projectId: "seu-projeto-firebase",
  storageBucket: "seu-projeto-firebase.appspot.com",
  messagingSenderId: "SENDER_ID_AQUI",
  appId: "APP_ID_AQUI"
};

// Start Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Intercepta a notificação quando o PWA (site) está fechado / Em Segundo Plano
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Mensagem recebida em background', payload);
  
  const notificationTitle = payload.notification?.title || "Nova Atualização na Partida";
  const notificationOptions = {
    body: payload.notification?.body || "Acesso rápido ao seu app.",
    icon: '/logo.png',   // Deve existir em public/logo.png
    badge: '/favicon.png',// Deve existir em public/favicon.png
    tag: payload.data?.matchId || 'geral', // Agrupar mensagens da mesma partida pra não poluir
    data: payload.data, // O que mandamos na Edge Function (matchId, etc)
    vibrate: [200, 100, 200, 100, 200, 100, 200]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Ação quando clica na notificação do PC/Android
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const matchId = event.notification.data?.matchId;

  // Direciona o navegador do usuário pra página do jogo
  const targetUrl = matchId ? `/match/${matchId}` : '/matches';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      // Se já tiver uma aba aberta do site, traga ela pra frente
      for (const client of windowClients) {
        if (client.url.includes('yourleague') && 'focus' in client) {
          return client.focus();
        }
      }
      // Se não, abre uma nova aba
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
