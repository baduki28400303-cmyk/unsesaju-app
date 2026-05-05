function checkPremium(){
  const d=JSON.parse(localStorage.getItem('fortune_premium')||'null');
  return d&&Date.now()<d.expires;
}
function getPremiumExpiry(){
  const d=JSON.parse(localStorage.getItem('fortune_premium')||'null');
  return d?new Date(d.expires):null;
}
function setPremium(days){
  days=days||30;
  localStorage.setItem('fortune_premium',JSON.stringify({expires:Date.now()+(days*86400000),days}));
  alert('✅ 프리미엄이 활성화되었습니다!\n'+days+'일간 모든 기능을 이용하실 수 있습니다.');
  location.reload();
}

// 구글 플레이 인앱결제 브릿지 (Flutter 앱에서 호출)
window.fortuneApp=window.fortuneApp||{};
window.fortuneApp.onPurchaseSuccess=function(productId,token){
  setPremium(productId.includes('yearly')?365:30);
};
window.fortuneApp.onPurchaseFailed=function(code,msg){
  if(code!=='USER_CANCELED') alert('결제 오류: '+msg);
};
window.fortuneApp.onRestorePurchase=function(productId,expiryMs){
  localStorage.setItem('fortune_premium',JSON.stringify({expires:expiryMs}));
  alert('✅ 구독이 복원되었습니다.');
  location.reload();
};

function updatePremiumBadge(){
  const el=document.getElementById('premium-status');
  if(!el)return;
  if(checkPremium()){
    const exp=getPremiumExpiry();
    const left=exp?Math.ceil((exp-Date.now())/86400000):0;
    el.textContent='👑 D-'+left;
  }
}
document.addEventListener('DOMContentLoaded',updatePremiumBadge);
