export const KakaoLogin = () => {
  const Rest_api_key = '0ee2193a048d38e5d783af58eac76e36'; // REST API KEY
  const redirect_uri = 'http://13.209.177.1:3000/OAuthCallback'; // Redirect URI
  const kakaoURL = `https://kauth.kakao.com/oauth/authorize?client_id=${Rest_api_key}&redirect_uri=${redirect_uri}&response_type=code`;

  window.location.href = kakaoURL;
};
