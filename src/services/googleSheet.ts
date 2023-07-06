/**
 * 使用 google app script 取得試算表資料
 * 使用 axios 時，因為 redirect 無法正常轉導，改用 fetch
 */


const GOOGLE_APP_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbxAyOsMjLrBZWqYB2w8v3SamuMCCMVStjVQupXLkZ3zvEVDo228IBrmNJn-45xJX5hX/exec';

interface Data {
  sheetUrl: string;
  sheetName: string;
  type: 'read_table';
}

/**
 * 讀取 google 試算表資料
 *
 * @param data
 */ 0;
export function getGoogleSheetData(data: Data) {
  const myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8');

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: JSON.stringify(data),
  };

  return fetch(GOOGLE_APP_SCRIPT_URL, requestOptions)
    .then((response) => response.text())
    .then((result) => {
      return { data: JSON.parse(result).data };
    })
    .catch((error) => console.log('error', error));
}
