const fs = require('fs');
const path = require('path');
const base = path.dirname(process.argv[1] || __dirname);
const file = path.join(base, 'app', 'js', 'app.js');
let s = fs.readFileSync(file, 'utf8');
const old = `  var TIME_LIMIT_OPTIONS = [
    { value: 0, label: '制限なし' },
    { value: 5, label: '5秒' },
    { value: 10, label: '10秒' },
    { value: 15, label: '15秒' },
    { value: 30, label: '30秒' }
  ];`;
const neu = `  // 回答時間: 制限なし / 10秒 / 20秒 / 30秒
  var TIME_LIMIT_OPTIONS = [
    { value: 0, label: '制限なし' },
    { value: 10, label: '10秒' },
    { value: 20, label: '20秒' },
    { value: 30, label: '30秒' }
  ];`;
if (s.indexOf(old) !== -1) {
  s = s.replace(old, neu);
  fs.writeFileSync(file, s, 'utf8');
  console.log('Updated TIME_LIMIT_OPTIONS');
} else {
  console.log('Already up to date or pattern not found');
}
