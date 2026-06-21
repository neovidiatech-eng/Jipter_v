export const mailTemp = ({
  title,
  otp,
  text,
  username = "there",
  lang = "en",
  variant = "verify",
}) => {
  const isAr = lang === "ar";

  const brandName = "JUPITER";
  const primaryColor = "#1A4FC0";
  const secondaryColor = "#5B9BF8";

  const displayTitle =
    title || (isAr ? "إشعار" : "Notification");

  const safeOtp = String(otp ?? "").trim();

  const otpBoxes = safeOtp
    .split("")
    .map(
      (digit) => `
      <td style="padding:0 4px;">
        <div class="otp-box" style="
          width:48px;
          height:56px;
          background:#111111;
          border:1px solid ${primaryColor}35;
          border-radius:14px;
          text-align:center;
          line-height:56px;
          font-size:26px;
          font-weight:800;
          color:#FFFFFF;
          font-family:monospace;
        ">
          ${digit}
        </div>
      </td>
    `,
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="${lang}" dir="${isAr ? "rtl" : "ltr"}">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>${displayTitle}</title>

  <style>

    body{
      margin:0;
      padding:0;
      background:#FFFFFF;
      font-family:Arial, Helvetica, sans-serif;
    }

    @media only screen and (max-width:620px){

      .container{
        width:100% !important;
      }

      .mobile-padding{
        padding-left:24px !important;
        padding-right:24px !important;
      }

      .hero-title{
        font-size:34px !important;
      }

      .otp-box{
        width:42px !important;
        height:52px !important;
        line-height:52px !important;
        font-size:22px !important;
      }

    }

  </style>
</head>

<body>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FFFFFF;">
    <tr>
      <td align="center" style="padding:40px 14px;">

        <!-- Card -->
        <table
          class="container"
          width="460"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            width:100%;
            max-width:460px;
            background:#050505;
            border-radius:28px;
            overflow:hidden;
            border:1px solid #111111;
            box-shadow:
              0 20px 60px rgba(0,0,0,0.12);
          "
        >

          <!-- Top Bar -->
          <tr>
            <td style="
              height:5px;
              background:linear-gradient(
                90deg,
                ${primaryColor} 0%,
                ${secondaryColor} 50%,
                ${primaryColor} 100%
              );
            "></td>
          </tr>

          <!-- Header -->
          <tr>
            <td
              class="mobile-padding"
              style="padding:30px 34px 0 34px;"
            >

              <table width="100%">
                <tr>

                  <td align="${isAr ? "right" : "left"}">

                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>

                        <td>

                          <div style="
                            width:48px;
                            height:48px;
                            border-radius:14px;
                            background:linear-gradient(
                              135deg,
                              ${primaryColor} 0%,
                              ${secondaryColor} 100%
                            );
                            overflow:hidden;
                          ">
                            <img
                              src="https://jupiter-egy.com/assets/white-logo.png"
                              alt="logo"
                              style="
                                width:100%;
                                height:100%;
                                object-fit:cover;
                              "
                            />
                          </div>

                        </td>

                        <td style="padding-${isAr ? "right" : "left"}:12px;">

                          <p style="
                            margin:0;
                            color:#FFFFFF;
                            font-size:26px;
                            font-weight:800;
                            letter-spacing:1px;
                          ">
                            ${brandName}
                          </p>

                          <p style="
                            margin:4px 0 0 0;
                            color:${secondaryColor};
                            font-size:10px;
                            font-weight:700;
                            letter-spacing:1.8px;
                            text-transform:uppercase;
                          ">
                            LEARN • CODE • BUILD
                          </p>

                        </td>

                      </tr>
                    </table>

                  </td>

                </tr>
              </table>

            </td>
          </tr>

          <!-- Hero -->
          <tr>
            <td
              class="mobile-padding"
              style="padding:28px 34px 0 34px;"
            >

              <!-- Check / Bell -->
              <table align="center" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">

                    <div style="
                      width:88px;
                      height:88px;
                      border-radius:50%;
                      background:#0F1115;
                      border:1px solid ${primaryColor}30;
                      text-align:center;
                      line-height:88px;
                    ">
                      <span style="
                        color:${secondaryColor};
                        font-size:42px;
                        font-weight:700;
                      ">
                        ${variant === "reminder" ? "🔔" : "✓"}
                      </span>
                    </div>

                  </td>
                </tr>
              </table>

              <!-- Title -->
              <h1 class="hero-title" style="
                margin:28px 0 16px 0;
                color:#FFFFFF;
                text-align:center;
                font-size:46px;
                line-height:1;
                font-weight:900;
                letter-spacing:-2px;
              ">

                ${
                  variant === "reminder"
                    ? (isAr ? "تذكير" : "SESSION")
                    : (isAr ? "رمز" : "VERIFY")
                } <br>

                <span style="color:${secondaryColor};">
                  ${
                    variant === "reminder"
                      ? (isAr ? "بالجلسة" : "REMINDER")
                      : (isAr ? "التحقق" : "ACCOUNT")
                  }
                </span>

              </h1>

              <!-- Description -->
              <p style="
                margin:0 auto 26px auto;
                max-width:340px;
                color:#9F9F9F;
                text-align:center;
                font-size:14px;
                line-height:1.8;
              ">
                ${
                  variant === "reminder"
                    ? (isAr
                        ? `مرحباً <strong style="color:#FFFFFF;">${username}</strong>،<br>هذا تذكير بموعد جلستك القادمة. يرجى الاستعداد في الوقت المحدد.`
                        : `Hello <strong style="color:#FFFFFF;">${username}</strong>,<br>This is a reminder for your upcoming session. Please be ready on time.`)
                    : (isAr
                        ? `مرحباً <strong style="color:#FFFFFF;">${username}</strong>،
                    استخدم رمز التحقق التالي لإكمال عملية تسجيل الدخول بأمان.`
                        : `Hello <strong style="color:#FFFFFF;">${username}</strong>,
                    use the verification code below to securely continue your login process.`)
                }
              </p>

            </td>
          </tr>

          ${
            otp
              ? `
          <!-- OTP -->
          <tr>
            <td align="center" style="padding:0 20px 16px 20px;">

              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  ${otpBoxes}
                </tr>
              </table>

              <p style="
                margin:16px 0 0 0;
                color:#777777;
                font-size:11px;
                letter-spacing:1px;
              ">
                ${
                  isAr
                    ? "صالح لمدة 10 دقائق فقط"
                    : "VALID FOR 10 MINUTES ONLY"
                }
              </p>

            </td>
          </tr>
          `
              : ""
          }

          ${
            text
              ? `
          <!-- Text -->
          <tr>
            <td
              class="mobile-padding"
              style="padding:0 34px 24px 34px;"
            >

              <div style="
                background:#0D0D10;
                border:1px solid ${primaryColor}20;
                border-radius:18px;
                padding:20px;
              ">

                <p style="
                  margin:0;
                  color:#D6D6D6;
                  text-align:center;
                  font-size:14px;
                  line-height:1.8;
                ">
                  ${text}
                </p>

              </div>

            </td>
          </tr>
          `
              : ""
          }

          <!-- Button -->
          <tr>
            <td
              align="center"
              style="padding:4px 34px 36px 34px;"
            >

              <a
                href="${process.env.FRONTEND_URL || "https://dashboard.jupiter-egy.com"}"
                style="
                  display:inline-block;
                  padding:16px 34px;
                  background:linear-gradient(
                    135deg,
                    ${primaryColor} 0%,
                    ${secondaryColor} 100%
                  );
                  color:#FFFFFF;
                  text-decoration:none;
                  border-radius:16px;
                  font-size:13px;
                  font-weight:800;
                  letter-spacing:0.5px;
                  box-shadow:0 10px 30px rgba(26,79,192,0.25);
                "
              >
                ${
                  isAr
                    ? "الذهاب إلى المنصة"
                    : "GO TO PLATFORM"
                }
              </a>

            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 34px;">
              <div style="
                height:1px;
                background:rgba(255,255,255,0.06);
              "></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td
              class="mobile-padding"
              style="padding:22px 34px 26px 34px;"
            >

              <table width="100%">
                <tr>

                  <td align="${isAr ? "right" : "left"}">

                    <p style="
                      margin:0;
                      color:#777777;
                      font-size:11px;
                    ">
                      © 2026 Jupiter Platform
                    </p>

                  </td>

                  <td align="${isAr ? "left" : "right"}">

                    <span style="
                      display:inline-block;
                      padding:8px 14px;
                      border-radius:30px;
                      background:#0F1115;
                      border:1px solid ${primaryColor}25;
                      color:${secondaryColor};
                      font-size:10px;
                      font-weight:700;
                      letter-spacing:1px;
                    ">
                      SYSTEM SECURED
                    </span>

                  </td>

                </tr>
              </table>

            </td>
          </tr>

        </table>

        <!-- Footer Text -->
        <table cellpadding="0" cellspacing="0" border="0" style="margin-top:18px;">
          <tr>
            <td align="center">

              <p style="
                margin:0;
                color:#8D8D8D;
                font-size:11px;
                letter-spacing:1px;
              ">
                Powered by
                <span style="color:${secondaryColor};">
                  neovidi.co
                </span>
              </p>

            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;
};