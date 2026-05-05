// ★★★ 여기에 새로 발급받은 Gemini API 키를 입력하세요 ★★★
const GEMINI_API_KEY = 'AIzaSyCaajq6-UQDgqhfLWkclUCQqjxRBO9AVNw';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const STEMS = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const ZODIACS = ['쥐','소','호랑이','토끼','용','뱀','말','양','원숭이','닭','개','돼지'];

const CAT_NAMES = {
  destiny:'운명/전체운세',wealth:'재물운',love:'애정운',
  health:'건강운',career:'직업운/사업운',bigluck:'대운시기/10년운세',
  tojeong:'토정비결',mbti:'MBTI 궁합'
};

function getYearPillar(year){
  return{stem:STEMS[(year-4)%10],branch:BRANCHES[(year-4)%12],animal:ZODIACS[(year-4)%12]};
}

async function generateFortune(profile,category){
  const{year,month,day,hour,gender,name}=profile;
  const hourStr=(hour===-1||hour==='-1')?'모름':hour+'시';
  const prompt=`당신은 30년 경력의 전문 사주/운세 해설가입니다.
[사주 정보]
- 이름: ${name||'사용자'}
- 출생년월일: ${year}년 ${month}월 ${day}일
- 출생시간: ${hourStr}
- 성별: ${gender==='M'?'남성':'여성'}
- 분야: ${CAT_NAMES[category]||'전체운세'}
- 기준: 2026년

반드시 아래 JSON 형식만 출력하세요 (백틱/마크다운 절대 금지):
{"score":85,"summary":"한줄요약","analysis":"사주팔자 분석 200자","fortune":"운세 상세 해설 400자","advice":"조언 및 주의사항 200자","lucky_color":"빨간색","lucky_number":"3,7","lucky_direction":"남쪽","lucky_food":"나물류"}`;

  const res=await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{temperature:0.8,maxOutputTokens:1024}})
  });
  if(!res.ok) throw new Error('API '+res.status);
  const data=await res.json();
  const raw=(data.candidates?.[0]?.content?.parts?.[0]?.text||'').replace(/```json|```/gi,'').trim();
  const s=raw.indexOf('{'),e=raw.lastIndexOf('}');
  try{return JSON.parse(raw.slice(s,e+1));}
  catch{return{score:75,summary:'AI 분석 완료',analysis:raw,fortune:raw,advice:'운세를 참고하세요.',lucky_color:'빨간색',lucky_number:'3',lucky_direction:'남쪽',lucky_food:'나물류'};}
}

function getProfile(){
  return JSON.parse(localStorage.getItem('fortune_profiles')||'[]')[0]||null;
}
function saveProfile(p){
  localStorage.setItem('fortune_profiles',JSON.stringify([p]));
}

const MBTI_DATA={
  'ISTJ':{best:['ESTJ','ISFJ','INTJ'],good:['ISTP','ENTJ'],bad:['ENFP','ESFP'],desc:'신뢰할 수 있는 현실주의자'},
  'ISFJ':{best:['ISFJ','ISTJ','ESFJ'],good:['INFJ','ESTJ'],bad:['ENTP','ENTJ'],desc:'따뜻한 수호자'},
  'INFJ':{best:['ENFJ','INFP','INTJ'],good:['ISFJ','ENTP'],bad:['ESTP','ESFP'],desc:'선의의 옹호자'},
  'INTJ':{best:['INTJ','ENTJ','INFJ'],good:['ISTJ','ENTP'],bad:['ESFJ','ISFP'],desc:'용의주도한 전략가'},
  'ISTP':{best:['ESTP','ISTJ','INTP'],good:['ISFP','ENTP'],bad:['ENFJ','ESFJ'],desc:'만능 재주꾼'},
  'ISFP':{best:['ESFP','ISFJ','INFP'],good:['ISTP','ESFJ'],bad:['ENTJ','ESTJ'],desc:'호기심 많은 예술가'},
  'INFP':{best:['INFJ','ENFP','INTJ'],good:['ISFP','ENTP'],bad:['ESTJ','ESTP'],desc:'열정적인 중재자'},
  'INTP':{best:['ENTP','INTJ','INFP'],good:['ISTP','ENTJ'],bad:['ESFJ','ESTJ'],desc:'논리적인 사색가'},
  'ESTP':{best:['ISTP','ESTJ','ESFP'],good:['ENTP','ISFP'],bad:['INFJ','INFP'],desc:'에너지 넘치는 활동가'},
  'ESFP':{best:['ISFP','ESFJ','ESTP'],good:['ENFP','ISFJ'],bad:['INTJ','INFJ'],desc:'자유로운 영혼'},
  'ENFP':{best:['INFP','ENFJ','ENTP'],good:['ESFP','INFJ'],bad:['ISTJ','ISFJ'],desc:'열정적인 활동가'},
  'ENTP':{best:['ENTJ','INTP','ENFP'],good:['ESTP','INFJ'],bad:['ISFJ','ESFJ'],desc:'논쟁을 즐기는 변론가'},
  'ESTJ':{best:['ISTJ','ESTP','ESFJ'],good:['ENTJ','ISFJ'],bad:['INFP','ISFP'],desc:'엄격한 관리자'},
  'ESFJ':{best:['ISFJ','ESFP','ESTJ'],good:['ENFJ','ISFP'],bad:['INTP','INTJ'],desc:'사교적인 외교관'},
  'ENFJ':{best:['INFJ','ENFP','ESFJ'],good:['ENTJ','INFP'],bad:['ISTP','ESTP'],desc:'정의로운 사회운동가'},
  'ENTJ':{best:['INTJ','ENTP','ESTJ'],good:['ENFJ','INTP'],bad:['ISFP','INFP'],desc:'대담한 통솔자'}
};

function getMbtiCompat(t1,t2){
  const d=MBTI_DATA[t1];if(!d)return null;
  let score,grade,msg;
  if(d.best.includes(t2)){score=95;grade='최고의 궁합 ❤️';msg=`${t1}와 ${t2}는 천생연분! 서로의 장점을 극대화하는 최고의 조합입니다.`;}
  else if(d.good.includes(t2)){score=80;grade='좋은 궁합 😊';msg=`${t1}와 ${t2}는 서로 다른 매력을 느끼며 배울 점이 많은 관계입니다.`;}
  else if(d.bad.includes(t2)){score=45;grade='어려운 궁합 💪';msg=`${t1}와 ${t2}는 노력이 필요하지만 극복하면 좋은 시너지를 낼 수 있습니다.`;}
  else{score=65;grade='보통 궁합 🙂';msg=`${t1}와 ${t2}는 큰 갈등 없이 무난하게 지낼 수 있는 조합입니다.`;}
  return{score,grade,msg,desc1:d.desc};
}

function getTojeongResult(sticks){
  const total=sticks.reduce((a,b)=>a+b,0);
  if(total>=18)return{grade:'대길 (大吉)',icon:'🌟',msg:'매우 좋은 운세입니다. 모든 일이 뜻대로 이루어지며 큰 성취를 이룰 수 있습니다!'};
  if(total>=12)return{grade:'중길 (中吉)',icon:'☀️',msg:'좋은 운세입니다. 원하는 방향으로 진행되며 노력한 만큼의 성과를 거둘 수 있습니다.'};
  if(total>=6)return{grade:'소길 (小吉)',icon:'🌤',msg:'보통의 운세입니다. 어려움이 있지만 극복할 수 있으며 작은 성과를 기대할 수 있습니다.'};
  return{grade:'흉 (凶)',icon:'⚠️',msg:'조심이 필요한 운세입니다. 중요한 결정은 미루고 차분히 대처하세요.'};
}
