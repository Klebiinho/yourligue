import { supabase } from '../lib/supabase';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// ⚠️ ATENÇÃO: Substitua os dados abaixo pelo seu projeto oficial no Firebase Console (Configurações do Projeto > Geral > Seus Aplicativos > Web)
const firebaseConfig = {
    apiKey: "SUA_API_KEY_AQUI",
    authDomain: "seu-projeto-firebase.firebaseapp.com",
    projectId: "seu-projeto-firebase",
    storageBucket: "seu-projeto-firebase.appspot.com",
    messagingSenderId: "SENDER_ID_AQUI",
    appId: "APP_ID_AQUI"
};

// Variável VAPID (Chave de par de chaves da Web do Cloud Messaging)
const VAPID_KEY = "SUA_CHAVE_VAPID_AQUI"; // Gere em: Firebase Console -> Configurações do Projeto -> Cloud Messaging -> Certificados de push da Web

/**
 * Registra o dispositivo para receber Push Notifications.
 * Funciona de forma inteligente identificando se é App Nativo (Capacitor) ou Web PWA (Firebase).
 */
export const registerPushNotifications = async (userId: string) => {
    try {
        if (Capacitor.isNativePlatform()) {
            await registerNativePush(userId);
        } else {
            await registerWebPush(userId);
        }
    } catch (e) {
        console.error("Erro durante o registro de notificações:", e);
    }
};

/**
 * --- LÓGICA DE APLICATIVO NATIVO (IOS/ANDROID) ---
 */
async function registerNativePush(userId: string) {
    const isPushAvailable = !!PushNotifications;
    if (!isPushAvailable) return;

    let permStatus = await PushNotifications.checkPermissions();
    if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
    }
    if (permStatus.receive !== 'granted') {
        console.warn('Permissão nativa rejeitada pelo usuário.');
        return;
    }

    await PushNotifications.register();

    // Captura o token Nativo do dispositivo (APNs / FCM-nativo)
    PushNotifications.addListener('registration', async (token) => {
        console.log('Push Native registration success. Token:', token.value);
        await savePushToken(userId, token.value, Capacitor.getPlatform());
    });

    PushNotifications.addListener('registrationError', (error: any) => {
        console.error('Error on native push registration:', error);
    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push nativo recebido em foreground:', notification);
    });
}

/**
 * --- LÓGICA DE WEB APP / NAVEGADOR E PWA ---
 */
async function registerWebPush(userId: string) {
    if (!('serviceWorker' in navigator)) {
        console.warn("Navegador não suporta web push / service workers.");
        return;
    }

    // Validação de Chaves: Se ainda são os placeholders, não tentamos registrar para evitar erro no console
    const hasValidKey = VAPID_KEY && VAPID_KEY !== 'SUA_CHAVE_VAPID_AQUI';
    const hasValidConfig = firebaseConfig.apiKey !== 'SUA_API_KEY_AQUI';

    if (!hasValidKey || !hasValidConfig) {
        console.info('Push Notifications: Firebase ou VAPID não configurados. Pulando registro web push.');
        return;
    }

    try {
        // Pede a notificação do Chrome/Safari
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            console.log('Permissão de Notificação Web concedida.');
            
            const app = initializeApp(firebaseConfig);
            const messaging = getMessaging(app);

            // Tenta se registrar num Service Worker caso ainda não esteja rodando
            const swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            
            // Puxa o Token "FCM Web"
            const currentToken = await getToken(messaging, { 
                vapidKey: VAPID_KEY,
                serviceWorkerRegistration: swRegistration 
            });

            if (currentToken) {
                console.log('Token Web Push gerado:', currentToken);
                await savePushToken(userId, currentToken, 'web');
            } else {
                console.warn('Nenhum token disponível. Peça permissões via interface do usuário do navegador.');
            }

            // Ouve mensagens se o site já estiver aberto (Foreground)
            onMessage(messaging, (payload) => {
                console.log('Mensagem de Push (PWA Foreground):', payload);
                // Você pode mostrar um 'Toast' customizado na tela do site aqui
                if(payload.notification) {
                     alert(`⚽ NOVIDADE: ${payload.notification.title}\n${payload.notification.body}`);
                }
            });

        } else {
             console.warn('O usuário negou o envio de Notificações via Navegador.');
        }
    } catch (err) {
        console.warn("Push Notifications: Falha ao configurar Firebase Web Push (visto em ambientes sem HTTPS ou com chaves inválidas)", err);
    }
}

/**
 * Salva o token gerado no Supabase vinculado ao usuário logado, junto com a plataforma.
 */
async function savePushToken(userId: string, token: string, platform: string) {
    const { error } = await supabase
        .from('push_tokens')
        .upsert({ 
            user_id: userId, 
            token: token,
            platform: platform,
            updated_at: new Date().toISOString()
        }, { onConflict: 'token' });

    if (error) {
        console.error(`Erro ao salvar push token (${platform}) no banco:`, error.message);
    }
}
