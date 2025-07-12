# BearMusic
**차트를 기반으로 음원 추출, 가사 싱크, 비디오 렌더링 및 유튜브 업로드 과정을 자동화하는 리릭 비디오 생성 애플리케이션 📺**

## 프로젝트 소개

**BearMusic**은 리릭 비디오 제작을 자동화하기 위한 애플리케이션입니다.  
실시간 음악 차트에서 곡을 자동으로 선택하고, 해당 곡의 음원과 가사를 수집하여 **Remotion**를 사용해 동기화된 리릭 비디오를 생성하고 유튜브에 자동 업로드합니다.

> 🎵 음원 추출 → 📝 가사 수집 및 싱크 → 🎬 동영상 자동 생성  
> ⬆️ 유튜브 업로드 → 📡 실시간 진행 상황 모니터링 → 🗂 데이터 관리
   
이전 버전(v2)은 아래 링크에서 확인할 수 있습니다: [BearMusic V2 저장소 브랜치](https://github.com/joon-102/BearMusic/tree/BearMusic-V2)

## 기술 스택

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Remotion](https://img.shields.io/badge/Remotion-FF3E00?style=flat-square&logo=remotion&logoColor=white)](https://www.remotion.dev/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Playwright](https://img.shields.io/badge/Playwright-000000?style=flat-square&logo=playwright&logoColor=white)](https://playwright.dev/)
[![FFmpeg](https://img.shields.io/badge/FFmpeg-FFFFFF?style=flat-square&logo=ffmpeg&logoColor=black)](https://ffmpeg.org/)

## 프리뷰

**`황가람 - 나는 반딧불 [나는 반딧불]ㅣ가사/Lyrics`**

[![황가람 - 나는 반딧불 [나는 반딧불]ㅣ가사/Lyrics](http://img.youtube.com/vi/hhk4NYiCgeo/0.jpg)](https://www.youtube.com/watch?v=hhk4NYiCgeo)  
> **[유튜브 채널 바로가기](https://www.youtube.com/@%EB%B2%A0%EC%96%B4%EB%AE%A4%EC%A7%81)**  

## 시작하기

### 환경 설정
- Node.js (v22 이상)  
- yarn  
- FFmpeg (시스템 PATH에 등록되어 있어야 함)

### 1. 저장소 복제

```bash
git clone https://github.com/joon-102/BearMusic.git
cd BearMusic
```

### 2. 의존성 설치

```bash
yarn install
```

### 3. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고, `.env.example` 파일을 참고하여 필요한 환경 변수를 설정합니다.

```dotenv
# .env.example
MONGO_URI=""
PORT=3000
CHROME_PATH="C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
GOODLE_ACCOUNT_EMAIL=""
GOODLE_ACCOUNT_PASS=""
```

### 4. 서버 실행

> `createQueue.mjs`는 차트 기반 자동 플레이리스트를 구성하는 스크립트입니다.  
> 서버 실행 시 함께 동작하여 자동으로 큐를 채웁니다.

```bash
yarn run build
yarn start
```

## 피드백

이 프로젝트에 대한 제안, 버그 제보 또는 개선 아이디어가 있다면 [Issue](https://github.com/joon-102/BearMusic/issues)로 남겨주세요.
