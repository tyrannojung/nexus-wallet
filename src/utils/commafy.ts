export default function commafy(num: number): string {
  // 숫자를 문자열로 변환
  const numStr = num.toString();

  return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
