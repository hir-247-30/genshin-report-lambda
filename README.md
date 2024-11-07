### 概要

原神の通知を送信するプログラム。
LamndaかCronJobでの定期実行を想定。

```
# 型チェック
npm run test

# ビルド
npm run build

# ビルド〜Lambda用のzipファイル作成まで
npm run zip

# 
ローカル実行 cronとかで実行する場合はこっち
npm run local
```

### TODO

LINE通知が廃止されるっぽいので、それまでにdiscord通知など別のものに切り替えたい。