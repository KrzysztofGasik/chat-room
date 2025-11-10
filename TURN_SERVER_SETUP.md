# TURN Server Setup Guide

## What is a TURN Server?

**TURN (Traversal Using Relays around NAT)** servers relay media traffic when direct peer-to-peer connections fail. This is critical for:
- Mobile networks (cellular data)
- Strict NATs (corporate networks, some ISPs)
- Firewalls blocking P2P connections

**STUN** (already configured) only discovers your public IP. **TURN** actually relays the media.

## Environment Variables

Create a `.env` file in the `client/` directory with:

```env
# API Configuration
VITE_API_URL=http://localhost:3000

# TURN Server Configuration (Optional)
# Leave empty for development (STUN only)
VITE_TURN_URL=turn:your-turn-server.com:3478
VITE_TURN_USERNAME=your-username
VITE_TURN_CREDENTIAL=your-password
```

**Important:** Never commit `.env` files to git! They're already in `.gitignore`.

## TURN Server Options

### Option 1: Metered TURN (Recommended for Start)

**Free tier:** 1 GB/month (enough for testing)
**Paid:** $0.50/GB

1. Sign up at https://www.metered.ca/tools/openrelay/
2. Get your credentials from dashboard
3. Use format: `turn:openrelay.metered.ca:80`

**Pros:**
- Free tier for testing
- Easy setup
- Pay-as-you-go pricing

**Cons:**
- Limited free tier
- Costs scale with usage

---

### Option 2: Twilio STUN/TURN (Best for Production)

**Free trial:** $15.50 credit
**Paid:** $0.40/GB

1. Sign up at https://www.twilio.com/
2. Go to "Network Traversal Service" → "Credentials"
3. Get your credentials

**Format:**
```
VITE_TURN_URL=turn:global.turn.twilio.com:3478?transport=udp
# Or for TCP:
VITE_TURN_URL=turn:global.turn.twilio.com:3478?transport=tcp
```

**Pros:**
- Reliable (enterprise-grade)
- Global infrastructure
- Good documentation

**Cons:**
- Requires credit card (even for free trial)
- More expensive than self-hosted

---

### Option 3: Self-Hosted Coturn (Free, but Complex)

**Cost:** Free (just server costs)

1. Deploy Coturn on a VPS (DigitalOcean, AWS, etc.)
2. Configure firewall (open ports 3478, 49152-65535)
3. Set up authentication

**Example setup:**
```bash
# Install Coturn
sudo apt-get install coturn

# Configure /etc/turnserver.conf
listening-port=3478
realm=yourdomain.com
user=username:password
```

**Pros:**
- Completely free (after server cost)
- Full control
- No usage limits

**Cons:**
- Requires server management
- More complex setup
- You handle scaling/maintenance

---

### Option 4: Xirsys (Alternative)

**Free trial:** Available
**Paid:** Various plans

1. Sign up at https://xirsys.com/
2. Create a domain and get credentials
3. Use provided TURN URLs

---

## Development vs Production

### Development (Local)
- **No TURN needed** - STUN is enough for localhost testing
- Leave TURN variables empty
- Works fine for desktop-to-desktop on same network

### Production
- **TURN is essential** for mobile users
- **TURN is essential** for users behind strict NATs
- Without TURN: ~30-50% of connections will fail
- With TURN: ~95%+ success rate

## Testing Your TURN Server

1. Set up your `.env` file with TURN credentials
2. Restart your dev server (`npm run dev`)
3. Test video call between:
   - Desktop + Mobile (different networks)
   - Two mobile devices (different networks)
   - Behind corporate firewall

## Security Notes

⚠️ **Important:** TURN credentials are exposed in the client bundle!

- Anyone can see your TURN credentials in browser DevTools
- Use **time-limited credentials** (Twilio supports this)
- Or use **TURN REST API** to generate temporary credentials (more secure)
- For production, consider fetching TURN credentials from your backend API

## Advanced: Dynamic TURN Credentials (More Secure)

Instead of hardcoding in `.env`, fetch from your backend:

```typescript
// In your backend (NestJS)
@Get('webrtc/ice-servers')
async getIceServers() {
  // Generate temporary TURN credentials
  // Return to authenticated users only
  return {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      {
        urls: 'turn:your-server.com:3478',
        username: generateTempUsername(),
        credential: generateTempCredential(),
      },
    ],
  };
}
```

Then in frontend:
```typescript
const response = await apiClient.get('/webrtc/ice-servers');
const iceServers = response.data.iceServers;
```

This is more secure but requires backend changes.

## Current Implementation

The current code in `useWebRTC.ts`:
- ✅ Uses STUN (always available)
- ✅ Uses TURN if env variables are set
- ✅ Falls back gracefully if TURN not configured
- ⚠️ Exposes TURN credentials in client bundle (acceptable for MVP)

## Recommended Path

1. **Development:** Use STUN only (no TURN needed)
2. **Testing:** Use Metered TURN free tier
3. **Production:** Use Twilio or self-hosted Coturn

