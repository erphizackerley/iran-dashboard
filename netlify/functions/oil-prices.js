exports.handler = async function(event, context) {
  const apiKey1 = process.env.ALPHA_VANTAGE_KEY;
  const apiKey2 = process.env.ALPHA_VANTAGE_KEY_2;

  if (!apiKey1 || !apiKey2) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API keys not configured' })
    };
  }

  try {
    // Use separate keys for each call to avoid rate limiting
    const [brentRes, wtiRes] = await Promise.all([
      fetch(`https://www.alphavantage.co/query?function=BRENT&interval=daily&apikey=${apiKey1}`),
      fetch(`https://www.alphavantage.co/query?function=WTI&interval=daily&apikey=${apiKey2}`)
    ]);

    const brentData = await brentRes.json();
    const wtiData   = await wtiRes.json();

    const brentLatest    = brentData?.data?.[0];
    const brentPrev      = brentData?.data?.[1];
    const wtiLatest      = wtiData?.data?.[0];
    const wtiPrev        = wtiData?.data?.[1];

    const brentPrice     = brentLatest ? parseFloat(brentLatest.value) : null;
    const brentPrevPrice = brentPrev   ? parseFloat(brentPrev.value)   : null;
    const wtiPrice       = wtiLatest   ? parseFloat(wtiLatest.value)   : null;
    const wtiPrevPrice   = wtiPrev     ? parseFloat(wtiPrev.value)     : null;

    const brentChange    = brentPrice && brentPrevPrice ? brentPrice - brentPrevPrice : null;
    const brentChangePct = brentChange && brentPrevPrice ? (brentChange / brentPrevPrice) * 100 : null;
    const wtiChange      = wtiPrice && wtiPrevPrice ? wtiPrice - wtiPrevPrice : null;
    const wtiChangePct   = wtiChange && wtiPrevPrice ? (wtiChange / wtiPrevPrice) * 100 : null;

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
