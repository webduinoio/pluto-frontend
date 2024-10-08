const Hashids = require('hashids/cjs');
const fs = require('fs');

// 排除字符 o, l, i
const customAlphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ0123456789';
const hashids = new Hashids('wa5499', 6, customAlphabet);

// 取得命令列參數
const numOfHashes = parseInt(process.argv[2], 10) || 10;
const outputFile = process.argv[3] || 'output.txt';

// 生成指定數量的長度為 6 碼的字串
const hashes = [];
for (let i = 0; i < numOfHashes; i++) {
  // 使用不同的數字生成唯一的 hash
  const hash = hashids.encode(i);
  hashes.push(hash);
}

// 將每個字串寫入檔案
fs.writeFileSync(outputFile, hashes.join('\n'));

console.log(`已生成 ${numOfHashes} 個 hash 並輸出至檔案: ${outputFile}`);
