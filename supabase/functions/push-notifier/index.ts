import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Interface para payload de Database Webhook
interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: any;
  schema: "public";
  old_record: any | null;
}

serve(async (req) => {
  try {
    const payload: WebhookPayload = await req.json();

    // Apenas rodar quando a partida for atualizada (ex: status indo para 'live')
    if (payload.type === "UPDATE" && payload.table === "matches") {
      const { status: oldStatus } = payload.old_record || {};
      const { status: newStatus, home_team_id, away_team_id } = payload.record;

      // Disparar APENAS quando for de "scheduled" (ou outro) para "live"
      if (oldStatus !== "live" && newStatus === "live") {
        
        // 1. Initializar Supabase (Requer SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY Configurados)
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        // 2. Buscar seguidores dos times (Exemplo: users que seguiam essa liga ou time)
        // Por simplificação: pegar de uma tabela 'user_interactions' pra pegar os tokens
        const { data: supporters } = await supabase
          .from("user_interactions")
          .select("user_id")
          .in("team_id", [home_team_id, away_team_id]);

        if (!supporters || supporters.length === 0) {
            return new Response("Nenhum torcedor", { status: 200 });
        }

        const userIds = supporters.map((s) => s.user_id);

        // 3. Buscar os tokens de push
        const { data: pushTokens } = await supabase
          .from("push_tokens")
          .select("token")
          .in("user_id", userIds);

        if (!pushTokens || pushTokens.length === 0) {
            return new Response("Nenhum token encontrado", { status: 200 });
        }

        const tokens = pushTokens.map((p) => p.token);

        // 4. Enviar os tokens para a API do FCM (Firebase Cloud Messaging)
        const serverKey = Deno.env.get("FCM_SERVER_KEY"); // Sua chave da Cloud Messaging API (Legacy/HTTP v1) do Firebase
        
        if (serverKey && tokens.length > 0) {
            const fcmPayload = {
               registration_ids: tokens,
               notification: {
                 title: "O Jogo Começou! ⚽",
                 body: "O seu time de coração acabou de entrar em campo. Acompanhe a partida ao vivo!",
                 sound: "default"
               },
               // O "data" permite instanciar Live Activities (iOS) sem abrir o app se bem configurado
               data: {
                 matchId: payload.record.id,
                 startLiveActivity: true // Indicador para o Capacitor ActivityKit Native Plugin
               }
            };

            await fetch("https://fcm.googleapis.com/fcm/send", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `key=${serverKey}`
                },
                body: JSON.stringify(fcmPayload)
            });
            console.log("Push notifications enviadas com sucesso", tokens.length);
        }
      }
    }

    return new Response("Ok", { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(String(error), { status: 500 });
  }
});
