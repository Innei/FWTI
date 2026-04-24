import { usePageContext } from 'vike-solid/usePageContext'
import { getOgImageUrl, getSiteOrigin } from '../src/site'

const JSON_LD_DESCRIPTION =
  '基于 FWTI 框架的恋爱主题趣味性格测试，含十六种类型释义。仅供娱乐，非临床或心理诊断工具。'

export function Head() {
  const pageContext = usePageContext()
  const site = getSiteOrigin()
  const pathname = pageContext.urlPathname ?? '/'
  const pathForCanonical = pathname.startsWith('/') ? pathname : `/${pathname}`
  const canonical = site ? `${site}${pathForCanonical}` : ''
  const ogImage = getOgImageUrl()

  const jsonLd =
    site &&
    JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'FWTI 自嘲型恋爱人格测试',
      description: JSON_LD_DESCRIPTION,
      inLanguage: 'zh-CN',
      url: `${site}/`,
      publisher: {
        '@type': 'Organization',
        name: 'FWTI',
        url: site,
      },
    })

  return (
    <>
      <script
        innerHTML={`(function(){try{var t=localStorage.getItem('fwti-theme');if(t==='dark'||t==='light')document.documentElement.dataset.theme=t;}catch(e){}})();`}
      />
      <meta name="theme-color" content="#FFF8F0" />
      <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#1D1217" />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link rel="apple-touch-icon" href="/favicon.svg" />
      <link rel="mask-icon" href="/favicon.svg" color="#ff4d6d" />
      <meta
        name="keywords"
        content="FWTI,恋爱测试,性格测试,趣味测试,自嘲型恋爱人格,娱乐测试"
      />
      <meta name="robots" content="index,follow" />
      <meta name="author" content="Innei" />
      {canonical ? <link rel="canonical" href={canonical} /> : null}
      <meta property="og:site_name" content="FWTI" />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="zh_CN" />
      {canonical ? <meta property="og:url" content={canonical} /> : null}
      <meta name="twitter:card" content="summary_large_image" />
      {ogImage ? <meta property="og:image" content={ogImage} /> : null}
      {ogImage ? <meta name="twitter:image" content={ogImage} /> : null}
      {jsonLd ? (
        <script type="application/ld+json" innerHTML={jsonLd} />
      ) : null}
    </>
  )
}
