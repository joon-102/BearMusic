# BEAR MUSIC
#### 음원 추출, 가사 싱크, 비디오 렌더링 및 유튜브 업로드 과정을 자동화하는 리릭 비디오 생성 애플리케이션

## 목차
1. [개요](#개요)
2. [프리뷰](#프리뷰)
2. [기술스택](#기술스택)
4. [시작하기](#시작하기)
5. [피드백](#피드백)
6. [라이선스](#라이선스)

## [개요](#목차)
**BEAR MUSIC** 은 리릭 비디오 제작을 자동화하기 위한 애플리케이션입니다. 실시간 음악 차트에서 곡을 자동으로 선택하고, 해당 곡의 음원과 가사를 수집하여 Remotion를 사용해 동기화된 리릭 비디오를 생성하고 유튜브에 자동 업로드합니다.

### 주요 기능
- 🗂 차트 음악 선정
- 🎵 음원 추출
- 📝 가사 수집 및 싱크
- 🎬 동영상 자동 생성 
- ⬆️ 유튜브 업로드

이전 버전(v1)은 [여기](https://github.com/joon-102/BearMusic/archive/4f29d95ff19a01a6a06588be38ed1152f89b3862.zip) 버전(v2)은 [여기](https://github.com/joon-102/BearMusic/archive/b13edee083407cd28f423476e963cceffef28e41.zip)서 다운로드할 수 있습니다.

## [프리뷰](#프리뷰)
🎬 **샘플 영상: 황가람 - 나는 반딧불 [가사/리릭 비디오]**

[![황가람 - 나는 반딧불 [나는 반딧불]ㅣ가사/Lyrics](http://img.youtube.com/vi/hhk4NYiCgeo/0.jpg)](https://www.youtube.com/watch?v=hhk4NYiCgeo)  
👉 [유튜브 채널 바로가기](https://www.youtube.com/@%EB%B2%A0%EC%96%B4%EB%AE%A4%EC%A7%81)

## [기술스택](#목차)

**BEAR MUSIC** 는 아래와 같은 오픈소스를 사용합니다:
- [Node.js](https://nodejs.org/) 
- [TypeScript](https://www.typescriptlang.org/) 
- [Remotion](https://www.remotion.dev/) 
- [React](https://reactjs.org/) 
- [Tailwind CSS](https://tailwindcss.com/)
- [MongoDB](https://www.mongodb.com/)
- [Playwright](https://playwright.dev/) 
- [FFmpeg](https://ffmpeg.org/) 

## [시작하기](#목차)
- [Node.js](https://nodejs.org/) - v20 이상 
- [yarn](https://yarnpkg.com/) 
- [FFmpeg](https://ffmpeg.org/) 
- [fpcalc](https://acoustid.org/chromaprint)  

#### 저장소 복제
```sh
git clone https://github.com/joon-102/BearMusic.git
cd BearMusic
```
#### 의존성 설치
```sh
yarn install
```
환경 변수 설정
프로젝트 루트에 `.env` 파일을 생성하고, `.env.example` 파일을 참고하여 필요한 환경 변수를 설정합니다.

```dotenv
MONGO_URI=""
PORT=3000
CHROME_PATH="C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
GOOGLE_ACCOUNT_EMAIL=""
GOOGLE_ACCOUNT_PASS=""
```
#### 실행
> `createQueue.mjs`는 차트 기반 자동 플레이리스트를 구성하는 스크립트입니다.  
> 영상 생성 전에 먼저 실행해주세요.
```sh
node .\createQueue.mjs
yarn run build
yarn start
```
## [피드백](#목차)
이 프로젝트에 대한 제안, 버그 제보 또는 개선 아이디어가 있다면 [ISSUE](https://github.com/joon-102/BearMusic/issues)로 남겨주세요.

## [라이선스](#목차)
[![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc/4.0/)

이 프로젝트는 CC BY-NC 4.0 라이선스에 따라 사용됩니다.