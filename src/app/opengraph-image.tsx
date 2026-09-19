import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const alt = 'Dust and Dazzle — Tales from a Village and a City';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F5ECE1',
          backgroundImage: 'radial-gradient(circle at 50% 50%, #FAF3EB 0%, #E8D9C5 100%)',
          padding: '60px 80px',
          border: '16px solid #8C3A27',
          boxSizing: 'border-box',
          fontFamily: 'serif',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 48,
            marginBottom: 16,
          }}
        >
          🪔
        </div>
        <div
          style={{
            fontSize: 22,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: '#8C3A27',
            marginBottom: 16,
          }}
        >
          A Collection of Short Stories
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: '#2B1D14',
            marginBottom: 16,
            lineHeight: 1.1,
          }}
        >
          Dust and Dazzle
        </div>
        <div
          style={{
            fontSize: 28,
            fontStyle: 'italic',
            color: '#6B5446',
            marginBottom: 32,
          }}
        >
          Tales from a Village and a City
        </div>
        <div
          style={{
            fontSize: 22,
            color: '#3A4F3F',
            fontWeight: 500,
            letterSpacing: '0.05em',
          }}
        >
          By Ajeet Kumar Singh
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
