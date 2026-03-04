export const getVerificationCodeEmailTemplate = ({
   code,
   expiresInTitle = '15 分钟',
}: {
   code: string;
   expiresInTitle?: string;
}) => {
   const primaryColor = '#fa7c0e';
   const bgColor = '#111111';
   const cardColor = '#1c1c1c';
   const textPrimary = '#e5e5e5';
   const textSecondary = '#cacaca';
   const textMuted = '#6d6d6d';
   const borderColor = '#272727';
   const dashedBorderColor = '#434343';

   // 确保验证码大写
   const upperCaseCode = code.toUpperCase();

   return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>验证码 - Quanta Challenge</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Manrope', 'PingFang SC', 'Microsoft YaHei', sans-serif;
      background-color: ${bgColor};
      color: ${textPrimary};
      -webkit-font-smoothing: antialiased;
    }
    table {
      border-spacing: 0;
      border-collapse: collapse;
    }
    .wrapper {
      width: 100%;
      background-color: ${bgColor};
      padding: 40px 20px;
    }
    .container {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
    }
    .card {
      background-color: ${cardColor};
      border-radius: 12px;
      padding: 48px 40px;
      text-align: center;
      border: 1px solid ${borderColor};
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    }
    .logo {
      font-size: 26px;
      font-weight: 800;
      color: ${textPrimary};
      margin-bottom: 32px;
      display: inline-block;
      text-decoration: none;
      letter-spacing: -0.5px;
    }
    .logo span {
      color: ${primaryColor};
    }
    .title {
      font-size: 22px;
      font-weight: 700;
      margin: 0 0 16px 0;
      color: ${textPrimary};
    }
    .description {
      font-size: 15px;
      color: ${textSecondary};
      margin: 0 0 32px 0;
      line-height: 1.6;
    }
    .strong {
      color: ${textPrimary};
      font-weight: 600;
    }
    .code-container {
      background-color: ${bgColor};
      border: 1px dashed ${dashedBorderColor};
      border-radius: 8px;
      padding: 24px;
      margin: 0 auto 32px auto;
      text-align: center;
      max-width: 400px;
    }
    .code {
      font-family: 'FiraCode Nerd Font Mono', Consolas, 'Microsoft YaHei', monospace;
      font-size: 36px;
      font-weight: 700;
      letter-spacing: 12px;
      color: ${primaryColor};
      margin: 0;
      line-height: 1;
      /* 补偿最后一个字符的 letter-spacing 导致的视觉不居中 */
      padding-left: 12px;
    }
    .warning {
      font-size: 13px;
      color: ${textMuted};
      margin: 0;
      line-height: 1.6;
    }
    .footer {
      font-size: 12px;
      color: ${textMuted};
      margin-top: 40px;
      text-align: center;
      line-height: 1.6;
    }
    .footer-text {
      margin: 0 0 8px 0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="card">
        <a href="https://challenge.quantacenter.com" class="logo" target="_blank" rel="noopener">
        <div style="text-align: center">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="100"
                height="72"
                viewBox="0 -2 74 42"
                fill="none">
                <g clip-path="url(#clip0_21_52)">
                    <path
                        d="M30.9113 0.0407064C33.1488 -0.271785 35.268 1.20329 35.7321 3.44002L37.8908 13.8419L37.9302 14.0604C38.2807 16.3177 36.8026 18.4775 34.541 18.947C32.2064 19.4316 29.921 17.9316 29.4365 15.5968L28.1414 9.35662L9.85271 12.8533L13.5758 32.7129L18.614 31.8554C20.9645 31.4553 23.1942 33.0365 23.5942 35.3874C23.9943 37.7382 22.4133 39.968 20.0627 40.3684L10.8396 41.9385C8.51692 42.3337 6.30624 40.7939 5.87201 38.4777L0.573612 10.216C0.135311 7.87814 1.67018 5.6258 4.00622 5.17915L30.6944 0.0763554L30.9113 0.0407064Z"
                        fill="#FE6603" />
                    <path
                        d="M22.4007 21.8893C23.8147 20.0627 26.4038 19.6819 28.2782 20.987L28.4576 21.1185L40.6241 30.539L40.7964 30.6797C42.5292 32.1677 42.809 34.77 41.3949 36.5967C39.9808 38.4232 37.392 38.8041 35.5175 37.499L35.3381 37.3675L23.1715 27.947L22.9994 27.8063C21.2665 26.3183 20.9867 23.7159 22.4007 21.8893Z"
                        fill="#FE6603" />
                    <path
                        d="M45.4299 4.87628C47.7223 4.22128 50.1117 5.54922 50.7668 7.84203C51.4218 10.1349 50.0941 12.5247 47.8012 13.1798L46.4276 13.5724C44.1351 14.2273 41.7458 12.8994 41.0907 10.6066C40.4357 8.31377 41.7634 5.92389 44.0563 5.26881L45.4299 4.87628Z"
                        fill="white" />
                    <path
                        d="M68.3916 0.465754C70.7354 0.028799 72.9898 1.57493 73.4266 3.91912C73.8638 6.26327 72.3179 8.51777 69.974 8.95484L62.6242 10.3252L65.9728 28.6638L66.0069 28.8831C66.3032 31.1481 64.7734 33.2719 62.5013 33.6869C60.2289 34.1017 58.048 32.6559 57.5244 30.4325L57.4789 30.2147L53.3579 7.64464C52.9309 5.30501 54.4761 3.06054 56.8136 2.62463L68.3916 0.465754Z"
                        fill="white" />
                </g>
                <defs>
                    <clipPath id="clip0_21_52">
                    <rect width="73" height="42" fill="white" transform="translate(0.5)" />
                    </clipPath>
                </defs>
            </svg>
            <div style='font-family: "Source Serif Pro", "SimSun", "STSong", serif;'>
            <span>Quanta</span> Challenge
            </div>
        </div>
        </a>
        
        <h2 class="title">身份验证</h2>
        
        <p class="description">
            您正在进行身份验证操作。<br />
            请使用下方的验证码完成验证，该验证码在 <span class="strong">${expiresInTitle}</span> 内有效。
        </p>
        
        <div class="code-container">
          <div class="code">${upperCaseCode}</div>
        </div>
        
        <p class="warning">
          如果您没有发起此请求，请忽略此邮件。<br/>
          为了保护您的账号安全，<strong>请勿将此验证码泄露给他人。</strong>
        </p>
      </div>
      
      <div class="footer">
        <p class="footer-text">&copy; ${new Date().getFullYear()} Quanta Center. All rights reserved.</p>
        <p class="footer-text">这是一封由系统自动发送的邮件，请勿直接回复。</p>
      </div>
    </div>
  </div>
</body>
</html>`;
};
