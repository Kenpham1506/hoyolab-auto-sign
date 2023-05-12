/** Enter the hoyolab sign-in page, press F12 to enter the console, paste the following code and execute it to get the token. **/
/** https://act.hoyolab.com/ys/event/signin-sea-v3/index.html?act_id=e202102251931481 **/

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}
let token = 'ltoken=' + getCookie('ltoken') + '; ltuid=' + getCookie('ltuid') + ';'
let ask = confirm(token + '\n\nPress enter, then paste the token into your Google Apps Script Project');
if (ask == true) {
  copy(token);
  msg = token;
} else {
  msg = 'Cancel';
}