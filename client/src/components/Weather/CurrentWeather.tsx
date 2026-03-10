/**
 * CurrentWeather.tsx — redesigned
 */

interface CurrentWeatherProps {
  data: any;
}

function CurrentWeather({ data }: CurrentWeatherProps) {
  const icon = data.weather?.[0]?.icon;
  const desc = data.weather?.[0]?.description ?? '';
  const temp = Math.round(data.main?.temp);
  const feelsLike = Math.round(data.main?.feels_like);
  const humidity = data.main?.humidity;

  return (
    <div className="card" style={{ padding: '0.875rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {icon && (
          <img
            src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
            alt={desc}
            style={{ width: 44, height: 44, flexShrink: 0 }}
          />
        )}
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--ink)', lineHeight: 1 }}>
              {temp}°
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>C</span>
          </div>
          <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--ink-soft)', textTransform: 'capitalize', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {desc}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.625rem', paddingTop: '0.625rem', borderTop: '1px solid var(--border-soft)' }}>
        <div>
          <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--ink-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Feels like</p>
          <p style={{ margin: '2px 0 0', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--ink)' }}>{feelsLike}°</p>
        </div>
        <div>
          <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--ink-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Humidity</p>
          <p style={{ margin: '2px 0 0', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--ink)' }}>{humidity}%</p>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--ink-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>City</p>
          <p style={{ margin: '2px 0 0', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--ink)', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{data.name}</p>
        </div>
      </div>
    </div>
  );
}

export default CurrentWeather;
