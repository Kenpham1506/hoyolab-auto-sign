const profiles = [
  {
    token: "ltoken_v2=gBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxCY; ltuid_v2=26XXXXX20;",
    genshin: true,
    honkai_star_rail: true,
    honkai_3: false,
    tears_of_themis: false,
    zenless_zone_zero: false,
    accountName: "你的名字"
  }
];

const telegram_notify = true
const myTelegramID = "1XXXXXXX0"
const telegramBotToken = ""

/** 以上為設定檔，請參考 https://github.com/canaria3406/hoyolab-auto-sign/ 之說明進行設定**/
/** 以下為程式碼，請勿更動 **/

const urlDict = {
  Genshin: 'https://sg-hk4e-api.hoyolab.com/event/sol/sign?lang=zh-tw&act_id=e202102251931481',
  Star_Rail: 'https://sg-public-api.hoyolab.com/event/luna/os/sign?lang=zh-tw&act_id=e202303301540311',
  Honkai_3: 'https://sg-public-api.hoyolab.com/event/mani/sign?lang=zh-tw&act_id=e202110291205111',
  Tears_of_Themis: 'https://sg-public-api.hoyolab.com/event/luna/nxx/os/sign?lang=en-us&act_id=e202202281857121',
  Zenless_Zone_Zero: 'https://sg-act-nap-api.hoyolab.com/event/luna/zzz/os/sign?lang=zh-tw&act_id=e202406031448091'
};

async function main(){
  const messages = await Promise.all(profiles.map(autoSignFunction));
  const hoyolabResp = `${messages.join('\n\n')}`

  if (telegram_notify && telegramBotToken && myTelegramID) {
    postWebhook(hoyolabResp);
  }
}

function autoSignFunction({
  token,
  genshin = false,
  honkai_star_rail = false,
  honkai_3 = false,
  tears_of_themis = false,
  zenless_zone_zero = false,
  accountName
}) {
  const urls = [];

  if (genshin) urls.push(urlDict.Genshin);
  if (honkai_star_rail) urls.push(urlDict.Star_Rail);
  if (honkai_3) urls.push(urlDict.Honkai_3);
  if (tears_of_themis) urls.push(urlDict.Tears_of_Themis);
  if (zenless_zone_zero) urls.push(urlDict.Zenless_Zone_Zero);

  let response = `${accountName} 的自動簽到作業已完成`;

  var sleepTime = 0;
  const httpResponses = [];
  for (const url of urls) {
    // Determine whether the URL is for "Zenless_Zone_Zero" and set headers accordingly
    const isZenless = url === urlDict.Zenless_Zone_Zero;
    const isTears_of_themis = url === urlDict.Tears_of_Themis;
    
    const header = {
      Cookie: token,
      'Accept': 'application/json, text/plain, */*',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'x-rpc-app_version': '2.34.1',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
      'x-rpc-client_type': '4',
      'Referer': 'https://act.hoyolab.com/',
      'Origin': 'https://act.hoyolab.com',
      ...(isZenless && { 'x-rpc-signgame': 'zzz' }),
      ...(isTears_of_themis && { 'x-rpc-signgame': 'nxx' })
    };

    const options = {
      method: 'POST',
      headers: header,
      muteHttpExceptions: true,
    };

    Utilities.sleep(sleepTime);
    httpResponses.push(UrlFetchApp.fetch(url, options));
    sleepTime = 1000;
  }

  for (const [i, hoyolabResponse] of httpResponses.entries()) {
    const responseJson = JSON.parse(hoyolabResponse);
    const checkInResult = responseJson.message;
    const enGameName = Object.keys(urlDict).find(key => urlDict[key] === urls[i]);
    let gameName;
    switch (enGameName) {
      case 'Genshin':
        gameName = '原神';
        break;
      case 'Star_Rail':
        gameName = '星穹鐵道';
        break;
      case 'Honkai_3':
        gameName = '崩壞3rd';
        break;
      case 'Tears_of_Themis':
        gameName = '未定事件簿';
        break;
      case 'Zenless_Zone_Zero':
        gameName = '絕區零';
        break;
    }
    const bannedCheck = responseJson.data?.gt_result?.is_risk;

    if (bannedCheck) {
      response += `\n${gameName}: 自動簽到失敗，受到圖形驗證阻擋。`;
    } else {
      response += `\n${gameName}: ${checkInResult}`;
    }
  }

  return response;
}


function postWebhook(data) {
  let payload = JSON.stringify({
    'chat_id': myTelegramID,
    'text': data,
    'parse_mode': 'HTML'
  });

  const options = {
    method: 'POST',
    contentType: 'application/json',
    payload: payload,
    muteHttpExceptions: true
  };

  UrlFetchApp.fetch('https://api.telegram.org/bot' + telegramBotToken + '/sendMessage', options);
}
