exports.handler = async function(event, context) {
  const apiKey = process.env.ALPHA_VANTAGE_KEY;

  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API key not configured' })
    };
  }

  try {
    const [wtiRes, brentRes] = await Promise.all([
      fetch(`https://www.alphavantage.co/query?function=WTI&interval=daily&apikey=${apiKey}`),
      fetch(`https://www.alphavantage.co/query?function=BRENT&interval=daily&apikey=${apiKey}`)
    ]);

    const wtiData = await wtiRes.json();
    const brentData = await brentRes.json();

    const wtiLatest  = wtiData?.data?.[0];
    const wtiPrev    = wtiData?.data?.[1];
    const brentLatest = brentData?.data?.[0];
    const brentPrev   = brentData?.data?.[1];

    const wtiPrice       = wtiLatest   ? parseFloat(wtiLatest.value)   : null;
    const wtiPrevPrice   = wtiPrev     ? parseFloat(wtiPrev.value)     : null;
    const brentPrice     = brentLatest ? parseFloat(brentLatest.value) : null;
    const brentPrevPrice = brentPrev   ? parseFloat(brentPrev.value)   : null;

    const wtiChange      = wtiPrice && wtiPrevPrice     ? wtiPrice - wtiPrevPrice     : null;
    const wtiChangePct   = wtiChange && wtiPrevPrice    ? (wtiChange / wtiPrevPrice) * 100   : null;
    const brentChange    = brentPrice && brentPrevPrice ? brentPrice - brentPrevPrice : null;
    const brentChangePct = brentChange && brentPrevPrice ? (brentChange / brentPrevPrice) * 100 : null;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        brent: brentPrice ? {
          price: brentPrice,
          change: brentChange,
          changePct: brentChangePct,
          updated: brentLatest.date
        } : null,
        wti: wtiPrice ? {
          price: wtiPrice,
          change: wtiChange,
          changePct: wtiChangePct,
          updated: wtiLatest.date
        } : null
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
