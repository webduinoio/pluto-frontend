#!/bin/bash
rm -rf public
mkdir public
cp -R webduino_logo.svg public
cp -R dist public
cp -R prod public
cp -R lib public
cp index.html public

# 將 public 資料夾打包成 tar 檔案，忽略 macOS 特殊屬性
cd public && tar --no-xattrs --format=ustar -czf ../public.tar.gz . && cd ..

# 將 public.tar.gz 檔案上傳到 /mnt/i32g-nfs/chat-frontend
scp -P 2022 public.tar.gz wa@home.nodered.vip:/mnt/i32g-nfs/chat-frontend

# 在遠端刪除 public 目錄下的所有內容並解壓縮至 public 目錄下
ssh -p 2022 wa@home.nodered.vip "cd /mnt/i32g-nfs/chat-frontend && rm -rf public/* && tar -xzf public.tar.gz -C public"

rm public.tar.gz