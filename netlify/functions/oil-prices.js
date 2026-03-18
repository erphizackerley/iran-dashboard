exports.handler = async function(event, context) {
  const apiKey = process.env.ALPHA_VANTAGE_KEY;

  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API key not configured' })
    };
  }

  try {
    // Fetch Brent and WTI in parallel
    const [brentRes, wtiRes] = await Promise.all([
      fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=BZ=F&apikey=${apiKey}`),
      fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=CL=F&apikey=${apiKey}`)
    ]);

    const brentData = await brentRes.json();
    const wtiData = await wtiRes.json();

    const brentQuote = brentData['Global Quote'];
    const wtiQuote = wtiData['Global Quote'];

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        brent: brentQuote ? {
          price: parseFloat(brentQuote['05. price']),
          change: parseFloat(brentQuote['09. change']),
          changePct: parseFloat(brentQuote['10. change percent'].replace('%', '')),
          updated: brentQuote['07. latest trading day']
        } : null,
        wti: wtiQuote ? {
          price: parseFloat(wtiQuote['05. price']),
          change: parseFloat(wtiQuote['09. change']),
          changePct: parseFloat(wtiQuote['10. change percent'].replace('%', '')),
          updated: wtiQuote['07. latest trading day']
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
