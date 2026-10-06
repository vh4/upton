import { ImageResponse } from 'next/og';

export const alt = 'UP-TON — Fast, Free & Ephemeral File Sharing';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #09090b 0%, #18181b 50%, #09090b 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 60px',
          fontFamily: 'sans-serif',
          color: '#ffffff',
          position: 'relative',
        }}
      >
        {/* Brand badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 24px',
            borderRadius: '9999px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            fontSize: 18,
            color: '#fbbf24',
            marginBottom: '28px',
          }}
        >
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#10b981',
            }}
          />
          <span style={{ fontWeight: 700, letterSpacing: '1px' }}>
            UPLOAD • SHARE • DONE
          </span>
        </div>

        {/* Main Title */}
        <div
          style={{
            fontSize: 76,
            fontWeight: 900,
            letterSpacing: '-2px',
            textAlign: 'center',
            color: '#ffffff',
            marginBottom: '16px',
            lineHeight: 1.1,
          }}
        >
          UP-TON
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 32,
            fontWeight: 500,
            textAlign: 'center',
            color: '#a1a1aa',
            maxWidth: '920px',
            lineHeight: 1.3,
            marginBottom: '44px',
          }}
        >
          Fast, Free & Ephemeral File Sharing for Images & Videos
        </div>

        {/* Highlights Pills */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              borderRadius: '14px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              color: '#34d399',
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            No Account Needed
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              borderRadius: '14px',
              background: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.35)',
              color: '#60a5fa',
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            Auto-Expiration (1h - 30d)
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              borderRadius: '14px',
              background: 'rgba(168, 85, 247, 0.15)',
              border: '1px solid rgba(168, 85, 247, 0.35)',
              color: '#c084fc',
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            HTML5 Video Streaming
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
