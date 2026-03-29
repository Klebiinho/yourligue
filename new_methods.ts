    const addTeam = async (team: { name: string; logo: string; primary_color?: string; secondary_color?: string }) => {
        if (!league) return { error: 'Nenhuma liga selecionada' };
        const { data, error } = await supabase.from('teams').insert({ 
            league_id: league.id, 
            name: team.name, 
            logo: team.logo,
            primary_color: team.primary_color,
            secondary_color: team.secondary_color 
        }).select().single();
        if (error) return { error: error.message };
        if (data) {
            setRawTeams(prev => [...prev, mapDBTeam(data)]);
        }
        return { error: null };
    };

    const updateTeam = async (teamId: string, data: Partial<{ name: string; logo: string; primary_color: string; secondary_color: string }>) => {
        console.log('[LeagueContext] Iniciando updateTeam:', { teamId, updateKeys: Object.keys(data) });
        
        try {
            // Limpa campos vazios ou nulos que não devem ser enviados
            const updatePayload: any = {};
            if (data.name) updatePayload.name = data.name;
            if (data.logo) updatePayload.logo = data.logo;
            if (data.primary_color) updatePayload.primary_color = data.primary_color;
            if (data.secondary_color) updatePayload.secondary_color = data.secondary_color;

            const { data: updatedData, error } = await supabase
                .from('teams')
                .update(updatePayload)
                .eq('id', teamId)
                .select()
                .single();
            
            if (error) {
                console.error('[LeagueContext] Erro fatal no Supabase updateTeam:', error);
                return { error: `Erro no servidor: ${error.message} (Código: ${error.code})` };
            }

            if (!updatedData) {
                console.error('[LeagueContext] Update concluído mas nenhum dado retornado para ID:', teamId);
                return { error: 'O time não foi encontrado para atualização.' };
            }

            console.log('[LeagueContext] Update bem-sucedido:', updatedData.id);

            // Sincroniza estado local com o retorno real do banco, preservando os jogadores
            setRawTeams(prev => prev.map(t => {
                if (t.id === teamId) {
                    const mapped = mapDBTeam(updatedData);
                    return { ...mapped, players: t.players }; // Preserva os jogadores do estado atual
                }
                return t;
            }));
            
            return { error: null };
        } catch (err: any) {
            console.error('[LeagueContext] Exceção inesperada em updateTeam:', err);
            return { error: 'Ocorreu um erro inesperado ao salvar. Verifique o tamanho da imagem.' };
        }
    };

    const deleteTeam = async (teamId: string) => {
        await supabase.from('teams').delete().eq('id', teamId);
        setRawTeams(prev => prev.filter(t => t.id !== teamId));
    };

    // ── Player CRUD ────────────────────────────────────────────
    // ── Player CRUD ────────────────────────────────────────────
    const addPlayer = async (teamId: string, player: Omit<Player, 'id' | 'stats'>) => {
        const team = rawTeams.find(t => t.id === teamId);
        if (!team || !league) return { error: 'Time ou liga não encontrados' };

        // Validação de número único no time
        if (team.players.some(p => p.number === player.number)) {
            return { error: `O número ${player.number} já está sendo usado neste time.` };
        }

        // Validação de limites (Titulares / Reservas)
        const currentStarters = team.players.filter(p => !p.isReserve).length;
        const currentReserves = team.players.filter(p => p.isReserve).length;

        if (!player.isReserve && currentStarters >= (league.playersPerTeam || 5)) {
            return { error: `O limite de titulares (${league.playersPerTeam}) já foi atingido. Inscreva-o como Reserva.` };
        }
        if (player.isReserve && currentReserves >= (league.reserveLimitPerTeam || 5)) {
            return { error: `O limite de reservas (${league.reserveLimitPerTeam}) já foi atingido.` };
        }

        const { data, error } = await supabase.from('players').insert({
            team_id: teamId, 
            name: player.name, 
            number: player.number,
            position: player.position, 
            photo: player.photo || '',
            is_captain: player.isCaptain || false, 
            is_reserve: player.isReserve || false
        }).select().single();

        if (error) return { error: error.message };
        if (data) {
            const newPlayer = mapDBPlayer(data);
            setRawTeams(prev => prev.map(t => {
                if (t.id === teamId) {
                    const updatedPlayers = [...t.players, newPlayer];
                    // Se for o primeiro titular e não houver capitão, torna-o capitão
                    const hasCaptain = updatedPlayers.some(p => p.isCaptain);
                    if (!hasCaptain && !newPlayer.isReserve) {
                        newPlayer.isCaptain = true;
                        supabase.from('players').update({ is_captain: true }).eq('id', newPlayer.id).then();
                    }
                    return { ...t, players: updatedPlayers };
                }
                return t;
            }));
        }
        return { error: null };
    };

    const updatePlayer = async (teamId: string, playerId: string, data: Partial<Player>) => {
        const team = rawTeams.find(t => t.id === teamId);
        const player = team?.players.find(p => p.id === playerId);
        if (!team || !player || !league) {
            console.error('[LeagueContext] Erro: Dados insuficientes', { teamId, playerId });
            return { error: 'Dados insuficientes.' };
        }

        // Construção do Payload diferencial (apenas o que mudou) para evitar 520 (payload too large)
        const updatePayload: any = {};
        if (data.name !== undefined && data.name !== player.name) {
            updatePayload.name = data.name;
            updatePayload.slug = generateSlug(data.name);
        }
        if (data.number !== undefined && data.number !== player.number) updatePayload.number = data.number;
        if (data.position !== undefined && data.position !== player.position) updatePayload.position = data.position;
        
        // Foto: Só envia se for diferente (base64 pode ser pesado)
        if (data.photo !== undefined && data.photo !== player.photo) {
            updatePayload.photo = data.photo;
            if (data.photo.length > 1000000) { // > 1MB warning
                 console.warn('[LeagueContext] Alerta: Foto pesada detectada (>1MB). Isso pode causar erro 520.');
            }
        }
        
        if (data.isCaptain !== undefined && data.isCaptain !== player.isCaptain) {
            updatePayload.is_captain = data.isCaptain;
            if (data.isCaptain) updatePayload.is_reserve = false;
        }
        if (data.isReserve !== undefined && data.isReserve !== player.isReserve && !updatePayload.is_captain) {
             updatePayload.is_reserve = data.isReserve;
        }

        // Se nada mudou, não fazemos o hit no banco
        if (Object.keys(updatePayload).length === 0) {
            console.log('[LeagueContext] Nada mudou, pulando updatePlayer.');
            return { error: null };
        }

        console.log('[LeagueContext] Enviando atualização parcial:', Object.keys(updatePayload));

        const { error } = await supabase.from('players').update(updatePayload).eq('id', playerId);

        if (error) {
            console.error('[LeagueContext] Erro fatal no Supabase updatePlayer:', error);
            // Se o erro for de payload grande, avisa o usuário
            if (error.code === '413' || error.message.includes('large')) return { error: 'A foto é muito grande. Tente uma imagem menor.' };
            return { error: `Erro no servidor: ${error.message}` };
        }

        // Se marcamos um novo capitão, desmarcamos os outros no banco (background)
        if (updatePayload.is_captain) {
            for (const p of team.players) {
                if (p.isCaptain && p.id !== playerId) {
                    supabase.from('players').update({ is_captain: false }).eq('id', p.id).then();
                }
            }
        }

        // Atualização do Estado Local (Sync camelCase)
        setRawTeams(prev => prev.map(t => t.id === teamId
            ? { 
                ...t, 
                players: t.players.map(p => {
                    if (p.id === playerId) {
                        const newIsCaptain = updatePayload.is_captain ?? p.isCaptain;
                        // Regra de negócio: se virou capitão, não pode ser reserva.
                        // Se não mudou capitão, usa o is_reserve do payload ou o antigo.
                        const newIsReserve = newIsCaptain ? false : (updatePayload.is_reserve ?? p.isReserve);

                        return { 
                            ...p, 
                            ...data, 
                            slug: updatePayload.slug || p.slug,
                            isCaptain: newIsCaptain,
                            isReserve: newIsReserve
                        };
                    }
                    // Desmarca outros capitães se um novo foi definido
                    if (updatePayload.is_captain === true && p.id !== playerId) return { ...p, isCaptain: false };
                    return p;
                }) 
              }
            : t
        ));

        return { error: null };
    };

    const removePlayer = async (teamId: string, playerId: string) => {
        const team = rawTeams.find(t => t.id === teamId);
        const player = team?.players.find(p => p.id === playerId);
        const wasCaptain = player?.isCaptain;

        await supabase.from('players').delete().eq('id', playerId);
        
        setRawTeams(prev => prev.map(t => {
            if (t.id === teamId) {
                const updatedPlayers = t.players.filter(p => p.id !== playerId);
                // Se o removido era o capitão, precisamos de um novo entre os titulares
                if (wasCaptain && updatedPlayers.length > 0) {
                    const starter = updatedPlayers.find(p => !p.isReserve) || updatedPlayers[0];
                    if (starter) {
                        starter.isCaptain = true;
                        supabase.from('players').update({ is_captain: true }).eq('id', starter.id).then();
                    }
                }
                return { ...t, players: updatedPlayers };
            }
            return t;
        }));
    };

    const toggleCaptain = async (teamId: string, playerId: string) => {
        const team = rawTeams.find(t => t.id === teamId);
        if (!team) return;
        const pl = team.players.find(p => p.id === playerId);
        if (!pl) return;

        const newVal = !pl.isCaptain;
        
        // Se for para desativar o único capitão, não permitimos (sempre deve ter um)
        if (!newVal && team.players.filter(p => p.isCaptain).length <= 1) return;

        // Se for ativar, garantimos que seja titular
        let updatedReserve = pl.isReserve;
        if (newVal) {
            updatedReserve = false;
            await supabase.from('players').update({ is_reserve: false }).eq('id', playerId);
        }

        for (const p of team.players) {
            if (p.isCaptain && p.id !== playerId) await supabase.from('players').update({ is_captain: false }).eq('id', p.id);
        }
        await supabase.from('players').update({ is_captain: newVal }).eq('id', playerId);
        
        setRawTeams(prev => prev.map(t => t.id === teamId
            ? { ...t, players: t.players.map(p => ({ 
                ...p, 
                isCaptain: p.id === playerId ? newVal : false,
                isReserve: p.id === playerId ? updatedReserve : p.isReserve 
            })) }
            : t
        ));
    };
    
    const reorderPlayers = async (teamId: string, playerIds: string[]) => {
        if (!league) return;
        const limit = league.playersPerTeam || 5;
        
        let newCaptainId = '';
        const currentTeam = rawTeams.find(t => t.id === teamId);
        const currentCaptain = currentTeam?.players.find(p => p.isCaptain);
        
        // If captain moved to reserve or doesn't exist, first player becomes captain
        const captainIdx = currentCaptain ? playerIds.indexOf(currentCaptain.id) : -1;
        if (captainIdx >= limit || captainIdx === -1) {
            newCaptainId = playerIds[0];
        }

        // Prepare updates
        const promises = playerIds.map((pid, idx) => {
            const isReserve = idx >= limit;
            const isCaptain = newCaptainId ? (pid === newCaptainId) : (pid === currentCaptain?.id);
            return supabase.from('players').update({ 
                display_order: idx,
                is_reserve: isReserve,
                is_captain: isCaptain
            }).eq('id', pid);
        });

        await Promise.all(promises);

        // Update local state
        setRawTeams(prev => prev.map(t => {
            if (t.id === teamId) {
                const sortedPlayers = [...t.players].sort((a, b) => {
                    const idxA = playerIds.indexOf(a.id);
                    const idxB = playerIds.indexOf(b.id);
                    return idxA - idxB;
                }).map((p, idx) => ({
                    ...p,
                    displayOrder: idx,
                    isReserve: idx >= limit,
                    isCaptain: newCaptainId ? (p.id === newCaptainId) : (p.id === currentCaptain?.id)
                }));
                return { ...t, players: sortedPlayers };
            }
            return t;
        }));

        // Broadcast change
        supabase.channel(`league-central-${league.id}`).send({
            type: 'broadcast',
            event: 'players-reordered',
            payload: { teamId, playerIds, limit }
        });
    };

    // ── Match CRUD ─────────────────────────────────────────────
    const createMatch = async (data: { homeTeamId: string; awayTeamId: string; scheduledAt?: string; location?: string; youtubeLiveId?: string }) => {
        if (!league) return { error: 'Nenhuma liga selecionada' };
        if (data.homeTeamId === data.awayTeamId) return { error: 'Um time não pode jogar contra ele mesmo.' };
        const { data: row, error } = await supabase.from('matches').insert({
            league_id: league.id, home_team_id: data.homeTeamId, away_team_id: data.awayTeamId,
            scheduled_at: data.scheduledAt || null, location: data.location || '',
            youtube_live_id: data.youtubeLiveId || '', half_length: league.defaultHalfLength
        }).select().single();
        if (error) return { error: error.message };
        if (row) {
            setRawMatches((prev: Match[]) => [...prev, mapDBMatch(row)]);
            return { error: null, matchId: row.id };
        }
        return { error: 'Unknown error' };
    };

    const updateMatch = async (matchId: string, data: Partial<Match>) => {
        await supabase.from('matches').update({
            home_score: data.homeScore, away_score: data.awayScore, status: data.status,
            timer: data.timer, youtube_live_id: data.youtubeLiveId, half_length: data.halfLength,
            extra_time: data.extraTime, period: data.period,
            scheduled_at: data.scheduledAt, location: data.location
        }).eq('id', matchId);
        
        const currentMatch = rawMatches.find(m => m.id === matchId);
        let finalTimer = data.timer;
        
        // If match is live and we are not explicitly changing the timer, "freeze" the current live time as a new base
        if (currentMatch && currentMatch.status === 'live' && finalTimer === undefined) {
            const lastUpdate = new Date(currentMatch.updatedAt || new Date().toISOString()).getTime();
            const diffInSeconds = Math.max(0, Math.floor((Date.now() - lastUpdate) / 1000));
            finalTimer = (currentMatch.timer || 0) + diffInSeconds;
        }

        const effectiveData = { ...data, timer: finalTimer ?? currentMatch?.timer ?? 0 };

        // Optimistic update with current time to keep timer sync smooth
        setRawMatches((prev: Match[]) => prev.map(m => m.id === matchId ? { 
            ...m, 
            ...effectiveData,
            updatedAt: new Date().toISOString() 
        } : m));

        // BROADCAST for other users (low latency)
        if (currentMatch) {
            supabase.channel(`league-central-${league?.id}`).send({
                type: 'broadcast',
                event: 'match-update',
                payload: {
                    matchId,
                    timer: effectiveData.timer ?? currentMatch.timer,
                    homeScore: effectiveData.homeScore ?? currentMatch.homeScore,
                    awayScore: effectiveData.awayScore ?? currentMatch.awayScore,
                    period: effectiveData.period ?? currentMatch.period,
                    status: effectiveData.status ?? currentMatch.status,
                    updatedAt: new Date().toISOString()
                }
            });
        }
    };

    const deleteMatch = async (matchId: string) => {
        await supabase.from('matches').delete().eq('id', matchId);
        setRawMatches((prev: Match[]) => prev.filter(m => m.id !== matchId));
    };

    const startMatch = async (matchId: string, currentTimer: number = 0, shouldStartLive = false) => {
        const match = rawMatches.find(m => m.id === matchId);
        let youtubeLiveId = match?.youtubeLiveId;

        // Create YouTube Live ONLY if requested, authenticated, and match is not finished
        if (shouldStartLive && isYtAuthenticated && match && match.status !== 'finished' && !youtubeLiveId) {
            const ht = rawTeams.find(t => t.id === match.homeTeamId);
            const at = rawTeams.find(t => t.id === match.awayTeamId);
            const title = `${league?.name} - ${ht?.name} x ${at?.name}`;
            
            try {
                const result = await ytService.createLiveBroadcast(title, `Assista ao vivo: ${title}`);
                if (result.broadcastId) {
                    youtubeLiveId = result.broadcastId;
                    setCurrentYtLiveStream({
                        streamKey: result.streamKey,
                        rtmpUrl: result.rtmpUrl
                    });
                }
            } catch (err: any) {
                console.error('Failed to create YouTube Live broadcast:', err);
                alert("Aviso: Não foi possível iniciar a Live no YouTube.\n\nMotivo: " + (err.message || "Erro desconhecido") + "\n\nO jogo será iniciado sem transmissão ao vivo.");
            }
        }

        // Ao iniciar/retomar, salvamos o tempo atual e o Supabase cuidará do updated_at (agora)
        return updateMatch(matchId, { status: 'live', timer: currentTimer, youtubeLiveId });
    };

    const deleteYtLive = async (matchId: string, broadcastId: string) => {
        try {
            await ytService.deleteBroadcast(broadcastId);
            await updateMatch(matchId, { youtubeLiveId: undefined });
        } catch (err: any) {
            console.error('Failed to delete YT broadcast:', err);
            throw err;
        }
    };

    const setYtLivePrivacy = async (broadcastId: string, privacy: 'public' | 'private' | 'unlisted') => {
        try {
            await ytService.setBroadcastPrivacy(broadcastId, privacy);
        } catch (err: any) {
            console.error('Failed to set YT privacy:', err);
            throw err;
        }
    };
    
    const pauseMatch = async (matchId: string, currentTimer: number) => {
        // Ao pausar, salvamos o tempo exato acumulado
        return updateMatch(matchId, { status: 'scheduled', timer: currentTimer });
    };

    const endMatch = async (matchId: string, currentTimer: number) => {
        return updateMatch(matchId, { status: 'finished', timer: currentTimer });
    };
    
    const updateTimer = async (matchId: string, time: number) => updateMatch(matchId, { timer: time });

    const isPlayerOnPitch = (match: Match, playerId: string) => {
        const teamId = [...rawTeams].find(t => t.players.some(p => p.id === playerId))?.id;
        if (!teamId) return false;
        
        const team = rawTeams.find(t => t.id === teamId);
        const player = team?.players.find(p => p.id === playerId);
        if (!player) return false;

        // Check cards
        const redCards = match.events.filter(e => e.type === 'red_card' && e.playerId === playerId).length;
        if (redCards > 0) return false;

        const subIns = match.events.filter(e => e.type === 'substitution' && e.playerId === playerId).length;
        const subOuts = match.events.filter(e => e.type === 'substitution' && e.playerOutId === playerId).length;

        if (player.isReserve) {
            return subIns > subOuts;
        } else {
            return subOuts <= subIns;
        }
    };

    const addEvent = async (matchId: string, event: Omit<MatchEvent, 'id'>) => {
        // 1. Get current match state safely
        const m = rawMatches.find(x => String(x.id) === String(matchId));
        if (!m) {
            console.error('[LeagueContext] Partida não encontrada para addEvent:', matchId);
            return;
        }

        // 2. SNAPSHOT TIMER: Calculate current running time to use as new 0-base
        const now = Date.now();
        let snapshotTimer = m.timer || 0;
        if (m.status === 'live') {
            const lastUpdate = new Date(m.updatedAt || now).getTime();
            const diffInSeconds = Math.max(0, Math.floor((now - lastUpdate) / 1000));
            snapshotTimer += diffInSeconds;
        }

        // 3. Persist Event
        const { data, error } = await supabase.from('match_events').insert({
            match_id: matchId, type: event.type, team_id: event.teamId,
            player_id: event.playerId, player_out_id: event.playerOutId, minute: event.minute
        }).select().single();
        
        if (error || !data) {
            console.error('[LeagueContext] Erro ao salvar evento:', error);
            return;
        }
        
        const mappedEvent = mapDBEvent(data);
        
        // 4. Calculate New Scores
        let newHomeScore = m.homeScore || 0;
        let newAwayScore = m.awayScore || 0;
        const isHome = String(event.teamId) === String(m.homeTeamId);

        if (event.type === 'goal' || event.type === 'penalty_goal') {
            if (isHome) newHomeScore++; else newAwayScore++;
        } else if (event.type === 'own_goal') {
            if (isHome) newAwayScore++; else newHomeScore++;
        } else if (event.type === 'points_1') {
            if (isHome) newHomeScore += 1; else newAwayScore += 1;
        } else if (event.type === 'points_2') {
            if (isHome) newHomeScore += 2; else newAwayScore += 2;
        } else if (event.type === 'points_3') {
            if (isHome) newHomeScore += 3; else newAwayScore += 3;
        }

        const newMatchState = {
            ...m,
            homeScore: newHomeScore,
            awayScore: newAwayScore,
            timer: snapshotTimer,
            updatedAt: new Date(now).toISOString(),
            events: [...m.events, mappedEvent]
        };

        // 5. Update Local State (Optimistic)
        setRawMatches(prev => prev.map(x => String(x.id) === String(matchId) ? newMatchState : x));

        // 6. Sync with Database
        const isScoreChange = ['goal', 'penalty_goal', 'own_goal', 'points_1', 'points_2', 'points_3'].includes(event.type);
        
        const updateData: any = { timer: snapshotTimer };
        if (isScoreChange) {
            updateData.home_score = newHomeScore;
            updateData.away_score = newAwayScore;
        }

        await supabase.from('matches').update(updateData).eq('id', matchId);

        // 7. BROADCAST for Overlays (Critical for low latency sync)
        supabase.channel(`league-central-${league?.id}`).send({
            type: 'broadcast',
            event: 'match-update',
            payload: {
                matchId,
                timer: snapshotTimer,
                homeScore: newHomeScore,
                awayScore: newAwayScore,
                period: m.period,
                status: m.status,
                newEvent: mappedEvent,
                updatedAt: new Date(now).toISOString()
            }
        });

        // Lógica de Transferência de Braçadeira (Substituição ou Vermelho do Capitão)
        if (event.type === 'substitution' || event.type === 'red_card') {
            const team = rawTeams.find(t => t.id === event.teamId);
            const match = rawMatches.find(m => m.id === matchId);
            if (!team || !match) return;
            
            const pId = event.type === 'substitution' ? event.playerOutId : event.playerId;
            const player = team.players.find(p => p.id === pId);

            if (player?.isCaptain) {
                let newCaptainId = '';
                if (event.type === 'substitution') {
                    newCaptainId = event.playerId as string; // O que entra herda a braçadeira
                } else {
                    // No vermelho, passa para outro que esteja em campo
                    // Precisamos considerar o evento que acabamos de adicionar (o vermelho)
                    const onPitch = team.players.filter(p => p.id !== player.id && isPlayerOnPitch({ ...m, events: [...m.events, mappedEvent] }, p.id));
                    if (onPitch.length > 0) newCaptainId = onPitch[0].id;
                }

                if (newCaptainId) {
                    await toggleCaptain(team.id, newCaptainId);
                }
            }
        }
    };

    const removeEvent = async (matchId: string, eventId: string) => {
        const match = rawMatches.find(m => m.id === matchId);
        const event = match?.events.find(e => e.id === eventId);
        await supabase.from('match_events').delete().eq('id', eventId);

        let newHomeScore = 0;
        let newAwayScore = 0;

        setRawMatches(prev => prev.map(m => {
            if (m.id !== matchId) return m;

            newHomeScore = m.homeScore;
            newAwayScore = m.awayScore;

            const isScoreChange = event && ['goal', 'penalty_goal', 'own_goal', 'points_1', 'points_2', 'points_3'].includes(event.type);
            if (event && isScoreChange) {
                const isHome = String(event.teamId) === String(m.homeTeamId);
                const isOwnGoal = event.type === 'own_goal';
                
                let pointsToRemove = 0;
                if (['goal', 'penalty_goal', 'own_goal'].includes(event.type)) pointsToRemove = 1;
                else if (event.type === 'points_1') pointsToRemove = 1;
                else if (event.type === 'points_2') pointsToRemove = 2;
                else if (event.type === 'points_3') pointsToRemove = 3;

                if (isOwnGoal) {
                    if (isHome) newAwayScore = Math.max(0, newAwayScore - pointsToRemove);
                    else newHomeScore = Math.max(0, newHomeScore - pointsToRemove);
                } else {
                    if (isHome) newHomeScore = Math.max(0, newHomeScore - pointsToRemove);
                    else newAwayScore = Math.max(0, newAwayScore - pointsToRemove);
                }
            }

            return {
                ...m,
                events: m.events.filter(e => e.id !== eventId),
                homeScore: newHomeScore,
                awayScore: newAwayScore,
                updatedAt: new Date().toISOString()
            };
        }));

        const isScoreChange = event && ['goal', 'penalty_goal', 'own_goal', 'points_1', 'points_2', 'points_3'].includes(event.type);
        if (isScoreChange) {
            await supabase.from('matches').update({
                home_score: newHomeScore,
                away_score: newAwayScore,
            }).eq('id', matchId);
        }

        // BROADCAST for instant feedback (important for non-score events too)
        supabase.channel(`league-central-${league?.id}`).send({
            type: 'broadcast',
            event: 'match-update',
            payload: {
                matchId,
                removedEventId: eventId,
                homeScore: newHomeScore,
                awayScore: newAwayScore,
                updatedAt: new Date().toISOString()
            }
        });
    };

    // ── Bracket ────────────────────────────────────────────────
    const generateBracket = async () => {
        if (!league) return;
        // Delete existing
        await supabase.from('brackets').delete().eq('league_id', league.id);

        // Sort teams by points for seeding
        const sorted = [...teams].sort((a, b) => {
            const pA = a.stats.wins * league.pointsForWin + a.stats.draws * league.pointsForDraw;
            const pB = b.stats.wins * league.pointsForWin + b.stats.draws * league.pointsForDraw;
            return pB - pA;
        });

        const rounds: Array<{ round: string; count: number }> = [
            { round: 'oitavas', count: 8 }, { round: 'quartas', count: 4 },
            { round: 'semifinal', count: 2 }, { round: 'final', count: 1 }
        ];

        const rows: any[] = [];
        rounds.forEach(({ round, count }) => {
            for (let i = 0; i < count; i++) {
                const homeIdx = round === 'oitavas' ? i * 2 : undefined;
                const awayIdx = round === 'oitavas' ? i * 2 + 1 : undefined;
                rows.push({
                    league_id: league.id, round, match_order: i,
                    home_team_id: homeIdx !== undefined && sorted[homeIdx] ? sorted[homeIdx].id : null,
                    away_team_id: awayIdx !== undefined && sorted[awayIdx] ? sorted[awayIdx].id : null,
                });
            }
        });

        const { data } = await supabase.from('brackets').insert(rows).select();
        if (data) {
            setBrackets(data.map((b: any) => ({
                id: b.id, round: b.round, matchOrder: b.match_order,
                homeTeamId: b.home_team_id, awayTeamId: b.away_team_id,
                homeScore: b.home_score, awayScore: b.away_score, status: b.status
            })));
        }
    };
    const updateBracket = async (bracketId: string, data: Partial<BracketMatch>) => {
        await supabase.from('brackets').update({
            home_score: data.homeScore, away_score: data.awayScore, status: data.status,
            home_team_id: data.homeTeamId, away_team_id: data.awayTeamId
        }).eq('id', bracketId);
        setBrackets(prev => prev.map(b => b.id === bracketId ? { ...b, ...data } : b));
    };



    const generateGroups = async (teamsPerGroup: number) => {
        if (!league || teams.length === 0) return;

        const shuffled = [...teams].sort(() => Math.random() - 0.5);
        const groupLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

        const updates = shuffled.map((team, index) => {
            const groupIndex = Math.floor(index / teamsPerGroup);
            const groupName = groupLetters[groupIndex] || `Grupo ${groupIndex + 1}`;
            return supabase.from('teams').update({ group_name: groupName }).eq('id', team.id);
        });

        await Promise.all(updates);
        loadLeagueData(league.id);
    };

    const interactWithTeam = async (teamId: string, type: TeamInteraction['interactionType']) => {
        if (!user) {
            setPendingInteraction({ teamId, type });
            setShowAuthModal(true);
            return;
        }

        if (!league) return;

        // --- Optimistic Update ---
        const oldInteractions = [...userInteractions];
        let newInteractions = [...userInteractions];

        // Helper to find existing of same type in this league
        const existingOfType = oldInteractions.filter(i => i.leagueId === league.id && i.interactionType === type);
        const existingExact = oldInteractions.find(i => i.teamId === teamId && i.interactionType === type);

        if (existingExact) {
            // Toggle OFF: Remove this specific interaction
            newInteractions = newInteractions.filter(i => i.id !== existingExact.id);
        } else {
            // Toggle ON or Switch: 
            if (type === 'supporting') {
                // Rule: Only 1 supporting per league. Remove others first.
                newInteractions = newInteractions.filter(i => !(i.leagueId === league.id && i.interactionType === 'supporting'));
                // Rule: Cannot support and rival the same team
                newInteractions = newInteractions.filter(i => !(i.teamId === teamId && i.interactionType === 'rival'));
            } else if (type === 'rival') {
                // Rule: Cannot support and rival the same team
                newInteractions = newInteractions.filter(i => !(i.teamId === teamId && i.interactionType === 'supporting'));
            }
            
            // Add the new one optimistically
            newInteractions.push({
                id: 'temp-' + Date.now(),
                teamId,
                leagueId: league.id,
                interactionType: type
            });
        }

        setUserInteractions(newInteractions);

        try {
            // 1. If it's a toggle off (exact match found above)
            if (existingExact) {
                await supabase.from('user_team_interactions').delete().eq('id', existingExact.id);
            } else {
                // 2. Rules Implementation (Cleanup in DB)
                if (type === 'supporting') {
                    // Delete any existing supporting in this league
                    if (existingOfType.length > 0) {
                        await supabase.from('user_team_interactions')
                            .delete()
                            .eq('user_id', user.id)
                            .eq('league_id', league.id)
                            .eq('interaction_type', 'supporting');
                    }

                    // Delete rival for same team if exists
                    await supabase.from('user_team_interactions')
                        .delete()
                        .eq('user_id', user.id)
                        .eq('team_id', teamId)
                        .eq('interaction_type', 'rival');
                } else if (type === 'rival') {
                    // Delete support for same team if exists
                    await supabase.from('user_team_interactions')
                        .delete()
                        .eq('user_id', user.id)
                        .eq('team_id', teamId)
                        .eq('interaction_type', 'supporting');
                }

                // 3. Insert new interaction
                await supabase.from('user_team_interactions').insert({
                    user_id: user.id,
                    league_id: league.id,
                    team_id: teamId,
                    interaction_type: type
                });
            }
        } catch (error) {
            console.error('Error interacting with team:', error);
            setUserInteractions(oldInteractions); // Rollback on error
        } finally {
            // Final refresh to ensure sync with DB (IDs etc)
            loadUserInteractions(league.id);
            loadSupportCounts(league.id);
        }
    };

    const loadPlayerPhotos = useCallback(async (playerIds: string[]) => {
        if (!playerIds || playerIds.length === 0) return;
        try {
            const { data } = await supabase.from('players').select('id, photo').in('id', playerIds).not('photo', 'eq', '');
            if (!data || data.length === 0) return;
            const photoMap = new Map(data.map(p => [p.id, p.photo]));
            setRawTeams(prev => prev.map(t => ({
                ...t,
                players: t.players.map(p => ({ ...p, photo: photoMap.get(p.id) || p.photo }))
            })));
        } catch (err) { console.error('Error loading specific player photos:', err); }
    }, []);

    const removeInteraction = async (interactionId: string) => {
        await supabase.from('user_team_interactions').delete().eq('id', interactionId);
        if (league) loadUserInteractions(league.id);
    };



    // ── Initial Logic & Recovery ─────────────────────────────
    useEffect(() => {
        const recover = async () => {
            const isLeaguesPage = window.location.pathname === '/leagues' || window.location.pathname === '/';
            if (isLeaguesPage) {
                console.log('LeagueContext: Hub path detected - skipping auto-recovery to ensure clean Hub landing');
                // Cleanup to ensure Hub has 100% width and no stale data
                setLeague(null);
                setRawTeams([]);
                setRawMatches([]);
                return;
            }

            const lastLeagueId = localStorage.getItem('selectedLeagueId');
            if (lastLeagueId) {
                console.log('LeagueContext: Recovering last active league for non-Hub path:', lastLeagueId);
                loadPublicLeague(lastLeagueId);
            }
        };
        recover();
    }, [loadPublicLeague]);
