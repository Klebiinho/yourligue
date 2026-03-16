/**
 * YouTube Live API Service
 * Handles OAuth2 and Broadcast/Stream creation
 */

const SCOPES = 'https://www.googleapis.com/auth/youtube.force-ssl';
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'];

declare global {
    interface Window {
        gapi: any;
        google: any;
    }
}

export class YouTubeService {
    private static instance: YouTubeService;
    private tokenClient: any;
    private accessToken: string | null = null;

    private constructor() { }

    public static getInstance(): YouTubeService {
        if (!YouTubeService.instance) {
            YouTubeService.instance = new YouTubeService();
        }
        return YouTubeService.instance;
    }

    public async init(clientId: string): Promise<void> {
        if (!clientId) return;
        return new Promise((resolve, reject) => {
            const scriptgis = document.createElement('script');
            scriptgis.src = 'https://accounts.google.com/gsi/client';
            scriptgis.onload = () => {
                this.tokenClient = window.google.accounts.oauth2.initTokenClient({
                    client_id: clientId,
                    scope: SCOPES,
                    callback: (response: any) => {
                        if (response.error !== undefined) {
                            reject(response);
                        }
                        this.accessToken = response.access_token;
                        localStorage.setItem('yt_access_token', response.access_token);
                        if (this.onAuthChange) this.onAuthChange(response.access_token);
                    },
                });

                const scriptgapi = document.createElement('script');
                scriptgapi.src = 'https://apis.google.com/js/api.js';
                scriptgapi.onload = () => {
                    window.gapi.load('client', async () => {
                        await window.gapi.client.init({
                            discoveryDocs: DISCOVERY_DOCS,
                        });
                        resolve();
                    });
                };
                document.body.appendChild(scriptgapi);
            };
            scriptgis.onerror = reject;
            document.body.appendChild(scriptgis);
        });
    }

    private onAuthChange: ((token: string | null) => void) | null = null;

    public subscribeAuth(callback: (token: string | null) => void) {
        this.onAuthChange = callback;
        const savedToken = localStorage.getItem('yt_access_token');
        if (savedToken) {
            this.accessToken = savedToken;
            callback(savedToken);
        }
    }

    public async logIn() {
        if (!this.tokenClient) throw new Error('Not initialized');
        this.tokenClient.requestAccessToken({ prompt: 'consent' });
    }

    public logOut() {
        this.accessToken = null;
        localStorage.removeItem('yt_access_token');
        if (this.onAuthChange) this.onAuthChange(null);
    }

    public getIsAuthenticated(): boolean {
        return !!this.accessToken;
    }

    public async createLiveBroadcast(title: string, description: string) {
        if (!this.accessToken) throw new Error('Not authenticated');

        // 1. Create Broadcast
        const broadcastResponse = await fetch('https://www.googleapis.com/youtube/v3/liveBroadcasts?part=snippet,status,contentDetails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                snippet: {
                    title: title,
                    scheduledStartTime: new Date().toISOString(),
                    description: description
                },
                status: {
                    privacyStatus: 'public',
                    selfDeclaredMadeForKids: false
                },
                contentDetails: {
                    enableAutoStart: true,
                    enableAutoStop: true,
                    monitorStream: {
                        enableMonitorStream: false
                    }
                }
            })
        });
        
        if (broadcastResponse.status === 401) {
            this.logOut();
            throw new Error('Sua sessão do YouTube expirou. Por favor, faça login novamente.');
        }

        const broadcast = await broadcastResponse.json();
        if (!broadcast.id) {
            console.error('YouTube Broadcast Creation Failed:', broadcast);
            throw new Error(broadcast.error?.message || 'Failed to create broadcast');
        }

        // 2. Create Stream
        const streamResponse = await fetch('https://www.googleapis.com/youtube/v3/liveStreams?part=snippet,cdn', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                snippet: {
                    title: title + ' Stream'
                },
                cdn: {
                    frameRate: '60fps',
                    ingestionType: 'rtmp',
                    resolution: '720p'
                }
            })
        });

        if (streamResponse.status === 401) {
            this.logOut();
            throw new Error('Sua sessão do YouTube expirou. Por favor, faça login novamente.');
        }

        const stream = await streamResponse.json();
        if (!stream.id) {
            console.error('YouTube Stream Creation Failed:', stream);
            throw new Error(stream.error?.message || 'Failed to create stream');
        }

        // 3. Bind Broadcast to Stream
        const bindRes = await fetch(`https://www.googleapis.com/youtube/v3/liveBroadcasts/bind?id=${broadcast.id}&part=id,contentDetails&streamId=${stream.id}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (bindRes.status === 401) {
            this.logOut();
            throw new Error('Sua sessão do YouTube expirou. Por favor, faça login novamente.');
        }

        return {
            broadcastId: broadcast.id,
            streamKey: stream.cdn.ingestionInfo.streamName,
            rtmpUrl: stream.cdn.ingestionInfo.ingestionAddress
        };
    }

    public async getBroadcastDetails(broadcastId: string) {
        if (!this.accessToken) throw new Error('Not authenticated');

        // 1. Get Broadcast to find bound stream
        const bRes = await fetch(`https://www.googleapis.com/youtube/v3/liveBroadcasts?part=contentDetails&id=${broadcastId}`, {
            headers: { 'Authorization': `Bearer ${this.accessToken}` }
        });
        const bData = await bRes.json();
        const streamId = bData.items?.[0]?.contentDetails?.boundStreamId;

        if (!streamId) return null;

        // 2. Get Stream details
        const sRes = await fetch(`https://www.googleapis.com/youtube/v3/liveStreams?part=cdn&id=${streamId}`, {
            headers: { 'Authorization': `Bearer ${this.accessToken}` }
        });
        const sData = await sRes.json();
        const stream = sData.items?.[0];

        if (!stream) return null;

        return {
            streamKey: stream.cdn.ingestionInfo.streamName,
            rtmpUrl: stream.cdn.ingestionInfo.ingestionAddress
        };
    }

    public async deleteBroadcast(broadcastId: string) {
        if (!this.accessToken) throw new Error('Not authenticated');

        const response = await fetch(`https://www.googleapis.com/youtube/v3/liveBroadcasts?id=${broadcastId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${this.accessToken}` }
        });

        if (response.status === 401) {
            this.logOut();
            throw new Error('Sua sessão do YouTube expirou. Por favor, faça login novamente.');
        }

        if (!response.ok && response.status !== 204) {
            const data = await response.json();
            throw new Error(data.error?.message || 'Failed to delete broadcast');
        }
    }

    public async setBroadcastPrivacy(broadcastId: string, privacy: 'public' | 'private' | 'unlisted') {
        if (!this.accessToken) throw new Error('Not authenticated');

        const response = await fetch(`https://www.googleapis.com/youtube/v3/liveBroadcasts?part=status`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: broadcastId,
                status: {
                    privacyStatus: privacy
                }
            })
        });

        if (response.status === 401) {
            this.logOut();
            throw new Error('Sua sessão do YouTube expirou. Por favor, faça login novamente.');
        }

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error?.message || 'Failed to update privacy');
        }
    }
}
