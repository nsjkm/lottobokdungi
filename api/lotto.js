export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=3600');

  try {
    // 회차 자동 계산
    const baseDate = new Date('2002-12-07');
    const now = new Date();
    const diffDays = Math.floor((now - baseDate) / (1000 * 60 * 60 * 24));
    let round = 1 + Math.floor(diffDays / 7);
    const day = now.getDay();
    const hour = now.getHours();
    if (day === 6 && hour < 21) round -= 1;

    // 동행복권 HTML 페이지에서 당첨번호 스크래핑
    const response = await fetch(
      `https://www.dhlottery.co.kr/gameResult.do?method=byWin&drwNo=${round}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://www.dhlottery.co.kr/',
        }
      }
    );
    const html = await response.text();

    // 당첨번호 파싱
    const numMatches = html.match(/class="ball_645[^"]*">(\d+)<\/span>/g);
    const numbers = numMatches ? numMatches.slice(0,6).map(m => parseInt(m.match(/(\d+)<\/span>/)[1])) : [];
    const bonus = numMatches ? parseInt(numMatches[6]?.match(/(\d+)<\/span>/)?.[1] || 0) : 0;

    // 당첨금 파싱
    const prizeMatch = html.match(/1등[^<]*<[^>]*>([0-9,]+)원/);
    const prize = prizeMatch ? parseInt(prizeMatch[1].replace(/,/g, '')) : 0;

    res.status(200).json({ round, numbers, bonus, prize });

  } catch (e) {
    res.status(500).json({ error: '실패', message: e.message });
  }
}
