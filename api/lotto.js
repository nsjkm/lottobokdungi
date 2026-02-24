export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    // 최신 회차 자동 계산
    const baseDate = new Date('2002-12-07');
    const now = new Date();
    const diffDays = Math.floor((now - baseDate) / (1000 * 60 * 60 * 24));
    let round = 1 + Math.floor(diffDays / 7);
    const day = now.getDay();
    const hour = now.getHours();
    if (day === 6 && hour < 21) round -= 1;

    const response = await fetch(
      `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${round}`
    );
    const data = await response.json();

    res.status(200).json({
      round: round,
      prize: data.firstWinamnt,
      numbers: [data.drwtNo1, data.drwtNo2, data.drwtNo3, data.drwtNo4, data.drwtNo5, data.drwtNo6],
      bonus: data.bnusNo,
      date: data.drwNoDate
    });
  } catch (e) {
    res.status(500).json({ error: '데이터 불러오기 실패' });
  }
}
