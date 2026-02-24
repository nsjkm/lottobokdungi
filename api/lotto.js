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

    // 모바일 페이지로 시도 (더 가벼움)
    const response = await fetch(
      `https://m.dhlottery.co.kr/gameResult.do?method=byWin&drwNo=${round}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1',
          'Referer': 'https://m.dhlottery.co.kr/',
          'Accept': 'text/html,application/xhtml+xml'
        }
      }
    );

    const html = await response.text();

    // 번호 파싱 - span 태그에서 숫자 추출
    const ballMatches = [...html.matchAll(/class="ball_645[^"]*"\s*>(\d+)<\/span>/g)];
    const numbers = ballMatches.slice(0, 6).map(m => parseInt(m[1]));
    const bonus = ballMatches[6] ? parseInt(ballMatches[6][1]) : 0;

    // 당첨금 파싱
    const prizeMatch = html.match(/firstWinAmt[^>]*>([0-9,]+)/);
    const prize = prizeMatch ? parseInt(prizeMatch[1].replace(/,/g, '')) : 0;

    res.status(200).json({ round, numbers, bonus, prize, raw: html.substring(0, 500) });

  } catch (e) {
    res.status(500).json({ error: '실패', message: e.message });
  }
}
