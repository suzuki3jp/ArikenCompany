# ArikenCompany Design Documantaion

## 目次

- [ArikenCompany Design Documantaion](#arikencompany-design-documantaion)
  - [目次](#目次)
  - [開発目標](#開発目標)
  - [コミット規則](#コミット規則)
  - [プロセス](#プロセス)
    - [ArikenCompany Database (Nodejs)](#arikencompany-database-nodejs)
    - [ArikenCompany Core (Nodejs)](#arikencompany-core-nodejs)
    - [ArikenCompany Web Dashboard (React, vercel)](#arikencompany-web-dashboard-react-vercel)
  - [ディレクトリ構成](#ディレクトリ構成)

## 開発目標

- コメントをしっかりと記載する
- 車輪の再発明をせず、できるだけパッケージを利用する
- モノリポに対応する
  - [参考 - git clone](https://tech.asoview.co.jp/entry/2023/03/14/095235)
  - [参考 - npm workspaces](https://zenn.dev/suin/scraps/20896e54419069)

## コミット規則

- コミットメッセージは日本語にする
- プレフィックスは以下
  - root: - ルートの設定ファイルや README など
  - db: - [ArikenCompany Database](#arikencompany-database-nodejs)
  - core: - [ArikenCompany Core](#arikencompany-core-nodejs)
  - web: - [ArikenCompany Web Dashboard](#arikencompany-web-dashboard-react-vercel)
  - 複数の場合は & でつなげる（`ArikenCompany Database`と`ArikenCompany Core`の同時変更の場合 -> `db & core: `）

## プロセス

### ArikenCompany Database (Nodejs)

- ArikenCompany のデータベースプロセス
- データベースは sqlite を使用
- ORM は prisma
- REST API として外部に公開
- ホスト名は`db.suzuki3jp.xyz`
- 使用パッケージ
  - [Prisma - ORM](https://github.com/prisma/prisma)
  - [Nestjs](https://github.com/nestjs/nest)

### ArikenCompany Core (Nodejs)

- ArikenCompany のメインプロセス
- このプロセスから Twitch や Discord に接続する
- 以下の機能を有する
  - ChatCommand
  - ChatCommandManager
  - StreamNotification
  - StreamMemo
- 使用パッケージ
  - discord.js
  - twurple

### ArikenCompany Web Dashboard (React, vercel)

- ArikenCompany のウェブダッシュボード
- 将来的に discord で管理していたものをすべてウェブから管理できるようにする
- スモールスタートを採用し、段階的に上記を達成する。
  - 1 - パブリックコマンドをログインせずに確認できるようにする。
  - 2 - ログイン機能を実装し、管理ユーザーは `ArikenCompany Database`, `ArikenCompany Core`のステータスを確認可能にする
  - 3 - 管理ユーザーがチャットコマンドを編集可能にする
  - 4 - 配信通知を編集可能にする
  - 5 - 切り抜きメモを discord の forum ベースからデータベースに移行し、Web から変更する。(これは検討中)

## ディレクトリ構成

- root/
  - packages/
    - database/
      - src/
        - api/
        - prisma/
      - packages.json
      - packages-lock.json
    - core/
      - src/
      - packages.json
      - packages-lock.json
    - web/
      - src/
      - packages.json
      - packages-lock.json
  - packages.json
  - packages-lock.json
