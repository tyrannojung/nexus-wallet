module.exports = {
  extends: [
    'plugin:@next/next/recommended', // next에서 사용할 경우, 별도의 eslint.js(default: eslint.json)와 같이 설정 파일을 사용하는 경우, 꼭 명시해 줘야함
    'airbnb', // Airbnb 스타일 가이드 적용
    'airbnb-typescript', // Airbnb 스타일 가이드의 TypeScript 확장 적용
    'prettier',
  ],
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  globals: {
    React: true,
    JSX: true,
  },
  ignorePatterns: [
    'node_modules',
    'dist',
    '.next',
    '.github',
    '*.config.js',
    '*.js',
    '.eslintrc.js',
    'next.config.mjs',
    'src/e2e/**',
  ],
  overrides: [{ files: ['*.js?(x)', '*.ts?(x)'] }],
  // ESLint 확장을 통해 다양한 규칙과 설정을 적용합니다.
  parser: '@typescript-eslint/parser', // TypeScript 코드를 분석하기 위한 파서
  plugins: ['@typescript-eslint/eslint-plugin'], // @typescript-eslint 플러그인을 사용하여 TypeScript 규칙을 적용
  parserOptions: {
    // parserOptions는 ESLint가 JavaScript 언어 버전과 모듈을 파싱하는 방법을 지정합니다.
    project: './tsconfig.json', // TypeScript 프로젝트 설정 파일 경로
    tsconfigRootDir: __dirname, // tsconfig 파일의 루트 디렉토리 지정
    sourceType: 'module', // 모듈 시스템 사용을 위해 'module'로 설정
  },
  rules: {
    'react/jsx-props-no-spreading': 0, // JSX 내의 props spreading을 허용
    'react/jsx-uses-react': 0, // React 버전 17 이후 JSX 변환에 React 임포트가 필요 없음
    'react/react-in-jsx-scope': 0, // React 버전 17 이후 JSX 사용 시 React를 범위 내에 두지 않아도 됨
    'import/extensions': 0,
  },
};
